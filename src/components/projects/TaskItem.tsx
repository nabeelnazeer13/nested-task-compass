
import React, { useState } from 'react';
import { Task } from '@/context/TaskTypes';
import TaskItemMain from './TaskItemMain';
import AddTaskDialog from './AddTaskDialog';
import TimeTrackingDialog from '@/components/time-tracking/TimeTrackingDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';

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
    // Only open details if clicking the task container, not its controls
    if ((e.target as HTMLElement).closest('.task-controls')) {
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
            {task.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description}
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TaskItem;
