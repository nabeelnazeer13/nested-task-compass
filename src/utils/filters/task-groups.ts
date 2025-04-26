
import { Task } from '@/context/TaskTypes';
import { GroupBy } from '@/context/FilterContext';
import { TaskGroup } from './types';
import { groupTasksByDate } from './date-groups';
import { groupTasksByPriority } from './priority-groups';
import { groupTasksByProject } from './project-groups';

export const groupTasks = (
  tasks: Task[], 
  groupBy: GroupBy, 
  projects: any[]
): TaskGroup[] => {
  switch (groupBy) {
    case GroupBy.DATE:
      return groupTasksByDate(tasks);
    case GroupBy.PRIORITY:
      return groupTasksByPriority(tasks);
    case GroupBy.PROJECT:
      return groupTasksByProject(tasks, projects);
    default:
      return [{ id: 'all', title: 'All Tasks', tasks }];
  }
};
