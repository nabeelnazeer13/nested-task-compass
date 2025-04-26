
import { Task, Priority } from '@/context/TaskTypes';
import { SortBy, SortDirection } from '@/context/FilterContext';

export const sortTasks = (tasks: Task[], sortBy: SortBy, sortDirection: SortDirection): Task[] => {
  return [...tasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case SortBy.TITLE:
        comparison = a.title.localeCompare(b.title);
        break;
      
      case SortBy.DUE_DATE:
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      
      case SortBy.PRIORITY:
        const priorityValues: Record<Priority, number> = { 
          high: 3, 
          medium: 2, 
          low: 1 
        };
        comparison = priorityValues[b.priority] - priorityValues[a.priority];
        break;
      
      default:
        comparison = 0;
    }
    
    return sortDirection === SortDirection.ASC ? comparison : -comparison;
  });
};
