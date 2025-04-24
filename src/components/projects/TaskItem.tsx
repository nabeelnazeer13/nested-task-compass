
import React, { useState } from 'react';
import { Task } from '@/context/TaskTypes';
import TaskItemMain from './TaskItemMain';
import AddTaskDialog from './AddTaskDialog';
import TimeTrackingDialog from '@/components/time-tracking/TimeTrackingDialog';

interface TaskItemProps {
  task: Task;
  level: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, level }) => {
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [showTimeTrackingDialog, setShowTimeTrackingDialog] = useState(false);

  return (
    <div className="task-container">
      <TaskItemMain 
        task={task} 
        level={level}
        onAddSubtask={() => setIsAddingSubtask(true)}
      />
      
      {task.isExpanded && task.children.length > 0 && (
        <div className="task-children">
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
    </div>
  );
};

export default TaskItem;
