
import { useState, useEffect } from 'react';

export interface UseServiceWorkerUpdatesResult {
  newVersionAvailable: boolean;
  updateServiceWorker: () => Promise<void>;
}

export function useServiceWorkerUpdates(): UseServiceWorkerUpdatesResult {
  const [newVersionAvailable, setNewVersionAvailable] = useState<boolean>(false);
  const [waitingServiceWorker, setWaitingServiceWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setNewVersionAvailable(true);
                setWaitingServiceWorker(registration.waiting);
              }
            });
          }
        });
      });
      
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const updateServiceWorker = async () => {
    if (waitingServiceWorker) {
      waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
      setNewVersionAvailable(false);
    }
  };

  return {
    newVersionAvailable,
    updateServiceWorker
  };
}
