
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { TaskProvider } from '@/context/TaskContext';
import { FilterProvider } from '@/context/FilterContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Index = () => {
  return (
    <ErrorBoundary>
      <FilterProvider>
        <AppLayout />
      </FilterProvider>
    </ErrorBoundary>
  );
};

export default Index;
