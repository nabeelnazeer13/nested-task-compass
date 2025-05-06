
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError, prepareDatesForSupabase, processSupabaseData, getCurrentUserId } from './serviceUtils';
import { TimeBlock } from '@/context/TaskTypes';

/**
 * Fetch all time blocks for the current user
 */
export async function getTimeBlocks(): Promise<TimeBlock[]> {
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    return data.map(block => ({
      id: block.id,
      taskId: block.task_id,
      date: new Date(block.date),
      startTime: block.start_time,
      endTime: block.end_time
    }));
  } catch (error) {
    return handleSupabaseError(error, 'Failed to fetch time blocks');
  }
}

/**
 * Create a new time block
 */
export async function createTimeBlock(timeBlock: Omit<TimeBlock, 'id'>): Promise<TimeBlock> {
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('time_blocks')
      .insert({
        task_id: timeBlock.taskId,
        date: timeBlock.date.toISOString(),
        start_time: timeBlock.startTime,
        end_time: timeBlock.endTime,
        user_id: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      taskId: data.task_id,
      date: new Date(data.date),
      startTime: data.start_time,
      endTime: data.end_time
    };
  } catch (error) {
    return handleSupabaseError(error, 'Failed to create time block');
  }
}

/**
 * Update an existing time block
 */
export async function updateTimeBlock(timeBlock: TimeBlock): Promise<void> {
  try {
    const { error } = await supabase
      .from('time_blocks')
      .update({
        task_id: timeBlock.taskId,
        date: timeBlock.date.toISOString(),
        start_time: timeBlock.startTime,
        end_time: timeBlock.endTime
      })
      .eq('id', timeBlock.id);
    
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to update time block');
  }
}

/**
 * Delete a time block
 */
export async function deleteTimeBlock(timeBlockId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('time_blocks')
      .delete()
      .eq('id', timeBlockId);
    
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to delete time block');
  }
}
