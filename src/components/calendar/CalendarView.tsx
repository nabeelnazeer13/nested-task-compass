
import React, { useState, useEffect } from 'react';
import { useTaskContext, useViewModeContext, Task } from '@/context/TaskContext';
import { toast } from "sonner";
import { isSameDay, format } from 'date-fns';
import FilterPills from '@/components/filters/FilterPills';
import { useFilterContext, FilterType } from '@/context/FilterContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { generateRecurringTaskInstances } from '@/lib/recurrence-utils';

import CalendarGrid from './grid/CalendarGrid';
import TaskList from './tasks/TaskList';
import CalendarViewHeader from './header/CalendarViewHeader';
import { useCalendarNavigation } from './hooks/useCalendarNavigation';

const CalendarView: React.FC = () => {
  const { tasks, updateTask } = useTaskContext();
  const { selectedDate: contextSelectedDate, setSelectedDate: setContextSelectedDate } = useViewModeContext();
  const { activeFilters } = useFilterContext();
  const [showTaskList, setShowTaskList] = useState(true);
  const [showMiniCalendar, setShowMiniCalendar] = useState(false);
  const isMobile = useIsMobile();
  
  const {
    selectedDate,
    setSelectedDate,
    view,
    setView,
    navigatePrevious,
    navigateNext,
    navigateToday,
    daysToDisplay
  } = useCalendarNavigation(contextSelectedDate);
  
  useEffect(() => {
    setContextSelectedDate(selectedDate);
  }, [selectedDate, setContextSelectedDate]);
  
  useEffect(() => {
    window.___allTasks = tasks;
    
    return () => {
      delete window.___allTasks;
    };
  }, [tasks]);
  
  // Generate recurring task instances
  const getExpandedTasks = () => {
    const regularTasks = [...tasks];
    const recurringTaskTemplates = tasks.filter(task => task.isRecurring && task.recurrencePattern && task.dueDate);
    
    let recurringInstances: Task[] = [];
    
    if (daysToDisplay.length > 0) {
      // Get the range for recurring task generation - add some buffer days
      const firstDay = new Date(daysToDisplay[0]);
      firstDay.setDate(firstDay.getDate() - 7); // Buffer before
      
      const lastDay = new Date(daysToDisplay[daysToDisplay.length - 1]);
      lastDay.setDate(lastDay.getDate() + 7); // Buffer after
      
      // Generate instances for each recurring task template
      recurringTaskTemplates.forEach(template => {
        if (template.dueDate && template.recurrencePattern) {
          const instances = generateRecurringTaskInstances(template, firstDay, lastDay);
          recurringInstances = [...recurringInstances, ...instances];
        }
      });
    }
    
    // Combine regular tasks with generated instances
    return [...regularTasks, ...recurringInstances];
  };
  
  const getUndatedTasks = () => {
    let expandedTasks = getExpandedTasks();
    let filteredTasks = [...expandedTasks.filter(task => !task.recurrenceParentId)]; // Show only original non-recurring tasks
    
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
    let expandedTasks = getExpandedTasks();
    let filteredTasks = [...expandedTasks];
    
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

  const handleTaskDrop = (task: Task, date: Date, timeSlot?: string) => {
    try {
      // If this is a recurring instance, handle it differently
      if (task.recurrenceParentId) {
        const updatedTask = {
          ...task,
          dueDate: date,
          timeSlot: timeSlot || undefined,
          recurrenceParentId: undefined // Detach from recurrence
        };
        
        // Add the date to exceptions in the parent task
        const originalTask = tasks.find(t => t.id === task.recurrenceParentId);
        if (originalTask && originalTask.isRecurring && task.dueDate) {
          updateTask({
            ...originalTask,
            recurrenceExceptions: [
              ...(originalTask.recurrenceExceptions || []),
              task.dueDate
            ]
          });
        }
        
        // Add as a regular task
        updateTask(updatedTask);
        toast.success(`Recurring task "${task.title}" moved to ${format(date, 'MMM d, yyyy')}${timeSlot ? ` at ${timeSlot}` : ''} and detached from recurrence`);
      } else {
        // Regular task update
        const updatedTask = {
          ...task,
          dueDate: date,
          timeSlot: timeSlot || undefined
        };
        
        updateTask(updatedTask);
        const timeInfo = timeSlot ? ` at ${timeSlot}` : '';
        toast.success(`Task "${task.title}" moved to ${format(date, 'MMM d, yyyy')}${timeInfo}`);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task date');
    }
  };

  const renderTaskList = () => {
    return <TaskList tasks={getUndatedTasks()} />;
  };

  return (
    <div className="space-y-3 md:space-y-6">
      <CalendarViewHeader
        selectedDate={selectedDate}
        view={view}
        daysToDisplay={daysToDisplay}
        showMiniCalendar={showMiniCalendar}
        setShowMiniCalendar={setShowMiniCalendar}
        setView={setView}
        navigatePrevious={navigatePrevious}
        navigateNext={navigateNext}
        navigateToday={navigateToday}
        showTaskList={showTaskList}
        setShowTaskList={setShowTaskList}
        renderTaskList={renderTaskList}
      />
      
      <FilterPills />
      
      <div className="flex flex-col md:flex-row gap-4">
        {showTaskList && !isMobile && renderTaskList()}
        
        <CalendarGrid
          daysToDisplay={daysToDisplay}
          getTasksForDate={getTasksForDate}
          handleTaskDrop={handleTaskDrop}
          view={view}
        />
      </div>
    </div>
  );
};

export default CalendarView;
