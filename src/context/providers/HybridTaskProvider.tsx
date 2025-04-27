
import React, { useState, useEffect } from 'react';
import { ReactNode } from 'react';
import { TaskContextProvider } from './TaskContextProvider';
import { SupabaseTaskProvider } from './SupabaseTaskProvider';
import { TimeTrackingProvider } from './TimeTrackingProvider';
import { ViewModeProvider } from './ViewModeProvider';
import { useAuth } from '../AuthContext';
import MigrationDialog from '@/components/migration/MigrationDialog';
import { toast } from '@/components/ui/use-toast';

export const HybridTaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [migrationCompleted, setMigrationCompleted] = useState(false);
  const [hasLocalData, setHasLocalData] = useState(false);

  // Check if migration dialog should be shown
  useEffect(() => {
    if (user && !authLoading) {
      // Check if we have local data that needs migration
      const hasProjects = !!localStorage.getItem('quire-projects'); 
      const hasTasks = !!localStorage.getItem('quire-tasks');
      const hasTimeBlocks = !!localStorage.getItem('quire-timeblocks');
      const hasTimeTrackings = !!localStorage.getItem('quire-timetrackings');
      
      const shouldShowMigration = (hasProjects || hasTasks || hasTimeBlocks || hasTimeTrackings);
      setHasLocalData(shouldShowMigration);
      
      if (shouldShowMigration && !migrationCompleted) {
        setShowMigrationDialog(true);
      }
    }
  }, [user, authLoading, migrationCompleted]);

  const handleMigrationComplete = () => {
    setMigrationCompleted(true);
    setShowMigrationDialog(false);
    toast({
      title: "Data Migration Successful",
      description: "Your data has been successfully migrated to the cloud.",
      variant: "default",
    });
  };

  const handleDismissMigration = () => {
    setShowMigrationDialog(false);
    if (hasLocalData) {
      toast({
        title: "Migration Skipped",
        description: "You can migrate your local data later from settings.",
        variant: "default",
      });
    }
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
              onOpenChange={handleDismissMigration}
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
