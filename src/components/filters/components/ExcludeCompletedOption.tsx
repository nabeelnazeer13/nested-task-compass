
import React from 'react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useFilterContext } from '@/context/FilterContext';

export const ExcludeCompletedOption = () => {
  const { excludeCompleted, setExcludeCompleted } = useFilterContext();

  return (
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
  );
};
