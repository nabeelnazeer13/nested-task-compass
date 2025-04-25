
import React from 'react';
import { Task } from '@/context/TaskTypes';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { formatMinutes } from '@/lib/time-utils';
import TrackingHistory from '@/components/time-tracking/TrackingHistory';
import { useTaskContext } from '@/context/TaskContext';
import { priorityColors, priorityLabels } from '@/lib/priority-utils';

interface TaskDetailsContentProps {
  task: Task;
}

const TaskDetailsContent: React.FC<TaskDetailsContentProps> = ({ task }) => {
  const { timeTrackings, updateTimeTracking, deleteTimeTracking } = useTaskContext();
  const taskTrackings = timeTrackings.filter(t => t.taskId === task.id);

  return (
    <div className="space-y-4 pt-8">
      <h3 className="text-lg font-semibold">{task.title}</h3>
      
      <div className="flex flex-wrap gap-2">
        <Badge className={`${priorityColors[task.priority]}`}>
          {priorityLabels[task.priority]}
        </Badge>
        
        {task.dueDate && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar size={14} />
            {format(new Date(task.dueDate), 'MMM d')}
            {task.timeSlot && (
              <span className="ml-0.5">{task.timeSlot}</span>
            )}
          </Badge>
        )}

        {task.estimatedTime > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock size={14} />
            Est: {formatMinutes(task.estimatedTime)}
          </Badge>
        )}

        {task.timeTracked > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock size={14} />
            Tracked: {formatMinutes(task.timeTracked)}
          </Badge>
        )}
      </div>
      
      {task.description && (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {task.description}
        </p>
      )}

      <div className="pt-4">
        <h4 className="text-sm font-semibold mb-2">Time Tracking History</h4>
        <TrackingHistory
          trackings={taskTrackings}
          onUpdateTracking={updateTimeTracking}
          onDeleteTracking={deleteTimeTracking}
        />
      </div>
    </div>
  );
};

export default TaskDetailsContent;
