
import { Priority } from '@/context/TaskTypes';

export const priorityColors: Record<Priority, string> = {
  low: 'bg-task-low/20 text-task-low',
  medium: 'bg-task-medium/20 text-task-medium',
  high: 'bg-task-high/20 text-task-high'
};

export const priorityLabels: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};
