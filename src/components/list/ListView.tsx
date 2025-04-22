import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTaskContext, Task } from '@/context/TaskContext';
import { useFilterContext, FilterType, ViewMode } from '@/context/FilterContext';
import FilterButton from '@/components/filters/FilterButton';
import FilterPills from '@/components/filters/FilterPills';
import { List, Table, ChevronDown, ChevronUp } from 'lucide-react';
import ListViewMode from './ListViewMode';
import TableViewMode from './TableViewMode';
import ListToolbar, { GroupBy, SortBy } from './ListToolbar';
import { format, isToday, isTomorrow, isThisWeek, isThisMonth } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type ViewFormat = 'list' | 'table';

const ListView: React.FC = () => {
  const { tasks, projects } = useTaskContext();
  const { activeFilters, excludeCompleted } = useFilterContext();
  const [viewFormat, setViewFormat] = useState<ViewFormat>('list');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [sortBy, setSortBy] = useState<SortBy>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  
  // Toggle group collapse state
  const toggleGroupCollapsed = (groupName: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };
  
  // Get filtered tasks based on active filters
  const getFilteredTasks = () => {
    let filteredTasks = [...tasks];
    
    if (excludeCompleted) {
      filteredTasks = filteredTasks.filter(task => false); // Remove status-based filtering
    }
    
    activeFilters.forEach(filter => {
      switch (filter.type) {
        case FilterType.PRIORITY:
          filteredTasks = filteredTasks.filter(task => task.priority === filter.value);
          break;
        case FilterType.PROJECT:
          filteredTasks = filteredTasks.filter(task => task.projectId === filter.value);
          break;
      }
    });
    
    return filteredTasks;
  };

  const sortTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = a.dueDate.getTime() - b.dueDate.getTime();
          break;
        case 'priority': {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        }
        case 'estimatedTime': {
          const aTime = a.estimatedTime || 0;
          const bTime = b.estimatedTime || 0;
          comparison = aTime - bTime;
          break;
        }
        case 'timeTracked': {
          comparison = a.timeTracked - b.timeTracked;
          break;
        }
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const groupTasks = (tasksToGroup: Task[]) => {
    if (groupBy === 'none') return { 'All Tasks': tasksToGroup };
    
    const groups: Record<string, Task[]> = {};
    
    tasksToGroup.forEach(task => {
      let groupKey = '';
      
      switch (groupBy) {
        case 'project':
          const project = projects.find(p => p.id === task.projectId);
          groupKey = project?.name || 'No Project';
          break;
        case 'date':
          if (!task.dueDate) groupKey = 'No Due Date';
          else if (isToday(task.dueDate)) groupKey = 'Today';
          else if (isTomorrow(task.dueDate)) groupKey = 'Tomorrow';
          else if (isThisWeek(task.dueDate)) groupKey = 'This Week';
          else if (isThisMonth(task.dueDate)) groupKey = 'This Month';
          else groupKey = format(task.dueDate, 'MMMM yyyy');
          break;
        case 'priority':
          groupKey = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
          break;
      }
      
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(task);
    });
    
    // Sort tasks within each group
    Object.keys(groups).forEach(key => {
      groups[key] = sortTasks(groups[key]);
    });
    
    return groups;
  };

  const filteredTasks = getFilteredTasks();
  const groupedTasks = groupTasks(filteredTasks);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Task List</h2>
        <div className="flex gap-2">
          <div className="border rounded-md overflow-hidden flex">
            <Button 
              variant={viewFormat === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewFormat('list')}
              className="rounded-none"
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button 
              variant={viewFormat === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewFormat('table')}
              className="rounded-none"
            >
              <Table className="h-4 w-4 mr-2" />
              Table
            </Button>
          </div>
          <FilterButton />
        </div>
      </div>

      <FilterPills />

      <ListToolbar
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
      />

      {viewFormat === 'list' ? (
        Object.entries(groupedTasks).map(([group, tasks]) => (
          <Collapsible 
            key={group}
            className="space-y-4"
            open={!collapsedGroups[group]}
          >
            {group !== 'All Tasks' && (
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                <div className="text-lg font-semibold text-muted-foreground flex items-center">
                  {collapsedGroups[group] ? (
                    <ChevronUp className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  )}
                  {group}
                </div>
              </CollapsibleTrigger>
            )}
            <CollapsibleContent>
              <ListViewMode tasks={tasks} />
            </CollapsibleContent>
          </Collapsible>
        ))
      ) : (
        <TableViewMode 
          tasks={filteredTasks} 
          initialSortField={sortBy === 'date' ? 'dueDate' : sortBy}
          initialSortDirection={sortDirection}
          onSortChange={(field, direction) => {
            setSortBy(field === 'dueDate' ? 'date' : field);
            setSortDirection(direction);
          }}
          groupBy={groupBy}
          groupedTasks={groupedTasks}
          collapsedGroups={collapsedGroups}
          onToggleGroup={toggleGroupCollapsed}
        />
      )}
    </div>
  );
};

export default ListView;
