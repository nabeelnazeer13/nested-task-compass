
import React from 'react';
import { Task } from '@/context/TaskTypes';
import TaskBlock from './TaskBlock';

interface AllDaySectionProps {
  tasks: Task[];
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onTaskClick: (task: Task) => void;
  activeTimeTrackingTaskId?: string | null;
}

const AllDaySection: React.FC<AllDaySectionProps> = ({
  tasks,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onTaskClick,
  activeTimeTrackingTaskId
}) => {
  return (
    <div 
      className={`border-b p-1 ${isDragOver ? 'bg-primary/10' : 'bg-muted/10'}`}
      style={{ minHeight: '60px' }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="text-xs text-muted-foreground ml-1 mb-1">All day</div>
      <div className="flex flex-wrap gap-1">
        {tasks.map((task) => (
          <TaskBlock
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            activeTaskId={activeTimeTrackingTaskId}
          />
        ))}
      </div>
    </div>
  );
};

export default AllDaySection;
