
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, processSupabaseData } from './serviceUtils';
import { TimeTracking } from '@/context/TaskTypes';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

// Helper to ensure we have valid UUIDs
const ensureValidUUID = (id: string): string => {
  // Check if it's already a valid UUID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  
  // For legacy task IDs like "task-4-3", generate a mapping
  try {
    // Create a namespace for our app's task IDs
    return uuidv4();
  } catch (error) {
    console.error('Error converting task ID to UUID:', error);
    toast(`Error processing task ID: ${id}. Please try again.`);
    throw new Error(`Invalid task ID format: ${id}`);
  }
};

/**
 * Fetch all time tracking entries for the current user
 */
export async function getTimeTrackings(): Promise<TimeTracking[]> {
  try {
    // Using default user ID since we're removing authentication - use UUID format
    const userId = "00000000-0000-0000-0000-000000000000";
    
    const { data, error } = await supabase
      .from('time_trackings')
      .select('*')
      .eq('user_id', userId)
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
    // Using default user ID since we're removing authentication - use UUID format
    const userId = "00000000-0000-0000-0000-000000000000";
    const startTime = new Date();
    
    // Ensure we have a valid UUID for the task ID
    const validTaskId = ensureValidUUID(taskId);
    
    const { data, error } = await supabase
      .from('time_trackings')
      .insert({
        task_id: validTaskId,
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
    console.error('Error starting time tracking:', error);
    toast(`Failed to start time tracking. Please try again.`);
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
    
    // Ensure we have a valid UUID for the task ID
    const validTaskId = ensureValidUUID(taskId);
    
    // Update the task's total tracked time
    const { data: taskData, error: taskGetError } = await supabase
      .from('tasks')
      .select('time_tracked')
      .eq('id', validTaskId)
      .single();
    
    if (taskGetError) {
      console.error('Error fetching task data:', taskGetError);
      toast(`Tracking stopped, but couldn't update task total time.`);
      return;
    }
    
    const newTimeTracked = (taskData.time_tracked || 0) + durationInMinutes;
    
    const { error: taskUpdateError } = await supabase
      .from('tasks')
      .update({
        time_tracked: newTimeTracked
      })
      .eq('id', validTaskId);
    
    if (taskUpdateError) {
      console.error('Error updating task time tracked:', taskUpdateError);
      toast(`Tracking stopped, but couldn't update task total time.`);
    }
  } catch (error) {
    console.error('Error stopping time tracking:', error);
    toast(`Failed to stop time tracking. Please try again.`);
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
    // Using default user ID since we're removing authentication - use UUID format
    const userId = "00000000-0000-0000-0000-000000000000";
    
    // Ensure we have a valid UUID for the task ID
    const validTaskId = ensureValidUUID(tracking.taskId);
    
    const { data, error } = await supabase
      .from('time_trackings')
      .insert({
        task_id: validTaskId,
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
    try {
      const { data: taskData, error: taskGetError } = await supabase
        .from('tasks')
        .select('time_tracked')
        .eq('id', validTaskId)
        .single();
      
      if (!taskGetError && taskData) {
        const newTimeTracked = (taskData.time_tracked || 0) + tracking.duration;
        
        await supabase
          .from('tasks')
          .update({
            time_tracked: newTimeTracked
          })
          .eq('id', validTaskId);
      }
    } catch (taskUpdateError) {
      console.error('Error updating task time tracked:', taskUpdateError);
      // Continue with the main function even if task update fails
    }
    
    return {
      id: data.id,
      taskId: data.task_id,
      startTime: new Date(data.start_time),
      endTime: data.end_time ? new Date(data.end_time) : undefined,
      duration: data.duration,
      notes: data.notes || undefined
    };
  } catch (error) {
    console.error('Error adding manual time tracking:', error);
    toast(`Failed to add manual time tracking. Please try again.`);
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
      try {
        const { data: taskData, error: taskGetError } = await supabase
          .from('tasks')
          .select('time_tracked')
          .eq('id', originalTracking.task_id)
          .single();
        
        if (!taskGetError && taskData) {
          const newTimeTracked = Math.max(0, (taskData.time_tracked || 0) + durationDifference);
          
          await supabase
            .from('tasks')
            .update({
              time_tracked: newTimeTracked
            })
            .eq('id', originalTracking.task_id);
        }
      } catch (taskUpdateError) {
        console.error('Error updating task time tracked:', taskUpdateError);
        // Continue even if task update fails
      }
    }
  } catch (error) {
    console.error('Error updating time tracking:', error);
    toast(`Failed to update time tracking. Please try again.`);
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
    try {
      const { data: taskData, error: taskGetError } = await supabase
        .from('tasks')
        .select('time_tracked')
        .eq('id', tracking.task_id)
        .single();
      
      if (!taskGetError && taskData) {
        const newTimeTracked = Math.max(0, (taskData.time_tracked || 0) - tracking.duration);
        
        await supabase
          .from('tasks')
          .update({
            time_tracked: newTimeTracked
          })
          .eq('id', tracking.task_id);
      }
    } catch (taskUpdateError) {
      console.error('Error updating task time tracked after deletion:', taskUpdateError);
      // Continue even if task update fails
    }
  } catch (error) {
    console.error('Error deleting time tracking:', error);
    toast(`Failed to delete time tracking. Please try again.`);
    handleSupabaseError(error, 'Failed to delete time tracking');
  }
}
