
import { Priority } from '@/context/TaskTypes';

export const priorityColors = {
  high: {
    bg: 'bg-red-100',
    border: 'border-red-500',
    text: 'text-red-700'
  },
  medium: {
    bg: 'bg-yellow-100',
    border: 'border-yellow-500',
    text: 'text-yellow-700'
  },
  low: {
    bg: 'bg-blue-100',
    border: 'border-blue-500',
    text: 'text-blue-700'
  }
};

export const getPriorityColor = (priority: Priority) => {
  return priorityColors[priority] || priorityColors.low;
};

export const getPriorityLabel = (priority: Priority): string => {
  switch (priority) {
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    default:
      return 'Low';
  }
};
