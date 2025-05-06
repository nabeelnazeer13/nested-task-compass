
import React from 'react';
import { ReactNode } from 'react';
import { TaskContextProvider } from './TaskContextProvider';
import { TimeTrackingProvider } from './TimeTrackingProvider';
import { ViewModeProvider } from './ViewModeProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const HybridTaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <TaskContextProvider>
        <TimeTrackingProvider>
          <ViewModeProvider>
            {children}
          </ViewModeProvider>
        </TimeTrackingProvider>
      </TaskContextProvider>
    </ErrorBoundary>
  );
};
