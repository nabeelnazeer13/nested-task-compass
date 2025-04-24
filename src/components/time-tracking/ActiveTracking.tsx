
import React from 'react';
import { Clock, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TimeTracking } from '@/context/TaskTypes';
import { formatTimeDisplay } from '@/lib/time-utils';

interface ActiveTrackingProps {
  isCurrentlyTracking: boolean;
  elapsedTime: number;
  activeTimeTracking: TimeTracking | null;
  onStopTracking: () => void;
}

const ActiveTracking: React.FC<ActiveTrackingProps> = ({
  isCurrentlyTracking,
  elapsedTime,
  activeTimeTracking,
  onStopTracking,
}) => {
  if (!isCurrentlyTracking) return null;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-xl font-mono">{formatTimeDisplay(elapsedTime)}</span>
        </div>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onStopTracking}
          className="gap-1"
        >
          <Square className="h-4 w-4" />
          Stop
        </Button>
      </div>
      
      <div>
        <Label>Notes (optional)</Label>
        <div className="text-sm mt-1 italic">
          {activeTimeTracking?.notes || 'No notes added'}
        </div>
      </div>
    </div>
  );
};

export default ActiveTracking;
