
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
  GROUP_BY_DATE = 'groupByDate',
  GROUP_BY_PRIORITY = 'groupByPriority'
}

export enum GroupBy {
  NONE = 'none',
  PROJECT = 'project',
  DATE = 'date',
  PRIORITY = 'priority'
}

export enum SortBy {
  TITLE = 'title',
  DUE_DATE = 'dueDate',
  PRIORITY = 'priority',
  CREATED = 'created'
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export enum DateGroup {
  TODAY = 'today',
  TOMORROW = 'tomorrow',
  THIS_WEEK = 'thisWeek',
  NEXT_WEEK = 'nextWeek',
  LATER = 'later',
  NO_DATE = 'noDate'
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
  groupBy: GroupBy;
  setGroupBy: (groupBy: GroupBy) => void;
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Helper to generate IDs for filters
const generateId = () => Math.random().toString(36).substring(2, 11);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.ACTIVE_TASKS);
  const [excludeCompleted, setExcludeCompleted] = useState<boolean>(true);
  const [groupBy, setGroupBy] = useState<GroupBy>(GroupBy.NONE);
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.DUE_DATE);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.ASC);

  // Load from localStorage on init
  useEffect(() => {
    const storedFilters = localStorage.getItem('quire-filters');
    const storedViewMode = localStorage.getItem('quire-viewmode');
    const storedExcludeCompleted = localStorage.getItem('quire-exclude-completed');
    const storedGroupBy = localStorage.getItem('quire-groupby');
    const storedSortBy = localStorage.getItem('quire-sortby');
    const storedSortDirection = localStorage.getItem('quire-sortdirection');
    
    if (storedFilters) setActiveFilters(JSON.parse(storedFilters));
    if (storedViewMode) setViewMode(storedViewMode as ViewMode);
    if (storedExcludeCompleted) setExcludeCompleted(storedExcludeCompleted === 'true');
    if (storedGroupBy) setGroupBy(storedGroupBy as GroupBy);
    if (storedSortBy) setSortBy(storedSortBy as SortBy);
    if (storedSortDirection) setSortDirection(storedSortDirection as SortDirection);
  }, []);

  // Save to localStorage when changes occur
  useEffect(() => {
    localStorage.setItem('quire-filters', JSON.stringify(activeFilters));
    localStorage.setItem('quire-viewmode', viewMode);
    localStorage.setItem('quire-exclude-completed', String(excludeCompleted));
    localStorage.setItem('quire-groupby', groupBy);
    localStorage.setItem('quire-sortby', sortBy);
    localStorage.setItem('quire-sortdirection', sortDirection);
  }, [activeFilters, viewMode, excludeCompleted, groupBy, sortBy, sortDirection]);

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
    setExcludeCompleted,
    groupBy,
    setGroupBy,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection
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
