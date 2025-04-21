
import React from 'react';
import { useTaskContext, Project, Task } from '@/context/TaskContext';
import { ChevronDown, ChevronUp, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TaskItem from './TaskItem';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface ProjectItemProps {
  project: Project;
  onAddTask: () => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project, onAddTask }) => {
  const { 
    toggleProjectExpanded, 
    deleteProject, 
    tasks
  } = useTaskContext();

  // Get top-level tasks for this project
  const projectTasks = tasks.filter(
    task => task.projectId === project.id && !task.parentId
  );

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-4 bg-card">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 h-auto"
            onClick={() => toggleProjectExpanded(project.id)}
          >
            {project.isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
          <div>
            <h3 className="font-medium">{project.name}</h3>
            {project.description && (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-2"
            onClick={onAddTask}
          >
            <Plus size={16} className="mr-1" /> Add Task
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => deleteProject(project.id)}
              >
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {project.isExpanded && (
        <div className="bg-card/50 p-2">
          {projectTasks.length > 0 ? (
            <div className="space-y-1">
              {projectTasks.map((task) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  level={0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No tasks in this project yet</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={onAddTask}
              >
                <Plus size={16} className="mr-1" /> Add your first task
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectItem;
