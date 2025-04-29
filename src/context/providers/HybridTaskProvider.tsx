
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
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [migrationCompleted, setMigrationCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Safely access auth context
  useEffect(() => {
    try {
      const { user, loading } = useAuth();
      setUser(user);
      setAuthLoading(loading);
    } catch (error) {
      console.error("Error accessing auth context:", error);
      setAuthLoading(false);
    }
  }, []);

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

  const TaskProvider = user ? SupabaseTaskProvider : TaskContextProvider;

  return (
    <ErrorBoundary>
      <ViewModeProvider>
        <TaskProvider>
          <TimeTrackingProvider>
            <>
              {children}
              {showMigrationDialog && (
                <MigrationDialog 
                  open={showMigrationDialog} 
                  onOpenChange={handleDismissMigration}
                  onMigrationComplete={handleMigrationComplete}
                />
              )}
            </>
          </TimeTrackingProvider>
        </TaskProvider>
      </ViewModeProvider>
    </ErrorBoundary>
  );
};
