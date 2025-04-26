
import React, { useState } from 'react';
import { Task } from '@/context/TaskTypes';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { formatMinutes } from '@/lib/time-utils';
import TrackingHistory from '@/components/time-tracking/TrackingHistory';
import { useTaskContext, useTimeTrackingContext } from '@/context/TaskContext';
import { priorityColors, priorityLabels } from '@/lib/priority-utils';
import { EditablePriority } from './EditablePriority';
import { EditableDateTime } from './EditableDateTime';
import { EditableEstimatedTime } from './EditableEstimatedTime';
import { EditableDescription } from './EditableDescription';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface TaskDetailsContentProps {
  task: Task;
}

const TaskDetailsContent: React.FC<TaskDetailsContentProps> = ({ task }) => {
  const { updateTask } = useTaskContext();
  const { timeTrackings, updateTimeTracking, deleteTimeTracking } = useTimeTrackingContext();
  const taskTrackings = timeTrackings.filter(t => t.taskId === task.id);
  const isMobile = useIsMobile();
  
  const [editingPriority, setEditingPriority] = useState(false);
  const [editingDateTime, setEditingDateTime] = useState(false);
  const [editingEstimatedTime, setEditingEstimatedTime] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);

  const handleSavePriority = (priority: Task['priority']) => {
    updateTask({ ...task, priority });
    setEditingPriority(false);
  };

  const handleSaveDateTime = (dueDate: Date | undefined, timeSlot: string | undefined) => {
    updateTask({ ...task, dueDate, timeSlot });
    setEditingDateTime(false);
  };

  const handleSaveEstimatedTime = (estimatedTime: number | undefined) => {
    updateTask({ ...task, estimatedTime });
    setEditingEstimatedTime(false);
  };

  const handleSaveDescription = (description: string | undefined) => {
    updateTask({ ...task, description });
    setEditingDescription(false);
  };

  const textSizeClass = isMobile ? 'text-sm' : 'text-base';

  return (
    <div className="space-y-4 pt-8">
      <h3 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>{task.title}</h3>
      
      <div className="space-y-4">
        {editingPriority ? (
          <EditablePriority
            priority={task.priority}
            onSave={handleSavePriority}
            onCancel={() => setEditingPriority(false)}
          />
        ) : (
          <div className="flex items-center gap-2">
            <Badge className={`${priorityColors[task.priority]}`}>
              {priorityLabels[task.priority]}
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => setEditingPriority(true)}>
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {editingDateTime ? (
          <EditableDateTime
            date={task.dueDate}
            timeSlot={task.timeSlot}
            onSave={handleSaveDateTime}
            onCancel={() => setEditingDateTime(false)}
          />
        ) : (
          task.dueDate && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar size={14} />
                {format(new Date(task.dueDate), 'MMM d')}
                {task.timeSlot && <span className="ml-0.5">{task.timeSlot}</span>}
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => setEditingDateTime(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )
        )}

        {editingEstimatedTime ? (
          <EditableEstimatedTime
            time={task.estimatedTime}
            onSave={handleSaveEstimatedTime}
            onCancel={() => setEditingEstimatedTime(false)}
          />
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock size={14} />
              Est: {formatMinutes(task.estimatedTime || 0)}
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => setEditingEstimatedTime(true)}>
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {task.timeTracked > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock size={14} />
            Tracked: {formatMinutes(task.timeTracked)}
          </Badge>
        )}
      </div>
      
      <div className="space-y-2">
        {editingDescription ? (
          <EditableDescription
            description={task.description}
            onSave={handleSaveDescription}
            onCancel={() => setEditingDescription(false)}
          />
        ) : (
          <div className="space-y-2">
            <p className={`${textSizeClass} text-muted-foreground whitespace-pre-wrap`}>
              {task.description || "No description"}
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setEditingDescription(true)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              <span>{task.description ? "Edit" : "Add"} description</span>
            </Button>
          </div>
        )}
      </div>

      <div className="pt-4">
        <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold mb-2`}>
          Time Tracking History
        </h4>
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
