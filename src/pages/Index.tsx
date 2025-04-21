
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { TaskProvider } from '@/context/TaskContext';
import { FilterProvider } from '@/context/FilterContext';

const Index = () => {
  return (
    <TaskProvider>
      <FilterProvider>
        <AppLayout />
      </FilterProvider>
    </TaskProvider>
  );
};

export default Index;
