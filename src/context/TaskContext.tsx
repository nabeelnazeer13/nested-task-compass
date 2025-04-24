import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Task, TimeBlock, TimeTracking, TaskContextType, ReactNode, Priority } from './TaskTypes';
import { sampleProjects, sampleTasks, sampleTimeBlocks } from './TaskMockData';
import { useProjectActions } from './TaskProjectActions';
import { useTaskActions } from './TaskTaskActions';
import { useTimeBlockActions } from './TaskTimeBlockActions';
import { useTimeTrackingActions } from './TaskTimeTrackingActions';
import { findTaskById, getRootTasks, updateTaskInHierarchy } from './TaskHelpers';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(sampleTimeBlocks);
  const [timeTrackings, setTimeTrackings] = useState<TimeTracking[]>([]);
  const [activeTimeTracking, setActiveTimeTracking] = useState<TimeTracking | null>(null);
  const [selectedView, setSelectedView] = useState<'projects' | 'calendar'>('projects');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    console.log('TaskContext initialized with:');
    console.log('Projects:', projects);
    console.log('Tasks:', tasks);
    console.log('TimeBlocks:', timeBlocks);
  }, []);

  useEffect(() => {
    const storedProjects = localStorage.getItem('quire-projects');
    const storedTasks = localStorage.getItem('quire-tasks');
    const storedTimeBlocks = localStorage.getItem('quire-timeblocks');
    const storedTimeTrackings = localStorage.getItem('quire-timetrackings');
    const storedActiveTimeTracking = localStorage.getItem('quire-active-timetracking');
    
    if (!storedProjects) {
      setProjects(sampleProjects);
      localStorage.setItem('quire-projects', JSON.stringify(sampleProjects));
    } else {
      setProjects(JSON.parse(storedProjects));
    }

    if (!storedTasks) {
      setTasks(sampleTasks);
      localStorage.setItem('quire-tasks', JSON.stringify(sampleTasks));
    } else {
      const parsedTasks = JSON.parse(storedTasks);
      parsedTasks.forEach((task: any) => {
        if (task.dueDate) task.dueDate = new Date(task.dueDate);
        if (task.status !== undefined) {
          delete task.status;
        }
        if (task.timeTracked === undefined) {
          task.timeTracked = 0;
        }
      });
      setTasks(parsedTasks);
    }

    if (!storedTimeBlocks) {
      setTimeBlocks(sampleTimeBlocks);
      localStorage.setItem('quire-timeblocks', JSON.stringify(sampleTimeBlocks));
    } else {
      const parsedTimeBlocks = JSON.parse(storedTimeBlocks);
      parsedTimeBlocks.forEach((block: any) => {
        if (block.date) block.date = new Date(block.date);
      });
      setTimeBlocks(parsedTimeBlocks);
    }

    if (!storedTimeTrackings) {
      setTimeTrackings([]);
      localStorage.setItem('quire-timetrackings', JSON.stringify([]));
    } else {
      const parsedTimeTrackings = JSON.parse(storedTimeTrackings);
      parsedTimeTrackings.forEach((tracking: any) => {
        if (tracking.startTime) tracking.startTime = new Date(tracking.startTime);
        if (tracking.endTime) tracking.endTime = new Date(tracking.endTime);
      });
      setTimeTrackings(parsedTimeTrackings);
    }

    if (!storedActiveTimeTracking) {
      setActiveTimeTracking(null);
      localStorage.setItem('quire-active-timetracking', JSON.stringify(null));
    } else {
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

  useEffect(() => {
    localStorage.setItem('quire-projects', JSON.stringify(projects));
    localStorage.setItem('quire-tasks', JSON.stringify(tasks));
    localStorage.setItem('quire-timeblocks', JSON.stringify(timeBlocks));
    localStorage.setItem('quire-timetrackings', JSON.stringify(timeTrackings));
    localStorage.setItem('quire-active-timetracking', JSON.stringify(activeTimeTracking));
  }, [projects, tasks, timeBlocks, timeTrackings, activeTimeTracking]);

  const projectActions = useProjectActions(projects, setProjects);
  const taskActions = useTaskActions(tasks, setTasks, () => tasks);
  const timeBlockActions = useTimeBlockActions(timeBlocks, setTimeBlocks);
  const timeTrackingActions = useTimeTrackingActions(timeTrackings, setTimeTrackings);

  useEffect(() => {
    if (!activeTimeTracking) return;
    
    const intervalId = setInterval(() => {
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
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [activeTimeTracking]);

  const updateTaskTimeTracked = (taskId: string, additionalMinutes: number) => {
    const task = findTaskById(taskId, getRootTasks(tasks));
    if (!task) return;
    
    if (task.parentId) {
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
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, timeTracked: (t.timeTracked || 0) + additionalMinutes } : t
      ));
    }
  };

  const startTimeTracking = (taskId: string, notes?: string) => {
    if (activeTimeTracking) {
      stopTimeTracking();
    }
    
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
    
    const endTime = new Date();
    const startTime = new Date(activeTimeTracking.startTime);
    const durationInMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
    
    const completedTracking: TimeTracking = {
      ...activeTimeTracking,
      endTime,
      duration: durationInMinutes
    };
    
    setTimeTrackings([...timeTrackings, completedTracking]);
    
    updateTaskTimeTracked(completedTracking.taskId, durationInMinutes);
    
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

export type { Task, Project, TimeBlock, TimeTracking, Priority, TaskContextType };
