
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define filter types and enums
export enum FilterType {
  PRIORITY = 'priority',
  STATUS = 'status',
  DUE_DATE = 'dueDate',
  PROJECT = 'project',
  CONTENT = 'content'
}

export enum ViewMode {
  ACTIVE_TASKS = 'activeTasks',
  ALL_TASKS = 'allTasks',
  GROUP_BY_PROJECT = 'groupByProject',
  GROUP_BY_DATE = 'groupByDate'
}

export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  CONTAINS = 'contains',
  GREATER_THAN = 'greaterThan',
  LESS_THAN = 'lessThan',
  BETWEEN = 'between',
  IS_SET = 'isSet',
  IS_NOT_SET = 'isNotSet'
}

export interface Filter {
  id: string;
  type: FilterType;
  value: any;
  operator: FilterOperator;
  label: string;
}

interface FilterContextType {
  activeFilters: Filter[];
  viewMode: ViewMode;
  addFilter: (filter: Omit<Filter, 'id'>) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;
  setViewMode: (mode: ViewMode) => void;
  excludeCompleted: boolean;
  setExcludeCompleted: (exclude: boolean) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Helper to generate IDs for filters
const generateId = () => Math.random().toString(36).substring(2, 11);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.ACTIVE_TASKS);
  const [excludeCompleted, setExcludeCompleted] = useState<boolean>(true);

  // Load from localStorage on init
  useEffect(() => {
    const storedFilters = localStorage.getItem('quire-filters');
    const storedViewMode = localStorage.getItem('quire-viewmode');
    const storedExcludeCompleted = localStorage.getItem('quire-exclude-completed');
    
    if (storedFilters) setActiveFilters(JSON.parse(storedFilters));
    if (storedViewMode) setViewMode(storedViewMode as ViewMode);
    if (storedExcludeCompleted) setExcludeCompleted(storedExcludeCompleted === 'true');
  }, []);

  // Save to localStorage when changes occur
  useEffect(() => {
    localStorage.setItem('quire-filters', JSON.stringify(activeFilters));
    localStorage.setItem('quire-viewmode', viewMode);
    localStorage.setItem('quire-exclude-completed', String(excludeCompleted));
  }, [activeFilters, viewMode, excludeCompleted]);

  const addFilter = (filter: Omit<Filter, 'id'>) => {
    const newFilter = { ...filter, id: generateId() };
    setActiveFilters([...activeFilters, newFilter]);
  };

  const removeFilter = (filterId: string) => {
    setActiveFilters(activeFilters.filter(filter => filter.id !== filterId));
  };

  const clearFilters = () => {
    setActiveFilters([]);
  };

  const value = {
    activeFilters,
    viewMode,
    addFilter,
    removeFilter,
    clearFilters,
    setViewMode,
    excludeCompleted,
    setExcludeCompleted
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
};
