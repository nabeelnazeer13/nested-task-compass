
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Clock, Edit, Save, Trash, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TimeTracking } from '@/context/TaskTypes';

interface TrackingHistoryProps {
  trackings: TimeTracking[];
  onUpdateTracking: (tracking: TimeTracking) => void;
  onDeleteTracking: (trackingId: string) => void;
}

const TrackingHistory: React.FC<TrackingHistoryProps> = ({
  trackings,
  onUpdateTracking,
  onDeleteTracking,
}) => {
  const [isEditingIndex, setIsEditingIndex] = useState<number | null>(null);
  const [editedNotes, setEditedNotes] = useState('');

  const handleEditTracking = (index: number) => {
    setIsEditingIndex(index);
    setEditedNotes(trackings[index].notes || '');
  };

  const handleSaveEdit = (tracking: TimeTracking) => {
    onUpdateTracking({
      ...tracking,
      notes: editedNotes
    });
    setIsEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setIsEditingIndex(null);
  };

  if (trackings.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No time tracking entries yet
      </div>
    );
  }

  return (
    <div className="divide-y">
      {trackings.map((tracking, index) => (
        <div key={tracking.id} className="p-3 space-y-2">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {format(new Date(tracking.startTime), 'MMM d, yyyy')}
              </span>
              <span className="text-sm text-muted-foreground">
                {format(new Date(tracking.startTime), 'h:mm a')} - 
                {tracking.endTime ? format(new Date(tracking.endTime), ' h:mm a') : ' ongoing'}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="font-mono">
                {Math.floor(tracking.duration / 60)}h {tracking.duration % 60}m
              </span>
              
              {isEditingIndex === index ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleSaveEdit(tracking)}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditTracking(index)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDeleteTracking(tracking.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {isEditingIndex === index ? (
            <Textarea 
              value={editedNotes} 
              onChange={(e) => setEditedNotes(e.target.value)}
              placeholder="Add notes"
              className="h-20"
            />
          ) : (
            tracking.notes && (
              <div className="text-sm italic bg-muted/30 p-2 rounded-sm">
                {tracking.notes}
              </div>
            )
          )}
        </div>
      ))}
    </div>
  );
};

export default TrackingHistory;
