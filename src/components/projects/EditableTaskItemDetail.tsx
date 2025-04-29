
import React, { useState } from 'react';
import { Task } from '@/context/TaskTypes';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { formatMinutes } from '@/lib/time-utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { getPriorityColor, getPriorityLabel } from '@/lib/priority-utils';
import { EditableDateTime } from '@/components/tasks/EditableDateTime';
import { EditablePriority } from '@/components/tasks/EditablePriority';
import { EditableEstimatedTime } from '@/components/tasks/EditableEstimatedTime';
import { useTaskContext } from '@/context/TaskContext';

interface EditableTaskItemDetailProps {
  task: Task;
  onEditStateChange?: (isEditing: boolean) => void;
}

const EditableTaskItemDetail: React.FC<EditableTaskItemDetailProps> = ({ task, onEditStateChange }) => {
  const isMobile = useIsMobile();
  const { updateTask } = useTaskContext();
  const [editingField, setEditingField] = useState<'dueDate' | 'priority' | 'estimatedTime' | null>(null);

  // Handle saving due date and time
  const handleSaveDueDate = (date: Date | undefined, timeSlot: string | undefined) => {
    updateTask({
      ...task,
      dueDate: date,
      timeSlot
    });
    setEditingField(null);
    if (onEditStateChange) onEditStateChange(false);
  };

  // Handle saving priority
  const handleSavePriority = (priority: typeof task.priority) => {
    updateTask({
      ...task,
      priority
    });
    setEditingField(null);
    if (onEditStateChange) onEditStateChange(false);
  };

  // Handle saving estimated time
  const handleSaveEstimatedTime = (estimatedTime: number | undefined) => {
    updateTask({
      ...task,
      estimatedTime
    });
    setEditingField(null);
    if (onEditStateChange) onEditStateChange(false);
  };

  // Handle click on field to edit
  const handleFieldClick = (field: 'dueDate' | 'priority' | 'estimatedTime', event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingField(field);
    if (onEditStateChange) onEditStateChange(true);
  };

  // Cancel any editing
  const handleCancelEdit = () => {
    setEditingField(null);
    if (onEditStateChange) onEditStateChange(false);
  };
  
  return (
    <div className="flex-grow min-w-0">
      <div className="flex items-center flex-wrap gap-1">
        <span className={`font-medium truncate ${task.completed ? 'line-through' : ''}`}>
          {task.title}
          {(task.isRecurring || task.recurrenceParentId) && (
            <Repeat size={isMobile ? 10 : 12} className="inline-block ml-0.5 text-primary" />
          )}
        </span>
        
        {editingField === 'dueDate' ? (
          <div 
            className="z-10 bg-background shadow-md rounded-md border p-2" 
            onClick={e => e.stopPropagation()}
          >
            <EditableDateTime 
              date={task.dueDate} 
              timeSlot={task.timeSlot} 
              onSave={handleSaveDueDate}
              onCancel={handleCancelEdit}
            />
          </div>
        ) : task.dueDate ? (
          <Badge 
            variant="outline" 
            className="text-[10px] md:text-xs flex items-center gap-1 shrink-0 cursor-pointer hover:bg-accent"
            onClick={(e) => handleFieldClick('dueDate', e)}
          >
            <Calendar size={isMobile ? 10 : 12} />
            {format(new Date(task.dueDate), 'MMM d')}
            {task.timeSlot && (
              <span className="ml-0.5">{task.timeSlot}</span>
            )}
          </Badge>
        ) : null}
        
        {!isMobile && (
          editingField === 'priority' ? (
            <div 
              className="z-10 bg-background shadow-md rounded-md border p-2" 
              onClick={e => e.stopPropagation()}
            >
              <EditablePriority 
                priority={task.priority} 
                onSave={handleSavePriority}
                onCancel={handleCancelEdit}
              />
            </div>
          ) : (
            <Badge 
              className={`text-xs ${getPriorityColor(task.priority).text} ${getPriorityColor(task.priority).bg} shrink-0 cursor-pointer hover:bg-accent-foreground hover:text-accent`}
              onClick={(e) => handleFieldClick('priority', e)}
            >
              {getPriorityLabel(task.priority)}
            </Badge>
          )
        )}
        
        {editingField === 'estimatedTime' ? (
          <div 
            className="z-10 bg-background shadow-md rounded-md border p-2" 
            onClick={e => e.stopPropagation()}
          >
            <EditableEstimatedTime 
              time={task.estimatedTime} 
              onSave={handleSaveEstimatedTime}
              onCancel={handleCancelEdit}
            />
          </div>
        ) : task.estimatedTime && task.estimatedTime > 0 ? (
          <Badge 
            variant="outline" 
            className="text-[10px] md:text-xs flex items-center gap-1 shrink-0 cursor-pointer hover:bg-accent"
            onClick={(e) => handleFieldClick('estimatedTime', e)}
          >
            <Clock size={isMobile ? 10 : 12} />
            {formatMinutes(task.estimatedTime)}
          </Badge>
        ) : null}
        
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

export default EditableTaskItemDetail;
