
import { supabase } from '@/integrations/supabase/client';
import { Project, Task, TimeTracking, TimeBlock } from '@/context/TaskTypes';
import { toast } from '@/components/ui/use-toast';
import { createProject } from './projectService';
import { createTask } from './taskService';
import { addManualTimeTracking } from './timeTrackingService';
import { createTimeBlock } from './timeBlockService';

/**
 * Migrate all data from localStorage to Supabase
 */
export async function migrateDataToSupabase(): Promise<boolean> {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in before migrating your data.",
        variant: "destructive",
      });
      return false;
    }

    // Start migration with toast notification
    toast({
      title: "Migration started",
      description: "Migrating your data to the cloud. This might take a moment...",
    });

    // Load data from localStorage
    const projectsData = localStorage.getItem('quire-projects');
    const tasksData = localStorage.getItem('quire-tasks');
    const timeTrackingsData = localStorage.getItem('quire-timetrackings');
    const timeBlocksData = localStorage.getItem('quire-timeblocks');

    // Parse data
    const projects: Project[] = projectsData ? JSON.parse(projectsData) : [];
    const tasks: Task[] = tasksData ? JSON.parse(tasksData) : [];
    const timeTrackings: TimeTracking[] = timeTrackingsData ? JSON.parse(timeTrackingsData) : [];
    const timeBlocks: TimeBlock[] = timeBlocksData ? JSON.parse(timeBlocksData) : [];

    // Fix dates in tasks
    tasks.forEach(task => {
      if (task.dueDate) task.dueDate = new Date(task.dueDate);
      if (task.recurrencePattern?.endDate) {
        task.recurrencePattern.endDate = new Date(task.recurrencePattern.endDate);
      }
      if (task.recurrenceExceptions) {
        task.recurrenceExceptions = task.recurrenceExceptions.map(
          date => new Date(date)
        );
      }
    });

    // Fix dates in time trackings
    timeTrackings.forEach(tracking => {
      tracking.startTime = new Date(tracking.startTime);
      if (tracking.endTime) tracking.endTime = new Date(tracking.endTime);
    });

    // Fix dates in time blocks
    timeBlocks.forEach(block => {
      block.date = new Date(block.date);
    });

    // Create a map to store old IDs to new IDs mapping
    const projectIdMap = new Map<string, string>();
    const taskIdMap = new Map<string, string>();

    // Migrate projects
    for (const project of projects) {
      try {
        const newProject = await createProject({
          name: project.name,
          description: project.description,
          isExpanded: project.isExpanded
        });
        projectIdMap.set(project.id, newProject.id);
      } catch (error) {
        console.error('Error migrating project:', project, error);
      }
    }

    // Helper function to restructure tasks into a flat array with correct parent-child relationships
    const getFlattenedTasks = (tasks: Task[]): Task[] => {
      const flatTasks: Task[] = [];
      
      const processTasks = (taskList: Task[], parentId: string | undefined = undefined) => {
        for (const task of taskList) {
          const flatTask = { ...task, parentId };
          flatTasks.push(flatTask);
          if (task.children && task.children.length > 0) {
            processTasks(task.children, task.id);
          }
        }
      };
      
      processTasks(tasks);
      return flatTasks;
    };

    // Get flattened tasks
    const flattenedTasks = getFlattenedTasks(tasks);
    
    // First pass: migrate top-level tasks
    for (const task of flattenedTasks.filter(t => !t.parentId)) {
      try {
        // Map to new project ID
        const newProjectId = projectIdMap.get(task.projectId) || task.projectId;
        
        const newTask = await createTask({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
          projectId: newProjectId,
          notes: task.notes,
          estimatedTime: task.estimatedTime,
          completed: task.completed,
          timeSlot: task.timeSlot,
          isRecurring: task.isRecurring,
          recurrencePattern: task.recurrencePattern,
          recurrenceExceptions: task.recurrenceExceptions
        });
        
        taskIdMap.set(task.id, newTask.id);
      } catch (error) {
        console.error('Error migrating top-level task:', task, error);
      }
    }
    
    // Second pass: migrate child tasks with updated parent IDs
    for (const task of flattenedTasks.filter(t => t.parentId)) {
      try {
        // Map to new project ID and parent ID
        const newProjectId = projectIdMap.get(task.projectId) || task.projectId;
        const newParentId = taskIdMap.get(task.parentId!) || task.parentId;
        
        const newTask = await createTask({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
          projectId: newProjectId,
          parentId: newParentId,
          notes: task.notes,
          estimatedTime: task.estimatedTime,
          completed: task.completed,
          timeSlot: task.timeSlot,
          isRecurring: task.isRecurring,
          recurrencePattern: task.recurrencePattern,
          recurrenceExceptions: task.recurrenceExceptions
        });
        
        taskIdMap.set(task.id, newTask.id);
      } catch (error) {
        console.error('Error migrating child task:', task, error);
      }
    }

    // Migrate time tracking entries
    for (const tracking of timeTrackings) {
      try {
        // Map to new task ID
        const newTaskId = taskIdMap.get(tracking.taskId) || tracking.taskId;
        
        await addManualTimeTracking({
          taskId: newTaskId,
          startTime: tracking.startTime,
          endTime: tracking.endTime,
          duration: tracking.duration,
          notes: tracking.notes
        });
      } catch (error) {
        console.error('Error migrating time tracking:', tracking, error);
      }
    }

    // Migrate time blocks
    for (const block of timeBlocks) {
      try {
        // Map to new task ID
        const newTaskId = taskIdMap.get(block.taskId) || block.taskId;
        
        await createTimeBlock({
          taskId: newTaskId,
          date: block.date,
          startTime: block.startTime,
          endTime: block.endTime
        });
      } catch (error) {
        console.error('Error migrating time block:', block, error);
      }
    }

    // Migration completed successfully
    toast({
      title: "Migration completed",
      description: "Your data has been successfully migrated to the cloud.",
    });
    
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    toast({
      title: "Migration failed",
      description: "There was an error migrating your data. Please try again.",
      variant: "destructive",
    });
    return false;
  }
}

/**
 * Check if a migration is needed
 */
export function isMigrationNeeded(): boolean {
  // Check if we have any local data that needs migration
  const projectsData = localStorage.getItem('quire-projects');
  const tasksData = localStorage.getItem('quire-tasks');
  
  return !!(projectsData || tasksData);
}

/**
 * Mark migration as completed by removing local data
 */
export function markMigrationCompleted(): void {
  // We don't delete the data immediately for safety, just rename it
  const keys = ['quire-projects', 'quire-tasks', 'quire-timetrackings', 'quire-timeblocks', 'quire-active-timetracking'];
  
  keys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      localStorage.setItem(`${key}-backup`, data);
      localStorage.removeItem(key);
    }
  });
}
