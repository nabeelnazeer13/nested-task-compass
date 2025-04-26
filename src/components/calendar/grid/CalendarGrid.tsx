import React from 'react';
import { format, isSameDay } from 'date-fns';
import { Task } from '@/context/TaskTypes';
import CalendarDay from '../CalendarDay';

interface CalendarGridProps {
  daysToDisplay: Date[];
  getTasksForDate: (date: Date) => Task[];
  handleTaskDrop: (task: Task, date: Date, timeSlot?: string) => void;
  view: 'day' | 'week' | 'month';
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  daysToDisplay, 
  getTasksForDate, 
  handleTaskDrop,
  view
}) => {
  return (
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
            oneHourSlots={true}
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
