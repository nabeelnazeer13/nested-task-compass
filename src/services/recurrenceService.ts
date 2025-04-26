
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from './serviceUtils';
import { RecurrencePattern } from '@/context/TaskTypes';

/**
 * Update a task's recurrence pattern
 */
export async function updateRecurrencePattern(
  taskId: string, 
  pattern: RecurrencePattern
): Promise<void> {
  try {
    // Check if the task has a recurrence pattern
    const { data: existing, error: checkError } = await supabase
      .from('recurrence_patterns')
      .select('id')
      .eq('task_id', taskId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    // Update the task to mark it as recurring
    const { error: taskError } = await supabase
      .from('tasks')
      .update({ is_recurring: true })
      .eq('id', taskId);
    
    if (taskError) throw taskError;
    
    if (existing) {
      // Update existing pattern
      const { error } = await supabase
        .from('recurrence_patterns')
        .update({
          frequency: pattern.frequency,
          interval: pattern.interval,
          days_of_week: pattern.daysOfWeek,
          day_of_month: pattern.dayOfMonth,
          month_of_year: pattern.monthOfYear,
          end_date: pattern.endDate?.toISOString(),
          occurrences: pattern.occurrences
        })
        .eq('id', existing.id);
      
      if (error) throw error;
    } else {
      // Create new pattern
      const { error } = await supabase
        .from('recurrence_patterns')
        .insert({
          task_id: taskId,
          frequency: pattern.frequency,
          interval: pattern.interval,
          days_of_week: pattern.daysOfWeek,
          day_of_month: pattern.dayOfMonth,
          month_of_year: pattern.monthOfYear,
          end_date: pattern.endDate?.toISOString(),
          occurrences: pattern.occurrences
        });
      
      if (error) throw error;
    }
  } catch (error) {
    handleSupabaseError(error, 'Failed to update recurrence pattern');
  }
}

/**
 * Remove a task's recurrence pattern
 */
export async function removeRecurrencePattern(taskId: string): Promise<void> {
  try {
    // Delete the pattern
    const { error: deleteError } = await supabase
      .from('recurrence_patterns')
      .delete()
      .eq('task_id', taskId);
    
    if (deleteError) throw deleteError;
    
    // Update the task to mark it as non-recurring
    const { error: taskError } = await supabase
      .from('tasks')
      .update({ is_recurring: false })
      .eq('id', taskId);
    
    if (taskError) throw taskError;
    
    // Delete all exceptions as well
    const { error: exceptionsError } = await supabase
      .from('recurrence_exceptions')
      .delete()
      .eq('task_id', taskId);
    
    if (exceptionsError) throw exceptionsError;
  } catch (error) {
    handleSupabaseError(error, 'Failed to remove recurrence pattern');
  }
}

/**
 * Add a recurrence exception
 */
export async function addRecurrenceException(
  taskId: string, 
  exceptionDate: Date
): Promise<void> {
  try {
    const { error } = await supabase
      .from('recurrence_exceptions')
      .insert({
        task_id: taskId,
        exception_date: exceptionDate.toISOString()
      });
    
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to add recurrence exception');
  }
}

/**
 * Remove a recurrence exception
 */
export async function removeRecurrenceException(
  taskId: string, 
  exceptionDate: Date
): Promise<void> {
  try {
    const formattedDate = exceptionDate.toISOString();
    
    const { error } = await supabase
      .from('recurrence_exceptions')
      .delete()
      .eq('task_id', taskId)
      .eq('exception_date', formattedDate);
    
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to remove recurrence exception');
  }
}
