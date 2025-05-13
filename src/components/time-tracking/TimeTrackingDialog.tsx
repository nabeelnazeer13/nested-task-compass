
import React, { useState, useEffect } from 'react';
import { useTimeTrackingContext, Task, TimeTracking } from '@/context/TaskContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ActiveTracking from './ActiveTracking';
import TimeTrackingControls from './TimeTrackingControls';
import TrackingHistory from './TrackingHistory';
import ManualTimeEntry from './ManualTimeEntry';

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
    addTimeTracking,
    updateTimeTracking,
    deleteTimeTracking
  } = useTimeTrackingContext();
  
  const [notes, setNotes] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  
  console.log(`TimeTrackingDialog: Rendered for task ${task?.id}`, { 
    taskTitle: task?.title,
    isCurrentlyTracking: activeTimeTracking?.taskId === task?.id,
    contextAvailable: !!startTimeTracking
  });
  
  const taskTrackings = timeTrackings.filter(tracking => tracking.taskId === task.id);
  const isCurrentlyTracking = activeTimeTracking && activeTimeTracking.taskId === task.id;
  
  console.log('TimeTrackingDialog: Current state', {
    taskTrackings: taskTrackings.length,
    isCurrentlyTracking,
    activeTimeTracking: activeTimeTracking ? {
      id: activeTimeTracking.id,
      taskId: activeTimeTracking.taskId,
      startTime: activeTimeTracking.startTime
    } : null
  });
  
  useEffect(() => {
    if (!isCurrentlyTracking || !activeTimeTracking) return;
    
    console.log('TimeTrackingDialog: Setting up elapsed time interval');
    const intervalId = setInterval(() => {
      const now = new Date();
      const startTime = new Date(activeTimeTracking.startTime);
      const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(elapsedSeconds);
    }, 1000);
    
    return () => {
      console.log('TimeTrackingDialog: Clearing elapsed time interval');
      clearInterval(intervalId);
    };
  }, [isCurrentlyTracking, activeTimeTracking]);
  
  useEffect(() => {
    if (open) {
      console.log('TimeTrackingDialog: Dialog opened, resetting notes');
      setNotes('');
    }
  }, [open]);
  
  const handleStartTracking = () => {
    console.log(`TimeTrackingDialog: Starting tracking for task ${task.id}`);
    startTimeTracking(task.id, notes);
    setNotes('');
  };
  
  const handleAddManualEntry = (entry: Omit<TimeTracking, 'id'>) => {
    console.log('TimeTrackingDialog: Adding manual entry', entry);
    addTimeTracking(entry);
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
              <ActiveTracking 
                isCurrentlyTracking={isCurrentlyTracking}
                elapsedTime={elapsedTime}
                activeTimeTracking={activeTimeTracking}
                onStopTracking={stopTimeTracking}
              />
            ) : (
              <TimeTrackingControls
                notes={notes}
                onNotesChange={setNotes}
                onStartTracking={handleStartTracking}
              />
            )}
          </div>
          
          {/* Time tracking history */}
          <div className="border rounded-md">
            <div className="bg-muted/50 p-3 font-medium flex justify-between items-center">
              <h3>Time Tracking History</h3>
              <ManualTimeEntry 
                onAddManualEntry={handleAddManualEntry} 
                taskId={task.id}
              />
            </div>
            
            <TrackingHistory
              trackings={taskTrackings}
              onUpdateTracking={updateTimeTracking}
              onDeleteTracking={deleteTimeTracking}
            />
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
