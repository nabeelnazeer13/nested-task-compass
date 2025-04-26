
import React from 'react';
import { ReactNode } from 'react';
import { TaskContextProvider } from './TaskContextProvider';
import { TimeTrackingProvider } from './TimeTrackingProvider';
import { ViewModeProvider } from './ViewModeProvider';

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <TaskContextProvider>
    <TimeTrackingProvider>
      <ViewModeProvider>
        {children}
      </ViewModeProvider>
    </TimeTrackingProvider>
  </TaskContextProvider>
);

