
import React, { useState } from 'react';
import { useTaskContext, Task } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CalendarDay from './CalendarDay';

const CalendarView: React.FC = () => {
  const { selectedDate, setSelectedDate, tasks } = useTaskContext();
  const [view, setView] = useState<'day' | 'week'>('week');
  
  // Get all tasks with due dates
  const tasksWithDueDate = tasks.filter(task => task.dueDate);
  
  // Helper function to get all tasks due on a specific date
  const getTasksForDate = (date: Date) => {
    return tasksWithDueDate.filter(task => 
      task.dueDate && isSameDay(task.dueDate, date)
    );
  };
  
  // Calculate the days to display based on view (day or week)
  const daysToDisplay = view === 'day' 
    ? [selectedDate] 
    : eachDayOfInterval({
        start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
        end: endOfWeek(selectedDate, { weekStartsOn: 1 })
      });
  
  // Navigation functions
  const navigatePrevious = () => {
    if (view === 'day') {
      setSelectedDate(addDays(selectedDate, -1));
    } else {
      setSelectedDate(addDays(selectedDate, -7));
    }
  };
  
  const navigateNext = () => {
    if (view === 'day') {
      setSelectedDate(addDays(selectedDate, 1));
    } else {
      setSelectedDate(addDays(selectedDate, 7));
    }
  };
  
  const navigateToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            <Button 
              variant={view === 'day' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setView('day')}
              className="rounded-none"
            >
              Day
            </Button>
            <Button 
              variant={view === 'week' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setView('week')}
              className="rounded-none"
            >
              Week
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={navigateToday}>
            Today
          </Button>
          <h3 className="text-lg font-medium ml-2">
            {view === 'day' 
              ? format(selectedDate, 'MMMM d, yyyy') 
              : `${format(daysToDisplay[0], 'MMM d')} - ${format(daysToDisplay[daysToDisplay.length - 1], 'MMM d, yyyy')}`
            }
          </h3>
        </div>
        
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </div>
      </div>
      
      <div className="grid gap-1" style={{ 
        gridTemplateColumns: `repeat(${daysToDisplay.length}, 1fr)` 
      }}>
        {/* Day headers */}
        {daysToDisplay.map((day) => (
          <div key={day.toString()} className="text-center p-2 font-medium">
            <div>{format(day, 'EEE')}</div>
            <div className={`text-lg ${isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
        
        {/* Calendar days */}
        {daysToDisplay.map((day) => (
          <CalendarDay 
            key={day.toString()} 
            date={day} 
            tasks={getTasksForDate(day)} 
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
