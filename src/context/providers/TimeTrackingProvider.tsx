import React, { createContext, useContext, useState, useEffect } from 'react';
import { ReactNode, TimeTracking, TimeBlock } from '../TaskTypes';
import { useTimeTrackingActions } from '../hooks/useTimeTrackingActions';
import { useTimeBlockActions } from '../hooks/useTimeBlockActions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../AuthContext';
import * as timeTrackingService from '@/services/timeTrackingService';
import * as timeBlockService from '@/services/timeBlockService';
import { toast } from '@/components/ui/use-toast';
import { useTaskContext } from './TaskContextProvider';
import { findTaskById, getRootTasks, updateTaskInHierarchy } from '../TaskHelpers';

interface TimeTrackingContextType {
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

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

export const TimeTrackingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, tasks, updateTask } = useTaskContext();
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [timeTrackings, setTimeTrackings] = useState<TimeTracking[]>([]);
  const [activeTimeTracking, setActiveTimeTracking] = useState<TimeTracking | null>(null);
  
  useEffect(() => {
    if (!user) {
      // Reset state when user logs out
      setTimeBlocks([]);
      setTimeTrackings([]);
      setActiveTimeTracking(null);
      return;
    }

    loadInitialData();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channels = [
      supabase.channel('public:time_trackings')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'time_trackings' }, 
          () => loadTimeTrackings()),

      supabase.channel('public:time_blocks')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'time_blocks' }, 
          () => loadTimeBlocks())
    ];

    // Subscribe to all channels
    Promise.all(channels.map(channel => channel.subscribe()));

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [user]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadTimeTrackings(),
        loadTimeBlocks()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load your data. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  };

  const loadTimeTrackings = async () => {
    try {
      const fetchedTimeTrackings = await timeTrackingService.getTimeTrackings();
      
      const activeTracking = fetchedTimeTrackings.find(tracking => !tracking.endTime);
      if (activeTracking) {
        setActiveTimeTracking(activeTracking);
        setTimeTrackings(fetchedTimeTrackings.filter(tracking => tracking.endTime));
      } else {
        setActiveTimeTracking(null);
        setTimeTrackings(fetchedTimeTrackings);
      }
    } catch (error) {
      console.error('Error loading time trackings:', error);
    }
  };

  const loadTimeBlocks = async () => {
    try {
      const fetchedTimeBlocks = await timeBlockService.getTimeBlocks();
      setTimeBlocks(fetchedTimeBlocks);
    } catch (error) {
      console.error('Error loading time blocks:', error);
    }
  };

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

  const timeBlockActions = useTimeBlockActions(timeBlocks, setTimeBlocks);
  const timeTrackingActions = useTimeTrackingActions(timeTrackings, setTimeTrackings);

  const startTimeTracking = async (taskId: string, notes?: string) => {
    try {
      if (activeTimeTracking) {
        await stopTimeTracking();
      }
      
      const newTracking = await timeTrackingService.startTimeTracking(taskId, notes);
      setActiveTimeTracking(newTracking);
    } catch (error) {
      console.error('Error starting time tracking:', error);
      throw error;
    }
  };

  const stopTimeTracking = async () => {
    try {
      if (activeTimeTracking) {
        await timeTrackingService.stopTimeTracking(activeTimeTracking.id, activeTimeTracking.taskId);
        await loadTimeTrackings();
        setActiveTimeTracking(null);
      }
    } catch (error) {
      console.error('Error stopping time tracking:', error);
      throw error;
    }
  };

  const addTimeTracking = async (timeTracking: Omit<TimeTracking, 'id'>) => {
    try {
      const newTracking = await timeTrackingService.addManualTimeTracking(timeTracking);
      timeTrackingActions.addTimeTracking(newTracking);
      
      const task = findTaskById(timeTracking.taskId, getRootTasks(tasks));
      if (task) {
        const updatedTask = {
          ...task,
          timeTracked: (task.timeTracked || 0) + timeTracking.duration
        };
        updateTask(updatedTask);
      }
    } catch (error) {
      console.error('Error adding time tracking:', error);
    }
  };

  const updateTimeTracking = async (timeTracking: TimeTracking) => {
    try {
      await timeTrackingService.updateTimeTracking(timeTracking);
      timeTrackingActions.updateTimeTracking(timeTracking);
    } catch (error) {
      console.error('Error updating time tracking:', error);
    }
  };

  const deleteTimeTracking = async (timeTrackingId: string) => {
    try {
      await timeTrackingService.deleteTimeTracking(timeTrackingId);
      timeTrackingActions.deleteTimeTracking(timeTrackingId);
    } catch (error) {
      console.error('Error deleting time tracking:', error);
    }
  };

  const addTimeBlock = async (timeBlock: Omit<TimeBlock, 'id'>) => {
    try {
      const newTimeBlock = await timeBlockService.createTimeBlock(timeBlock);
      timeBlockActions.addTimeBlock(newTimeBlock);
    } catch (error) {
      console.error('Error adding time block:', error);
    }
  };

  const updateTimeBlock = async (timeBlock: TimeBlock) => {
    try {
      await timeBlockService.updateTimeBlock(timeBlock);
      timeBlockActions.updateTimeBlock(timeBlock);
    } catch (error) {
      console.error('Error updating time block:', error);
    }
  };

  const deleteTimeBlock = async (timeBlockId: string) => {
    try {
      await timeBlockService.deleteTimeBlock(timeBlockId);
      timeBlockActions.deleteTimeBlock(timeBlockId);
    } catch (error) {
      console.error('Error deleting time block:', error);
    }
  };

  const value: TimeTrackingContextType = {
    timeBlocks,
    timeTrackings,
    activeTimeTracking,
    startTimeTracking,
    stopTimeTracking,
    addTimeTracking,
    updateTimeTracking,
    deleteTimeTracking,
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
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
