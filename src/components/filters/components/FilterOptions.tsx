
import React from 'react';
import { 
  DropdownMenuGroup, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useFilterContext, FilterType, FilterOperator, DateGroup } from '@/context/FilterContext';
import { Priority } from '@/context/TaskContext';

export const FilterOptions = () => {
  const { addFilter } = useFilterContext();

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
      overdue: 'Overdue',
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

  return (
    <>
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
    </>
  );
};
