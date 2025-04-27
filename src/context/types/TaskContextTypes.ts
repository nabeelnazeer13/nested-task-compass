
import { Task, Project, TimeTracking, TimeBlock } from '../TaskTypes';

export interface TaskContextType {
  projects: Project[];
  tasks: Task[];
  addProject: (project: Omit<Project, 'id' | 'isExpanded'>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  toggleProjectExpanded: (projectId: string) => void;
  addTask: (task: Omit<Task, 'id' | 'children' | 'isExpanded' | 'timeTracked'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskExpanded: (taskId: string) => void;
}

export interface TimeTrackingContextType {
  timeBlocks: TimeBlock[];
  timeTrackings: TimeTracking[];
  activeTimeTracking: TimeTracking | null;
  startTimeTracking: (taskId: string, notes?: string) => void;
  stopTimeTracking: () => void;
  addTimeTracking: (timeTracking: Omit<TimeTracking, 'id'>) => void;
  updateTimeTracking: (timeTracking: TimeTracking) => void;
  deleteTimeTracking: (timeTrackingId: string) => void;
  addTimeBlock: (timeBlock: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (timeBlock: TimeBlock) => void;
  deleteTimeBlock: (timeBlockId: string) => void;
}
