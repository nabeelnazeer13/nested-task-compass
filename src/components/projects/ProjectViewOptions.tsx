import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { GroupBy, SortBy, useFilterContext, ViewMode } from '@/context/FilterContext';
import { ChevronDown, Group, SortAsc, Filter, Check } from 'lucide-react';
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

  const renderButton = (
    icon: React.ReactNode,
    text: string,
    tooltip: string,
    className?: string
  ) => {
    const buttonContent = (
      <Button 
        variant="outline" 
        size={isMobile ? "icon" : "sm"} 
        className={`${isMobile ? 'h-11 w-11' : 'gap-2'} ${className || ''}`}
        aria-label={tooltip}
      >
        {icon}
        {!isMobile && text}
        {!isMobile && <ChevronDown className="h-4 w-4" />}
      </Button>
    );

    return isMobile ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : buttonContent;
  };

  return (
    <div className="flex items-center gap-2">
      {/* View Mode Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {renderButton(
            <Check className="h-4 w-4" />,
            viewMode === ViewMode.ACTIVE_TASKS ? 'Active Tasks' : 'All Tasks',
            'Toggle Active/All Tasks',
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent className={isMobile ? 'w-screen max-w-[calc(100vw-2rem)] mx-2' : ''}>
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

      {/* Group By Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {renderButton(
            <Group className="h-4 w-4" />,
            'Group by',
            'Group Tasks',
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent className={isMobile ? 'w-screen max-w-[calc(100vw-2rem)] mx-2' : ''}>
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

      {/* Sort By Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {renderButton(
            <SortAsc className="h-4 w-4" />,
            'Sort by',
            'Sort Tasks',
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent className={isMobile ? 'w-screen max-w-[calc(100vw-2rem)] mx-2' : ''}>
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
