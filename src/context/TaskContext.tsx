
import { HybridTaskProvider } from './providers/HybridTaskProvider';
import { useTaskContext as useLocalTaskContext } from './providers/TaskContextProvider';
import { useSupabaseTaskContext } from './providers/SupabaseTaskProvider';
import { useTimeTrackingContext } from './providers/TimeTrackingProvider';
import { useViewModeContext } from './providers/ViewModeProvider';
import { useAuth } from './AuthContext';
import type { Task, Project, TimeBlock, TimeTracking, Priority } from './TaskTypes';

// Custom hook that provides the correct context based on auth state
export const useTaskContext = () => {
  const { user } = useAuth();
  return user ? useSupabaseTaskContext() : useLocalTaskContext();
};

export {
  HybridTaskProvider as TaskProvider,
  useTimeTrackingContext,
  useViewModeContext,
  type Task,
  type Project,
  type TimeBlock,
  type TimeTracking,
  type Priority,
};
