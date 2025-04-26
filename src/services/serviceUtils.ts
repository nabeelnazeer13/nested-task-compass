
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

/**
 * Utility function to handle Supabase errors
 */
export const handleSupabaseError = (error: any, customMessage?: string) => {
  console.error('Supabase error:', error);
  toast({
    title: 'Error',
    description: customMessage || error.message || 'An unexpected error occurred',
    variant: 'destructive',
  });
  throw error;
};

/**
 * Convert Supabase timestamp to Date object
 */
export const convertTimestamp = (timestamp: string | null): Date | undefined => {
  return timestamp ? new Date(timestamp) : undefined;
};

/**
 * Prepares date fields for Supabase insert/update by converting them to ISO strings
 */
export const prepareDatesForSupabase = (data: any): any => {
  const result = { ...data };
  
  // Convert Date objects to ISO strings
  Object.keys(result).forEach(key => {
    if (result[key] instanceof Date) {
      result[key] = result[key].toISOString();
    }
  });
  
  return result;
};

/**
 * Process data from Supabase, converting timestamps to Date objects
 */
export const processSupabaseData = <T extends Record<string, any>>(data: T): T => {
  const processed = { ...data } as T;
  
  // Convert specific timestamp fields to Date objects
  const dateFields = ['due_date', 'end_date', 'date', 'start_time', 'end_time', 'created_at', 'updated_at'];
  
  dateFields.forEach(field => {
    if (field in processed && processed[field as keyof T] && typeof processed[field as keyof T] === 'string') {
      try {
        // Only convert if it looks like an ISO timestamp
        if ((processed[field as keyof T] as string).match(/^\d{4}-\d{2}-\d{2}T/)) {
          (processed as any)[field] = new Date(processed[field as keyof T] as string);
        }
      } catch (e) {
        console.warn(`Failed to convert ${field} to Date:`, e);
      }
    }
  });
  
  return processed;
};

/**
 * Get the current authenticated user's ID
 */
export const getCurrentUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.id;
};

