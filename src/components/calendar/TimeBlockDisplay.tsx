
import React from 'react';
import { TimeBlock, Task } from '@/context/TaskTypes';

interface TimeBlockDisplayProps {
  block: TimeBlock;
  task: Task | undefined;
}

const TimeBlockDisplay: React.FC<TimeBlockDisplayProps> = ({ block, task }) => {
  if (!task) return null;
  
  return (
    <div 
      key={block.id}
      className="calendar-task bg-primary/10 border-l-2 border-primary text-xs p-1 rounded-sm"
    >
      <div className="font-medium">{task.title}</div>
      <div>{block.startTime} - {block.endTime}</div>
    </div>
  );
};

export default TimeBlockDisplay;
