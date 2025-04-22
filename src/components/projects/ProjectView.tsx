
import React from 'react';
import { useTaskContext, Project, Task } from '@/context/TaskContext';
import ProjectItem from './ProjectItem';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AddTaskDialog from './AddTaskDialog';
import FilterButton from '@/components/filters/FilterButton';
import FilterPills from '@/components/filters/FilterPills';
import { useFilterContext, FilterType, ViewMode } from '@/context/FilterContext';

const ProjectView: React.FC = () => {
  const { projects, tasks } = useTaskContext();
  const { activeFilters, viewMode, excludeCompleted } = useFilterContext();
  const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);

  // Add console log for debugging
  React.useEffect(() => {
    console.log('ProjectView rendering with projects:', projects);
    console.log('ProjectView rendering with tasks:', tasks);
  }, [projects, tasks]);

  const handleAddTask = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsAddTaskOpen(true);
  };

  const getFilteredTasks = () => {
    let filteredTasks = [...tasks];
    
    // We're no longer filtering by completed status since it's been removed
    
    activeFilters.forEach(filter => {
      switch (filter.type) {
        case FilterType.PRIORITY:
          filteredTasks = filteredTasks.filter(task => task.priority === filter.value);
          break;
        case FilterType.PROJECT:
          filteredTasks = filteredTasks.filter(task => task.projectId === filter.value);
          break;
        // Remove FilterType.STATUS case since status has been removed
      }
    });
    
    return filteredTasks;
  };

  const getFilteredProjects = () => {
    const filteredTasks = getFilteredTasks();
    const projectIds = new Set(filteredTasks.map(task => task.projectId));
    return projects.filter(project => projectIds.has(project.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projects & Tasks</h2>
        <div className="flex gap-2">
          <FilterButton />
        </div>
      </div>

      <FilterPills />

      {projects.length > 0 ? (
        viewMode === ViewMode.GROUP_BY_PROJECT ? (
          <div className="space-y-4">
            {getFilteredProjects().map((project) => (
              <ProjectItem 
                key={project.id} 
                project={project}
                onAddTask={() => handleAddTask(project.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <ProjectItem 
                key={project.id} 
                project={project}
                onAddTask={() => handleAddTask(project.id)}
              />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No projects yet. Create your first project to get started!</p>
        </div>
      )}

      <AddTaskDialog 
        open={isAddTaskOpen} 
        onOpenChange={setIsAddTaskOpen} 
        projectId={selectedProjectId || ''}
      />
    </div>
  );
};

export default ProjectView;
