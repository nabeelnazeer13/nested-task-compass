import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { TaskProvider } from '@/context/TaskContext';

const Index = () => {
  return (
    <TaskProvider>
      <AppLayout>
        {/* Main content is rendered through AppLayout */}
      </AppLayout>
    </TaskProvider>
  );
};

export default Index;
