
import { useState, useEffect } from 'react';

export interface OnlineStatus {
  isOnline: boolean;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean | null;
  connectionQuality: 'unknown' | 'poor' | 'moderate' | 'good' | 'excellent';
  lastChecked: number;
  latency: number | null;
}

const initialStatus: OnlineStatus = {
  isOnline: navigator.onLine,
  effectiveType: null,
  downlink: null, 
  rtt: null,
  saveData: null,
  connectionQuality: 'unknown',
  lastChecked: Date.now(),
  latency: null
};

export function useOnlineStatus() {
  const [status, setStatus] = useState<OnlineStatus>(initialStatus);

  // Determine connection quality based on network information
  const determineConnectionQuality = (info: any): OnlineStatus['connectionQuality'] => {
    if (!info) return 'unknown';
    
    const { effectiveType, downlink, rtt, saveData } = info;
    
    // Check if on 2G or save-data mode
    if (effectiveType === '2g' || saveData) return 'poor';
    
    // If on slow 3G or high latency
    if (effectiveType === '3g' || rtt > 500) return 'moderate';
    
    // If on fast 3G or low 4G
    if (rtt > 100 || downlink < 5) return 'good';
    
    // Fast connection
    return 'excellent';
  };

  // Measure network latency by pinging a small resource
  const checkLatency = async () => {
    if (!navigator.onLine) return null;
    
    try {
      const start = performance.now();
      // Use a timestamp to avoid caching
      await fetch('/favicon.ico?' + Date.now(), {
        method: 'HEAD',
        cache: 'no-store',
      });
      const end = performance.now();
      return Math.round(end - start);
    } catch (error) {
      console.error('Error measuring latency:', error);
      return null;
    }
  };

  // Update network information
  const updateNetworkInfo = async () => {
    let connectionInfo: any = null;
    
    // Access the Network Information API if available
    if ('connection' in navigator) {
      connectionInfo = (navigator as any).connection;
    }
    
    const latency = await checkLatency();
    
    setStatus({
      isOnline: navigator.onLine,
      effectiveType: connectionInfo?.effectiveType || null,
      downlink: connectionInfo?.downlink || null,
      rtt: connectionInfo?.rtt || null,
      saveData: connectionInfo?.saveData || null,
      connectionQuality: determineConnectionQuality(connectionInfo),
      lastChecked: Date.now(),
      latency
    });
  };

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      updateNetworkInfo();
    };
    
    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };
    
    const handleConnectionChange = () => {
      updateNetworkInfo();
    };

    // Initialize
    updateNetworkInfo();

    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen for connection changes if available
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', handleConnectionChange);
    }
    
    // Periodically check connection when the app is active
    const interval = setInterval(updateNetworkInfo, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', handleConnectionChange);
      }
      
      clearInterval(interval);
    };
  }, []);

  return status;
}
