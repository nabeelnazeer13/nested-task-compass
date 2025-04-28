
export function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('ServiceWorker registration successful with scope:', registration.scope);
          
          // Check if an update is available immediately after registration
          registration.update();
          
          // Set up periodic background sync if supported
          if ('periodicSync' in registration) {
            // Request permission for periodic background sync
            navigator.permissions.query({
              name: 'periodic-background-sync' as any,
            }).then((status) => {
              if (status.state === 'granted') {
                // Register periodic sync with tag and minimum interval
                (registration as any).periodicSync.register('periodic-sync', {
                  minInterval: 24 * 60 * 60 * 1000, // Once per day
                }).then(() => {
                  console.log('Periodic background sync registered');
                }).catch((error: Error) => {
                  console.error('Error registering periodic background sync:', error);
                });
              } else {
                console.log('Periodic background sync permission not granted');
              }
            });
          }
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
            console.log('Checking for service worker updates...');
          }, 1000 * 60 * 60); // Check every hour
        })
        .catch((error) => {
          console.error('ServiceWorker registration failed:', error);
        });
        
      // Listen for updates from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data) {
          // Handle various messages from service worker
          switch (event.data.type) {
            case 'UPDATE_AVAILABLE':
              console.log('New content is available; please refresh.');
              // You could trigger an update notification here
              break;
                
            case 'BACKGROUND_SYNC_STARTED':
              console.log('Background sync started by service worker');
              break;
                
            case 'BACKGROUND_SYNC_COMPLETE':
              console.log('Background sync completed with status:', event.data.success ? 'success' : 'failure');
              // Could show a toast notification about sync status
              break;
          }
        }
      });
    });
  }
}
