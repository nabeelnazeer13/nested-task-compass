
import React, { useState, useEffect } from 'react';
import { useTaskContext, Task, TimeTracking } from '@/context/TaskContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Clock, Play, Square, Trash, Edit, Save, X } from 'lucide-react';
import { formatTimeDisplay } from '@/lib/time-utils';

interface TimeTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

const TimeTrackingDialog: React.FC<TimeTrackingDialogProps> = ({ 
  open, 
  onOpenChange, 
  task 
}) => {
  const { 
    timeTrackings, 
    activeTimeTracking, 
    startTimeTracking, 
    stopTimeTracking,
    updateTimeTracking,
    deleteTimeTracking,
    addTimeTracking
  } = useTaskContext();
  
  const [notes, setNotes] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isEditingIndex, setIsEditingIndex] = useState<number | null>(null);
  const [editedNotes, setEditedNotes] = useState('');
  
  // Get time trackings for this task
  const taskTrackings = timeTrackings.filter(tracking => tracking.taskId === task.id);
  const isCurrentlyTracking = activeTimeTracking && activeTimeTracking.taskId === task.id;
  
  // Update elapsed time every second when tracking
  useEffect(() => {
    if (!isCurrentlyTracking || !activeTimeTracking) return;
    
    const intervalId = setInterval(() => {
      const now = new Date();
      const startTime = new Date(activeTimeTracking.startTime);
      const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(elapsedSeconds);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [isCurrentlyTracking, activeTimeTracking]);
  
  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setNotes('');
      setIsEditingIndex(null);
    }
  }, [open]);
  
  const handleStartTracking = () => {
    startTimeTracking(task.id, notes);
    setNotes('');
  };
  
  const handleStopTracking = () => {
    stopTimeTracking();
    setElapsedTime(0);
  };
  
  const handleEditTracking = (index: number) => {
    setIsEditingIndex(index);
    setEditedNotes(taskTrackings[index].notes || '');
  };
  
  const handleSaveEdit = (tracking: TimeTracking) => {
    updateTimeTracking({
      ...tracking,
      notes: editedNotes
    });
    setIsEditingIndex(null);
  };
  
  const handleCancelEdit = () => {
    setIsEditingIndex(null);
  };
  
  const handleAddManualEntry = () => {
    // Implementation for adding manual time entry
    console.log('Add manual time entry');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Time Tracking - {task.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Active tracking section */}
          <div className="border rounded-md p-4">
            <h3 className="text-lg font-medium mb-3">Track Time</h3>
            
            {isCurrentlyTracking ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary animate-pulse" />
                    <span className="text-xl font-mono">{formatTimeDisplay(elapsedTime)}</span>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleStopTracking}
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
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tracking-notes">Notes (optional)</Label>
                  <Textarea 
                    id="tracking-notes" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What are you working on?"
                    className="h-20"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleStartTracking}
                    className="gap-1"
                  >
                    <Play className="h-4 w-4" />
                    Start Tracking
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Time tracking history */}
          <div className="border rounded-md">
            <div className="bg-muted/50 p-3 font-medium flex justify-between items-center">
              <h3>Time Tracking History</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddManualEntry}
              >
                Add Manual Entry
              </Button>
            </div>
            
            <div className="divide-y">
              {taskTrackings.length > 0 ? (
                taskTrackings.map((tracking, index) => (
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
                              onClick={() => deleteTimeTracking(tracking.id)}
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
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  No time tracking entries yet
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimeTrackingDialog;
