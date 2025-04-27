
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

export const HybridTaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [migrationCompleted, setMigrationCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if migration dialog should be shown when user logs in
  useEffect(() => {
    const initializeProvider = async () => {
      try {
        if (user && !authLoading) {
          if (!migrationCompleted && isMigrationNeeded()) {
            setShowMigrationDialog(true);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeProvider();
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
    if (isMigrationNeeded()) {
      toast({
        title: "Migration Skipped",
        description: "You can migrate your local data later from settings.",
        variant: "default",
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
        <p className="text-destructive font-semibold">Error loading application</p>
        <p className="text-muted-foreground">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

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
