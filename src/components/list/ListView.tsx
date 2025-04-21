
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTaskContext, Task } from '@/context/TaskContext';
import { useFilterContext, FilterType, ViewMode } from '@/context/FilterContext';
import FilterButton from '@/components/filters/FilterButton';
import FilterPills from '@/components/filters/FilterPills';
import { List, Table, Columns, Calendar } from 'lucide-react';
import ListViewMode from './ListViewMode';
import TableViewMode from './TableViewMode';

type ViewFormat = 'list' | 'table';

const ListView: React.FC = () => {
  const { tasks } = useTaskContext();
  const { activeFilters, excludeCompleted } = useFilterContext();
  const [viewFormat, setViewFormat] = useState<ViewFormat>('list');
  
  // Get filtered tasks based on active filters
  const getFilteredTasks = () => {
    let filteredTasks = [...tasks];
    
    if (excludeCompleted) {
      filteredTasks = filteredTasks.filter(task => task.status !== 'done');
    }
    
    activeFilters.forEach(filter => {
      switch (filter.type) {
        case FilterType.PRIORITY:
          filteredTasks = filteredTasks.filter(task => task.priority === filter.value);
          break;
        case FilterType.STATUS:
          filteredTasks = filteredTasks.filter(task => task.status === filter.value);
          break;
        case FilterType.PROJECT:
          filteredTasks = filteredTasks.filter(task => task.projectId === filter.value);
          break;
      }
    });
    
    return filteredTasks;
  };

  const filteredTasks = getFilteredTasks();

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

      {viewFormat === 'list' ? (
        <ListViewMode tasks={filteredTasks} />
      ) : (
        <TableViewMode tasks={filteredTasks} />
      )}
    </div>
  );
};

export default ListView;
