
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ReactNode, TimeTracking } from '../TaskTypes';
import { useTimeTrackingActions } from '../hooks/useTimeTrackingActions';
import { useTimeBlockActions } from '../hooks/useTimeBlockActions';
import { sampleTimeBlocks } from '../TaskMockData';
import { useTaskContext } from './TaskContextProvider';
import { findTaskById, getRootTasks, updateTaskInHierarchy } from '../TaskHelpers';

interface TimeTrackingContextType {
  timeBlocks: TimeTracking[];
  timeTrackings: TimeTracking[];
  activeTimeTracking: TimeTracking | null;
  startTimeTracking: (taskId: string, notes?: string) => void;
  stopTimeTracking: () => void;
  addTimeTracking: (timeTracking: Omit<TimeTracking, 'id'>) => void;
  updateTimeTracking: (timeTracking: TimeTracking) => void;
  deleteTimeTracking: (timeTrackingId: string) => void;
  addTimeBlock: (timeBlock: Omit<TimeTracking, 'id'>) => void;
  updateTimeBlock: (timeBlock: TimeTracking) => void;
  deleteTimeBlock: (timeBlockId: string) => void;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

export const TimeTrackingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { tasks, updateTask } = useTaskContext();
  const [timeBlocks, setTimeBlocks] = useState(sampleTimeBlocks);
  const [timeTrackings, setTimeTrackings] = useState<TimeTracking[]>([]);
  const [activeTimeTracking, setActiveTimeTracking] = useState<TimeTracking | null>(null);

  useEffect(() => {
    const storedTimeBlocks = localStorage.getItem('quire-timeblocks');
    const storedTimeTrackings = localStorage.getItem('quire-timetrackings');
    const storedActiveTimeTracking = localStorage.getItem('quire-active-timetracking');

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
    localStorage.setItem('quire-timeblocks', JSON.stringify(timeBlocks));
    localStorage.setItem('quire-timetrackings', JSON.stringify(timeTrackings));
    localStorage.setItem('quire-active-timetracking', JSON.stringify(activeTimeTracking));
  }, [timeBlocks, timeTrackings, activeTimeTracking]);

  const timeBlockActions = useTimeBlockActions(timeBlocks, setTimeBlocks);
  const timeTrackingActions = useTimeTrackingActions(timeTrackings, setTimeTrackings);

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
      updateTask(updatedTasks[0]);
    } else {
      updateTask({
        ...task,
        timeTracked: (task.timeTracked || 0) + additionalMinutes
      });
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

  const value = {
    timeBlocks,
    timeTrackings,
    activeTimeTracking,
    startTimeTracking,
    stopTimeTracking,
    ...timeBlockActions,
    ...timeTrackingActions,
  };

  return (
    <TimeTrackingContext.Provider value={value}>
      {children}
    </TimeTrackingContext.Provider>
  );
};

export const useTimeTrackingContext = () => {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error('useTimeTrackingContext must be used within a TimeTrackingProvider');
  }
  return context;
};
