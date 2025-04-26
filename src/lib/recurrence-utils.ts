import { addDays, addMonths, addWeeks, addYears, isSameDay, startOfDay } from 'date-fns';
import { RecurrencePattern, Task } from '@/context/TaskTypes';
import { generateId } from '@/context/TaskHelpers';

/**
 * Determines if a date matches a recurrence pattern
 */
export function doesDateMatchRecurrencePattern(
  date: Date,
  startDate: Date,
  pattern: RecurrencePattern,
  exceptions?: Date[]
): boolean {
  // Check for exceptions
  if (exceptions && exceptions.some(exception => isSameDay(date, exception))) {
    return false;
  }

  // Check if date is before start date
  if (date < startOfDay(startDate)) {
    return false;
  }

  // Check if date is after end date
  if (pattern.endDate && date > pattern.endDate) {
    return false;
  }

  const normalizedDate = startOfDay(date);
  const normalizedStartDate = startOfDay(startDate);

  switch (pattern.frequency) {
    case 'daily':
      const dayDiff = Math.floor((normalizedDate.getTime() - normalizedStartDate.getTime()) / (1000 * 60 * 60 * 24));
      return dayDiff % pattern.interval === 0;

    case 'weekly':
      // Check if we're on the right week
      const weekDiff = Math.floor((normalizedDate.getTime() - normalizedStartDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      if (weekDiff % pattern.interval !== 0) return false;

      // If specific days are set, check if current day is one of them
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        return pattern.daysOfWeek.includes(normalizedDate.getDay());
      }
      // If no specific days, use the same weekday as the start date
      return normalizedDate.getDay() === normalizedStartDate.getDay();

    case 'monthly':
      const startMonth = normalizedStartDate.getMonth();
      const startYear = normalizedStartDate.getFullYear();
      const targetMonth = normalizedDate.getMonth();
      const targetYear = normalizedDate.getFullYear();

      const monthDiff = (targetYear - startYear) * 12 + (targetMonth - startMonth);
      if (monthDiff % pattern.interval !== 0) return false;

      // If specific day of month is set, check if current day is that day
      if (pattern.dayOfMonth) {
        return normalizedDate.getDate() === pattern.dayOfMonth;
      }
      // Otherwise, use the same day of the month as the start date
      return normalizedDate.getDate() === normalizedStartDate.getDate();

    case 'yearly':
      const yearDiff = normalizedDate.getFullYear() - normalizedStartDate.getFullYear();
      if (yearDiff % pattern.interval !== 0) return false;

      if (pattern.monthOfYear !== undefined && pattern.dayOfMonth !== undefined) {
        return normalizedDate.getMonth() === pattern.monthOfYear && 
               normalizedDate.getDate() === pattern.dayOfMonth;
      }

      // Otherwise, use the same month and day as the start date
      return normalizedDate.getMonth() === normalizedStartDate.getMonth() &&
             normalizedDate.getDate() === normalizedStartDate.getDate();

    default:
      return false;
  }
}

/**
 * Calculates the next occurrence of a recurring task
 */
export function getNextOccurrence(
  startDate: Date,
  pattern: RecurrencePattern,
  exceptions?: Date[]
): Date | null {
  let baseDate = new Date();
  if (baseDate < startDate) {
    baseDate = startDate;
  }
  
  // Check if pattern has ended
  if (pattern.endDate && baseDate > pattern.endDate) {
    return null;
  }

  const tryDate = (date: Date): Date | null => {
    if (doesDateMatchRecurrencePattern(date, startDate, pattern, exceptions)) {
      return date;
    }
    return null;
  };

  // First see if today matches
  let result = tryDate(baseDate);
  if (result) return result;

  // Try future dates
  let nextDate = baseDate;
  let maxTries = 100; // Safety limit
  
  while (maxTries > 0) {
    switch (pattern.frequency) {
      case 'daily':
        nextDate = addDays(nextDate, 1);
        break;
      case 'weekly':
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          // Find the next day of the week
          nextDate = addDays(nextDate, 1);
        } else {
          nextDate = addWeeks(nextDate, pattern.interval);
        }
        break;
      case 'monthly':
        nextDate = addMonths(nextDate, pattern.interval);
        break;
      case 'yearly':
        nextDate = addYears(nextDate, pattern.interval);
        break;
    }

    result = tryDate(nextDate);
    if (result) return result;

    if (pattern.endDate && nextDate > pattern.endDate) {
      return null;
    }

    maxTries--;
  }

  return null;
}

/**
 * Generates recurring task instances for a given date range
 */
export function generateRecurringTaskInstances(
  task: Task,
  startDate: Date,
  endDate: Date
): Task[] {
  if (!task.isRecurring || !task.recurrencePattern || !task.dueDate) {
    return [];
  }

  const instances: Task[] = [];
  const currentDate = new Date(Math.max(startDate.getTime(), task.dueDate.getTime()));
  
  // Ensure we don't exceed the end date of the recurrence pattern
  const recurrenceEndDate = task.recurrencePattern.endDate 
    ? new Date(Math.min(endDate.getTime(), task.recurrencePattern.endDate.getTime()))
    : endDate;
  
  // For each day in the range, check if it matches the recurrence pattern
  while (currentDate <= recurrenceEndDate) {
    if (doesDateMatchRecurrencePattern(
      currentDate,
      task.dueDate,
      task.recurrencePattern,
      task.recurrenceExceptions
    )) {
      const instance: Task = {
        ...task,
        id: generateId(),
        dueDate: new Date(currentDate),
        recurrenceParentId: task.id,
        // Don't include children in generated instances
        children: [],
        // Don't pass on recurrence pattern to generated instances
        isRecurring: false,
        recurrencePattern: undefined
      };
      instances.push(instance);
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return instances;
}

/**
 * Format a recurrence pattern as human-readable text
 */
export function formatRecurrencePattern(pattern: RecurrencePattern): string {
  let text = '';
  
  // Frequency and interval
  switch (pattern.frequency) {
    case 'daily':
      text = pattern.interval === 1 ? 'Daily' : `Every ${pattern.interval} days`;
      break;
    case 'weekly':
      if (pattern.interval === 1) {
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          const dayNames = pattern.daysOfWeek.map(day => {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[day];
          }).join(', ');
          text = `Weekly on ${dayNames}`;
        } else {
          text = 'Weekly';
        }
      } else {
        text = `Every ${pattern.interval} weeks`;
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          const dayNames = pattern.daysOfWeek.map(day => {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[day];
          }).join(', ');
          text += ` on ${dayNames}`;
        }
      }
      break;
    case 'monthly':
      if (pattern.dayOfMonth) {
        text = pattern.interval === 1 
          ? `Monthly on day ${pattern.dayOfMonth}` 
          : `Every ${pattern.interval} months on day ${pattern.dayOfMonth}`;
      } else {
        text = pattern.interval === 1 
          ? 'Monthly' 
          : `Every ${pattern.interval} months`;
      }
      break;
    case 'yearly':
      text = pattern.interval === 1 ? 'Yearly' : `Every ${pattern.interval} years`;
      if (pattern.monthOfYear !== undefined && pattern.dayOfMonth !== undefined) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
        text += ` on ${months[pattern.monthOfYear]} ${pattern.dayOfMonth}`;
      }
      break;
  }
  
  // End condition
  if (pattern.endDate) {
    text += ` until ${pattern.endDate.toLocaleDateString()}`;
  } else if (pattern.occurrences) {
    text += `, ${pattern.occurrences} times`;
  }
  
  return text;
}
