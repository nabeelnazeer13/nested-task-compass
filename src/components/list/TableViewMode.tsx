
import React, { useState } from 'react';
import { Task, useTaskContext } from '@/context/TaskContext';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  ArrowDown,
  ArrowUp,
  LucideColumns,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { GroupBy } from './ListToolbar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Column {
  id: string;
  header: string;
  cell: (task: Task) => React.ReactNode;
  visible: boolean;
}

// Define the SortField type to match the possible sort values
export type SortField = 'title' | 'dueDate' | 'priority' | 'estimatedTime' | 'timeTracked';

interface TableViewModeProps {
  tasks: Task[];
  initialSortField: SortField;
  initialSortDirection: 'asc' | 'desc';
  onSortChange: (field: SortField, direction: 'asc' | 'desc') => void;
  groupBy: GroupBy;
  groupedTasks: Record<string, Task[]>;
  collapsedGroups: Record<string, boolean>;
  onToggleGroup: (groupName: string) => void;
}

const TableViewMode: React.FC<TableViewModeProps> = ({ 
  tasks, 
  initialSortField,
  initialSortDirection,
  onSortChange,
  groupBy,
  groupedTasks,
  collapsedGroups,
  onToggleGroup
}) => {
  const { updateTask } = useTaskContext();
  const [sortField, setSortField] = useState<SortField>(initialSortField);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [collapsedTasks, setCollapsedTasks] = useState<Record<string, boolean>>({});
  
  const toggleTaskCollapsed = (taskId: string) => {
    setCollapsedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleSort = (field: SortField) => {
    let newDirection: 'asc' | 'desc';
    if (sortField === field) {
      // Toggle direction
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New field, default to ascending
      newDirection = 'asc';
    }
    
    setSortField(field);
    setSortDirection(newDirection);
    onSortChange(field, newDirection);
  };

  const sortedTasks = [...tasks];

  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'checkbox',
      header: '',
      cell: (task) => (
        <Checkbox className="mr-2" />
      ),
      visible: true
    },
    {
      id: 'title',
      header: 'Task',
      cell: (task) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {task.title}
            </span>
            {task.children && task.children.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => toggleTaskCollapsed(task.id)}
              >
                {collapsedTasks[task.id] ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </Button>
            )}
          </div>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {task.description}
            </p>
          )}
        </div>
      ),
      visible: true
    },
    {
      id: 'priority',
      header: 'Priority',
      cell: (task) => (
        <Badge className={`text-xs ${
          task.priority === 'high' ? 'bg-red-100 text-red-800' : 
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {task.priority}
        </Badge>
      ),
      visible: true
    },
    {
      id: 'dueDate',
      header: 'Due Date',
      cell: (task) => (
        task.dueDate ? (
          <div className="text-sm flex items-center gap-1">
            <Calendar size={14} />
            {format(task.dueDate, 'MMM d, yyyy')}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Not set</span>
        )
      ),
      visible: true
    },
    {
      id: 'notes',
      header: 'Notes',
      cell: (task) => (
        <span className="text-sm truncate max-w-[200px] inline-block">
          {task.notes || '-'}
        </span>
      ),
      visible: true
    },
    {
      id: 'estimatedTime',
      header: 'Est. Time',
      cell: (task) => (
        task.estimatedTime ? (
          <div className="text-sm flex items-center gap-1">
            <Clock size={14} />
            {Math.floor(task.estimatedTime / 60)}h {task.estimatedTime % 60}m
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )
      ),
      visible: true
    },
    {
      id: 'timeTracked',
      header: 'Time Tracked',
      cell: (task) => (
        task.timeTracked > 0 ? (
          <div className="text-sm">
            {Math.floor(task.timeTracked / 60)}h {task.timeTracked % 60}m
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )
      ),
      visible: true
    },
    {
      id: 'project',
      header: 'Project',
      cell: (task) => (
        <span className="text-sm">{task.projectId}</span>
      ),
      visible: false
    }
  ]);

  const toggleColumnVisibility = (columnId: string) => {
    setColumns(columns.map(column => 
      column.id === columnId ? { ...column, visible: !column.visible } : column
    ));
  };

  const visibleColumns = columns.filter(column => column.visible);

  const renderTaskRow = (task: Task, isChild = false) => {
    return (
      <React.Fragment key={task.id}>
        <TableRow className={isChild ? "bg-muted/10" : ""}>
          {visibleColumns.map(column => (
            <TableCell 
              key={`${task.id}-${column.id}`}
              className={isChild ? "pl-10" : ""}
            >
              {column.cell(task)}
            </TableCell>
          ))}
        </TableRow>
        
        {task.children && task.children.length > 0 && !collapsedTasks[task.id] && (
          task.children.map(childTask => renderTaskRow(childTask, true))
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-card p-2 border-b flex justify-between items-center">
        <span className="font-medium">Tasks</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <LucideColumns className="h-4 w-4 mr-2" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {columns.map(column => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.visible}
                onCheckedChange={() => toggleColumnVisibility(column.id)}
              >
                {column.header}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {Object.entries(groupedTasks).map(([group, groupTasks]) => (
        <Collapsible key={group} open={!collapsedGroups[group]}>
          {group !== 'All Tasks' && (
            <CollapsibleTrigger className="w-full">
              <div 
                className="px-4 py-2 bg-muted/50 font-semibold text-muted-foreground flex items-center cursor-pointer"
                onClick={() => onToggleGroup(group)}
              >
                {collapsedGroups[group] ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronUp className="h-4 w-4 mr-2" />
                )}
                {group}
              </div>
            </CollapsibleTrigger>
          )}
          <CollapsibleContent>
            <Table>
              {group === Object.keys(groupedTasks)[0] && (
                <TableHeader>
                  <TableRow>
                    {visibleColumns.map(column => (
                      <TableHead key={column.id}>
                        {column.id !== 'checkbox' ? (
                          <button 
                            className="flex items-center gap-1 font-medium text-sm"
                            onClick={() => {
                              if (['title', 'dueDate', 'priority', 'estimatedTime', 'timeTracked'].includes(column.id)) {
                                handleSort(column.id as SortField);
                              }
                            }}
                          >
                            {column.header}
                            {sortField === column.id && (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )
                            )}
                          </button>
                        ) : (
                          column.header
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
              )}
              <TableBody>
                {groupTasks.length > 0 ? (
                  groupTasks.filter(task => !task.parentId).map(task => renderTaskRow(task))
                ) : null}
              </TableBody>
            </Table>
          </CollapsibleContent>
        </Collapsible>
      ))}
      {tasks.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No tasks match your current filters
        </div>
      )}
    </div>
  );
};

export default TableViewMode;
