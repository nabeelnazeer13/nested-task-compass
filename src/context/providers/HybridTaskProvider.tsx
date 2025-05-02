
import React from 'react';
import { ReactNode } from 'react';
import { TaskContextProvider } from './TaskContextProvider';
import { TimeTrackingProvider } from './TimeTrackingProvider';
import { ViewModeProvider } from './ViewModeProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const HybridTaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Always use local storage since we're removing authentication
  return (
    <ErrorBoundary>
      <ViewModeProvider>
        <TaskContextProvider>
          <TimeTrackingProvider>
            {children}
          </TimeTrackingProvider>
        </TaskContextProvider>
      </ViewModeProvider>
    </ErrorBoundary>
  );
};
