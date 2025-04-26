
import { Task } from '@/context/TaskTypes';
import { TaskGroup } from './types';

export const groupTasksByProject = (tasks: Task[], projects: any[]): TaskGroup[] => {
  const projectGroups: Record<string, Task[]> = {};
  
  tasks.forEach(task => {
    if (!projectGroups[task.projectId]) {
      projectGroups[task.projectId] = [];
    }
    projectGroups[task.projectId].push(task);
  });
  
  return Object.keys(projectGroups).map(projectId => {
    const project = projects.find(p => p.id === projectId);
    return {
      id: projectId,
      title: project ? project.name : 'Unknown Project',
      tasks: projectGroups[projectId],
    };
  });
};
