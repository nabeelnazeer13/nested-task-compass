
import { useAuth } from './AuthContext';
import { useTaskContext } from './providers/TaskContextProvider';
import { useSupabaseTaskContext } from './providers/SupabaseTaskProvider';

/**
 * Hook that provides a consistent task context API regardless of authentication state.
 * It automatically selects the appropriate task context based on whether the user is authenticated or not.
 */
const UnifiedTaskContext = () => {
  const { user } = useAuth();
  
  // Use the appropriate context based on authentication status
  const localContext = useTaskContext();
  const supabaseContext = useSupabaseTaskContext();
  
  // Return the authenticated context if user exists, otherwise the local context
  return user ? supabaseContext : localContext;
};

export default UnifiedTaskContext;
