
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { 
  migrateDataToSupabase, 
  isMigrationNeeded, 
  markMigrationCompleted 
} from '@/services/migrationService';
import { useAuth } from '@/context/AuthContext';

interface MigrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMigrationComplete: () => void;
}

const MigrationDialog: React.FC<MigrationDialogProps> = ({
  open,
  onOpenChange,
  onMigrationComplete
}) => {
  const { user } = useAuth();
  const [isMigrating, setIsMigrating] = useState(false);
  
  const handleMigrateData = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to migrate your data.",
        variant: "destructive",
      });
      return;
    }
    
    setIsMigrating(true);
    const success = await migrateDataToSupabase();
    setIsMigrating(false);
    
    if (success) {
      markMigrationCompleted();
      onMigrationComplete();
      onOpenChange(false);
    }
  };
  
  const handleSkip = () => {
    toast({
      title: "Migration skipped",
      description: "You can migrate your data later from the settings.",
    });
    onOpenChange(false);
  };
  
  const migrationNeeded = isMigrationNeeded();
  
  return (
    <Dialog open={open && migrationNeeded} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Migrate Your Data</DialogTitle>
          <DialogDescription>
            We've detected data stored in your browser. Would you like to migrate it to your account?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-2">
            Migrating will transfer your:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Projects</li>
            <li>Tasks and subtasks</li>
            <li>Time tracking entries</li>
            <li>Calendar time blocks</li>
          </ul>
          
          <p className="mt-4 text-sm">
            This ensures your data is securely stored in the cloud and available across devices.
          </p>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleSkip}
          >
            Skip for now
          </Button>
          <Button
            onClick={handleMigrateData}
            disabled={isMigrating}
          >
            {isMigrating ? "Migrating..." : "Migrate my data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MigrationDialog;
