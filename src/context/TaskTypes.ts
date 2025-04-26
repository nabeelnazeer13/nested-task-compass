
import React, { ReactNode } from 'react';

export type Priority = 'low' | 'medium' | 'high';

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // Every X days/weeks/months/years
  daysOfWeek?: number[]; // For weekly: 0 (Sunday) to 6 (Saturday)
  dayOfMonth?: number; // For monthly
  monthOfYear?: number; // For yearly
  endDate?: Date; // Optional end date
  occurrences?: number; // Optional number of occurrences
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: Priority;
  parentId?: string;
  projectId: string;
  children: Task[];
  isExpanded?: boolean;
  notes?: string;
  estimatedTime?: number;
  timeTracked: number;
  completed?: boolean;
  timeSlot?: string; // Format: "HH:MM" - specific time for the task on its due date
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceParentId?: string; // For generated recurring task instances
  recurrenceExceptions?: Date[]; // Dates where the recurring task is skipped
}

export interface TimeTracking {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  isExpanded?: boolean;
}

export interface TimeBlock {
  id: string;
  taskId: string;
  date: Date;
  startTime: string;
  endTime: string;
}

export type { ReactNode };
