
import { Task, Priority } from '@/context/TaskTypes';
import { DateGroup, GroupBy, SortBy, SortDirection, Filter, FilterType, FilterOperator } from '@/context/FilterContext';
import { isBefore, isToday, isTomorrow, isThisWeek, isAfter, startOfDay, addDays, endOfDay, startOfWeek, endOfWeek, addWeeks } from 'date-fns';

export interface TaskGroup {
  id: string;
  title: string;
  tasks: Task[];
}

export const filterTasks = (tasks: Task[], filters: Filter[], excludeCompleted: boolean): Task[] => {
  return tasks.filter(task => {
    // Skip completed tasks if excludeCompleted is true
    if (excludeCompleted && task.completed) {
      return false;
    }

    // Apply all filters
    return filters.every(filter => {
      switch (filter.type) {
        case FilterType.PRIORITY:
          return filter.operator === FilterOperator.EQUALS 
            ? task.priority === filter.value
            : task.priority !== filter.value;
        
        case FilterType.PROJECT:
          return filter.operator === FilterOperator.EQUALS
            ? task.projectId === filter.value
            : task.projectId !== filter.value;
        
        case FilterType.DUE_DATE:
          // No due date filtering
          if (!task.dueDate) {
            return filter.operator === FilterOperator.IS_NOT_SET;
          }
          
          const dueDate = new Date(task.dueDate);
          const today = startOfDay(new Date());
          
          switch (filter.value) {
            case DateGroup.TODAY:
              return isToday(dueDate);
            case DateGroup.TOMORROW:
              return isTomorrow(dueDate);
            case DateGroup.THIS_WEEK:
              return isThisWeek(dueDate) && !isToday(dueDate) && !isTomorrow(dueDate);
            case DateGroup.NEXT_WEEK:
              const nextWeekStart = startOfWeek(addWeeks(today, 1));
              const nextWeekEnd = endOfWeek(nextWeekStart);
              return isAfter(dueDate, nextWeekStart) && isBefore(dueDate, nextWeekEnd);
            case DateGroup.LATER:
              return isAfter(dueDate, endOfWeek(addWeeks(today, 1)));
            default:
              return true;
          }
        
        default:
          return true;
      }
    });
  });
};

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

export const getDateGroup = (date: Date | undefined): DateGroup => {
  if (!date) return DateGroup.NO_DATE;
  
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const nextWeekStart = startOfWeek(addWeeks(today, 1));
  
  if (isToday(date)) return DateGroup.TODAY;
  if (isTomorrow(date)) return DateGroup.TOMORROW;
  if (isThisWeek(date) && isAfter(date, tomorrow)) return DateGroup.THIS_WEEK;
  if (isAfter(date, nextWeekStart) && isBefore(date, addDays(nextWeekStart, 7))) return DateGroup.NEXT_WEEK;
  return DateGroup.LATER;
};

export const groupTasksByDate = (tasks: Task[]): TaskGroup[] => {
  const groups: Record<DateGroup, Task[]> = {
    [DateGroup.TODAY]: [],
    [DateGroup.TOMORROW]: [],
    [DateGroup.THIS_WEEK]: [],
    [DateGroup.NEXT_WEEK]: [],
    [DateGroup.LATER]: [],
    [DateGroup.NO_DATE]: [],
  };
  
  tasks.forEach(task => {
    const dateGroup = getDateGroup(task.dueDate);
    groups[dateGroup].push(task);
  });
  
  return [
    { id: DateGroup.TODAY, title: 'Today', tasks: groups[DateGroup.TODAY] },
    { id: DateGroup.TOMORROW, title: 'Tomorrow', tasks: groups[DateGroup.TOMORROW] },
    { id: DateGroup.THIS_WEEK, title: 'This Week', tasks: groups[DateGroup.THIS_WEEK] },
    { id: DateGroup.NEXT_WEEK, title: 'Next Week', tasks: groups[DateGroup.NEXT_WEEK] },
    { id: DateGroup.LATER, title: 'Later', tasks: groups[DateGroup.LATER] },
    { id: DateGroup.NO_DATE, title: 'No Due Date', tasks: groups[DateGroup.NO_DATE] },
  ].filter(group => group.tasks.length > 0);
};

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
