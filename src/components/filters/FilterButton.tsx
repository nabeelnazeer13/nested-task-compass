
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFilterContext } from '@/context/FilterContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ViewModeSelect } from './components/ViewModeSelect';
import { FilterOptions } from './components/FilterOptions';
import { ExcludeCompletedOption } from './components/ExcludeCompletedOption';

interface FilterButtonProps {
  forMobile?: boolean;
}

const FilterButton: React.FC<FilterButtonProps> = ({ forMobile = false }) => {
  const { activeFilters } = useFilterContext();
  const isMobile = useIsMobile();

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
        <ViewModeSelect />
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <ExcludeCompletedOption />
        
        <DropdownMenuSeparator />
        
        <FilterOptions />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterButton;
