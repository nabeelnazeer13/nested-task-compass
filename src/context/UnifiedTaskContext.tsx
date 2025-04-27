
import { useAuth } from './AuthContext';
import { useTaskContext as useLocalTaskContext } from './providers/TaskContextProvider';
import { useSupabaseTaskContext } from './providers/SupabaseTaskProvider';

/**
 * Hook that provides a consistent task context API regardless of authentication state.
 * It automatically selects the appropriate task context based on whether the user is authenticated or not.
 */
export const useUnifiedTaskContext = () => {
  const { user } = useAuth();
  return user ? useSupabaseTaskContext() : useLocalTaskContext();
};
