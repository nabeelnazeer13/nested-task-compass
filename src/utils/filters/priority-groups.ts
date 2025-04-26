
import { Task, Priority } from '@/context/TaskTypes';
import { TaskGroup } from './types';

export const groupTasksByPriority = (tasks: Task[]): TaskGroup[] => {
  const groups: Record<Priority, Task[]> = {
    high: [],
    medium: [],
    low: [],
  };
  
  tasks.forEach(task => {
    groups[task.priority].push(task);
  });
  
  return [
    { id: 'high', title: 'High Priority', tasks: groups.high },
    { id: 'medium', title: 'Medium Priority', tasks: groups.medium },
    { id: 'low', title: 'Low Priority', tasks: groups.low },
  ].filter(group => group.tasks.length > 0);
};
