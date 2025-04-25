
import React from 'react';
import { Task } from '@/context/TaskTypes';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTaskContext } from '@/context/TaskContext';
import TaskItemDetails from './TaskItemDetails';

interface TaskItemMainProps {
  task: Task;
  level: number;
  onAddSubtask: () => void;
}

const TaskItemMain: React.FC<TaskItemMainProps> = ({ task, level, onAddSubtask }) => {
  const { toggleTaskExpanded } = useTaskContext();
  
  return (
    <div className="flex items-center p-2">
      {task.children.length > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 h-6 w-6 mr-1 expand-button"
          onClick={() => toggleTaskExpanded(task.id)}
        >
          {task.isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </Button>
      )}
      
      <TaskItemDetails task={task} />
    </div>
  );
};

export default TaskItemMain;
