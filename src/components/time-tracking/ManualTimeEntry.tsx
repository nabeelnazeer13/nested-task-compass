
import React from 'react';
import { Button } from '@/components/ui/button';

interface ManualTimeEntryProps {
  onAddManualEntry: () => void;
}

const ManualTimeEntry: React.FC<ManualTimeEntryProps> = ({ onAddManualEntry }) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onAddManualEntry}
    >
      Add Manual Entry
    </Button>
  );
};

export default ManualTimeEntry;
