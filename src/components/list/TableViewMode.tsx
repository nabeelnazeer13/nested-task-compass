
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
  ArrowUp
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

interface TableViewModeProps {
  tasks: Task[];
}

const TableViewMode: React.FC<TableViewModeProps> = ({ tasks }) => {
  const { updateTask } = useTaskContext();
  
  type SortField = 'title' | 'priority' | 'status' | 'dueDate';
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const handleToggleStatus = (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    updateTask({
      ...task,
      status: newStatus
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'priority': {
        const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      }
      case 'status': {
        const statusOrder: Record<Status, number> = { 'todo': 0, 'in-progress': 1, 'done': 2 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
      }
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) {
          comparison = 0;
        } else if (!a.dueDate) {
          comparison = 1;
        } else if (!b.dueDate) {
          comparison = -1;
        } else {
          comparison = a.dueDate.getTime() - b.dueDate.getTime();
        }
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Define columns with visibility state
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
              <Columns className="h-4 w-4 mr-2" />
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
