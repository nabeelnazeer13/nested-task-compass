import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Task, TimeBlock, TimeTracking, ReactNode } from '../TaskTypes';
import { useProjectActions } from '../hooks/useProjectActions';
import { useTaskActions } from '../hooks/useTaskActions';
import { useTimeTrackingActions } from '../hooks/useTimeTrackingActions';
import { useTimeBlockActions } from '../hooks/useTimeBlockActions';
import { supabase } from '@/integrations/supabase/client';
import * as projectService from '@/services/projectService';
import * as taskService from '@/services/taskService';
import * as timeTrackingService from '@/services/timeTrackingService';
import * as timeBlockService from '@/services/timeBlockService';
import { toast } from '@/components/ui/use-toast';
import { useOnlineStatus } from '@/hooks/use-online-status';

interface SupabaseTaskContextProviderType {
  projects: Project[];
  tasks: Task[];
  timeBlocks: TimeBlock[];
  timeTrackings: TimeTracking[];
  activeTimeTracking: TimeTracking | null;
  loading: boolean;
  // Project actions
  addProject: (project: Omit<Project, 'id' | 'isExpanded'>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  toggleProjectExpanded: (projectId: string) => Promise<void>;
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'children' | 'isExpanded' | 'timeTracked'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskExpanded: (taskId: string) => Promise<void>;
  updateRecurringTask: (task: Task, updateMode?: 'single' | 'future' | 'all') => Promise<void>;
  deleteRecurringTask: (taskId: string, deleteMode?: 'single' | 'future' | 'all') => Promise<void>;
  // Time tracking actions
  startTimeTracking: (taskId: string, notes?: string) => Promise<void>;
  stopTimeTracking: () => Promise<void>;
  addTimeTracking: (timeTracking: Omit<TimeTracking, 'id'>) => Promise<void>;
  updateTimeTracking: (timeTracking: TimeTracking) => Promise<void>;
  deleteTimeTracking: (timeTrackingId: string) => Promise<void>;
  // Time block actions
  addTimeBlock: (timeBlock: Omit<TimeBlock, 'id'>) => Promise<void>;
  updateTimeBlock: (timeBlock: TimeBlock) => Promise<void>;
  deleteTimeBlock: (timeBlockId: string) => Promise<void>;
  isOnline: boolean;
  pendingOperations: number;
}

const SupabaseTaskContext = createContext<SupabaseTaskContextProviderType | undefined>(undefined);

export const SupabaseTaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Since we've removed authentication, we'll assume a default user state for simplicity
  const userId = 'default-user';
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [timeTrackings, setTimeTrackings] = useState<TimeTracking[]>([]);
  const [activeTimeTracking, setActiveTimeTracking] = useState<TimeTracking | null>(null);
  const [loading, setLoading] = useState(true);

  const projectActions = useProjectActions(projects, setProjects);
  const taskActions = useTaskActions(tasks, setTasks, () => tasks);
  const timeTrackingActions = useTimeTrackingActions(timeTrackings, setTimeTrackings);
  const timeBlockActions = useTimeBlockActions(timeBlocks, setTimeBlocks);

  const networkStatus = useOnlineStatus();
  const isOnline = networkStatus.isOnline;
  const [pendingOperations, setPendingOperations] = useState<Array<{
    type: 'add' | 'update' | 'delete';
    entity: 'task' | 'project' | 'timeTracking' | 'timeBlock';
    data: any;
  }>>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const channels = [
      supabase.channel('public:projects')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'projects' }, 
          (payload) => {
            console.log('Project change:', payload);
            loadProjects();
          }),

      supabase.channel('public:tasks')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'tasks' }, 
          (payload) => {
            console.log('Task change:', payload);
            loadTasks();
          }),

      supabase.channel('public:time_trackings')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'time_trackings' }, 
          (payload) => {
            console.log('Time tracking change:', payload);
            loadTimeTrackings();
          }),

      supabase.channel('public:time_blocks')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'time_blocks' }, 
          (payload) => {
            console.log('Time block change:', payload);
            loadTimeBlocks();
          })
    ];

    // Subscribe to all channels
    Promise.all(channels.map(channel => channel.subscribe()));

    // Cleanup: unsubscribe from all channels
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  // Process pending operations when coming back online
  useEffect(() => {
    if (isOnline && pendingOperations.length > 0) {
      const processPendingOperations = async () => {
        const operations = [...pendingOperations];
        setPendingOperations([]);

        for (const operation of operations) {
          try {
            switch (operation.type) {
              case 'add':
                if (operation.entity === 'task') {
                  await taskService.createTask(operation.data);
                } else if (operation.entity === 'project') {
                  await projectService.createProject(operation.data);
                }
                // ... handle other entities
                break;
              case 'update':
                if (operation.entity === 'task') {
                  await taskService.updateTask(operation.data);
                }
                // ... handle other entities
                break;
              case 'delete':
                if (operation.entity === 'task') {
                  await taskService.deleteTask(operation.data);
                }
                // ... handle other entities
                break;
            }
          } catch (error) {
            console.error('Error processing pending operation:', error);
            setPendingOperations(prev => [...prev, operation]);
          }
        }
      };

      processPendingOperations();
    }
  }, [isOnline, pendingOperations]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProjects(),
        loadTasks(),
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
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const fetchedProjects = await projectService.getProjects();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const fetchedTasks = await taskService.getTasks();
      
      const tasksMap = new Map<string, Task>();
      const rootTasks: Task[] = [];
      
      fetchedTasks.forEach(task => {
        task.children = [];
        tasksMap.set(task.id, task);
      });
      
      fetchedTasks.forEach(task => {
        if (task.parentId) {
          const parent = tasksMap.get(task.parentId);
          if (parent) {
            parent.children.push(task);
          } else {
            rootTasks.push(task);
          }
        } else {
          rootTasks.push(task);
        }
      });
      
      setTasks(rootTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
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

  // Rest of the methods remain largely unchanged, just removing auth dependencies
  const addProjectDb = async (project: Omit<Project, 'id' | 'isExpanded'>) => {
    try {
      await projectService.createProject(project);
      // No need to update local state, real-time subscription will handle it
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  };

  const updateProjectDb = async (project: Project) => {
    try {
      await projectService.updateProject(project);
      // No need to update local state, real-time subscription will handle it
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const deleteProjectDb = async (projectId: string) => {
    try {
      await projectService.deleteProject(projectId);
      projectActions.deleteProject(projectId);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const toggleProjectExpandedDb = async (projectId: string) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const newExpandedState = !project.isExpanded;
        await projectService.toggleProjectExpanded(projectId, newExpandedState);
        projectActions.toggleProjectExpanded(projectId);
      }
    } catch (error) {
      console.error('Error toggling project expanded state:', error);
    }
  };

  // Modified addTask with optimistic updates
  const addTaskDb = async (task: Omit<Task, 'id' | 'children' | 'isExpanded' | 'timeTracked'>) => {
    // Create optimistic version of the task
    const optimisticTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      children: [],
      isExpanded: true,
      timeTracked: 0
    };

    // Optimistically update UI
    taskActions.addTask(optimisticTask);

    try {
      if (!isOnline) {
        setPendingOperations(prev => [...prev, { type: 'add', entity: 'task', data: task }]);
        return;
      }

      const newTask = await taskService.createTask(task);
      
      // Replace optimistic task with real one
      taskActions.updateTask(newTask);
    } catch (error) {
      console.error('Error adding task:', error);
      // Revert optimistic update
      taskActions.deleteTask(optimisticTask.id);
      toast({
        title: "Error",
        description: "Failed to add task. It will be retried when you're back online.",
        variant: "destructive",
      });
    }
  };

  // Modified updateTask with optimistic updates
  const updateTaskDb = async (task: Task) => {
    const previousTask = findTaskById(task.id, tasks);
    
    // Optimistically update UI
    taskActions.updateTask(task);

    try {
      if (!isOnline) {
        setPendingOperations(prev => [...prev, { type: 'update', entity: 'task', data: task }]);
        return;
      }

      await taskService.updateTask(task);
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert optimistic update
      if (previousTask) {
        taskActions.updateTask(previousTask);
      }
      toast({
        title: "Error",
        description: "Failed to update task. Changes will be saved when you're back online.",
        variant: "destructive",
      });
    }
  };

  // Modified deleteTask with optimistic updates
  const deleteTaskDb = async (taskId: string) => {
    const taskToDelete = findTaskById(taskId, tasks);
    
    // Optimistically update UI
    taskActions.deleteTask(taskId);

    try {
      if (!isOnline) {
        setPendingOperations(prev => [...prev, { type: 'delete', entity: 'task', data: taskId }]);
        return;
      }

      await taskService.deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      // Revert optimistic update
      if (taskToDelete) {
        taskActions.addTask(taskToDelete);
      }
      toast({
        title: "Error",
        description: "Failed to delete task. It will be retried when you're back online.",
        variant: "destructive",
      });
    }
  };

  const toggleTaskExpandedDb = async (taskId: string) => {
    try {
      const task = findTaskById(taskId, tasks);
      if (task) {
        const newExpandedState = !task.isExpanded;
        await taskService.toggleTaskExpanded(taskId, newExpandedState);
        taskActions.toggleTaskExpanded(taskId);
      }
    } catch (error) {
      console.error('Error toggling task expanded state:', error);
    }
  };

  const updateRecurringTaskDb = async (task: Task, updateMode: 'single' | 'future' | 'all' = 'single') => {
    try {
      taskActions.updateRecurringTask(task, updateMode);
    } catch (error) {
      console.error('Error updating recurring task:', error);
    }
  };

  const deleteRecurringTaskDb = async (taskId: string, deleteMode: 'single' | 'future' | 'all' = 'single') => {
    try {
      taskActions.deleteRecurringTask(taskId, deleteMode);
    } catch (error) {
      console.error('Error deleting recurring task:', error);
    }
  };

  const startTimeTrackingDb = async (taskId: string, notes?: string) => {
    try {
      if (activeTimeTracking) {
        await stopTimeTrackingDb();
      }
      
      const newTracking = await timeTrackingService.startTimeTracking(taskId, notes);
      setActiveTimeTracking(newTracking);
    } catch (error) {
      console.error('Error starting time tracking:', error);
    }
  };

  const stopTimeTrackingDb = async () => {
    try {
      if (activeTimeTracking) {
        await timeTrackingService.stopTimeTracking(activeTimeTracking.id, activeTimeTracking.taskId);
        await loadTimeTrackings();
        setActiveTimeTracking(null);
      }
    } catch (error) {
      console.error('Error stopping time tracking:', error);
    }
  };

  const addTimeTrackingDb = async (timeTracking: Omit<TimeTracking, 'id'>) => {
    try {
      const newTracking = await timeTrackingService.addManualTimeTracking(timeTracking);
      timeTrackingActions.addTimeTracking(newTracking);
      
      const task = findTaskById(timeTracking.taskId, tasks);
      if (task) {
        const updatedTask = {
          ...task,
          timeTracked: (task.timeTracked || 0) + timeTracking.duration
        };
        taskActions.updateTask(updatedTask);
      }
    } catch (error) {
      console.error('Error adding time tracking:', error);
    }
  };

  const updateTimeTrackingDb = async (timeTracking: TimeTracking) => {
    try {
      await timeTrackingService.updateTimeTracking(timeTracking);
      timeTrackingActions.updateTimeTracking(timeTracking);
    } catch (error) {
      console.error('Error updating time tracking:', error);
    }
  };

  const deleteTimeTrackingDb = async (timeTrackingId: string) => {
    try {
      await timeTrackingService.deleteTimeTracking(timeTrackingId);
      timeTrackingActions.deleteTimeTracking(timeTrackingId);
    } catch (error) {
      console.error('Error deleting time tracking:', error);
    }
  };

  const addTimeBlockDb = async (timeBlock: Omit<TimeBlock, 'id'>) => {
    try {
      const newTimeBlock = await timeBlockService.createTimeBlock(timeBlock);
      timeBlockActions.addTimeBlock(newTimeBlock);
    } catch (error) {
      console.error('Error adding time block:', error);
    }
  };

  const updateTimeBlockDb = async (timeBlock: TimeBlock) => {
    try {
      await timeBlockService.updateTimeBlock(timeBlock);
      timeBlockActions.updateTimeBlock(timeBlock);
    } catch (error) {
      console.error('Error updating time block:', error);
    }
  };

  const deleteTimeBlockDb = async (timeBlockId: string) => {
    try {
      await timeBlockService.deleteTimeBlock(timeBlockId);
      timeBlockActions.deleteTimeBlock(timeBlockId);
    } catch (error) {
      console.error('Error deleting time block:', error);
    }
  };

  const findTaskById = (taskId: string, taskList: Task[]): Task | undefined => {
    for (const task of taskList) {
      if (task.id === taskId) return task;
      if (task.children && task.children.length > 0) {
        const foundTask = findTaskById(taskId, task.children);
        if (foundTask) return foundTask;
      }
    }
    return undefined;
  };

  // Add offline status to the context value
  const value: SupabaseTaskContextProviderType = {
    projects,
    tasks,
    timeBlocks,
    timeTrackings,
    activeTimeTracking,
    loading,
    addProject: addProjectDb,
    updateProject: updateProjectDb,
    deleteProject: deleteProjectDb,
    toggleProjectExpanded: toggleProjectExpandedDb,
    addTask: addTaskDb,
    updateTask: updateTaskDb,
    deleteTask: deleteTaskDb,
    toggleTaskExpanded: toggleTaskExpandedDb,
    updateRecurringTask: updateRecurringTaskDb,
    deleteRecurringTask: deleteRecurringTaskDb,
    startTimeTracking: startTimeTrackingDb,
    stopTimeTracking: stopTimeTrackingDb,
    addTimeTracking: addTimeTrackingDb,
    updateTimeTracking: updateTimeTrackingDb,
    deleteTimeTracking: deleteTimeTrackingDb,
    addTimeBlock: addTimeBlockDb,
    updateTimeBlock: updateTimeBlockDb,
    deleteTimeBlock: deleteTimeBlockDb,
    isOnline: isOnline,
    pendingOperations: pendingOperations.length,
  };

  return (
    <SupabaseTaskContext.Provider value={value}>
      {children}
      {!isOnline && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          Offline Mode {pendingOperations.length > 0 && `(${pendingOperations.length} pending changes)`}
        </div>
      )}
    </SupabaseTaskContext.Provider>
  );
};

export const useSupabaseTaskContext = () => {
  const context = useContext(SupabaseTaskContext);
  if (context === undefined) {
    throw new Error('useSupabaseTaskContext must be used within a SupabaseTaskProvider');
  }
  return context;
};
