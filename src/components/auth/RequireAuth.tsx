
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Using try-catch to handle potential context error more gracefully
  try {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <LoadingSpinner className="h-12 w-12 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading authentication...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Auth context error:", error);
    // Redirect to login if auth context fails
    return <Navigate to="/login" replace />;
  }
};
