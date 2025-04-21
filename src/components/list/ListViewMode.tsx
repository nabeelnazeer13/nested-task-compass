
import React from 'react';
import { Task, useTaskContext } from '@/context/TaskContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Circle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ListViewModeProps {
  tasks: Task[];
}

const ListViewMode: React.FC<ListViewModeProps> = ({ tasks }) => {
  const { updateTask } = useTaskContext();

  const handleToggleStatus = (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    updateTask({
      ...task,
      status: newStatus
    });
  };

  const renderTasksHierarchy = (tasks: Task[], level = 0) => {
    return tasks.map(task => (
      <React.Fragment key={task.id}>
        <div 
          className={`flex items-center p-3 border-b gap-3 ${task.status === 'done' ? 'bg-muted/30' : ''}`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          <Checkbox 
            checked={task.status === 'done'} 
            onCheckedChange={() => handleToggleStatus(task)} 
            className="flex-none"
          />
          
          <div className="flex-grow min-w-0 flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
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
              
              <Badge className={`text-xs ${
                task.status === 'done' ? 'bg-green-100 text-green-800' : 
                task.status === 'in-progress' ? 'bg-purple-100 text-purple-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {task.status === 'todo' ? (
                  <><Circle size={12} className="mr-1" /> To Do</>
                ) : task.status === 'in-progress' ? (
                  <><Clock size={12} className="mr-1" /> In Progress</>
                ) : (
                  <><CheckCircle size={12} className="mr-1" /> Done</>
                )}
              </Badge>
            </div>
            
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {task.description}
              </p>
            )}
          </div>
        </div>
        
        {task.children && task.children.length > 0 && task.isExpanded && (
          renderTasksHierarchy(task.children, level + 1)
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
