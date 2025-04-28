
import { OfflineSyncService } from './offline/offlineSyncCore';
import { useOfflineSync } from './offline/useOfflineSync';
import { OfflineSyncInterface, OfflineSyncHookResult } from './offline/types';

// Create and export a singleton instance
export const offlineSyncService: OfflineSyncInterface = new OfflineSyncService();

// Re-export the hook
export { useOfflineSync };

// Re-export types
export type { OfflineSyncInterface, OfflineSyncHookResult };
