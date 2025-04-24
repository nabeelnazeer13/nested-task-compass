
import React from 'react';
import { Task } from '@/context/TaskTypes';
import CalendarDayContainer from './CalendarDayContainer';

interface CalendarDayProps {
  date: Date;
  tasks: Task[];
  onTaskDrop?: (task: Task, timeSlot?: string) => void;
  oneHourSlots?: boolean;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ 
  date, 
  tasks, 
  onTaskDrop, 
  oneHourSlots 
}) => {
  return (
    <CalendarDayContainer
      date={date}
      tasks={tasks}
      onTaskDrop={onTaskDrop}
      oneHourSlots={oneHourSlots}
    />
  );
};

export default CalendarDay;
