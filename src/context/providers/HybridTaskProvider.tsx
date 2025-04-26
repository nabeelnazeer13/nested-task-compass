
import React, { useState, useEffect } from 'react';
import { ReactNode } from 'react';
import { TaskContextProvider } from './TaskContextProvider';
import { SupabaseTaskProvider } from './SupabaseTaskProvider';
import { TimeTrackingProvider } from './TimeTrackingProvider';
import { ViewModeProvider } from './ViewModeProvider';
import { useAuth } from '../AuthContext';
import MigrationDialog from '@/components/migration/MigrationDialog';

export const HybridTaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [migrationCompleted, setMigrationCompleted] = useState(false);

  // Check if migration dialog should be shown
  useEffect(() => {
    if (user && !authLoading) {
      // Check if we have local data that needs migration
      const hasLocalData = !!(
        localStorage.getItem('quire-projects') || 
        localStorage.getItem('quire-tasks')
      );
      
      if (hasLocalData && !migrationCompleted) {
        setShowMigrationDialog(true);
      }
    }
  }, [user, authLoading]);

  const handleMigrationComplete = () => {
    setMigrationCompleted(true);
  };

  // If a user is logged in, use the Supabase provider, otherwise use the local storage provider
  if (user) {
    return (
      <SupabaseTaskProvider>
        <ViewModeProvider>
          <>
            {children}
            <MigrationDialog 
              open={showMigrationDialog} 
              onOpenChange={setShowMigrationDialog}
              onMigrationComplete={handleMigrationComplete}
            />
          </>
        </ViewModeProvider>
      </SupabaseTaskProvider>
    );
  }

  // Fallback to local storage when not authenticated
  return (
    <TaskContextProvider>
      <TimeTrackingProvider>
        <ViewModeProvider>
          {children}
        </ViewModeProvider>
      </TimeTrackingProvider>
    </TaskContextProvider>
  );
};
