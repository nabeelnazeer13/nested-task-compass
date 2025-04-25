
import React, { useState, useEffect } from 'react';
import { useTaskContext, Task } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, List, Calendar as CalendarIcon } from 'lucide-react';
import CalendarDay from './CalendarDay';
import FilterButton from '@/components/filters/FilterButton';
import FilterPills from '@/components/filters/FilterPills';
import { useFilterContext, FilterType } from '@/context/FilterContext';
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

type CalendarViewType = 'day' | 'week' | 'month';

const CalendarView: React.FC = () => {
  const { selectedDate, setSelectedDate, tasks, updateTask } = useTaskContext();
  const { activeFilters } = useFilterContext();
  const [view, setView] = useState<CalendarViewType>('week');
  const [showTaskList, setShowTaskList] = useState(true);
  const [showMiniCalendar, setShowMiniCalendar] = useState(false);
  const isMobile = useIsMobile();
  
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
      // For mobile, show just 7 days in month view
      return Array.from({ length: isMobile ? 7 : 28 }, (_, i) => addDays(startDay, i));
    }
  };

  const daysToDisplay = getDaysToDisplay();

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

  const handleTaskDrop = (task: Task, date: Date, timeSlot?: string) => {
    try {
      const updatedTask = {
        ...task,
        dueDate: date,
        timeSlot: timeSlot || undefined
      };
      
      updateTask(updatedTask);
      const timeInfo = timeSlot ? ` at ${timeSlot}` : '';
      toast.success(`Task "${task.title}" moved to ${format(date, 'MMM d, yyyy')}${timeInfo}`);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task date');
    }
  };

  const renderTaskList = () => {
    return (
      <div className="w-full md:w-72 border rounded-md h-fit mb-4 md:mb-0">
        <div className="bg-muted/50 p-2 border-b font-medium">
          Tasks
        </div>
        <div className="p-2 divide-y max-h-[300px] md:max-h-none overflow-auto">
          {getUndatedTasks().length > 0 ? (
            <div className="py-2">
              <h4 className="font-medium text-sm mb-2">Tasks without dates</h4>
              {getUndatedTasks().map(task => (
                <div
                  key={task.id}
                  className="p-1.5 md:p-2 mb-1 bg-background border rounded-sm text-xs md:text-sm hover:bg-muted cursor-grab"
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
    );
  };

  return (
    <div className="space-y-3 md:space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl md:text-2xl font-bold">Calendar</h2>
        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
          {!isMobile ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTaskList(!showTaskList)}
            >
              <List className="h-4 w-4 mr-2" />
              {showTaskList ? 'Hide Task List' : 'Show Task List'}
            </Button>
          ) : (
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm">
                  <List className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="p-4 max-h-[80vh] overflow-auto">
                  {renderTaskList()}
                </div>
              </DrawerContent>
            </Drawer>
          )}
          
          <div className="flex border rounded-md overflow-hidden">
            <Button 
              variant={view === 'day' ? 'default' : 'ghost'} 
              size={isMobile ? "sm" : "sm"}
              onClick={() => setView('day')}
              className={`rounded-none px-2 md:px-4 ${isMobile ? "text-xs" : ""}`}
            >
              Day
            </Button>
            <Button 
              variant={view === 'week' ? 'default' : 'ghost'} 
              size={isMobile ? "sm" : "sm"}
              onClick={() => setView('week')}
              className={`rounded-none px-2 md:px-4 ${isMobile ? "text-xs" : ""}`}
            >
              Week
            </Button>
            <Button 
              variant={view === 'month' ? 'default' : 'ghost'} 
              size={isMobile ? "sm" : "sm"}
              onClick={() => setView('month')}
              className={`rounded-none px-2 md:px-4 ${isMobile ? "text-xs" : ""}`}
            >
              Month
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="text-xs md:text-sm" onClick={navigateToday}>
              Today
            </Button>
            <span className="ml-1 md:ml-2 text-sm md:text-lg font-medium hidden xs:inline">
              {view === 'day' 
                ? format(selectedDate, 'MMM d, yyyy') 
                : `${format(daysToDisplay[0], 'MMM d')} - ${format(daysToDisplay[daysToDisplay.length - 1], 'MMM d')}`
              }
            </span>
          </div>
          
          {!isMobile ? (
            <div className="relative">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowMiniCalendar((v) => !v)}
                className="ml-1"
                aria-label="Show calendar"
              >
                <CalendarIcon className="h-4 w-4" />
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
          ) : (
            <Drawer>
              <DrawerTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Show calendar"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="p-4 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) setSelectedDate(date);
                    }}
                    className="rounded-md border p-2"
                  />
                </div>
              </DrawerContent>
            </Drawer>
          )}
          
          <FilterButton />
        </div>
      </div>
      
      <FilterPills />
      
      <div className="flex flex-col md:flex-row gap-4">
        {showTaskList && !isMobile && renderTaskList()}
        
        <div className="flex-1 border rounded-md overflow-hidden">
          <div className="grid gap-px" style={{ 
            gridTemplateColumns: `repeat(${daysToDisplay.length}, 1fr)` 
          }}>
            {daysToDisplay.map((day) => (
              <div key={day.toString()} className="text-center p-1 md:p-2 font-medium">
                <div className="text-xs md:text-sm">{format(day, 'EEE')}</div>
                <div className={`text-sm md:text-lg ${isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center mx-auto' : ''}`}>
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
