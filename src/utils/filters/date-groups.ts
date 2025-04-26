
import { Task } from '@/context/TaskTypes';
import { DateGroup } from '@/context/FilterContext';
import { isBefore, isToday, isTomorrow, isThisWeek, isAfter, startOfDay, addDays, startOfWeek, endOfWeek, addWeeks } from 'date-fns';

export const getDateGroup = (date: Date | undefined, completed: boolean = false): DateGroup => {
  if (!date) return DateGroup.NO_DATE;
  
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const nextWeekStart = startOfWeek(addWeeks(today, 1));
  
  // Check for overdue tasks first
  if (!completed && isBefore(date, today)) return DateGroup.OVERDUE;
  if (isToday(date)) return DateGroup.TODAY;
  if (isTomorrow(date)) return DateGroup.TOMORROW;
  if (isThisWeek(date) && isAfter(date, tomorrow)) return DateGroup.THIS_WEEK;
  if (isAfter(date, nextWeekStart) && isBefore(date, addDays(nextWeekStart, 7))) return DateGroup.NEXT_WEEK;
  return DateGroup.LATER;
};

export const groupTasksByDate = (tasks: Task[]): TaskGroup[] => {
  const groups: Record<DateGroup, Task[]> = {
    [DateGroup.OVERDUE]: [],
    [DateGroup.TODAY]: [],
    [DateGroup.TOMORROW]: [],
    [DateGroup.THIS_WEEK]: [],
    [DateGroup.NEXT_WEEK]: [],
    [DateGroup.LATER]: [],
    [DateGroup.NO_DATE]: [],
  };
  
  tasks.forEach(task => {
    const dateGroup = getDateGroup(task.dueDate, task.completed);
    groups[dateGroup].push(task);
  });
  
  return [
    { id: DateGroup.OVERDUE, title: 'Overdue', tasks: groups[DateGroup.OVERDUE] },
    { id: DateGroup.TODAY, title: 'Today', tasks: groups[DateGroup.TODAY] },
    { id: DateGroup.TOMORROW, title: 'Tomorrow', tasks: groups[DateGroup.TOMORROW] },
    { id: DateGroup.THIS_WEEK, title: 'This Week', tasks: groups[DateGroup.THIS_WEEK] },
    { id: DateGroup.NEXT_WEEK, title: 'Next Week', tasks: groups[DateGroup.NEXT_WEEK] },
    { id: DateGroup.LATER, title: 'Later', tasks: groups[DateGroup.LATER] },
    { id: DateGroup.NO_DATE, title: 'No Due Date', tasks: groups[DateGroup.NO_DATE] },
  ].filter(group => group.tasks.length > 0);
};
