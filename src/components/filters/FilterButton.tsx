
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  useFilterContext, 
  FilterType, 
  FilterOperator, 
  ViewMode,
  DateGroup,
  GroupBy
} from '@/context/FilterContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Priority } from '@/context/TaskContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface FilterButtonProps {
  forMobile?: boolean;
}

const FilterButton: React.FC<FilterButtonProps> = ({ forMobile = false }) => {
  const { 
    activeFilters, 
    addFilter, 
    viewMode, 
    setViewMode, 
    excludeCompleted, 
    setExcludeCompleted,
    groupBy,
    setGroupBy
  } = useFilterContext();
  
  const isMobile = useIsMobile();

  const handleAddPriorityFilter = (priority: Priority) => {
    addFilter({
      type: FilterType.PRIORITY,
      value: priority,
      operator: FilterOperator.EQUALS,
      label: `Priority: ${priority}`
    });
  };

  const handleAddStatusFilter = (status: string) => {
    addFilter({
      type: FilterType.STATUS,
      value: status,
      operator: FilterOperator.EQUALS,
      label: `Status: ${status}`
    });
  };

  const handleAddDateFilter = (dateGroup: DateGroup) => {
    const labels: Record<DateGroup, string> = {
      today: 'Today',
      tomorrow: 'Tomorrow',
      thisWeek: 'This Week',
      nextWeek: 'Next Week',
      later: 'Later',
      noDate: 'No Due Date'
    };

    addFilter({
      type: FilterType.DUE_DATE,
      value: dateGroup,
      operator: FilterOperator.EQUALS,
      label: `Due: ${labels[dateGroup]}`
    });
  };

  const dropdownContentClass = isMobile || forMobile ? 
    'w-[calc(100vw-2rem)] fixed left-4 right-4 top-[calc(var(--header-height)+1rem)] z-[100] bg-popover border shadow-lg rounded-md mt-2' 
    : '';

  return (
    <DropdownMenu modal={true}>
      <DropdownMenuTrigger asChild id="filter-button">
        <Button 
          variant="outline" 
          size={forMobile ? "icon" : "sm"} 
          className={forMobile ? "h-11 w-11 p-0" : "gap-2"}
        >
          <Filter size={16} />
          {!forMobile && (
            <>
              <span>Filter</span>
              {activeFilters.length > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {activeFilters.length}
                </span>
              )}
            </>
          )}
          {forMobile && activeFilters.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
              {activeFilters.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={dropdownContentClass} align="end" sideOffset={8}>
        <DropdownMenuLabel>View Mode</DropdownMenuLabel>
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
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuItem onClick={(e) => e.preventDefault()}>
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            <Checkbox 
              id="exclude-completed" 
              checked={excludeCompleted}
              onCheckedChange={(checked) => setExcludeCompleted(checked as boolean)}
            />
            <label 
              htmlFor="exclude-completed"
              className="text-sm cursor-pointer"
            >
              Exclude completed tasks
            </label>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleAddPriorityFilter('high')}>
            High Priority
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddPriorityFilter('medium')}>
            Medium Priority
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddPriorityFilter('low')}>
            Low Priority
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Filter by Due Date</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleAddDateFilter(DateGroup.TODAY)}>
            Today
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddDateFilter(DateGroup.TOMORROW)}>
            Tomorrow
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddDateFilter(DateGroup.THIS_WEEK)}>
            This Week
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddDateFilter(DateGroup.NEXT_WEEK)}>
            Next Week
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddDateFilter(DateGroup.LATER)}>
            Later
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddDateFilter(DateGroup.NO_DATE)}>
            No Due Date
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleAddStatusFilter('todo')}>
            To Do
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddStatusFilter('in-progress')}>
            In Progress
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddStatusFilter('done')}>
            Done
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterButton;
