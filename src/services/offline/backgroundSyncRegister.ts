
/**
 * Register for background sync if the API is available
 */
export const registerBackgroundSync = (): void => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      // Check if sync API exists before using it
      if (registration.sync) {
        registration.sync.register('sync-tasks')
          .then(() => {
            console.log('Background sync registered successfully');
          })
          .catch((error) => {
            console.error('Error registering background sync:', error);
          });
      } else {
        console.log('Background Sync API not supported');
      }
    }).catch(error => {
      console.error('Error accessing service worker registration:', error);
    });
  }
};
