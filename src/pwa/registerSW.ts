
export function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('ServiceWorker registration successful with scope:', registration.scope);
          
          // Check if an update is available immediately after registration
          registration.update();
          
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
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          console.log('New content is available; please refresh.');
          // You could trigger an update notification here
        }
      });
    });
  }
}
