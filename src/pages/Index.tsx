
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { TaskProvider } from '@/context/TaskContext';
import { FilterProvider } from '@/context/FilterContext';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <TaskProvider>
      <FilterProvider>
        <AppLayout />
      </FilterProvider>
    </TaskProvider>
  );
};

export default Index;
