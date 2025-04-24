
import React, { useState } from 'react';
import { Project, Task } from '@/context/TaskContext';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTaskContext } from '@/context/TaskContext';
import TaskItem from './TaskItem';
import { Badge } from '@/components/ui/badge';

interface ProjectItemProps {
  project: Project;
  onAddTask: (projectId: string) => void;
  hideChildrenInitially?: boolean;
  showOnlyTasks?: string[];
  listMode?: boolean;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ 
  project, 
  onAddTask, 
  hideChildrenInitially = false,
  showOnlyTasks,
  listMode = false
}) => {
  const { tasks, toggleProjectExpanded } = useTaskContext();
  const [isExpanded, setIsExpanded] = useState(!hideChildrenInitially);
  
  const projectTasks = tasks
    .filter(task => task.projectId === project.id && !task.parentId)
    .sort((a, b) => {
      // Sort by priority
      const priorityValues: Record<string, number> = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityValues[b.priority] - priorityValues[a.priority];
      
      // If priority is the same, sort by due date (if available)
      if (priorityDiff === 0) {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      return priorityDiff;
    });

  const filteredTasks = showOnlyTasks 
    ? tasks.filter(task => showOnlyTasks.includes(task.id)) 
    : projectTasks;

  const handleToggleExpanded = () => {
    if (!listMode) {
      toggleProjectExpanded(project.id);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="overflow-hidden">
      {!listMode && (
        <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 h-8 w-8"
              onClick={handleToggleExpanded}
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </Button>
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <Badge variant="outline">{filteredTasks.length}</Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 h-8 w-8"
            onClick={() => onAddTask(project.id)}
          >
            <Plus size={20} />
          </Button>
        </CardHeader>
      )}
      
      {(isExpanded || listMode) && (
        <CardContent className={listMode ? "p-0" : "pt-3"}>
          {filteredTasks.length > 0 ? (
            <div className="space-y-1 task-list">
              {filteredTasks.map(task => (
                <TaskItem key={task.id} task={task} level={0} />
              ))}
            </div>
          ) : (
            <div className="py-2 text-center text-muted-foreground">
              <p>No tasks yet</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ProjectItem;
