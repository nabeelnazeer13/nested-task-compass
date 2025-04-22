import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define our types
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
  estimatedTime?: number; // in minutes
  timeTracked: number; // in minutes
}

export interface TimeTracking {
  id: string;
  taskId: string;
  startTime: Date;  // Actual timestamp when tracking started
  endTime?: Date;   // Actual timestamp when tracking ended (optional for ongoing tracking)
  duration: number; // Calculated duration in minutes (for completed tracking)
  notes?: string;   // Optional notes about what was done during this time
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

interface TaskContextType {
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

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Sample data
const sampleProjects: Project[] = [
  { id: "project-1", name: "Personal", description: "Personal goals and errands", isExpanded: true },
  { id: "project-2", name: "Work", description: "Tasks for work", isExpanded: true },
  { id: "project-3", name: "Fitness", description: "Workout routines and logs", isExpanded: true },
  { id: "project-4", name: "Learning", description: "Courses and study items", isExpanded: true },
];

const sampleTasks: Task[] = [
  {
    id: "task-1-1",
    title: "Buy groceries",
    description: "Get vegetables, fruits, and snacks",
    priority: "medium",
    projectId: "project-1",
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    notes: "",
    estimatedTime: 45,
    timeTracked: 0,
    children: [
      { id: "task-1-1-1", title: "Fruits", priority: "low", projectId: "project-1", parentId: "task-1-1", timeTracked: 0, children: [] },
      { id: "task-1-1-2", title: "Vegetables", priority: "medium", projectId: "project-1", parentId: "task-1-1", timeTracked: 0, children: [] },
    ],
    isExpanded: true,
  },
  {
    id: "task-1-2",
    title: "Call plumber",
    description: "Fix leaking bathroom sink",
    priority: "high",
    projectId: "project-1",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    notes: "",
    estimatedTime: 30,
    timeTracked: 0,
    children: [],
  },
  {
    id: "task-1-3",
    title: "Read a book",
    description: "Start reading a new fiction novel",
    priority: "low",
    projectId: "project-1",
    notes: "",
    estimatedTime: 90,
    timeTracked: 0,
    children: [],
  },

  {
    id: "task-2-1",
    title: "Prepare presentation",
    description: "Q2 Project demo slides",
    priority: "high",
    projectId: "project-2",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    notes: "",
    estimatedTime: 120,
    timeTracked: 60,
    children: [],
  },
  {
    id: "task-2-2",
    title: "Client meeting",
    description: "Monthly update with client",
    priority: "medium",
    projectId: "project-2",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    notes: "",
    estimatedTime: 60,
    timeTracked: 0,
    children: [],
  },
  {
    id: "task-2-3",
    title: "Update documentation",
    description: "Sync up README and process docs",
    priority: "low",
    projectId: "project-2",
    notes: "",
    estimatedTime: 25,
    timeTracked: 0,
    children: [],
  },

  {
    id: "task-3-1",
    title: "Morning run",
    description: "5km run in the park",
    priority: "medium",
    projectId: "project-3",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    notes: "",
    estimatedTime: 40,
    timeTracked: 0,
    children: [],
  },
  {
    id: "task-3-2",
    title: "Yoga session",
    description: "Evening stress relief routine",
    priority: "low",
    projectId: "project-3",
    notes: "",
    estimatedTime: 30,
    timeTracked: 0,
    children: [],
  },
  {
    id: "task-3-3",
    title: "Gym strength training",
    description: "Upper body and core",
    priority: "high",
    projectId: "project-3",
    notes: "",
    estimatedTime: 60,
    timeTracked: 0,
    children: [],
  },

  {
    id: "task-4-1",
    title: "Complete TypeScript course",
    description: "Finish sections 6-9",
    priority: "high",
    projectId: "project-4",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notes: "",
    estimatedTime: 180,
    timeTracked: 30,
    children: [],
  },
  {
    id: "task-4-2",
    title: "Study for math exam",
    description: "Focus on calculus problems",
    priority: "medium",
    projectId: "project-4",
    notes: "",
    estimatedTime: 120,
    timeTracked: 0,
    children: [],
  },
  {
    id: "task-4-3",
    title: "Watch tutorial videos",
    description: "React hooks and best practices",
    priority: "low",
    projectId: "project-4",
    notes: "",
    estimatedTime: 90,
    timeTracked: 0,
    children: [],
  },
];

const sampleTimeBlocks: TimeBlock[] = [
  {
    id: "block-1",
    taskId: "task-1-1",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    startTime: "09:00",
    endTime: "09:30",
  },
  {
    id: "block-2",
    taskId: "task-2-1",
    date: new Date(),
    startTime: "14:00",
    endTime: "15:00",
  },
];

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(sampleTimeBlocks);
  const [timeTrackings, setTimeTrackings] = useState<TimeTracking[]>([]);
  const [activeTimeTracking, setActiveTimeTracking] = useState<TimeTracking | null>(null);
  const [selectedView, setSelectedView] = useState<'projects' | 'list' | 'calendar'>('projects');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Local Storage persistence
  useEffect(() => {
    // Load data from localStorage on init
    const storedProjects = localStorage.getItem('quire-projects');
    const storedTasks = localStorage.getItem('quire-tasks');
    const storedTimeBlocks = localStorage.getItem('quire-timeblocks');
    const storedTimeTrackings = localStorage.getItem('quire-timetrackings');
    const storedActiveTimeTracking = localStorage.getItem('quire-active-timetracking');
    
    if (storedProjects) setProjects(JSON.parse(storedProjects));
    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks);
      // Convert date strings back to Date objects
      parsedTasks.forEach((task: any) => {
        if (task.dueDate) task.dueDate = new Date(task.dueDate);
        // Migrate existing tasks to new structure
        if (task.status !== undefined) {
          delete task.status;
        }
        if (task.timeTracked === undefined) {
          task.timeTracked = 0;
        }
      });
      setTasks(parsedTasks);
    }
    if (storedTimeBlocks) {
      const parsedTimeBlocks = JSON.parse(storedTimeBlocks);
      // Convert date strings back to Date objects
      parsedTimeBlocks.forEach((block: any) => {
        if (block.date) block.date = new Date(block.date);
      });
      setTimeBlocks(parsedTimeBlocks);
    }
    if (storedTimeTrackings) {
      const parsedTimeTrackings = JSON.parse(storedTimeTrackings);
      parsedTimeTrackings.forEach((tracking: any) => {
        if (tracking.startTime) tracking.startTime = new Date(tracking.startTime);
        if (tracking.endTime) tracking.endTime = new Date(tracking.endTime);
      });
      setTimeTrackings(parsedTimeTrackings);
    }
    if (storedActiveTimeTracking) {
      const parsedActiveTracking = JSON.parse(storedActiveTimeTracking);
      if (parsedActiveTracking) {
        if (parsedActiveTracking.startTime) 
          parsedActiveTracking.startTime = new Date(parsedActiveTracking.startTime);
        if (parsedActiveTracking.endTime) 
          parsedActiveTracking.endTime = new Date(parsedActiveTracking.endTime);
        setActiveTimeTracking(parsedActiveTracking);
      }
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('quire-projects', JSON.stringify(projects));
    localStorage.setItem('quire-tasks', JSON.stringify(tasks));
    localStorage.setItem('quire-timeblocks', JSON.stringify(timeBlocks));
    localStorage.setItem('quire-timetrackings', JSON.stringify(timeTrackings));
    localStorage.setItem('quire-active-timetracking', JSON.stringify(activeTimeTracking));
  }, [projects, tasks, timeBlocks, timeTrackings, activeTimeTracking]);

  // Timer effect to update active time tracking
  useEffect(() => {
    if (!activeTimeTracking) return;
    
    const intervalId = setInterval(() => {
      // Update the active time tracking's duration
      const now = new Date();
      const startTime = new Date(activeTimeTracking.startTime);
      const durationInMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);
      
      setActiveTimeTracking(prev => {
        if (prev) {
          return {
            ...prev,
            duration: durationInMinutes
          };
        }
        return null;
      });
    }, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, [activeTimeTracking]);

  // Project functions
  const addProject = (project: Omit<Project, 'id' | 'isExpanded'>) => {
    const newProject = { ...project, id: generateId(), isExpanded: true };
    setProjects([...projects, newProject]);
  };

  const updateProject = (project: Project) => {
    setProjects(projects.map(p => p.id === project.id ? project : p));
  };

  const deleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    // Delete all tasks associated with this project
    setTasks(tasks.filter(t => t.projectId !== projectId));
  };

  const toggleProjectExpanded = (projectId: string) => {
    setProjects(
      projects.map(p => 
        p.id === projectId ? { ...p, isExpanded: !p.isExpanded } : p
      )
    );
  };

  // Helper function to find a task by ID in a nested structure
  const findTaskById = (taskId: string, taskList: Task[]): Task | undefined => {
    for (const task of taskList) {
      if (task.id === taskId) return task;
      if (task.children.length > 0) {
        const foundTask = findTaskById(taskId, task.children);
        if (foundTask) return foundTask;
      }
    }
    return undefined;
  };

  // Helper function to get all root tasks (no parent)
  const getRootTasks = () => {
    return tasks.filter(task => !task.parentId);
  };

  // Helper function to update a task in the nested structure
  const updateTaskInHierarchy = (
    taskId: string,
    updateFn: (task: Task) => Task,
    taskList: Task[]
  ): Task[] => {
    return taskList.map(task => {
      if (task.id === taskId) {
        return updateFn(task);
      }
      if (task.children.length > 0) {
        return {
          ...task,
          children: updateTaskInHierarchy(taskId, updateFn, task.children)
        };
      }
      return task;
    });
  };

  // Helper function to delete a task from the nested structure
  const deleteTaskFromHierarchy = (
    taskId: string,
    taskList: Task[]
  ): Task[] => {
    return taskList.filter(task => {
      if (task.id === taskId) return false;
      if (task.children.length > 0) {
        task.children = deleteTaskFromHierarchy(taskId, task.children);
      }
      return true;
    });
  };

  // Task functions
  const addTask = (task: Omit<Task, 'id' | 'children' | 'isExpanded' | 'timeTracked'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      children: [],
      isExpanded: true,
      timeTracked: 0
    };

    if (task.parentId) {
      // Add as a child task to parent
      const updatedTasks = updateTaskInHierarchy(
        task.parentId,
        (parent) => ({
          ...parent,
          children: [...parent.children, newTask]
        }),
        getRootTasks()
      );
      setTasks(updatedTasks);
    } else {
      // Add as a root task
      setTasks([...getRootTasks(), newTask]);
    }
  };

  const updateTask = (task: Task) => {
    if (task.parentId) {
      // Update a child task
      const updatedTasks = updateTaskInHierarchy(
        task.id,
        () => task,
        getRootTasks()
      );
      setTasks(updatedTasks);
    } else {
      // Update a root task
      setTasks(tasks.map(t => t.id === task.id ? task : t));
    }
  };

  const deleteTask = (taskId: string) => {
    const taskToDelete = findTaskById(taskId, getRootTasks());
    
    if (!taskToDelete) return;
    
    if (taskToDelete.parentId) {
      // Delete a child task
      const updatedTasks = updateTaskInHierarchy(
        taskToDelete.parentId,
        (parent) => ({
          ...parent,
          children: parent.children.filter(child => child.id !== taskId)
        }),
        getRootTasks()
      );
      setTasks(updatedTasks);
    } else {
      // Delete a root task
      setTasks(tasks.filter(t => t.id !== taskId));
    }
    
    // Also delete any timeblocks associated with this task
    setTimeBlocks(timeBlocks.filter(tb => tb.taskId !== taskId));
  };

  const toggleTaskExpanded = (taskId: string) => {
    const taskToToggle = findTaskById(taskId, getRootTasks());
    
    if (!taskToToggle) return;
    
    if (taskToToggle.parentId) {
      // Toggle a child task
      const updatedTasks = updateTaskInHierarchy(
        taskId,
        (task) => ({
          ...task,
          isExpanded: !task.isExpanded
        }),
        getRootTasks()
      );
      setTasks(updatedTasks);
    } else {
      // Toggle a root task
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, isExpanded: !t.isExpanded } : t
      ));
    }
  };

  // TimeBlock functions
  const addTimeBlock = (timeBlock: Omit<TimeBlock, 'id'>) => {
    const newTimeBlock = { ...timeBlock, id: generateId() };
    setTimeBlocks([...timeBlocks, newTimeBlock]);
  };

  const updateTimeBlock = (timeBlock: TimeBlock) => {
    setTimeBlocks(timeBlocks.map(tb => tb.id === timeBlock.id ? timeBlock : tb));
  };

  const deleteTimeBlock = (timeBlockId: string) => {
    setTimeBlocks(timeBlocks.filter(tb => tb.id !== timeBlockId));
  };

  // TimeTracking functions
  const startTimeTracking = (taskId: string, notes?: string) => {
    // Check if there's already an active tracking
    if (activeTimeTracking) {
      // Stop the current tracking before starting a new one
      stopTimeTracking();
    }
    
    // Create a new time tracking
    const newTracking: TimeTracking = {
      id: generateId(),
      taskId,
      startTime: new Date(),
      duration: 0,
      notes
    };
    
    setActiveTimeTracking(newTracking);
  };

  const stopTimeTracking = () => {
    if (!activeTimeTracking) return;
    
    // Calculate the final duration
    const endTime = new Date();
    const startTime = new Date(activeTimeTracking.startTime);
    const durationInMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
    
    const completedTracking: TimeTracking = {
      ...activeTimeTracking,
      endTime,
      duration: durationInMinutes
    };
    
    // Add the completed tracking to the list
    setTimeTrackings([...timeTrackings, completedTracking]);
    
    // Update the task's total tracked time
    updateTaskTimeTracked(completedTracking.taskId, durationInMinutes);
    
    // Clear the active tracking
    setActiveTimeTracking(null);
  };

  const updateTaskTimeTracked = (taskId: string, additionalMinutes: number) => {
    const task = findTaskById(taskId, getRootTasks());
    if (!task) return;
    
    if (task.parentId) {
      // Update a child task
      const updatedTasks = updateTaskInHierarchy(
        taskId,
        (taskToUpdate) => ({
          ...taskToUpdate,
          timeTracked: (taskToUpdate.timeTracked || 0) + additionalMinutes
        }),
        getRootTasks()
      );
      setTasks(updatedTasks);
    } else {
      // Update a root task
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, timeTracked: (t.timeTracked || 0) + additionalMinutes } : t
      ));
    }
  };

  const addTimeTracking = (timeTracking: Omit<TimeTracking, 'id'>) => {
    const newTimeTracking = { ...timeTracking, id: generateId() };
    setTimeTrackings([...timeTrackings, newTimeTracking]);
    
    // Update the task's total tracked time if the tracking has a duration
    if (timeTracking.duration > 0) {
      updateTaskTimeTracked(timeTracking.taskId, timeTracking.duration);
    }
  };

  const updateTimeTracking = (timeTracking: TimeTracking) => {
    // Get the original time tracking
    const originalTracking = timeTrackings.find(t => t.id === timeTracking.id);
    
    if (originalTracking) {
      // If the duration changed, update the task's total tracked time
      const durationDifference = timeTracking.duration - originalTracking.duration;
      if (durationDifference !== 0) {
        updateTaskTimeTracked(timeTracking.taskId, durationDifference);
      }
    }
    
    setTimeTrackings(timeTrackings.map(t => 
      t.id === timeTracking.id ? timeTracking : t
    ));
  };

  const deleteTimeTracking = (timeTrackingId: string) => {
    const trackingToDelete = timeTrackings.find(t => t.id === timeTrackingId);
    
    if (trackingToDelete) {
      // Update the task's total tracked time by subtracting the deleted tracking's duration
      updateTaskTimeTracked(trackingToDelete.taskId, -trackingToDelete.duration);
      
      // Remove the tracking
      setTimeTrackings(timeTrackings.filter(t => t.id !== timeTrackingId));
    }
  };

  const value = {
    projects,
    tasks,
    timeBlocks,
    timeTrackings,
    activeTimeTracking,
    addProject,
    updateProject,
    deleteProject,
    toggleProjectExpanded,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskExpanded,
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    startTimeTracking,
    stopTimeTracking,
    addTimeTracking,
    updateTimeTracking,
    deleteTimeTracking,
    selectedView,
    setSelectedView,
    selectedDate,
    setSelectedDate
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
