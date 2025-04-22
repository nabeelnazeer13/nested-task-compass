
import React, { useState } from 'react';
import { Task, useTaskContext, Priority, Status } from '@/context/TaskContext';
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
  CheckCircle, 
  Circle, 
  Clock, 
  MoveHorizontal,
  ArrowDown,
  ArrowUp,
  Columns as LucideColumns 
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

interface Column {
  id: string;
  header: string;
  cell: (task: Task) => React.ReactNode;
  visible: boolean;
}

// Define the SortField type as a union of possible sort fields
export type SortField = 'title' | 'dueDate' | 'priority' | 'status';

interface TableViewModeProps {
  tasks: Task[];
  initialSortField: SortField;
  initialSortDirection: 'asc' | 'desc';
  onSortChange: (field: SortField, direction: 'asc' | 'desc') => void;
}

const TableViewMode: React.FC<TableViewModeProps> = ({ 
  tasks, 
  initialSortField,
  initialSortDirection,
  onSortChange
}) => {
  const { updateTask } = useTaskContext();
  const [sortField, setSortField] = useState<SortField>(initialSortField);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  
  const handleToggleStatus = (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    updateTask({
      ...task,
      status: newStatus
    });
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
      id: 'status',
      header: 'Status',
      cell: (task) => (
        <div className="flex items-center">
          <Checkbox 
            checked={task.status === 'done'} 
            onCheckedChange={() => handleToggleStatus(task)} 
            className="mr-2"
          />
          <Badge className={`text-xs ${
            task.status === 'done' ? 'bg-green-100 text-green-800' : 
            task.status === 'in-progress' ? 'bg-purple-100 text-purple-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {task.status === 'todo' ? (
              <><Circle size={12} className="mr-1" /> To Do</>
            ) : task.status === 'in-progress' ? (
              <><Clock size={12} className="mr-1" /> In Progress</>
            ) : (
              <><CheckCircle size={12} className="mr-1" /> Done</>
            )}
          </Badge>
        </div>
      ),
      visible: true
    },
    {
      id: 'title',
      header: 'Task',
      cell: (task) => (
        <div className="flex flex-col">
          <span className={`font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </span>
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

      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.map(column => (
              <TableHead key={column.id}>
                <button 
                  className="flex items-center gap-1 font-medium text-sm"
                  onClick={() => {
                    if (['title', 'priority', 'status', 'dueDate'].includes(column.id)) {
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
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.length > 0 ? (
            sortedTasks.map(task => (
              <TableRow key={task.id} className={task.status === 'done' ? 'bg-muted/30' : ''}>
                {visibleColumns.map(column => (
                  <TableCell key={`${task.id}-${column.id}`}>
                    {column.cell(task)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={visibleColumns.length} className="h-24 text-center">
                No tasks match your current filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableViewMode;
