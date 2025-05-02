import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useLocalTaskContext } from './TaskContext';
import { registerSW } from 'virtual:pwa-register';

interface PWAContextType {
  offlineReady: boolean;
  needRefresh: boolean;
  updateServiceWorker: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => Promise<boolean>) | null>(null);
  const taskContext = useLocalTaskContext();

  useEffect(() => {
    const updateSWFn = registerSW({
      onOfflineReady() {
        setOfflineReady(true);
      },
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onUpdate(swUpdate) {
        setUpdateSW(() => swUpdate);
      },
    });

    updateSWFn.then(swUpdate => {
      setUpdateSW(() => swUpdate);
    });
  }, []);

  const updateServiceWorker = () => {
    if (updateSW) {
      updateSW();
    }
  };

  const contextValue: PWAContextType = {
    offlineReady,
    needRefresh,
    updateServiceWorker,
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  );
};

export const usePWAContext = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWAContext must be used within a PWAProvider');
  }
  return context;
};
