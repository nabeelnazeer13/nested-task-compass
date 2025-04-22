
import React from 'react';
import { useTaskContext, Task, Priority } from '@/context/TaskContext';
import { 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  Calendar, 
  Plus,
  Clock,
  Notes
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
    updateTask 
  } = useTaskContext();
  
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);

  const handleUpdatePriority = (priority: Priority) => {
    updateTask({
      ...task,
      priority
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
                Est: {formatTime(task.estimatedTime)}
              </Badge>
            )}
            
            {task.timeTracked > 0 && (
              <Badge variant="outline" className="ml-2 text-xs flex items-center gap-1">
                <Clock size={12} />
                Tracked: {formatTime(task.timeTracked)}
              </Badge>
            )}
            
            {task.notes && (
              <Badge variant="outline" className="ml-2 text-xs flex items-center gap-1">
                <Notes size={12} />
                Notes
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
    </div>
  );
};

export default TaskItem;
