
import React from 'react';
import { useTaskContext, Project } from '@/context/TaskContext';
import ProjectItem from './ProjectItem';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AddTaskDialog from './AddTaskDialog';

const ProjectView: React.FC = () => {
  const { projects } = useTaskContext();
  const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);

  const handleAddTask = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsAddTaskOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projects & Tasks</h2>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectItem 
              key={project.id} 
              project={project}
              onAddTask={() => handleAddTask(project.id)}
            />
          ))}
        </div>
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
