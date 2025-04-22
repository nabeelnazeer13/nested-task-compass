
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ArrowDownZA, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export type GroupBy = 'none' | 'project' | 'date' | 'priority';
export type SortBy = 'title' | 'date' | 'priority' | 'estimatedTime' | 'timeTracked';

interface ListToolbarProps {
  groupBy: GroupBy;
  onGroupByChange: (value: GroupBy) => void;
  sortBy: SortBy;
  onSortByChange: (value: SortBy) => void;
  sortDirection: 'asc' | 'desc';
  onSortDirectionChange: (direction: 'asc' | 'desc') => void;
}

const ListToolbar: React.FC<ListToolbarProps> = ({
  groupBy,
  onGroupByChange,
  sortBy,
  onSortByChange,
  sortDirection,
  onSortDirectionChange,
}) => {
  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Group
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value={groupBy} onValueChange={value => onGroupByChange(value as GroupBy)}>
            <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioItem value="project">By Project</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="date">By Date</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="priority">By Priority</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Sort
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value={sortBy} onValueChange={value => onSortByChange(value as SortBy)}>
            <DropdownMenuRadioItem value="title">By Title</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="date">By Due Date</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="priority">By Priority</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="estimatedTime">By Estimated Time</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="timeTracked">By Time Tracked</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}>
            <ArrowDownZA className={`mr-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
            {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ListToolbar;
