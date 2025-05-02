
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { TaskProvider } from '@/context/TaskContext';
import { FilterProvider } from '@/context/FilterContext';
import { useAuth } from '@/context/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const Index = () => {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="h-12 w-12 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <FilterProvider>
        <TaskProvider>
          <AppLayout />
        </TaskProvider>
      </FilterProvider>
    </ErrorBoundary>
  );
};

export default Index;
