
import { useAuth } from './AuthContext';
import { useTaskContext } from './providers/TaskContextProvider';
import { useSupabaseTaskContext } from './providers/SupabaseTaskProvider';
import type { TaskContextType } from './types/TaskContextTypes';

export const useUnifiedTaskContext = (): TaskContextType => {
  const { user } = useAuth();
  return user ? useSupabaseTaskContext() : useTaskContext();
};
