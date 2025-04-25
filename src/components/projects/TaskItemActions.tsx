
import React from 'react';
import { Task, Priority } from '@/context/TaskTypes';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Plus, Square, Play } from 'lucide-react';
import { useTaskContext } from '@/context/TaskContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';
import { priorityColors } from '@/lib/priority-utils';

interface TaskItemActionsProps {
  task: Task;
  onAddSubtask: () => void;
}

const TaskItemActions: React.FC<TaskItemActionsProps> = ({ task, onAddSubtask }) => {
  const { 
    updateTask, 
    deleteTask,
    activeTimeTracking,
    startTimeTracking,
    stopTimeTracking,
  } = useTaskContext();
  
  const isMobile = useIsMobile();
  const isTracking = activeTimeTracking && activeTimeTracking.taskId === task.id;

  const handleToggleCompleted = (checked: boolean) => {
    updateTask({
      ...task,
      completed: checked
    });
    
    if (checked) {
      toast.success(`Task "${task.title}" marked as completed`);
    }
  };

  const handleTimeTrackingAction = () => {
    if (isTracking) {
      stopTimeTracking();
      toast.success(`Stopped tracking time for "${task.title}"`);
    } else {
      if (activeTimeTracking) {
        toast.warning(`Stopped tracking "${activeTimeTracking.taskId}" and started tracking "${task.title}"`);
      } else {
        toast.success(`Started tracking time for "${task.title}"`);
      }
      startTimeTracking(task.id);
    }
  };

  const handleUpdatePriority = (priority: Priority) => {
    updateTask({
      ...task,
      priority
    });
  };

  return (
    <div className="flex-none flex items-center gap-0.5">
      <Button 
        variant={isTracking ? "destructive" : "outline"} 
        size={isMobile ? "icon" : "sm"} 
        className={isMobile ? "h-7 w-7" : "h-8 w-8"}
        onClick={handleTimeTrackingAction}
      >
        {isTracking ? <Square size={isMobile ? 14 : 16} /> : <Play size={isMobile ? 14 : 16} />}
      </Button>

      {isTracking && !isMobile && (
        <Badge className="ml-1 text-xs bg-green-100 text-green-800 animate-pulse">
          Tracking...
        </Badge>
      )}
      
      <Button 
        variant="ghost" 
        size={isMobile ? "icon" : "sm"} 
        className={isMobile ? "h-7 w-7" : "h-8 w-8"}
        onClick={onAddSubtask}
      >
        <Plus size={isMobile ? 14 : 16} />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size={isMobile ? "icon" : "sm"} 
            className={isMobile ? "h-7 w-7" : "h-8 w-8"}
          >
            <MoreHorizontal size={isMobile ? 14 : 16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[160px]">
          <DropdownMenuItem onClick={() => handleToggleCompleted(!task.completed)}>
            {task.completed ? (
              <>Unmark as Completed</>
            ) : (
              <>Mark as Completed</>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleUpdatePriority('low')}>
            <div className="mr-2 h-3 w-3 rounded-full bg-task-low"></div> Low Priority
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleUpdatePriority('medium')}>
            <div className="mr-2 h-3 w-3 rounded-full bg-task-medium"></div> Medium Priority
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleUpdatePriority('high')}>
            <div className="mr-2 h-3 w-3 rounded-full bg-task-high"></div> High Priority
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="text-destructive"
            onClick={() => deleteTask(task.id)}
          >
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TaskItemActions;
