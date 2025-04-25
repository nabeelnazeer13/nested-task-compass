
import React, { useState } from 'react';
import { Task } from '@/context/TaskTypes';
import TaskItemMain from './TaskItemMain';
import AddTaskDialog from './AddTaskDialog';
import TimeTrackingDialog from '@/components/time-tracking/TimeTrackingDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { formatMinutes } from '@/lib/time-utils';
import { priorityColors, priorityLabels } from '@/lib/priority-utils';

interface TaskItemProps {
  task: Task;
  level: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, level }) => {
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [showTimeTrackingDialog, setShowTimeTrackingDialog] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const isMobile = useIsMobile();

  const handleTaskClick = (e: React.MouseEvent) => {
    // Don't open details if clicking controls or expand/collapse button
    if (
      (e.target as HTMLElement).closest('.task-controls') ||
      (e.target as HTMLElement).closest('.expand-button')
    ) {
      return;
    }
    setShowTaskDetails(true);
  };

  return (
    <div className={`task-container ${isMobile ? 'py-0.5' : ''}`}>
      <div onClick={handleTaskClick} className="cursor-pointer">
        <TaskItemMain 
          task={task} 
          level={level}
          onAddSubtask={() => setIsAddingSubtask(true)}
        />
      </div>
      
      {task.isExpanded && task.children.length > 0 && (
        <div className={`task-children ${isMobile ? 'pl-2 ml-0.5' : ''}`}>
          {task.children.map((childTask) => (
            <TaskItem 
              key={childTask.id} 
              task={childTask} 
              level={level + 1}
            />
          ))}
        </div>
      )}
      
      <AddTaskDialog 
        open={isAddingSubtask} 
        onOpenChange={setIsAddingSubtask} 
        projectId={task.projectId}
        parentTaskId={task.id}
      />
      
      <TimeTrackingDialog
        open={showTimeTrackingDialog}
        onOpenChange={setShowTimeTrackingDialog}
        task={task}
      />

      <Sheet open={showTaskDetails} onOpenChange={setShowTaskDetails}>
        <SheetContent>
          <div className="space-y-4 pt-8">
            <h3 className="text-lg font-semibold">{task.title}</h3>
            
            <div className="flex flex-wrap gap-2">
              <Badge className={priorityColors[task.priority]}>
                {priorityLabels[task.priority]}
              </Badge>
              
              {task.dueDate && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar size={14} />
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  {task.timeSlot && (
                    <span className="ml-1">{task.timeSlot}</span>
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
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TaskItem;
