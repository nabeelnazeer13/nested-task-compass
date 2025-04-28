
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Task, Project, TimeTracking, TimeBlock } from '@/context/TaskTypes';

interface KhonjaDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: {
      'by-project': string;
    };
  };
  projects: {
    key: string;
    value: Project;
  };
  timeTrackings: {
    key: string;
    value: TimeTracking;
    indexes: {
      'by-task': string;
    };
  };
  timeBlocks: {
    key: string;
    value: TimeBlock;
    indexes: {
      'by-task': string;
    };
  };
  pendingOperations: {
    key: string;
    value: PendingOperation;
    indexes: {
      'by-timestamp': number;
    };
  };
  syncMetadata: {
    key: string;
    value: {
      key: string;
      lastSyncTimestamp: number;
    };
  };
}

export type EntityType = 'task' | 'project' | 'timeTracking' | 'timeBlock';
export type OperationType = 'create' | 'update' | 'delete';

export interface PendingOperation {
  id: string;
  entityType: EntityType;
  entityId: string;
  operation: OperationType;
  data: any;
  timestamp: number;
  attempts: number;
  lastAttempt?: number;
}

const DB_NAME = 'khonja-offline-db';
const DB_VERSION = 1;

export class IndexedDBService {
  private dbPromise: Promise<IDBPDatabase<KhonjaDB>>;
  
  constructor() {
    this.dbPromise = this.initDatabase();
  }

  private async initDatabase(): Promise<IDBPDatabase<KhonjaDB>> {
    return openDB<KhonjaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create object stores
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('by-project', 'projectId');
        }
        
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('timeTrackings')) {
          const timeTrackingStore = db.createObjectStore('timeTrackings', { keyPath: 'id' });
          timeTrackingStore.createIndex('by-task', 'taskId');
        }
        
        if (!db.objectStoreNames.contains('timeBlocks')) {
          const timeBlockStore = db.createObjectStore('timeBlocks', { keyPath: 'id' });
          timeBlockStore.createIndex('by-task', 'taskId');
        }
        
        if (!db.objectStoreNames.contains('pendingOperations')) {
          const pendingOpsStore = db.createObjectStore('pendingOperations', { keyPath: 'id' });
          pendingOpsStore.createIndex('by-timestamp', 'timestamp');
        }
        
        if (!db.objectStoreNames.contains('syncMetadata')) {
          db.createObjectStore('syncMetadata', { keyPath: 'key' });
        }
      }
    });
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    const db = await this.dbPromise;
    return await db.getAll('tasks');
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    const db = await this.dbPromise;
    return await db.get('tasks', id);
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    const db = await this.dbPromise;
    return await db.getAllFromIndex('tasks', 'by-project', projectId);
  }

  async saveTask(task: Task): Promise<void> {
    const db = await this.dbPromise;
    await db.put('tasks', task);
  }

  async deleteTask(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('tasks', id);
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    const db = await this.dbPromise;
    return await db.getAll('projects');
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    const db = await this.dbPromise;
    return await db.get('projects', id);
  }

  async saveProject(project: Project): Promise<void> {
    const db = await this.dbPromise;
    await db.put('projects', project);
  }

  async deleteProject(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('projects', id);
  }

  // Time tracking operations
  async getTimeTrackings(): Promise<TimeTracking[]> {
    const db = await this.dbPromise;
    return await db.getAll('timeTrackings');
  }

  async getTimeTrackingsByTask(taskId: string): Promise<TimeTracking[]> {
    const db = await this.dbPromise;
    return await db.getAllFromIndex('timeTrackings', 'by-task', taskId);
  }

  async saveTimeTracking(timeTracking: TimeTracking): Promise<void> {
    const db = await this.dbPromise;
    await db.put('timeTrackings', timeTracking);
  }

  async deleteTimeTracking(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('timeTrackings', id);
  }

  // Time block operations
  async getTimeBlocks(): Promise<TimeBlock[]> {
    const db = await this.dbPromise;
    return await db.getAll('timeBlocks');
  }

  async getTimeBlocksByTask(taskId: string): Promise<TimeBlock[]> {
    const db = await this.dbPromise;
    return await db.getAllFromIndex('timeBlocks', 'by-task', taskId);
  }

  async saveTimeBlock(timeBlock: TimeBlock): Promise<void> {
    const db = await this.dbPromise;
    await db.put('timeBlocks', timeBlock);
  }

  async deleteTimeBlock(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('timeBlocks', id);
  }

  // Pending operations management
  async getPendingOperations(): Promise<PendingOperation[]> {
    const db = await this.dbPromise;
    return await db.getAll('pendingOperations');
  }

  async addPendingOperation(operation: PendingOperation): Promise<void> {
    const db = await this.dbPromise;
    await db.put('pendingOperations', operation);
  }

  async updatePendingOperation(operation: PendingOperation): Promise<void> {
    const db = await this.dbPromise;
    await db.put('pendingOperations', operation);
  }

  async deletePendingOperation(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('pendingOperations', id);
  }

  async getSyncMetadata(key: string): Promise<number> {
    const db = await this.dbPromise;
    const metadata = await db.get('syncMetadata', key);
    return metadata?.lastSyncTimestamp || 0;
  }

  async updateSyncMetadata(key: string, timestamp: number): Promise<void> {
    const db = await this.dbPromise;
    await db.put('syncMetadata', { key, lastSyncTimestamp: timestamp });
  }

  // Database maintenance
  async clearAllData(): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(
      ['tasks', 'projects', 'timeTrackings', 'timeBlocks', 'pendingOperations', 'syncMetadata'],
      'readwrite'
    );
    
    await Promise.all([
      tx.objectStore('tasks').clear(),
      tx.objectStore('projects').clear(),
      tx.objectStore('timeTrackings').clear(), 
      tx.objectStore('timeBlocks').clear(),
      tx.objectStore('pendingOperations').clear(),
      tx.objectStore('syncMetadata').clear(),
      tx.done
    ]);
  }
}

// Create and export a singleton instance
export const indexedDBService = new IndexedDBService();
