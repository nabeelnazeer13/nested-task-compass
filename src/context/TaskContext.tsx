
import { HybridTaskProvider } from './providers/HybridTaskProvider';
import { useTaskContext as useLocalTaskContext } from './providers/TaskContextProvider';
import { useSupabaseTaskContext } from './providers/SupabaseTaskProvider';
import { useTimeTrackingContext } from './providers/TimeTrackingProvider';
import { useViewModeContext } from './providers/ViewModeProvider';
import useUnifiedTaskContext from './UnifiedTaskContext';
import type { Task, Project, TimeBlock, TimeTracking, Priority } from './TaskTypes';
import type { TaskContextType, TimeTrackingContextType } from './types/TaskContextTypes';

// Export the unified task context as the default useTaskContext
export const useTaskContext = useUnifiedTaskContext;

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
