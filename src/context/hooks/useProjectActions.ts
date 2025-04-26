
import { useState } from 'react';
import { Project } from '../TaskTypes';
import { generateId } from '../TaskHelpers';

export function useProjectActions(projectsInit: Project[], setProjects: (proj: Project[]) => void) {
  const [projects, _setProjects] = useState<Project[]>(projectsInit);
  
  const addProject = (project: Omit<Project, 'id' | 'isExpanded'>) => {
    const newProject = { ...project, id: generateId(), isExpanded: true };
    setProjects([...projects, newProject]);
  };

  const updateProject = (project: Project) => {
    setProjects(projects.map((p) => (p.id === project.id ? project : p)));
  };

  const deleteProject = (projectId: string) => {
    setProjects(projects.filter((p) => p.id !== projectId));
  };

  const toggleProjectExpanded = (projectId: string) => {
    setProjects(
      projects.map((p) =>
        p.id === projectId ? { ...p, isExpanded: !p.isExpanded } : p
      )
    );
  };

  return {
    addProject,
    updateProject,
    deleteProject,
    toggleProjectExpanded
  };
}
