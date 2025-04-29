
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { FilterProvider } from '@/context/FilterContext';
import { useAuth } from '@/context/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const Index = () => {
  try {
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
          <AppLayout />
        </FilterProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("Error in Index component:", error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Something went wrong.</p>
          <p className="text-muted-foreground">Please refresh the page or try again later.</p>
        </div>
      </div>
    );
  }
};

export default Index;
