
import { Task } from '@/context/TaskTypes';
import { Filter, FilterType, FilterOperator, DateGroup } from '@/context/FilterContext';
import { isBefore, isToday, isTomorrow, isThisWeek, isAfter, startOfDay, addDays, endOfDay, startOfWeek, endOfWeek, addWeeks } from 'date-fns';

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
