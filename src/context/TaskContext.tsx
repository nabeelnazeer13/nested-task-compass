import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define our types
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: Priority;
  status: Status;
  parentId?: string;
  projectId: string;
  children: Task[];
  isExpanded?: boolean;
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
  addProject: (project: Omit<Project, 'id' | 'isExpanded'>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  toggleProjectExpanded: (projectId: string) => void;
  addTask: (task: Omit<Task, 'id' | 'children' | 'isExpanded'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskExpanded: (taskId: string) => void;
  addTimeBlock: (timeBlock: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (timeBlock: TimeBlock) => void;
  deleteTimeBlock: (timeBlockId: string) => void;
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
  { id: 'project-1', name: 'Personal Tasks', description: 'My personal to-dos', isExpanded: true },
  { id: 'project-2', name: 'Work', description: 'Work-related tasks', isExpanded: false },
];

const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Shopping list',
    description: 'Buy groceries for the week',
    priority: 'medium',
    status: 'todo',
    projectId: 'project-1',
    children: [
      {
        id: 'task-1-1',
        title: 'Vegetables',
        priority: 'medium',
        status: 'todo',
        projectId: 'project-1',
        parentId: 'task-1',
        children: [],
      },
      {
        id: 'task-1-2',
        title: 'Fruits',
        priority: 'low',
        status: 'todo',
        projectId: 'project-1',
        parentId: 'task-1',
        children: [],
      }
    ],
    isExpanded: true,
  },
  {
    id: 'task-2',
    title: 'Complete project proposal',
    description: 'Finish the proposal for the new client',
    priority: 'high',
    status: 'in-progress',
    projectId: 'project-2',
    dueDate: new Date(2025, 3, 25),
    children: [],
  },
  {
    id: 'task-3',
    title: 'Schedule team meeting',
    priority: 'low',
    status: 'todo',
    projectId: 'project-2',
    dueDate: new Date(2025, 3, 23),
    children: [],
  }
];

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [selectedView, setSelectedView] = useState<'projects' | 'list' | 'calendar'>('projects');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Local Storage persistence
  useEffect(() => {
    // Load data from localStorage on init
    const storedProjects = localStorage.getItem('quire-projects');
    const storedTasks = localStorage.getItem('quire-tasks');
    const storedTimeBlocks = localStorage.getItem('quire-timeblocks');
    
    if (storedProjects) setProjects(JSON.parse(storedProjects));
    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks);
      // Convert date strings back to Date objects
      parsedTasks.forEach((task: any) => {
        if (task.dueDate) task.dueDate = new Date(task.dueDate);
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
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('quire-projects', JSON.stringify(projects));
    localStorage.setItem('quire-tasks', JSON.stringify(tasks));
    localStorage.setItem('quire-timeblocks', JSON.stringify(timeBlocks));
  }, [projects, tasks, timeBlocks]);

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
  const addTask = (task: Omit<Task, 'id' | 'children' | 'isExpanded'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      children: [],
      isExpanded: true
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

  const value = {
    projects,
    tasks,
    timeBlocks,
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
