
import React from 'react';
import { useTaskContext, Task } from '@/context/TaskContext';
import { format } from 'date-fns';
import AddTimeBlockDialog from './AddTimeBlockDialog';

interface CalendarDayProps {
  date: Date;
  tasks: Task[];
}

const CalendarDay: React.FC<CalendarDayProps> = ({ date, tasks }) => {
  const { timeBlocks } = useTaskContext();
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isAddingTimeBlock, setIsAddingTimeBlock] = React.useState(false);
  
  // Get all time blocks for this day
  const dayTimeBlocks = timeBlocks.filter(block => {
    return block.date && format(block.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
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

  return (
    <div className="calendar-day relative">
      {/* Tasks for this day */}
      <div className="space-y-1">
        {tasks.map((task) => (
          <div 
            key={task.id}
            className={`calendar-task ${task.status === 'done' ? 'task-completed' : ''} ${task.priority === 'high' ? 'priority-high' : task.priority === 'medium' ? 'priority-medium' : 'priority-low'}`}
            onClick={() => handleTaskClick(task)}
          >
            {task.title}
          </div>
        ))}
      </div>
      
      {/* Time blocks */}
      <div className="mt-2 space-y-1">
        {dayTimeBlocks.map((block) => {
          const task = getTaskById(block.taskId);
          if (!task) return null;
          
          return (
            <div 
              key={block.id}
              className={`calendar-task bg-primary/10 border-l-2 border-primary text-xs`}
            >
              <div className="font-medium">{task.title}</div>
              <div>{block.startTime} - {block.endTime}</div>
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
