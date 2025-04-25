import React, { useState } from 'react';
import { Task, Priority } from '@/context/TaskTypes';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TaskItemDetails from './TaskItemDetails';
import TaskItemActions from './TaskItemActions';
import { useTaskContext } from '@/context/TaskContext';
import { toast } from "sonner";
import { priorityColors } from '@/lib/priority-utils';

interface TaskItemMainProps {
  task: Task;
  level: number;
  onAddSubtask: () => void;
}

const TaskItemMain: React.FC<TaskItemMainProps> = ({ task, level, onAddSubtask }) => {
  const { toggleTaskExpanded, updateTask } = useTaskContext();
  const [isDragging, setIsDragging] = useState(false);

  const handleToggleCompleted = (checked: boolean) => {
    updateTask({
      ...task,
      completed: checked
    });
    
    if (checked) {
      toast.success(`Task "${task.title}" marked as completed`);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    
    if (!window.___draggingTaskId) {
      window.___draggingTaskId = task.id;
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setTimeout(() => {
      window.___draggingTaskId = undefined;
    }, 100);
  };

  return (
    <div 
      className={`flex items-center p-2 task-item ${task.completed ? 'opacity-60' : ''} ${isDragging ? 'opacity-50' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-none mr-2">
        <Checkbox 
          checked={task.completed} 
          onCheckedChange={handleToggleCompleted}
        />
      </div>
      
      {task.children.length > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 h-6 w-6 mr-1"
          onClick={() => toggleTaskExpanded(task.id)}
        >
          {task.isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </Button>
      )}
      
      <TaskItemDetails task={task} />
      <TaskItemActions task={task} onAddSubtask={onAddSubtask} />
    </div>
  );
};

export default TaskItemMain;
