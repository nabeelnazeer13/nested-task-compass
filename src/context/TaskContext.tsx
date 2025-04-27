
import { HybridTaskProvider } from './providers/HybridTaskProvider';
import { useTaskContext as useLocalTaskContext } from './providers/TaskContextProvider';
import { useSupabaseTaskContext } from './providers/SupabaseTaskProvider';
import { useTimeTrackingContext } from './providers/TimeTrackingProvider';
import { useViewModeContext } from './providers/ViewModeProvider';
import type { Task, Project, TimeBlock, TimeTracking, Priority } from './TaskTypes';
import type { TaskContextType, TimeTrackingContextType } from './types/TaskContextTypes';

// Create a function that returns the hook rather than executing it immediately
const createUnifiedTaskContext = () => {
  const useUnifiedTaskContext = () => {
    const { user } = useAuth();
    return user ? useSupabaseTaskContext() : useLocalTaskContext();
  };
  return useUnifiedTaskContext;
};

// Export the hook factory function result
export const useTaskContext = createUnifiedTaskContext();

export {
  HybridTaskProvider as TaskProvider,
  useTimeTrackingContext,
  useViewModeContext,
  useLocalTaskContext,
  useSupabaseTaskContext,
  type Task,
  type Project,
  type TimeBlock,
  type TimeTracking,
  type Priority,
  type TaskContextType,
  type TimeTrackingContextType,
};
