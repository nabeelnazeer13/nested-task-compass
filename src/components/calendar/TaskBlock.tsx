
import React, { useState } from 'react';
import { Play, Clock } from 'lucide-react';
import { Task } from '@/context/TaskTypes';
import { formatMinutes } from '@/lib/time-utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import TaskDetailsContent from '@/components/tasks/TaskDetailsContent';
import { priorityColors } from '@/lib/priority-utils';

interface TaskBlockProps {
  task: Task;
  onClick?: () => void;
  showTimeSlot?: boolean;
  activeTaskId?: string | null;
}

const TaskBlock: React.FC<TaskBlockProps> = ({ 
  task, 
  onClick, 
  showTimeSlot = false,
  activeTaskId 
}) => {
  const [showTaskDetails, setShowTaskDetails] = useState(false);

  const getHeightClass = () => {
    if (!task.estimatedTime) return 'h-6'; // Default height
    
    // Each hour slot is 48px (h-12), so calculate proportional height
    const heightInPixels = Math.max((task.estimatedTime / 60) * 48, 24); // Minimum 24px height
    return `h-[${heightInPixels}px]`;
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 border-l-2 border-red-500';
      case 'medium':
        return 'bg-yellow-100 border-l-2 border-yellow-500';
      case 'low':
        return 'bg-blue-100 border-l-2 border-blue-500';
      default:
        return 'bg-blue-100 border-l-2 border-blue-500';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
    setShowTaskDetails(true);
  };

  return (
    <>
      <div 
        className={`calendar-task ${getPriorityClass(task.priority)} p-1 rounded-sm text-xs cursor-pointer ${getHeightClass()}`}
        onClick={handleClick}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', task.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
      >
        <div className="flex items-center justify-between">
          <span className="truncate">{task.title}</span>
          {showTimeSlot && task.timeSlot && (
            <span className="text-xs text-muted-foreground ml-1">{task.timeSlot}</span>
          )}
          {activeTaskId === task.id && (
            <Play size={10} className="text-green-600 animate-pulse flex-shrink-0 ml-1" />
          )}
        </div>
        {task.estimatedTime > 0 && (
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <Clock size={10} />
            Est: {formatMinutes(task.estimatedTime)}
          </div>
        )}
      </div>

      <Sheet open={showTaskDetails} onOpenChange={setShowTaskDetails}>
        <SheetContent>
          <TaskDetailsContent task={task} />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default TaskBlock;
