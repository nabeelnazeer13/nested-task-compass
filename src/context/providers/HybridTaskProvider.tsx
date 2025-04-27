
import React, { useState, useEffect } from 'react';
import { ReactNode } from 'react';
import { TaskContextProvider } from './TaskContextProvider';
import { SupabaseTaskProvider } from './SupabaseTaskProvider';
import { TimeTrackingProvider } from './TimeTrackingProvider';
import { ViewModeProvider } from './ViewModeProvider';
import { useAuth } from '../AuthContext';
import MigrationDialog from '@/components/migration/MigrationDialog';
import { toast } from '@/components/ui/use-toast';
import { isMigrationNeeded } from '@/services/migrationService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const HybridTaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [migrationCompleted, setMigrationCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if migration dialog should be shown when user logs in
  useEffect(() => {
    if (user && !authLoading) {
      if (!migrationCompleted && isMigrationNeeded()) {
        setShowMigrationDialog(true);
      }
    }
    setIsLoading(false);
  }, [user, authLoading, migrationCompleted]);

  const handleMigrationComplete = () => {
    setMigrationCompleted(true);
    setShowMigrationDialog(false);
    toast({
      title: "Data Migration Successful",
      description: "Your data has been successfully migrated to the cloud.",
    });
  };

  const handleDismissMigration = () => {
    setShowMigrationDialog(false);
    if (isMigrationNeeded()) {
      toast({
        title: "Migration Skipped",
        description: "You can migrate your local data later from settings.",
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  // For authenticated users, use Supabase provider with TimeTrackingProvider
  if (user) {
    return (
      <ErrorBoundary>
        <ViewModeProvider>
          <SupabaseTaskProvider>
            <TimeTrackingProvider>
              <>
                {children}
                <MigrationDialog 
                  open={showMigrationDialog} 
                  onOpenChange={handleDismissMigration}
                  onMigrationComplete={handleMigrationComplete}
                />
              </>
            </TimeTrackingProvider>
          </SupabaseTaskProvider>
        </ViewModeProvider>
      </ErrorBoundary>
    );
  }

  // For unauthenticated users, use local storage provider
  return (
    <ErrorBoundary>
      <ViewModeProvider>
        <TaskContextProvider>
          <TimeTrackingProvider>
            {children}
          </TimeTrackingProvider>
        </TaskContextProvider>
      </ViewModeProvider>
    </ErrorBoundary>
  );
};
