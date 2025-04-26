
import React from 'react';
import { Task } from '@/context/TaskTypes';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { formatMinutes } from '@/lib/time-utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { getPriorityColor, getPriorityLabel } from '@/lib/priority-utils';

interface TaskItemDetailsProps {
  task: Task;
}

const TaskItemDetails: React.FC<TaskItemDetailsProps> = ({ task }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex-grow min-w-0">
      <div className="flex items-center flex-wrap gap-1">
        <span className={`font-medium truncate ${task.completed ? 'line-through' : ''}`}>
          {task.title}
          {(task.isRecurring || task.recurrenceParentId) && (
            <Repeat size={isMobile ? 10 : 12} className="inline-block ml-0.5 text-primary" />
          )}
        </span>
        
        {task.dueDate && (
          <Badge variant="outline" className="text-[10px] md:text-xs flex items-center gap-1 shrink-0">
            <Calendar size={isMobile ? 10 : 12} />
            {format(new Date(task.dueDate), 'MMM d')}
            {task.timeSlot && (
              <span className="ml-0.5">{task.timeSlot}</span>
            )}
          </Badge>
        )}
        
        {!isMobile && (
          <Badge className={`text-xs ${getPriorityColor(task.priority).text} ${getPriorityColor(task.priority).bg} shrink-0`}>
            {getPriorityLabel(task.priority)}
          </Badge>
        )}
        
        {task.estimatedTime > 0 && (
          <Badge variant="outline" className="text-[10px] md:text-xs flex items-center gap-1 shrink-0">
            <Clock size={isMobile ? 10 : 12} />
            {formatMinutes(task.estimatedTime)}
          </Badge>
        )}
        
        {task.timeTracked > 0 && (
          <Badge variant="outline" className="text-[10px] md:text-xs flex items-center gap-1 shrink-0">
            <Clock size={isMobile ? 10 : 12} />
            {formatMinutes(task.timeTracked)}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default TaskItemDetails;
