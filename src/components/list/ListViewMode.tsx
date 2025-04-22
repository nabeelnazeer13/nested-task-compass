
import React, { useState } from 'react';
import { Task, useTaskContext } from '@/context/TaskContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

interface ListViewModeProps {
  tasks: Task[];
}

const ListViewMode: React.FC<ListViewModeProps> = ({ tasks }) => {
  const { updateTask } = useTaskContext();
  const [collapsedTasks, setCollapsedTasks] = useState<Record<string, boolean>>({});

  const toggleTaskCollapsed = (taskId: string) => {
    setCollapsedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const renderTasksHierarchy = (tasks: Task[], level = 0) => {
    return tasks.map(task => (
      <React.Fragment key={task.id}>
        <div 
          className="flex items-center p-3 border-b gap-3"
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          <Checkbox 
            className="flex-none"
          />
          
          <div className="flex-grow min-w-0 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {task.title}
              </span>
              
              {task.dueDate && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Calendar size={12} />
                  {format(task.dueDate, 'MMM d')}
                </Badge>
              )}
              
              <Badge className={`text-xs ${
                task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-blue-100 text-blue-800'
              }`}>
                {task.priority}
              </Badge>
              
              {task.estimatedTime && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Clock size={12} />
                  {Math.floor(task.estimatedTime / 60)}h {task.estimatedTime % 60}m
                </Badge>
              )}
            </div>
            
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {task.description}
              </p>
            )}
            
            {task.notes && (
              <p className="text-xs text-muted-foreground mt-1 truncate italic">
                Notes: {task.notes}
              </p>
            )}
          </div>
          
          {task.children && task.children.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => toggleTaskCollapsed(task.id)}
            >
              {collapsedTasks[task.id] ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </Button>
          )}
        </div>
        
        {task.children && task.children.length > 0 && (
          <Collapsible open={!collapsedTasks[task.id]}>
            <CollapsibleContent>
              {renderTasksHierarchy(task.children, level + 1)}
            </CollapsibleContent>
          </Collapsible>
        )}
      </React.Fragment>
    ));
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-muted/50 px-4 py-2 border-b flex items-center gap-3">
        <div className="w-5"></div>
        <div className="flex-grow font-medium">Task</div>
      </div>
      <div className="divide-y">
        {tasks.length > 0 ? (
          renderTasksHierarchy(tasks.filter(task => !task.parentId))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No tasks match your current filters
          </div>
        )}
      </div>
    </div>
  );
};

export default ListViewMode;
