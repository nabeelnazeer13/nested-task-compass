
import React from 'react';
import { useTaskContext } from '../TaskContext';
import type { TaskContextType } from '../types/TaskContextTypes';

export function withTaskContext<P extends { taskContext?: TaskContextType }>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithTaskContextComponent(props: Omit<P, 'taskContext'>) {
    const taskContext = useTaskContext();
    return <WrappedComponent {...(props as P)} taskContext={taskContext} />;
  };
}
