
import React, { useState } from 'react';
import { useTaskContext, Task, Priority } from '@/context/TaskContext';
import { 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  Calendar, 
  Plus,
  Clock,
  FileText,
  Play,
  Square,
  Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import AddTaskDialog from './AddTaskDialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import TimeTrackingDialog from '@/components/time-tracking/TimeTrackingDialog';
import { formatMinutes } from '@/lib/time-utils';
import { toast } from "sonner";

interface TaskItemProps {
  task: Task;
  level: number;
}

const priorityLabels: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

const priorityColors: Record<Priority, string> = {
  high: 'text-task-high',
  medium: 'text-task-medium',
  low: 'text-task-low'
};

const TaskItem: React.FC<TaskItemProps> = ({ task, level }) => {
  const { 
    toggleTaskExpanded, 
    deleteTask, 
    updateTask,
    activeTimeTracking,
    startTimeTracking,
    stopTimeTracking
  } = useTaskContext();
  
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [showTimeTrackingDialog, setShowTimeTrackingDialog] = useState(false);

  const handleUpdatePriority = (priority: Priority) => {
    updateTask({
      ...task,
      priority
    });
  };

  const isTracking = activeTimeTracking && activeTimeTracking.taskId === task.id;

  const handleTimeTrackingAction = () => {
    if (isTracking) {
      stopTimeTracking();
      toast.success(`Stopped tracking time for "${task.title}"`);
    } else {
      if (activeTimeTracking) {
        // Another task is being tracked
        toast.warning(`Stopped tracking "${activeTimeTracking.taskId}" and started tracking "${task.title}"`);
      } else {
        toast.success(`Started tracking time for "${task.title}"`);
      }
      startTimeTracking(task.id);
    }
  };

  const handleOpenTimeTracking = () => {
    setShowTimeTrackingDialog(true);
  };

  return (
    <div className="task-container">
      <div className="flex items-center p-2 task-item">
        <div className="flex-none mr-2">
          <Checkbox />
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
        
        <div className="flex-grow min-w-0">
          <div className="flex items-center">
            <span className="font-medium truncate">{task.title}</span>
            
            {task.dueDate && (
              <Badge variant="outline" className="ml-2 text-xs flex items-center gap-1">
                <Calendar size={12} />
                {format(task.dueDate, 'MMM d')}
              </Badge>
            )}
            
            <Badge className={`ml-2 text-xs ${priorityColors[task.priority]}`}>
              {priorityLabels[task.priority]}
            </Badge>
            
            {task.estimatedTime && (
              <Badge variant="outline" className="ml-2 text-xs flex items-center gap-1">
                <Clock size={12} />
                Est: {formatMinutes(task.estimatedTime)}
              </Badge>
            )}
            
            {task.timeTracked > 0 && (
              <Badge variant="outline" className="ml-2 text-xs flex items-center gap-1">
                <Clock size={12} />
                Tracked: {formatMinutes(task.timeTracked)}
              </Badge>
            )}
            
            {task.notes && (
              <Badge variant="outline" className="ml-2 text-xs flex items-center gap-1">
                <FileText size={12} />
                Notes
              </Badge>
            )}
            
            {isTracking && (
              <Badge className="ml-2 text-xs bg-green-100 text-green-800 animate-pulse">
                Tracking...
              </Badge>
            )}
          </div>
          
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {task.description}
            </p>
          )}
        </div>
        
        <div className="flex-none flex items-center">
          <Button 
            variant={isTracking ? "destructive" : "outline"} 
            size="sm" 
            className="h-8 w-8 p-0 mr-1"
            onClick={handleTimeTrackingAction}
          >
            {isTracking ? <Square size={16} /> : <Play size={16} />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 mr-1"
            onClick={handleOpenTimeTracking}
          >
            <Timer size={16} />
          </Button>
        
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => setIsAddingSubtask(true)}
          >
            <Plus size={16} />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
      </div>
      
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
