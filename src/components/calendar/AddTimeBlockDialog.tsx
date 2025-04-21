
import React, { useState } from 'react';
import { useTaskContext, Task } from '@/context/TaskContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddTimeBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  date: Date;
}

// Helper to generate time slots for selection
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 21; hour++) {
    const hourStr = hour % 12 === 0 ? 12 : hour % 12;
    const meridiem = hour < 12 ? 'AM' : 'PM';
    
    slots.push(`${hourStr}:00 ${meridiem}`);
    slots.push(`${hourStr}:30 ${meridiem}`);
  }
  return slots;
};

const timeSlots = generateTimeSlots();

const AddTimeBlockDialog: React.FC<AddTimeBlockDialogProps> = ({ 
  open, 
  onOpenChange, 
  task,
  date
}) => {
  const { addTimeBlock } = useTaskContext();
  
  const [startTime, setStartTime] = useState(timeSlots[0]);
  const [endTime, setEndTime] = useState(timeSlots[2]);

  const handleAddTimeBlock = () => {
    addTimeBlock({
      taskId: task.id,
      date,
      startTime,
      endTime
    });
    
    // Close dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Time Block for Task</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div>
            <p className="font-medium">{task.title}</p>
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label>Date</Label>
            <div className="p-2 border rounded-md">
              {format(date, 'PPPP')}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger id="start-time">
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="end-time">End Time</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger id="end-time">
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem 
                      key={time} 
                      value={time}
                      disabled={timeSlots.indexOf(time) <= timeSlots.indexOf(startTime)}
                    >
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddTimeBlock}>
            Add Time Block
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTimeBlockDialog;
