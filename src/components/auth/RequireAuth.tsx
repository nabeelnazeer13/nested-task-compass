
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Using try-catch to handle potential context error more gracefully
  try {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
      return <div>Loading...</div>;
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
