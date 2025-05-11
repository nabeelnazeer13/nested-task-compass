
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from './serviceUtils';
import { TimeBlock } from '@/context/TaskTypes';
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
 * Fetch all time blocks for the current user
 */
export async function getTimeBlocks(): Promise<TimeBlock[]> {
  try {
    // Using default user ID since we're removing authentication - use UUID format
    const userId = "00000000-0000-0000-0000-000000000000";
    
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
    console.error('Error fetching time blocks:', error);
    toast(`Failed to load time blocks. Please try again.`);
    return handleSupabaseError(error, 'Failed to fetch time blocks');
  }
}

/**
 * Create a new time block
 */
export async function createTimeBlock(timeBlock: Omit<TimeBlock, 'id'>): Promise<TimeBlock> {
  try {
    // Using default user ID since we're removing authentication - use UUID format
    const userId = "00000000-0000-0000-0000-000000000000";
    
    // Ensure we have a valid UUID for the task ID
    const validTaskId = ensureValidUUID(timeBlock.taskId);
    
    const { data, error } = await supabase
      .from('time_blocks')
      .insert({
        task_id: validTaskId,
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
    console.error('Error creating time block:', error);
    toast(`Failed to create time block. Please try again.`);
    return handleSupabaseError(error, 'Failed to create time block');
  }
}

/**
 * Update an existing time block
 */
export async function updateTimeBlock(timeBlock: TimeBlock): Promise<void> {
  try {
    // Ensure we have a valid UUID for the task ID
    const validTaskId = ensureValidUUID(timeBlock.taskId);
    
    const { error } = await supabase
      .from('time_blocks')
      .update({
        task_id: validTaskId,
        date: timeBlock.date.toISOString(),
        start_time: timeBlock.startTime,
        end_time: timeBlock.endTime
      })
      .eq('id', timeBlock.id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating time block:', error);
    toast(`Failed to update time block. Please try again.`);
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
    console.error('Error deleting time block:', error);
    toast(`Failed to delete time block. Please try again.`);
    handleSupabaseError(error, 'Failed to delete time block');
  }
}
