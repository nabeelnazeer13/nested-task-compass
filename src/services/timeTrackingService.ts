import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, prepareDatesForSupabase, processSupabaseData, getCurrentUserId } from './serviceUtils';
import { TimeTracking } from '@/context/TaskTypes';

/**
 * Fetch all time tracking entries for the current user
 */
export async function getTimeTrackings(): Promise<TimeTracking[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('time_trackings')
      .select('*')
      .order('start_time', { ascending: false });
    
    if (error) throw error;
    
    return data.map(tracking => ({
      id: tracking.id,
      taskId: tracking.task_id,
      startTime: new Date(tracking.start_time),
      endTime: tracking.end_time ? new Date(tracking.end_time) : undefined,
      duration: tracking.duration,
      notes: tracking.notes || undefined
    }));
  } catch (error) {
    return handleSupabaseError(error, 'Failed to fetch time tracking entries');
  }
}

/**
 * Start time tracking for a task
 */
export async function startTimeTracking(
  taskId: string, 
  notes?: string
): Promise<TimeTracking> {
  try {
    const userId = await getCurrentUserId();
    const startTime = new Date();
    
    const { data, error } = await supabase
      .from('time_trackings')
      .insert({
        task_id: taskId,
        start_time: startTime.toISOString(),
        duration: 0,
        notes,
        user_id: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      taskId: data.task_id,
      startTime: new Date(data.start_time),
      duration: 0,
      notes: data.notes || undefined
    };
  } catch (error) {
    return handleSupabaseError(error, 'Failed to start time tracking');
  }
}

/**
 * Stop time tracking
 */
export async function stopTimeTracking(
  timeTrackingId: string,
  taskId: string
): Promise<void> {
  try {
    // Get the time tracking entry
    const { data: trackingData, error: getError } = await supabase
      .from('time_trackings')
      .select('start_time')
      .eq('id', timeTrackingId)
      .single();
    
    if (getError) throw getError;
    
    const startTime = new Date(trackingData.start_time);
    const endTime = new Date();
    const durationInMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
    
    // Update the time tracking entry
    const { error: updateError } = await supabase
      .from('time_trackings')
      .update({
        end_time: endTime.toISOString(),
        duration: durationInMinutes
      })
      .eq('id', timeTrackingId);
    
    if (updateError) throw updateError;
    
    // Update the task's total tracked time
    const { data: taskData, error: taskGetError } = await supabase
      .from('tasks')
      .select('time_tracked')
      .eq('id', taskId)
      .single();
    
    if (taskGetError) throw taskGetError;
    
    const newTimeTracked = (taskData.time_tracked || 0) + durationInMinutes;
    
    const { error: taskUpdateError } = await supabase
      .from('tasks')
      .update({
        time_tracked: newTimeTracked
      })
      .eq('id', taskId);
    
    if (taskUpdateError) throw taskUpdateError;
  } catch (error) {
    handleSupabaseError(error, 'Failed to stop time tracking');
  }
}

/**
 * Add a manual time tracking entry
 */
export async function addManualTimeTracking(
  tracking: Omit<TimeTracking, 'id'>
): Promise<TimeTracking> {
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('time_trackings')
      .insert({
        task_id: tracking.taskId,
        start_time: tracking.startTime.toISOString(),
        end_time: tracking.endTime?.toISOString(),
        duration: tracking.duration,
        notes: tracking.notes,
        user_id: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the task's total tracked time
    const { data: taskData, error: taskGetError } = await supabase
      .from('tasks')
      .select('time_tracked')
      .eq('id', tracking.taskId)
      .single();
    
    if (taskGetError) throw taskGetError;
    
    const newTimeTracked = (taskData.time_tracked || 0) + tracking.duration;
    
    const { error: taskUpdateError } = await supabase
      .from('tasks')
      .update({
        time_tracked: newTimeTracked
      })
      .eq('id', tracking.taskId);
    
    if (taskUpdateError) throw taskUpdateError;
    
    return {
      id: data.id,
      taskId: data.task_id,
      startTime: new Date(data.start_time),
      endTime: data.end_time ? new Date(data.end_time) : undefined,
      duration: data.duration,
      notes: data.notes || undefined
    };
  } catch (error) {
    return handleSupabaseError(error, 'Failed to add manual time tracking');
  }
}

/**
 * Update a time tracking entry
 */
export async function updateTimeTracking(tracking: TimeTracking): Promise<void> {
  try {
    // Get the original tracking to calculate duration difference
    const { data: originalTracking, error: getError } = await supabase
      .from('time_trackings')
      .select('duration, task_id')
      .eq('id', tracking.id)
      .single();
    
    if (getError) throw getError;
    
    // Calculate duration difference for task total time update
    const durationDifference = tracking.duration - originalTracking.duration;
    
    // Update the time tracking entry
    const { error } = await supabase
      .from('time_trackings')
      .update({
        start_time: tracking.startTime.toISOString(),
        end_time: tracking.endTime?.toISOString(),
        duration: tracking.duration,
        notes: tracking.notes
      })
      .eq('id', tracking.id);
    
    if (error) throw error;
    
    // Update the task's total tracked time if duration changed
    if (durationDifference !== 0) {
      const { data: taskData, error: taskGetError } = await supabase
        .from('tasks')
        .select('time_tracked')
        .eq('id', originalTracking.task_id)
        .single();
      
      if (taskGetError) throw taskGetError;
      
      const newTimeTracked = Math.max(0, (taskData.time_tracked || 0) + durationDifference);
      
      const { error: taskUpdateError } = await supabase
        .from('tasks')
        .update({
          time_tracked: newTimeTracked
        })
        .eq('id', originalTracking.task_id);
      
      if (taskUpdateError) throw taskUpdateError;
    }
  } catch (error) {
    handleSupabaseError(error, 'Failed to update time tracking');
  }
}

/**
 * Delete a time tracking entry
 */
export async function deleteTimeTracking(trackingId: string): Promise<void> {
  try {
    // Get the tracking entry to adjust task total time
    const { data: tracking, error: getError } = await supabase
      .from('time_trackings')
      .select('duration, task_id')
      .eq('id', trackingId)
      .single();
    
    if (getError) throw getError;
    
    // Delete the time tracking entry
    const { error } = await supabase
      .from('time_trackings')
      .delete()
      .eq('id', trackingId);
    
    if (error) throw error;
    
    // Update the task's total tracked time
    const { data: taskData, error: taskGetError } = await supabase
      .from('tasks')
      .select('time_tracked')
      .eq('id', tracking.task_id)
      .single();
    
    if (taskGetError) throw taskGetError;
    
    const newTimeTracked = Math.max(0, (taskData.time_tracked || 0) - tracking.duration);
    
    const { error: taskUpdateError } = await supabase
      .from('tasks')
      .update({
        time_tracked: newTimeTracked
      })
      .eq('id', tracking.task_id);
    
    if (taskUpdateError) throw taskUpdateError;
  } catch (error) {
    handleSupabaseError(error, 'Failed to delete time tracking');
  }
}
