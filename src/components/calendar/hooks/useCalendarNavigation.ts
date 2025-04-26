
import { useState } from 'react';
import { addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

type CalendarViewType = 'day' | 'week' | 'month';

export const useCalendarNavigation = (initialDate: Date) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [view, setView] = useState<CalendarViewType>('week');
  const isMobile = useIsMobile();
  
  const getDaysToDisplay = () => {
    if (view === 'day') {
      return [selectedDate];
    } else if (view === 'week') {
      return eachDayOfInterval({
        start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
        end: endOfWeek(selectedDate, { weekStartsOn: 1 })
      });
    } else {
      const startDay = startOfWeek(selectedDate, { weekStartsOn: 1 });
      // For mobile, show just 7 days in month view
      return Array.from({ length: isMobile ? 7 : 28 }, (_, i) => addDays(startDay, i));
    }
  };

  const navigatePrevious = () => {
    if (view === 'day') {
      setSelectedDate(addDays(selectedDate, -1));
    } else if (view === 'week') {
      setSelectedDate(addDays(selectedDate, -7));
    } else {
      setSelectedDate(addDays(selectedDate, isMobile ? -7 : -28));
    }
  };

  const navigateNext = () => {
    if (view === 'day') {
      setSelectedDate(addDays(selectedDate, 1));
    } else if (view === 'week') {
      setSelectedDate(addDays(selectedDate, 7));
    } else {
      setSelectedDate(addDays(selectedDate, isMobile ? 7 : 28));
    }
  };

  const navigateToday = () => {
    setSelectedDate(new Date());
  };
  
  return {
    selectedDate,
    setSelectedDate,
    view,
    setView,
    getDaysToDisplay,
    navigatePrevious, 
    navigateNext,
    navigateToday,
    daysToDisplay: getDaysToDisplay()
  };
};
