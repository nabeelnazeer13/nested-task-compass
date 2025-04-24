
import React from 'react';
import { Clock } from 'lucide-react';
import { TimeTracking, Task } from '@/context/TaskTypes';
import { format } from 'date-fns';
import { formatMinutes } from '@/lib/time-utils';

interface TimeTrackingDisplayProps {
  tracking: TimeTracking;
  task: Task | undefined;
}

const TimeTrackingDisplay: React.FC<TimeTrackingDisplayProps> = ({ tracking, task }) => {
  if (!task) return null;

  const startTime = format(new Date(tracking.startTime), 'HH:mm');
  const endTime = tracking.endTime 
    ? format(new Date(tracking.endTime), 'HH:mm')
    : 'ongoing';

  return (
    <div
      className="calendar-task bg-green-100 border-l-2 border-green-500 text-xs p-1 rounded-sm mt-0.5 flex items-center gap-1"
    >
      <Clock size={10} className="text-green-600" />
      <div>
        <span className="font-medium">{task.title}</span>
        <span className="ml-2">
          {startTime} - {endTime} ({formatMinutes(tracking.duration)})
        </span>
      </div>
    </div>
  );
};

export default TimeTrackingDisplay;
