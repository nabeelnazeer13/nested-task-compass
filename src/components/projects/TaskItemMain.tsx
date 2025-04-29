
import React, { useState } from 'react';
import { Task, Priority } from '@/context/TaskTypes';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import EditableTaskItemDetail from './EditableTaskItemDetail';
import TaskItemActions from './TaskItemActions';
import { useTaskContext } from '@/context/TaskContext';
import { toast } from "sonner";
import { priorityColors } from '@/lib/priority-utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface TaskItemMainProps {
  task: Task;
  level: number;
  onAddSubtask: () => void;
  onEditStateChange?: (isEditing: boolean) => void;
}

const TaskItemMain: React.FC<TaskItemMainProps> = ({ task, level, onAddSubtask, onEditStateChange }) => {
  const { toggleTaskExpanded, updateTask } = useTaskContext();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const swipeThreshold = 80; // Pixels needed to trigger complete action
  const isMobile = useIsMobile();
  
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

  // Mobile swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    
    // Only allow right swipe for completing
    if (diff > 0) {
      setTranslateX(Math.min(diff, swipeThreshold * 1.2));
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    
    if (translateX > swipeThreshold) {
      // Complete the task when swiped enough to the right
      handleToggleCompleted(true);
    }
    
    // Reset position with animation
    setTranslateX(0);
  };

  // Notify parent when editing state changes
  const handleEditStateChange = (isEditing: boolean) => {
    if (onEditStateChange) {
      onEditStateChange(isEditing);
    }
  };

  return (
    <div 
      className={`flex items-center p-2 task-item ${task.completed ? 'opacity-60' : ''} ${isDragging ? 'opacity-50' : ''} ${isMobile ? 'pl-1' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
      style={isMobile ? 
        { 
          transform: `translateX(${translateX}px)`,
          transition: translateX === 0 ? 'transform 0.3s ease-out' : 'none',
          background: translateX > 0 ? `rgba(74, 222, 128, ${translateX/150})` : undefined,
          position: 'relative'
        } : undefined
      }
    >
      {!isMobile && (
        <div className="flex-none mr-2">
          <Checkbox 
            checked={task.completed} 
            onCheckedChange={handleToggleCompleted}
          />
        </div>
      )}
      
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
      
      <EditableTaskItemDetail 
        task={task} 
        onEditStateChange={handleEditStateChange} 
      />
      
      <TaskItemActions task={task} onAddSubtask={onAddSubtask} />
      
      {isMobile && translateX > 0 && (
        <div 
          className="absolute left-0 top-0 bottom-0 flex items-center justify-center text-green-800 opacity-70"
          style={{ width: `${translateX}px` }}
        >
          {translateX > swipeThreshold/2 && (
            <span className="text-xs font-bold">Complete</span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskItemMain;
