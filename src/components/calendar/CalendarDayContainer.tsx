
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTaskContext, Task } from '@/context/TaskContext';
import AddTimeBlockDialog from './AddTimeBlockDialog';
import AllDaySection from './AllDaySection';
import TimeSlotGrid from './TimeSlotGrid';
import TaskBlock from './TaskBlock';
import TimeBlockDisplay from './TimeBlockDisplay';
import TimeTrackingDisplay from './TimeTrackingDisplay';
import { findTaskById } from '@/context/TaskHelpers';
import { useIsMobile } from '@/hooks/use-mobile';

interface CalendarDayContainerProps {
  date: Date;
  tasks: Task[];
  onTaskDrop?: (task: Task, timeSlot?: string) => void;
  oneHourSlots?: boolean;
}

const getHourlySlots = () => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    slots.push(h);
  }
  return slots;
};

const snapToNearestHalfHour = (timeStr: string) => {
  const [hourStr, minStr] = timeStr.split(':');
  let h = parseInt(hourStr, 10);
  let m = parseInt(minStr, 10);

  if (isNaN(h) || isNaN(m)) return "00:00";

  let snapMins = m < 15 ? 0 : m < 45 ? 30 : 0;
  let snapHour = h + (m >= 45 ? 1 : 0);

  if (snapHour > 23) snapHour = 23;
  return `${snapHour.toString().padStart(2, '0')}:${snapMins === 0 ? '00' : '30'}`;
};

const CalendarDayContainer: React.FC<CalendarDayContainerProps> = ({ 
  date, 
  tasks, 
  onTaskDrop, 
  oneHourSlots 
}) => {
  const { timeBlocks, timeTrackings, activeTimeTracking } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddingTimeBlock, setIsAddingTimeBlock] = useState(false);
  const [draggedOverSlot, setDraggedOverSlot] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const isMobile = useIsMobile();
  
  const allDayTasks = tasks.filter(task => !task.timeSlot);
  const timeSlottedTasks = tasks.filter(task => task.timeSlot).sort((a, b) => 
    (a.timeSlot || '').localeCompare(b.timeSlot || '')
  );
  
  const dayTimeBlocks = timeBlocks.filter(block => 
    block.date && format(block.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
  );
  
  const dayTimeTrackings = timeTrackings.filter(tracking => 
    format(new Date(tracking.startTime), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
  );
  
  const getTaskById = (taskId: string): Task | undefined => {
    const findTask = (tasks: Task[]): Task | undefined => {
      for (const task of tasks) {
        if (task.id === taskId) return task;
        if (task.children.length > 0) {
          const found = findTask(task.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findTask([...tasks]);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsAddingTimeBlock(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    setDraggedOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    setDraggedOverSlot(null);
    
    try {
      const taskId = e.dataTransfer.getData('text/plain');
      if (!taskId) return;
      
      const droppedTask = tasks.find(t => t.id === taskId);
      if (!droppedTask && onTaskDrop) {
        const allTasks = window.___allTasks || [];
        const foundTask = allTasks.find((t: Task) => t.id === taskId);
        if (foundTask && onTaskDrop) {
          onTaskDrop(foundTask);
        }
      } else if (droppedTask && onTaskDrop) {
        const updatedTask = { ...droppedTask, timeSlot: undefined };
        onTaskDrop(updatedTask);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleHourSlotDragOver = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    if (!oneHourSlots) return;

    setIsDragOver(true);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const snapMinute = y < rect.height / 2 ? 0 : 30;
    const timeSlot = `${hour.toString().padStart(2, '0')}:${snapMinute === 0 ? '00' : '30'}`;
    setDraggedOverSlot(timeSlot);
  };

  const handleHourSlotDragLeave = (e: React.DragEvent) => {
    setIsDragOver(false);
    setDraggedOverSlot(null);
  };

  const handleHourSlotDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    setIsDragOver(false);
    setDraggedOverSlot(null);

    try {
      const taskId = e.dataTransfer.getData('text/plain');
      if (!taskId) return;

      let snappedTime = draggedOverSlot || `${hour.toString().padStart(2, '0')}:00`;
      snappedTime = snapToNearestHalfHour(snappedTime);

      if (onTaskDrop) {
        let droppedTask = tasks.find(t => t.id === taskId);
        
        if (!droppedTask) {
          const allTasks = window.___allTasks || [];
          droppedTask = allTasks.find((t: Task) => t.id === taskId);
        }
        
        if (droppedTask) {
          onTaskDrop(droppedTask, snappedTime);
        }
      }
    } catch (error) {
      console.error('Error handling hour slot drop:', error);
    }
  };

  if (!oneHourSlots) {
    return (
      <div 
        className={`calendar-day relative min-h-[120px] md:min-h-[150px] border p-1 md:p-2 ${isDragOver ? 'bg-primary/10' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-0.5 md:space-y-1">
          {tasks.map((task) => (
            <TaskBlock
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
              activeTaskId={activeTimeTracking?.taskId}
            />
          ))}
          
          {dayTimeBlocks.map((block) => (
            <TimeBlockDisplay
              key={block.id}
              block={block}
              task={getTaskById(block.taskId)}
            />
          ))}
          
          {dayTimeTrackings.map((tracking) => (
            <TimeTrackingDisplay
              key={tracking.id}
              tracking={tracking}
              task={getTaskById(tracking.taskId)}
            />
          ))}
        </div>
        
        {selectedTask && (
          <AddTimeBlockDialog 
            open={isAddingTimeBlock}
            onOpenChange={setIsAddingTimeBlock}
            task={selectedTask}
            date={date}
          />
        )}
      </div>
    );
  }

  const hours = getHourlySlots();
  const displayHours = isMobile ? hours.filter(h => h >= 6 && h <= 22) : hours;

  return (
    <div className="calendar-day border min-h-[600px] md:min-h-[900px] bg-white">
      <AllDaySection 
        tasks={allDayTasks}
        isDragOver={isDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onTaskClick={handleTaskClick}
        activeTimeTrackingTaskId={activeTimeTracking?.taskId}
      />
      
      <TimeSlotGrid 
        hours={displayHours}
        tasks={timeSlottedTasks}
        timeBlocks={dayTimeBlocks}
        timeTrackings={dayTimeTrackings}
        draggedOverSlot={draggedOverSlot}
        onHourSlotDragOver={handleHourSlotDragOver}
        onHourSlotDragLeave={handleHourSlotDragLeave}
        onHourSlotDrop={handleHourSlotDrop}
        getTaskById={getTaskById}
        onTaskClick={handleTaskClick}
        activeTimeTrackingTaskId={activeTimeTracking?.taskId}
      />
      
      {selectedTask && (
        <AddTimeBlockDialog 
          open={isAddingTimeBlock}
          onOpenChange={setIsAddingTimeBlock}
          task={selectedTask}
          date={date}
        />
      )}
    </div>
  );
};

export default CalendarDayContainer;
