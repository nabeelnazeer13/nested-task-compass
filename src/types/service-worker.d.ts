
// Extending the ServiceWorkerRegistration interface to include sync API
interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

interface ServiceWorkerRegistration {
  sync?: SyncManager;
}

// Extend the ServiceWorkerGlobalScope interface for service worker file
interface ServiceWorkerGlobalScope {
  __WB_MANIFEST: any;
}
