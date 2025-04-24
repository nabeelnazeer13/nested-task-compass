
import React from 'react';
import { Task } from '@/context/TaskTypes';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { formatMinutes } from '@/lib/time-utils';

interface TaskItemDetailsProps {
  task: Task;
}

const priorityColors: Record<string, string> = {
  high: 'text-task-high',
  medium: 'text-task-medium',
  low: 'text-task-low'
};

const priorityLabels: Record<string, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

const TaskItemDetails: React.FC<TaskItemDetailsProps> = ({ task }) => {
  return (
    <div className="flex-grow min-w-0">
      <div className="flex items-center flex-wrap">
        <span className={`font-medium truncate ${task.completed ? 'line-through' : ''}`}>
          {task.title}
        </span>
        
        {task.dueDate && (
          <Badge variant="outline" className="ml-2 text-xs flex items-center gap-1">
            <Calendar size={12} />
            {format(new Date(task.dueDate), 'MMM d')}
            {task.timeSlot && <span className="ml-1">{task.timeSlot}</span>}
          </Badge>
        )}
        
        <Badge className={`ml-2 text-xs ${priorityColors[task.priority]}`}>
          {priorityLabels[task.priority]}
        </Badge>
        
        {task.estimatedTime > 0 && (
          <Badge variant="outline" className="ml-2 text-xs flex items-center gap-1">
            <Clock size={12} />
            Est: {formatMinutes(task.estimatedTime)}
          </Badge>
        )}
        
        {task.timeTracked > 0 && (
          <Badge variant="outline" className="ml-2 text-xs flex items-center gap-1">
            <Clock size={12} />
            Tracked: {formatMinutes(task.timeTracked)}
          </Badge>
        )}
        
        {task.notes && (
          <Badge variant="outline" className="ml-2 text-xs flex items-center gap-1">
            <FileText size={12} />
            Notes
          </Badge>
        )}
      </div>
      
      {task.description && (
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {task.description}
        </p>
      )}
    </div>
  );
};

export default TaskItemDetails;
