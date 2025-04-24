
import React, { useState, useEffect } from 'react';
import { useTaskContext, Task } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import CalendarDay from './CalendarDay';
import FilterButton from '@/components/filters/FilterButton';
import FilterPills from '@/components/filters/FilterPills';
import { useFilterContext, FilterType } from '@/context/FilterContext';
import { toast } from "sonner";

type CalendarViewType = 'day' | 'week' | 'month';

const CalendarView: React.FC = () => {
  const { selectedDate, setSelectedDate, tasks, updateTask } = useTaskContext();
  const { activeFilters } = useFilterContext();
  const [view, setView] = useState<CalendarViewType>('week');
  const [showTaskList, setShowTaskList] = useState(true);
  const [showMiniCalendar, setShowMiniCalendar] = useState(false);
  
  // Store all tasks in window for drag and drop access
  useEffect(() => {
    window.___allTasks = tasks;
    
    return () => {
      delete window.___allTasks;
    };
  }, [tasks]);
  
  const getUndatedTasks = () => {
    let filteredTasks = [...tasks];
    activeFilters.forEach(filter => {
      switch (filter.type) {
        case FilterType.PRIORITY:
          filteredTasks = filteredTasks.filter(task => task.priority === filter.value);
          break;
        case FilterType.PROJECT:
          filteredTasks = filteredTasks.filter(task => task.projectId === filter.value);
          break;
      }
    });
    return filteredTasks.filter(task => !task.dueDate);
  };

  const getTasksForDate = (date: Date) => {
    let filteredTasks = [...tasks];
    activeFilters.forEach(filter => {
      switch (filter.type) {
        case FilterType.PRIORITY:
          filteredTasks = filteredTasks.filter(task => task.priority === filter.value);
          break;
        case FilterType.PROJECT:
          filteredTasks = filteredTasks.filter(task => task.projectId === filter.value);
          break;
      }
    });
    return filteredTasks.filter(task => task.dueDate && isSameDay(task.dueDate, date));
  };

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
      return Array.from({ length: 28 }, (_, i) => addDays(startDay, i));
    }
  };

  const daysToDisplay = getDaysToDisplay();

  const navigatePrevious = () => {
    if (view === 'day') {
      setSelectedDate(addDays(selectedDate, -1));
    } else if (view === 'week') {
      setSelectedDate(addDays(selectedDate, -7));
    } else {
      setSelectedDate(addDays(selectedDate, -28));
    }
  };

  const navigateNext = () => {
    if (view === 'day') {
      setSelectedDate(addDays(selectedDate, 1));
    } else if (view === 'week') {
      setSelectedDate(addDays(selectedDate, 7));
    } else {
      setSelectedDate(addDays(selectedDate, 28));
    }
  };

  const navigateToday = () => {
    setSelectedDate(new Date());
  };

  const handleTaskDrop = (task: Task, date: Date, timeSlot?: string) => {
    try {
      const updatedTask = {
        ...task,
        dueDate: date
      };
      
      updateTask(updatedTask);
      toast.success(`Task "${task.title}" moved to ${format(date, 'MMM d, yyyy')}`);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task date');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTaskList(!showTaskList)}
          >
            <List className="h-4 w-4 mr-2" />
            {showTaskList ? 'Hide Task List' : 'Show Task List'}
          </Button>
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
            <Button 
              variant={view === 'month' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setView('month')}
              className="rounded-none"
            >
              Month
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={navigateToday}>
              Today
            </Button>
            <span className="ml-2 text-lg font-medium">
              {view === 'day' 
                ? format(selectedDate, 'MMMM d, yyyy') 
                : `${format(daysToDisplay[0], 'MMM d')} - ${format(daysToDisplay[daysToDisplay.length - 1], 'MMM d, yyyy')}`
              }
            </span>
          </div>
          <div className="relative">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowMiniCalendar((v) => !v)}
              className="ml-1"
              aria-label="Show calendar"
            >
              <span role="img" aria-label="calendar">📅</span>
            </Button>
            {showMiniCalendar && (
              <div className="absolute right-0 z-20 bg-background border rounded-md shadow-lg mt-2 pointer-events-auto">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) setSelectedDate(date);
                    setShowMiniCalendar(false);
                  }}
                  className="rounded-md border p-2 pointer-events-auto"
                />
              </div>
            )}
          </div>
          <FilterButton />
        </div>
      </div>
      
      <FilterPills />
      
      <div className="flex gap-4">
        {showTaskList && (
          <div className="w-72 border rounded-md h-fit">
            <div className="bg-muted/50 p-2 border-b font-medium">
              Tasks
            </div>
            <div className="p-2 divide-y">
              {getUndatedTasks().length > 0 ? (
                <div className="py-2">
                  <h4 className="font-medium text-sm mb-2">Tasks without dates</h4>
                  {getUndatedTasks().map(task => (
                    <div
                      key={task.id}
                      className="p-2 mb-1 bg-background border rounded-sm text-sm hover:bg-muted cursor-grab"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', task.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  No tasks match your current filters
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex-1 border rounded-md overflow-hidden">
          <div className="grid gap-1" style={{ 
            gridTemplateColumns: `repeat(${daysToDisplay.length}, 1fr)` 
          }}>
            {daysToDisplay.map((day) => (
              <div key={day.toString()} className="text-center p-2 font-medium">
                <div>{format(day, 'EEE')}</div>
                <div className={`text-lg ${isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
            
            {daysToDisplay.map((day) => (
              <CalendarDay 
                key={day.toString()} 
                date={day} 
                tasks={getTasksForDate(day)} 
                onTaskDrop={(task, timeSlot) => handleTaskDrop(task, day, timeSlot)}
                oneHourSlots
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
