
import React from 'react';
import { 
  DropdownMenuGroup, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { useFilterContext, ViewMode, GroupBy } from '@/context/FilterContext';

export const ViewModeSelect = () => {
  const { viewMode, setViewMode, setGroupBy } = useFilterContext();

  return (
    <DropdownMenuGroup>
      <DropdownMenuItem 
        className={viewMode === ViewMode.ACTIVE_TASKS ? 'bg-accent' : ''}
        onClick={() => setViewMode(ViewMode.ACTIVE_TASKS)}
      >
        Active Tasks
      </DropdownMenuItem>
      <DropdownMenuItem 
        className={viewMode === ViewMode.ALL_TASKS ? 'bg-accent' : ''}
        onClick={() => setViewMode(ViewMode.ALL_TASKS)}
      >
        All Tasks
      </DropdownMenuItem>
      <DropdownMenuItem 
        className={viewMode === ViewMode.GROUP_BY_PROJECT ? 'bg-accent' : ''}
        onClick={() => setViewMode(ViewMode.GROUP_BY_PROJECT)}
      >
        Group by Project
      </DropdownMenuItem>
      <DropdownMenuItem 
        className={viewMode === ViewMode.GROUP_BY_DATE ? 'bg-accent' : ''}
        onClick={() => {
          setViewMode(ViewMode.GROUP_BY_DATE);
          setGroupBy(GroupBy.DATE);
        }}
      >
        Group by Date
      </DropdownMenuItem>
      <DropdownMenuItem 
        className={viewMode === ViewMode.GROUP_BY_PRIORITY ? 'bg-accent' : ''}
        onClick={() => {
          setViewMode(ViewMode.GROUP_BY_PRIORITY);
          setGroupBy(GroupBy.PRIORITY);
        }}
      >
        Group by Priority
      </DropdownMenuItem>
    </DropdownMenuGroup>
  );
};
