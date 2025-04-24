
import React from 'react';
import { useTaskContext, Task } from '@/context/TaskContext';
import ProjectItem from './ProjectItem';
import { Button } from '@/components/ui/button';
import { ChevronDown, Filter, SlidersHorizontal, ArrowDownUp } from 'lucide-react';
import AddTaskDialog from './AddTaskDialog';
import FilterButton from '@/components/filters/FilterButton';
import FilterPills from '@/components/filters/FilterPills';
import { useFilterContext, GroupBy, SortBy, SortDirection } from '@/context/FilterContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { filterTasks, sortTasks, groupTasks } from '@/utils/task-filters';

const ProjectView: React.FC = () => {
  const { projects, tasks } = useTaskContext();
  const { 
    activeFilters, 
    groupBy, 
    setGroupBy, 
    sortBy, 
    setSortBy, 
    sortDirection,
    setSortDirection,
    excludeCompleted 
  } = useFilterContext();
  const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const [showToolbar, setShowToolbar] = React.useState(false);

  // Add console log for debugging
  React.useEffect(() => {
    console.log('ProjectView rendering with projects:', projects);
    console.log('ProjectView rendering with tasks:', tasks);
  }, [projects, tasks]);

  const handleAddTask = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsAddTaskOpen(true);
  };

  // Filter and sort tasks based on current filters and sort settings
  const filteredTasks = filterTasks(tasks, activeFilters, excludeCompleted);
  const sortedTasks = sortTasks(filteredTasks, sortBy, sortDirection);
  
  // Group tasks based on the current grouping setting
  const taskGroups = groupTasks(sortedTasks, groupBy, projects);
  
  const handleSortDirectionToggle = () => {
    setSortDirection(
      sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projects & Tasks</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowToolbar(!showToolbar)}
          >
            <SlidersHorizontal size={16} className="mr-2" /> 
            View Options
          </Button>
          <FilterButton />
        </div>
      </div>

      <Collapsible open={showToolbar} onOpenChange={setShowToolbar} className="mb-4">
        <CollapsibleContent className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">View Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Group by</h3>
                <ToggleGroup type="single" value={groupBy} onValueChange={(value) => value && setGroupBy(value as GroupBy)}>
                  <ToggleGroupItem value={GroupBy.NONE}>None</ToggleGroupItem>
                  <ToggleGroupItem value={GroupBy.PROJECT}>Project</ToggleGroupItem>
                  <ToggleGroupItem value={GroupBy.DATE}>Date</ToggleGroupItem>
                  <ToggleGroupItem value={GroupBy.PRIORITY}>Priority</ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Sort by</h3>
                <div className="flex items-center">
                  <ToggleGroup type="single" value={sortBy} onValueChange={(value) => value && setSortBy(value as SortBy)}>
                    <ToggleGroupItem value={SortBy.TITLE}>Title</ToggleGroupItem>
                    <ToggleGroupItem value={SortBy.DUE_DATE}>Due Date</ToggleGroupItem>
                    <ToggleGroupItem value={SortBy.PRIORITY}>Priority</ToggleGroupItem>
                  </ToggleGroup>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2"
                    onClick={handleSortDirectionToggle}
                  >
                    {sortDirection === SortDirection.ASC ? (
                      <ArrowDownUp size={16} className="rotate-0" />
                    ) : (
                      <ArrowDownUp size={16} className="rotate-180" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <FilterPills />

      {groupBy !== GroupBy.NONE ? (
        <div className="space-y-6">
          {taskGroups.map((group) => (
            <Collapsible key={group.id} defaultOpen={true} className="border rounded-md">
              <CollapsibleTrigger className="flex justify-between items-center p-4 w-full hover:bg-muted">
                <h3 className="text-lg font-medium">{group.title} ({group.tasks.length})</h3>
                <ChevronDown size={20} />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                {group.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {group.tasks.map((task) => (
                      <div key={task.id} className="pl-4">
                        {/* We need to find the parent project for this task */}
                        {React.createElement(ProjectItem, {
                          project: projects.find(p => p.id === task.projectId) || { id: '', name: 'Unknown' },
                          hideChildrenInitially: true,
                          showOnlyTasks: [task.id],
                          onAddTask: handleAddTask,
                          listMode: true
                        })}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground p-4">No tasks in this group</p>
                )}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectItem 
              key={project.id} 
              project={project}
              onAddTask={() => handleAddTask(project.id)}
            />
          ))}
        </div>
      )}

      {projects.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No projects yet. Create your first project to get started!</p>
        </div>
      )}

      <AddTaskDialog 
        open={isAddTaskOpen} 
        onOpenChange={setIsAddTaskOpen} 
        projectId={selectedProjectId || ''}
      />
    </div>
  );
};

export default ProjectView;
