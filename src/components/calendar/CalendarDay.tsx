
import React, { useState } from 'react';
import { useTaskContext, Task } from '@/context/TaskContext';
import { format } from 'date-fns';
import AddTimeBlockDialog from './AddTimeBlockDialog';
import { Clock, Play } from 'lucide-react';
import { formatMinutes } from '@/lib/time-utils';

interface CalendarDayProps {
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

const CalendarDay: React.FC<CalendarDayProps> = ({ date, tasks, onTaskDrop, oneHourSlots }) => {
  const { timeBlocks, timeTrackings, activeTimeTracking } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddingTimeBlock, setIsAddingTimeBlock] = useState(false);
  const [draggedOverSlot, setDraggedOverSlot] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const dayTimeBlocks = timeBlocks.filter(block => {
    return block.date && format(block.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  });
  
  const dayTimeTrackings = timeTrackings.filter(tracking => {
    return format(new Date(tracking.startTime), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  });
  
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
    // Prevent default to allow drop
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
        // Look for the task in the global tasks
        const allTasks = window.___allTasks || [];
        const foundTask = allTasks.find((t: Task) => t.id === taskId);
        if (foundTask && onTaskDrop) {
          onTaskDrop(foundTask);
        }
      } else if (droppedTask && onTaskDrop) {
        onTaskDrop(droppedTask);
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
        // Try to find in tasks list for this day first
        let droppedTask = tasks.find(t => t.id === taskId);
        
        // If not found in day tasks, try global list
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
        className={`calendar-day relative min-h-[150px] border p-2 ${isDragOver ? 'bg-primary/10' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-1">
          {tasks.map((task) => (
            <div 
              key={task.id}
              className={`calendar-task ${
                task.priority === 'high' ? 'bg-red-100 border-l-2 border-red-500' : 
                task.priority === 'medium' ? 'bg-yellow-100 border-l-2 border-yellow-500' : 
                'bg-blue-100 border-l-2 border-blue-500'
              } p-2 rounded-sm text-sm mb-1 cursor-pointer`}
              onClick={() => handleTaskClick(task)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', task.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
            >
              <div className="flex justify-between items-center">
                <span>{task.title}</span>
                {activeTimeTracking && activeTimeTracking.taskId === task.id && (
                  <Play size={12} className="text-green-600 animate-pulse" />
                )}
              </div>
              {task.estimatedTime > 0 && (
                <div className="text-xs text-gray-600 flex items-center gap-1">
                  <Clock size={10} />
                  Est: {formatMinutes(task.estimatedTime)}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-2 space-y-1">
          {dayTimeBlocks.map((block) => {
            const task = getTaskById(block.taskId);
            if (!task) return null;
            
            return (
              <div 
                key={block.id}
                className={`calendar-task bg-primary/10 border-l-2 border-primary text-xs p-2 rounded-sm`}
              >
                <div className="font-medium">{task.title}</div>
                <div>{block.startTime} - {block.endTime}</div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-2 space-y-1">
          {dayTimeTrackings.map((tracking) => {
            const task = getTaskById(tracking.taskId);
            if (!task) return null;
            
            const startTime = format(new Date(tracking.startTime), 'h:mm a');
            const endTime = tracking.endTime 
              ? format(new Date(tracking.endTime), 'h:mm a')
              : 'ongoing';
            
            return (
              <div 
                key={tracking.id}
                className="calendar-task bg-green-100 border-l-2 border-green-500 text-xs p-2 rounded-sm"
              >
                <div className="font-medium flex items-center gap-1">
                  <Clock size={10} className="text-green-600" />
                  {task.title}
                </div>
                <div>{startTime} - {endTime} ({formatMinutes(tracking.duration)})</div>
              </div>
            );
          })}
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

  return (
    <div className="calendar-day border min-h-[900px] bg-white">
      <div className="flex flex-col h-full">
        {hours.map((hour) => {
          const hourStr = hour.toString().padStart(2, '0') + ':00';

          const hourBlocks = dayTimeBlocks.filter(tb => {
            return tb.startTime && tb.startTime.startsWith(hourStr);
          });

          const trackings = dayTimeTrackings.filter(trk => {
            const startTime = format(new Date(trk.startTime), 'HH:00');
            return startTime === hourStr;
          });

          return (
            <div
              key={hour}
              className={`border-b h-12 group relative transition-all ${
                draggedOverSlot && draggedOverSlot.startsWith(hourStr) ? 'bg-primary/15' : ''
              }`}
              style={{ minHeight: '48px' }}
              onDragOver={e => handleHourSlotDragOver(e, hour)}
              onDragLeave={e => handleHourSlotDragLeave(e)}
              onDrop={e => handleHourSlotDrop(e, hour)}
            >
              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground w-8 pl-1 select-none">
                {hourStr}
              </div>
              {draggedOverSlot && draggedOverSlot.startsWith(hourStr) && (
                <div className="absolute inset-0 bg-primary/15 pointer-events-none z-10" />
              )}
              <div className="ml-9 pr-2 flex flex-col gap-1">
                {hourBlocks.map((block) => {
                  const task = getTaskById(block.taskId);
                  if (!task) return null;
                  return (
                    <div 
                      key={block.id}
                      className="calendar-task bg-primary/10 border-l-2 border-primary text-xs p-1 rounded-sm mt-0.5"
                    >
                      <div className="font-medium">{task.title}</div>
                      <div>{block.startTime} - {block.endTime}</div>
                    </div>
                  );
                })}
                {trackings.map((tracking) => {
                  const task = getTaskById(tracking.taskId);
                  if (!task) return null;
                  const startTime = format(new Date(tracking.startTime), 'HH:mm');
                  const endTime = tracking.endTime 
                    ? format(new Date(tracking.endTime), 'HH:mm')
                    : 'ongoing';
                  return (
                    <div
                      key={tracking.id}
                      className="calendar-task bg-green-100 border-l-2 border-green-500 text-xs p-1 rounded-sm mt-0.5 flex items-center gap-1"
                    >
                      <Clock size={10} className="text-green-600" />
                      <div>
                        <span className="font-medium">{task.title}</span>
                        <span className="ml-2">
                          {startTime} - {endTime} ({formatMinutes(tracking.duration)})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
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
};

export default CalendarDay;
