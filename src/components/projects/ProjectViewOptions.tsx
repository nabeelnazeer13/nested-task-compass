
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { GroupBy, SortBy, useFilterContext, ViewMode } from '@/context/FilterContext';
import { Group, SortAsc, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

const ProjectViewOptions = () => {
  const { 
    viewMode, 
    setViewMode,
    groupBy,
    setGroupBy,
    sortBy,
    setSortBy,
  } = useFilterContext();
  const isMobile = useIsMobile();

  // Separate mobile button rendering without tooltip interference
  const renderButton = (icon: React.ReactNode, text: string, isActive?: boolean) => (
    <Button 
      variant="outline" 
      size={isMobile ? "icon" : "sm"} 
      className={`${isMobile ? 'h-11 w-11' : 'gap-2'} ${isActive ? 'bg-accent' : ''}`}
    >
      {icon}
      {!isMobile && text}
      {!isMobile && <ChevronDown className="h-4 w-4" />}
    </Button>
  );

  // Used only for desktop tooltip wrapping
  const withTooltip = (button: React.ReactNode, tooltip: string) => {
    if (!isMobile) return button;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent sideOffset={10} className="z-[100]">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const dropdownContentClass = isMobile ? 
    'w-[calc(100vw-2rem)] fixed left-4 right-4 top-[calc(var(--header-height)+1rem)] z-[100] bg-popover border shadow-lg rounded-md mt-2' 
    : '';

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          {withTooltip(
            renderButton(
              <Check className="h-4 w-4" />,
              viewMode === ViewMode.ACTIVE_TASKS ? 'Active Tasks' : 'All Tasks',
              false
            ),
            'Toggle Active/All Tasks'
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={dropdownContentClass}>
          <DropdownMenuItem 
            onClick={() => setViewMode(ViewMode.ACTIVE_TASKS)}
            className={viewMode === ViewMode.ACTIVE_TASKS ? 'bg-accent' : ''}
          >
            Active Tasks
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setViewMode(ViewMode.ALL_TASKS)}
            className={viewMode === ViewMode.ALL_TASKS ? 'bg-accent' : ''}
          >
            All Tasks
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          {withTooltip(
            renderButton(
              <Group className="h-4 w-4" />,
              'Group by',
              groupBy !== GroupBy.NONE
            ),
            'Group Tasks'
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={dropdownContentClass}>
          <DropdownMenuItem 
            onClick={() => setGroupBy(GroupBy.NONE)}
            className={groupBy === GroupBy.NONE ? 'bg-accent' : ''}
          >
            None
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setGroupBy(GroupBy.PROJECT)}
            className={groupBy === GroupBy.PROJECT ? 'bg-accent' : ''}
          >
            Project
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setGroupBy(GroupBy.DATE)}
            className={groupBy === GroupBy.DATE ? 'bg-accent' : ''}
          >
            Date
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setGroupBy(GroupBy.PRIORITY)}
            className={groupBy === GroupBy.PRIORITY ? 'bg-accent' : ''}
          >
            Priority
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          {withTooltip(
            renderButton(
              <SortAsc className="h-4 w-4" />,
              'Sort by',
              false
            ),
            'Sort Tasks'
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={dropdownContentClass}>
          <DropdownMenuItem 
            onClick={() => setSortBy(SortBy.DUE_DATE)}
            className={sortBy === SortBy.DUE_DATE ? 'bg-accent' : ''}
          >
            Due Date
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setSortBy(SortBy.PRIORITY)}
            className={sortBy === SortBy.PRIORITY ? 'bg-accent' : ''}
          >
            Priority
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setSortBy(SortBy.TITLE)}
            className={sortBy === SortBy.TITLE ? 'bg-accent' : ''}
          >
            Title
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProjectViewOptions;
