
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TimeTracking } from '@/context/TaskTypes';
import { useTaskContext } from '@/context/TaskContext';
import { format } from 'date-fns';

interface ManualTimeEntryProps {
  onAddManualEntry: (entry: Omit<TimeTracking, 'id'>) => void;
  taskId: string;
}

const ManualTimeEntry: React.FC<ManualTimeEntryProps> = ({ 
  onAddManualEntry, 
  taskId 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState(format(new Date(), 'HH:mm'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create start date from date and time inputs
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date(date);
    startDate.setHours(hours, minutes, 0, 0);
    
    // Create end date based on duration
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + duration);
    
    const newEntry: Omit<TimeTracking, 'id'> = {
      taskId,
      startTime: startDate,
      endTime: endDate,
      duration,
      notes: notes || undefined
    };
    
    onAddManualEntry(newEntry);
    setIsOpen(false);
    
    // Reset form
    setDuration(30);
    setNotes('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setStartTime(format(new Date(), 'HH:mm'));
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
      >
        Add Manual Entry
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Manual Time Entry</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Start Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                step="1"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you work on?"
                className="h-20"
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManualTimeEntry;
