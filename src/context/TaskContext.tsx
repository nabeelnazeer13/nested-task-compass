import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Task, TimeBlock, TimeTracking, TaskContextType, ReactNode } from './TaskTypes';
import { sampleProjects, sampleTasks, sampleTimeBlocks } from './TaskMockData';
import { useProjectActions } from './TaskProjectActions';
import { useTaskActions } from './TaskTaskActions';
import { useTimeBlockActions } from './TaskTimeBlockActions';
import { useTimeTrackingActions } from './TaskTimeTrackingActions';
import { findTaskById, getRootTasks, updateTaskInHierarchy } from './TaskHelpers';

// Compose all functionality as before, keeping async/persistence for now as in-memory with mock data

const TaskContext = createContext<TaskContextType | undefined>(undefined);

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

  // Delegate to actions hooks
  const projectActions = useProjectActions(projects, setProjects);
  const taskActions = useTaskActions(tasks, setTasks, () => tasks);
  const timeBlockActions = useTimeBlockActions(timeBlocks, setTimeBlocks);
  const timeTrackingActions = useTimeTrackingActions(timeTrackings, setTimeTrackings);

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

  const updateTaskTimeTracked = (taskId: string, additionalMinutes: number) => {
    const task = findTaskById(taskId, getRootTasks(tasks));
    if (!task) return;
    
    if (task.parentId) {
      // Update a child task
      const updatedTasks = updateTaskInHierarchy(
        taskId,
        (taskToUpdate) => ({
          ...taskToUpdate,
          timeTracked: (taskToUpdate.timeTracked || 0) + additionalMinutes
        }),
        getRootTasks(tasks)
      );
      setTasks(updatedTasks);
    } else {
      // Update a root task
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, timeTracked: (t.timeTracked || 0) + additionalMinutes } : t
      ));
    }
  };

  const startTimeTracking = (taskId: string, notes?: string) => {
    // Check if there's already an active tracking
    if (activeTimeTracking) {
      // Stop the current tracking before starting a new one
      stopTimeTracking();
    }
    
    // Create a new time tracking
    const newTracking: TimeTracking = {
      id: Math.random().toString(36).substring(2, 11),
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

  const value: TaskContextType = {
    projects,
    tasks,
    timeBlocks,
    timeTrackings,
    activeTimeTracking,
    ...projectActions,
    ...taskActions,
    ...timeBlockActions,
    ...timeTrackingActions,
    startTimeTracking,
    stopTimeTracking,
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
