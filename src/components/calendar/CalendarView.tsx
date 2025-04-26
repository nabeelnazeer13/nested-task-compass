import React, { useState, useEffect } from 'react';
import { useTaskContext, Task } from '@/context/TaskContext';
import { toast } from "sonner";
import { isSameDay, format } from 'date-fns';
import FilterPills from '@/components/filters/FilterPills';
import { useFilterContext, FilterType } from '@/context/FilterContext';
import { useIsMobile } from '@/hooks/use-mobile';

import CalendarGrid from './grid/CalendarGrid';
import TaskList from './tasks/TaskList';
import CalendarViewHeader from './header/CalendarViewHeader';
import { useCalendarNavigation } from './hooks/useCalendarNavigation';

const CalendarView: React.FC = () => {
  const { selectedDate: contextSelectedDate, setSelectedDate: setContextSelectedDate, tasks, updateTask } = useTaskContext();
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
