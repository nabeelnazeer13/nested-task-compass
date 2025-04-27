
import { useAuth } from './AuthContext';
import { useTaskContext } from './providers/TaskContextProvider';
import { useSupabaseTaskContext } from './providers/SupabaseTaskProvider';
import type { TaskContextType } from './types/TaskContextTypes';

const useUnifiedTaskContext = (): TaskContextType => {
  const { user } = useAuth();
  return user ? useSupabaseTaskContext() : useTaskContext();
};

export default useUnifiedTaskContext;
