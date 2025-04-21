
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { TaskProvider } from '@/context/TaskContext';

const Index = () => {
  return (
    <TaskProvider>
      <AppLayout />
    </TaskProvider>
  );
};

export default Index;

