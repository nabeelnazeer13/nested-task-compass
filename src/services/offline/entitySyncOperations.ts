
import * as taskService from '@/services/taskService';
import * as projectService from '@/services/projectService';
import * as timeTrackingService from '@/services/timeTrackingService';
import * as timeBlockService from '@/services/timeBlockService';
import { PendingOperation } from '../indexedDBService';

export const syncTaskChange = async (change: PendingOperation): Promise<boolean> => {
  try {
    switch (change.operation) {
      case 'create':
        await taskService.createTask(change.data);
        break;
      case 'update':
        await taskService.updateTask(change.data);
        break;
      case 'delete':
        await taskService.deleteTask(change.entityId);
        break;
    }
    return true;
  } catch (error) {
    console.error(`Error syncing task change:`, error);
    return false;
  }
};

export const syncProjectChange = async (change: PendingOperation): Promise<boolean> => {
  try {
    switch (change.operation) {
      case 'create':
        await projectService.createProject(change.data);
        break;
      case 'update':
        await projectService.updateProject(change.data);
        break;
      case 'delete':
        await projectService.deleteProject(change.entityId);
        break;
    }
    return true;
  } catch (error) {
    console.error(`Error syncing project change:`, error);
    return false;
  }
};

export const syncTimeTrackingChange = async (change: PendingOperation): Promise<boolean> => {
  try {
    switch (change.operation) {
      case 'create':
        await timeTrackingService.addManualTimeTracking(change.data);
        break;
      case 'update':
        await timeTrackingService.updateTimeTracking(change.data);
        break;
      case 'delete':
        await timeTrackingService.deleteTimeTracking(change.entityId);
        break;
    }
    return true;
  } catch (error) {
    console.error(`Error syncing time tracking change:`, error);
    return false;
  }
};

export const syncTimeBlockChange = async (change: PendingOperation): Promise<boolean> => {
  try {
    switch (change.operation) {
      case 'create':
        await timeBlockService.createTimeBlock(change.data);
        break;
      case 'update':
        await timeBlockService.updateTimeBlock(change.data);
        break;
      case 'delete':
        await timeBlockService.deleteTimeBlock(change.entityId);
        break;
    }
    return true;
  } catch (error) {
    console.error(`Error syncing time block change:`, error);
    return false;
  }
};
