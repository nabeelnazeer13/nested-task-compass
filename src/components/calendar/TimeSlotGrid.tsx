
import React from 'react';
import { format } from 'date-fns';
import { Task, TimeBlock, TimeTracking } from '@/context/TaskTypes';
import TaskBlock from './TaskBlock';
import TimeBlockDisplay from './TimeBlockDisplay';
import TimeTrackingDisplay from './TimeTrackingDisplay';

interface TimeSlotGridProps {
  hours: number[];
  tasks: Task[];
  timeBlocks: TimeBlock[];
  timeTrackings: TimeTracking[];
  draggedOverSlot: string | null;
  onHourSlotDragOver: (e: React.DragEvent, hour: number) => void;
  onHourSlotDragLeave: (e: React.DragEvent) => void;
  onHourSlotDrop: (e: React.DragEvent, hour: number) => void;
  getTaskById: (taskId: string) => Task | undefined;
  onTaskClick: (task: Task) => void;
  activeTimeTrackingTaskId?: string | null;
}

const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  hours,
  tasks,
  timeBlocks,
  timeTrackings,
  draggedOverSlot,
  onHourSlotDragOver,
  onHourSlotDragLeave,
  onHourSlotDrop,
  getTaskById,
  onTaskClick,
  activeTimeTrackingTaskId
}) => {
  return (
    <div className="flex flex-col relative">
      {hours.map((hour) => {
        const hourStr = hour.toString().padStart(2, '0') + ':00';
        
        const hourTasks = tasks.filter(task => 
          task.timeSlot && task.timeSlot.startsWith(hour.toString().padStart(2, '0'))
        );

        const hourBlocks = timeBlocks.filter(tb => 
          tb.startTime && tb.startTime.startsWith(hourStr)
        );

        const trackings = timeTrackings.filter(trk => {
          const startTime = format(new Date(trk.startTime), 'HH:00');
          return startTime === hourStr;
        });

        return (
          <div
            key={hour}
            className={`border-b relative transition-all ${
              draggedOverSlot && draggedOverSlot.startsWith(hourStr) ? 'bg-primary/15' : ''
            }`}
            style={{ height: '48px', minHeight: '48px' }} 
            onDragOver={e => onHourSlotDragOver(e, hour)}
            onDragLeave={onHourSlotDragLeave}
            onDrop={e => onHourSlotDrop(e, hour)}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground w-8 pl-1 select-none">
              {hourStr}
            </div>
            {draggedOverSlot && draggedOverSlot.startsWith(hourStr) && (
              <div className="absolute inset-0 bg-primary/15 pointer-events-none z-10" />
            )}
            <div className="ml-9 pr-2 h-full relative">
              {hourTasks.map((task) => (
                <div key={task.id} className="absolute left-0 right-0" style={{
                  // Position task based on its minute within the hour
                  top: task.timeSlot ? 
                    (parseInt(task.timeSlot.split(':')[1]) / 60) * 48 : 0
                }}>
                  <TaskBlock
                    task={task}
                    onClick={() => onTaskClick(task)}
                    showTimeSlot
                    activeTaskId={activeTimeTrackingTaskId}
                  />
                </div>
              ))}
              
              {hourBlocks.map((block) => (
                <TimeBlockDisplay
                  key={block.id}
                  block={block}
                  task={getTaskById(block.taskId)}
                />
              ))}
              
              {trackings.map((tracking) => (
                <TimeTrackingDisplay
                  key={tracking.id}
                  tracking={tracking}
                  task={getTaskById(tracking.taskId)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimeSlotGrid;
