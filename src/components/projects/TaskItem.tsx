
import React, { useState } from 'react';
import { Task } from '@/context/TaskTypes';
import TaskItemMain from './TaskItemMain';
import AddTaskDialog from './AddTaskDialog';
import TimeTrackingDialog from '@/components/time-tracking/TimeTrackingDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import TaskDetailsContent from '@/components/tasks/TaskDetailsContent';

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
    // Don't open details if clicking the expand button, task controls or if editing is in progress
    if (
      (e.target as HTMLElement).closest('button') || 
      (e.target as HTMLElement).closest('.task-controls') ||
      (e.target as HTMLElement).closest('.cursor-pointer.hover\\:bg-accent') // Don't open details when clicking editable badges
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
        <SheetContent className={isMobile ? "max-h-[95vh] overflow-y-auto pb-16" : ""}>
          <TaskDetailsContent task={task} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TaskItem;
