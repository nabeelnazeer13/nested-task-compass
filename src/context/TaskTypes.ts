
import React, { ReactNode } from 'react';

export type Priority = 'low' | 'medium' | 'high';

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

export interface TaskContextType {
  projects: Project[];
  tasks: Task[];
  timeBlocks: TimeBlock[];
  timeTrackings: TimeTracking[];
  activeTimeTracking: TimeTracking | null;
  addProject: (project: Omit<Project, 'id' | 'isExpanded'>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  toggleProjectExpanded: (projectId: string) => void;
  addTask: (task: Omit<Task, 'id' | 'children' | 'isExpanded' | 'timeTracked'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskExpanded: (taskId: string) => void;
  addTimeBlock: (timeBlock: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (timeBlock: TimeBlock) => void;
  deleteTimeBlock: (timeBlockId: string) => void;
  startTimeTracking: (taskId: string, notes?: string) => void;
  stopTimeTracking: () => void;
  addTimeTracking: (timeTracking: Omit<TimeTracking, 'id'>) => void;
  updateTimeTracking: (timeTracking: TimeTracking) => void;
  deleteTimeTracking: (timeTrackingId: string) => void;
  selectedView: 'projects' | 'list' | 'calendar';
  setSelectedView: (view: 'projects' | 'list' | 'calendar') => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export type { ReactNode };
