
import { useAuth } from './AuthContext';
import { useTaskContext } from './providers/TaskContextProvider';
import { useSupabaseTaskContext } from './providers/SupabaseTaskProvider';
import type { TaskContextType } from './types/TaskContextTypes';

// Create a hook function that will be executed during component rendering
const useUnifiedTaskContext = (): TaskContextType => {
  const { user } = useAuth();
  // This ensures hooks are only called during component rendering
  return user ? useSupabaseTaskContext() : useTaskContext();
};

export default useUnifiedTaskContext;
