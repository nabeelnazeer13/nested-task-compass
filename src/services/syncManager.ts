
import { PendingOperation } from './indexedDBService';
import { offlineSyncService } from './offlineSyncService';

// Retry configuration
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  jitter: boolean;
}

// Default retry configuration
const defaultRetryConfig: RetryConfig = {
  maxAttempts: 5,
  baseDelay: 1000, // 1 second
  maxDelay: 60000, // 1 minute
  jitter: true,   // Add randomness to avoid thundering herd
};

export class SyncManager {
  private readonly config: RetryConfig;
  private isSyncing: boolean = false;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...defaultRetryConfig, ...config };
  }

  /**
   * Calculate delay time using exponential backoff with optional jitter
   */
  private calculateRetryDelay(attempt: number): number {
    const exponentialDelay = Math.min(
      this.config.baseDelay * Math.pow(2, attempt),
      this.config.maxDelay
    );
    
    if (this.config.jitter) {
      // Add jitter: +/- 25% of the delay
      const jitterFactor = 0.25;
      const jitterAmount = exponentialDelay * jitterFactor;
      return exponentialDelay - jitterAmount + (Math.random() * jitterAmount * 2);
    }
    
    return exponentialDelay;
  }

  /**
   * Process a single operation with retry logic
   */
  public async processOperation(operation: PendingOperation): Promise<boolean> {
    let attempt = operation.attempts || 0;
    
    while (attempt < this.config.maxAttempts) {
      attempt++;
      
      try {
        // If not the first attempt, apply exponential backoff delay
        if (attempt > 1) {
          const delay = this.calculateRetryDelay(attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // Attempt to sync the operation
        const success = await offlineSyncService.processSingleChange({
          ...operation,
          attempts: attempt,
          lastAttempt: Date.now(),
        });
        
        if (success) {
          console.log(`Operation ${operation.id} succeeded on attempt ${attempt}`);
          return true;
        }
        
        console.log(`Operation ${operation.id} failed on attempt ${attempt}, will retry`);
      } catch (error) {
        console.error(`Error processing operation ${operation.id} (attempt ${attempt}):`, error);
      }
    }
    
    console.warn(`Operation ${operation.id} failed after ${attempt} attempts`);
    return false;
  }

  /**
   * Sync all pending operations with retry logic
   */
  public async syncAll(): Promise<{ success: number; failed: number }> {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping');
      return { success: 0, failed: 0 };
    }
    
    this.isSyncing = true;
    let succeeded = 0;
    let failed = 0;
    
    try {
      // Get all pending operations
      const operations = await offlineSyncService.getPendingOperations();
      
      // Process operations in order
      for (const operation of operations) {
        const success = await this.processOperation(operation);
        
        if (success) {
          // Remove from pending operations if successful
          await offlineSyncService.deletePendingOperation(operation.id);
          succeeded++;
        } else {
          failed++;
        }
      }
      
      return { success: succeeded, failed };
    } catch (error) {
      console.error('Error during sync:', error);
      return { success: succeeded, failed };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Handle background sync event from service worker
   */
  public async handleBackgroundSync(): Promise<boolean> {
    console.log('Handling background sync event');
    
    try {
      const result = await this.syncAll();
      console.log(`Background sync complete: ${result.success} succeeded, ${result.failed} failed`);
      
      // Notify service worker of completion
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'BACKGROUND_SYNC_DONE',
          result
        });
      }
      
      return result.failed === 0;
    } catch (error) {
      console.error('Error during background sync:', error);
      return false;
    }
  }
}

// Create singleton instance
export const syncManager = new SyncManager();

// Add event listener for background sync messages from service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'BACKGROUND_SYNC_STARTED') {
      await syncManager.handleBackgroundSync();
    }
  });
}
