
import React from 'react';
import { Task } from '@/context/TaskTypes';

interface TaskListProps {
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  return (
    <div className="w-full md:w-72 border rounded-md h-fit mb-4 md:mb-0">
      <div className="bg-muted/50 p-2 border-b font-medium">
        Tasks
      </div>
      <div className="p-2 divide-y max-h-[300px] md:max-h-none overflow-auto">
        {tasks.length > 0 ? (
          <div className="py-2">
            <h4 className="font-medium text-sm mb-2">Tasks without dates</h4>
            {tasks.map(task => (
              <div
                key={task.id}
                className="p-1.5 md:p-2 mb-1 bg-background border rounded-sm text-xs md:text-sm hover:bg-muted cursor-grab"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', task.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
              >
                {task.title}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            No tasks match your current filters
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
