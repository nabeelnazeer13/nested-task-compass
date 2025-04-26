
import React, { createContext, useContext, useState } from 'react';
import { ReactNode } from '../TaskTypes';

interface ViewModeContextType {
  selectedView: 'projects' | 'calendar';
  setSelectedView: (view: 'projects' | 'calendar') => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export const ViewModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedView, setSelectedView] = useState<'projects' | 'calendar'>('projects');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const value = {
    selectedView,
    setSelectedView,
    selectedDate,
    setSelectedDate
  };

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewModeContext = () => {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewModeContext must be used within a ViewModeProvider');
  }
  return context;
};
