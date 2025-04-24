
import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TimeTrackingControlsProps {
  notes: string;
  onNotesChange: (value: string) => void;
  onStartTracking: () => void;
}

const TimeTrackingControls: React.FC<TimeTrackingControlsProps> = ({
  notes,
  onNotesChange,
  onStartTracking,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tracking-notes">Notes (optional)</Label>
        <Textarea 
          id="tracking-notes" 
          value={notes} 
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="What are you working on?"
          className="h-20"
        />
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={onStartTracking}
          className="gap-1"
        >
          <Play className="h-4 w-4" />
          Start Tracking
        </Button>
      </div>
    </div>
  );
};

export default TimeTrackingControls;
