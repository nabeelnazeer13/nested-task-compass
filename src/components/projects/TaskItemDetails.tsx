
import React from 'react';
import { Task } from '@/context/TaskTypes';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { formatMinutes } from '@/lib/time-utils';
import TrackingHistory from '@/components/time-tracking/TrackingHistory';
import { useTaskContext } from '@/context/TaskContext';

interface TaskItemDetailsProps {
  task: Task;
}

const TaskItemDetails: React.FC<TaskItemDetailsProps> = ({ task }) => {
  const { timeTrackings, updateTimeTracking, deleteTimeTracking } = useTaskContext();
  const taskTrackings = timeTrackings.filter(tracking => tracking.taskId === task.id);
  
  return (
    <div className="space-y-6 pt-8">
      <div>
        <h3 className="text-2xl font-semibold mb-2">{task.title}</h3>
        {task.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4">
            {task.description}
          </p>
        )}
      </div>

      <div className="grid gap-4">
        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
              {task.timeSlot && (
                <span className="ml-1">at {task.timeSlot}</span>
              )}
            </Badge>
          </div>
        )}

        {/* Time Estimates */}
        <div className="flex flex-wrap gap-2">
          {task.estimatedTime > 0 && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Estimated: {formatMinutes(task.estimatedTime)}
            </Badge>
          )}
          
          {task.timeTracked > 0 && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Total tracked: {formatMinutes(task.timeTracked)}
            </Badge>
          )}
        </div>
      </div>

      {/* Time Tracking History */}
      {taskTrackings.length > 0 && (
        <div className="border rounded-md mt-6">
          <div className="bg-muted/50 p-3 font-medium">
            <h4>Time Tracking History</h4>
          </div>
          <TrackingHistory
            trackings={taskTrackings}
            onUpdateTracking={updateTimeTracking}
            onDeleteTracking={deleteTimeTracking}
          />
        </div>
      )}
    </div>
  );
};

export default TaskItemDetails;
