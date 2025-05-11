
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Cache } from '@/utils/cache-utils';
import { v4 as uuidv4 } from 'uuid';

/**
 * Utility function to handle Supabase errors
 */
export const handleSupabaseError = (error: any, customMessage?: string) => {
  console.error('Supabase error:', error);
  
  // Check for specific error types
  if (error?.code === '22P02' && error?.message?.includes('uuid')) {
    toast({
      title: 'ID Format Error',
      description: 'There was an issue with the data format. The application will use UUID format going forward.',
      variant: 'destructive',
    });
  } else {
    toast({
      title: 'Error',
      description: customMessage || error.message || 'An unexpected error occurred',
      variant: 'destructive',
    });
  }
  
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
    if (field in processed && processed[field as keyof typeof processed] && typeof processed[field as keyof typeof processed] === 'string') {
      try {
        // Only convert if it looks like an ISO timestamp
        if ((processed[field as keyof typeof processed] as string).match(/^\d{4}-\d{2}-\d{2}T/)) {
          (processed as any)[field] = new Date(processed[field as keyof typeof processed] as string);
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
 * Since we're removing authentication, we'll return a default user ID in UUID format
 */
export const getCurrentUserId = async (): Promise<string> => {
  // Return a consistent UUID for the default user instead of a string
  return "00000000-0000-0000-0000-000000000000";
};

// Create caches for different data types
export const projectsCache = new Cache<any>({ ttl: 300000, capacity: 100 }); // 5 minutes TTL
export const tasksCache = new Cache<any>({ ttl: 300000, capacity: 1000 });
export const timeBlocksCache = new Cache<any>({ ttl: 300000, capacity: 500 });
export const timeTrackingsCache = new Cache<any>({ ttl: 300000, capacity: 500 });

export function getCacheKey(operation: string, params?: any): string {
  return `cache:${operation}:${JSON.stringify(params)}`;
}
