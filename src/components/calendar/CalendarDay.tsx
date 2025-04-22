
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
}

const CalendarDay: React.FC<CalendarDayProps> = ({ date, tasks, onTaskDrop }) => {
  const { timeBlocks, timeTrackings, activeTimeTracking } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddingTimeBlock, setIsAddingTimeBlock] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Get all time blocks for this day
  const dayTimeBlocks = timeBlocks.filter(block => {
    return block.date && format(block.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  });
  
  // Get all time trackings for this day
  const dayTimeTrackings = timeTrackings.filter(tracking => {
    return format(new Date(tracking.startTime), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  });
  
  // Helper function to get a task by ID
  const getTaskById = (taskId: string): Task | undefined => {
    // Recursive function to search through task hierarchy
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

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // In a real app, we would get the task ID from the drag event data
    // and then find the task in our state. For now, we'll just mock it.
    const taskId = e.dataTransfer.getData('taskId');
    console.log(`Dropped task ${taskId} onto ${format(date, 'MMM d')}`);
    
    // If we had a real task from drag data:
    // const droppedTask = getTaskById(taskId);
    // if (droppedTask && onTaskDrop) {
    //   onTaskDrop(droppedTask);
    // }
  };

  return (
    <div 
      className={`calendar-day relative min-h-[150px] border p-2 ${isDragOver ? 'bg-primary/10 border-primary' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Tasks for this day */}
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
      
      {/* Scheduled time blocks */}
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
      
      {/* Actual time tracking entries */}
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
};

export default CalendarDay;
