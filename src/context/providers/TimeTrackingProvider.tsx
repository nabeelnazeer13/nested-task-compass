import React, { createContext, useContext, useState, useEffect } from 'react';
import { ReactNode, TimeTracking, TimeBlock } from '../TaskTypes';
import { useTimeTrackingActions } from '../hooks/useTimeTrackingActions';
import { useTimeBlockActions } from '../hooks/useTimeBlockActions';
import { supabase } from '@/integrations/supabase/client';
import * as timeTrackingService from '@/services/timeTrackingService';
import * as timeBlockService from '@/services/timeBlockService';
import { withTaskContext } from '../hocs/withTaskContext';
import { toast } from "@/hooks/use-toast";
import { findTaskById, updateTaskInHierarchy, getRootTasks } from '../TaskHelpers';
import type { TaskContextType, TimeTrackingContextType } from '../types/TaskContextTypes';

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

interface TimeTrackingProviderProps {
  children: ReactNode;
  taskContext: TaskContextType;
}

const TimeTrackingProviderBase: React.FC<TimeTrackingProviderProps> = ({ 
  children, 
  taskContext 
}) => {
  const { tasks, updateTask } = taskContext;
  // Since we've removed authentication, we'll assume a default user state
  const userId = 'default-user';
  
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [timeTrackings, setTimeTrackings] = useState<TimeTracking[]>([]);
  const [activeTimeTracking, setActiveTimeTracking] = useState<TimeTracking | null>(null);
  
  useEffect(() => {
    console.log('TimeTrackingProvider: Initializing provider');
    loadInitialData();
  }, []);

  useEffect(() => {
    console.log('TimeTrackingProvider: Setting up Supabase channels');
    const channels = [
      supabase.channel('public:time_trackings')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'time_trackings' }, 
          (payload) => {
            console.log('Supabase time_trackings change received:', payload);
            loadTimeTrackings();
          }),

      supabase.channel('public:time_blocks')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'time_blocks' }, 
          (payload) => {
            console.log('Supabase time_blocks change received:', payload);
            loadTimeBlocks();
          })
    ];

    Promise.all(channels.map(channel => channel.subscribe()));

    return () => {
      console.log('TimeTrackingProvider: Cleaning up Supabase channels');
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  const loadInitialData = async () => {
    console.log('TimeTrackingProvider: Loading initial data');
    try {
      await Promise.all([
        loadTimeTrackings(),
        loadTimeBlocks()
      ]);
      console.log('TimeTrackingProvider: Initial data loaded successfully');
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
    console.log('TimeTrackingProvider: Loading time trackings');
    try {
      const fetchedTimeTrackings = await timeTrackingService.getTimeTrackings();
      console.log(`TimeTrackingProvider: Fetched ${fetchedTimeTrackings.length} time trackings`);
      
      const activeTracking = fetchedTimeTrackings.find(tracking => !tracking.endTime);
      if (activeTracking) {
        console.log('TimeTrackingProvider: Found active tracking:', activeTracking);
        setActiveTimeTracking(activeTracking);
        setTimeTrackings(fetchedTimeTrackings.filter(tracking => tracking.endTime));
      } else {
        console.log('TimeTrackingProvider: No active tracking found');
        setActiveTimeTracking(null);
        setTimeTrackings(fetchedTimeTrackings);
      }
    } catch (error) {
      console.error('Error loading time trackings:', error);
    }
  };

  const loadTimeBlocks = async () => {
    console.log('TimeTrackingProvider: Loading time blocks');
    try {
      const fetchedTimeBlocks = await timeBlockService.getTimeBlocks();
      console.log(`TimeTrackingProvider: Fetched ${fetchedTimeBlocks.length} time blocks`);
      setTimeBlocks(fetchedTimeBlocks);
    } catch (error) {
      console.error('Error loading time blocks:', error);
    }
  };

  const updateTaskTimeTracked = (taskId: string, additionalMinutes: number) => {
    console.log(`TimeTrackingProvider: Updating task ${taskId} time tracked by ${additionalMinutes} minutes`);
    const task = findTaskById(taskId, getRootTasks(tasks));
    if (!task) {
      console.error(`TimeTrackingProvider: Task ${taskId} not found`);
      return;
    }
    
    if (task.parentId) {
      const updatedTasks = updateTaskInHierarchy(
        taskId,
        (taskToUpdate) => ({
          ...taskToUpdate,
          timeTracked: (taskToUpdate.timeTracked || 0) + additionalMinutes
        }),
        getRootTasks(tasks)
      );
      console.log('TimeTrackingProvider: Updating task in hierarchy:', updatedTasks[0]);
      updateTask(updatedTasks[0]);
    } else {
      console.log('TimeTrackingProvider: Updating standalone task:', task.id);
      updateTask({
        ...task,
        timeTracked: (task.timeTracked || 0) + additionalMinutes
      });
    }
  };

  const timeBlockActions = useTimeBlockActions(timeBlocks, setTimeBlocks);
  const timeTrackingActions = useTimeTrackingActions(timeTrackings, setTimeTrackings);

  const startTimeTracking = async (taskId: string, notes?: string) => {
    console.log(`TimeTrackingProvider: Starting time tracking for task ${taskId}`);
    console.log('Current task list:', tasks.map(t => ({ id: t.id, title: t.title })));
    
    const task = findTaskById(taskId, getRootTasks(tasks));
    if (!task) {
      console.error(`TimeTrackingProvider: Task ${taskId} not found in current tasks list`);
      toast({
        title: "Error starting time tracking",
        description: `Task not found in your task list. Please try again.`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (activeTimeTracking) {
        console.log('TimeTrackingProvider: Stopping current active tracking before starting new one');
        await stopTimeTracking();
      }
      
      console.log(`TimeTrackingProvider: Creating new time tracking for task ${taskId}`);
      const newTracking = await timeTrackingService.startTimeTracking(taskId, notes);
      setActiveTimeTracking(newTracking);
      console.log('TimeTrackingProvider: Time tracking started successfully', newTracking);
    } catch (error) {
      console.error('Error starting time tracking:', error);
      toast({
        title: "Error starting time tracking",
        description: `Failed to start time tracking for "${task.title}". Please try again.`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const stopTimeTracking = async () => {
    console.log('TimeTrackingProvider: Stopping time tracking');
    try {
      if (activeTimeTracking) {
        console.log(`TimeTrackingProvider: Stopping time tracking ${activeTimeTracking.id}`);
        await timeTrackingService.stopTimeTracking(activeTimeTracking.id, activeTimeTracking.taskId);
        await loadTimeTrackings();
        setActiveTimeTracking(null);
        console.log('TimeTrackingProvider: Time tracking stopped successfully');
      } else {
        console.log('TimeTrackingProvider: No active time tracking to stop');
      }
    } catch (error) {
      console.error('Error stopping time tracking:', error);
      toast({
        title: "Error stopping time tracking",
        description: "Failed to stop time tracking. Please try again.",
        variant: "destructive",
      });
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

export const TimeTrackingProvider = withTaskContext(TimeTrackingProviderBase);

export const useTimeTrackingContext = () => {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error('useTimeTrackingContext must be used within a TimeTrackingProvider');
  }
  return context;
};
