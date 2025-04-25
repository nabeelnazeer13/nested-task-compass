
import React from 'react';
import { useTaskContext } from '@/context/TaskContext';
import ProjectItem from './ProjectItem';
import { Button } from '@/components/ui/button';
import { ChevronDown, Filter } from 'lucide-react';
import AddTaskDialog from './AddTaskDialog';
import FilterButton from '@/components/filters/FilterButton';
import FilterPills from '@/components/filters/FilterPills';
import { GroupBy, useFilterContext } from '@/context/FilterContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ProjectViewOptions from './ProjectViewOptions';
import { filterTasks, sortTasks, groupTasks } from '@/utils/task-filters';
import { priorityColors } from '@/lib/priority-utils';

const ProjectView: React.FC = () => {
  const {
    projects,
    tasks
  } = useTaskContext();
  const {
    activeFilters,
    groupBy,
    sortBy,
    sortDirection,
    excludeCompleted
  } = useFilterContext();
  const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const [showToolbar, setShowToolbar] = React.useState(false);

  // Filter and sort tasks based on current filters and sort settings
  const filteredTasks = filterTasks(tasks, activeFilters, excludeCompleted);
  const sortedTasks = sortTasks(filteredTasks, sortBy, sortDirection);

  // Group tasks based on the current grouping setting
  const taskGroups = groupTasks(sortedTasks, groupBy, projects);
  const handleAddTask = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsAddTaskOpen(true);
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Everything</h2>
        <div className="flex gap-2">
          <ProjectViewOptions />
          <FilterButton />
        </div>
      </div>

      <FilterPills />

      {groupBy !== GroupBy.NONE ? <div className="space-y-6">
          {taskGroups.map(group => <Collapsible key={group.id} defaultOpen={true} className="border rounded-md">
              <CollapsibleTrigger className="flex justify-between items-center p-4 w-full hover:bg-muted px-0 py-0">
                <h3 className="text-lg font-medium">{group.title} ({group.tasks.length})</h3>
                <ChevronDown size={20} />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                {group.tasks.length > 0 ? <div className="space-y-2">
                    {group.tasks.map(task => <div key={task.id} className="pl-4">
                        {/* We need to find the parent project for this task */}
                        {React.createElement(ProjectItem, {
                project: projects.find(p => p.id === task.projectId) || {
                  id: '',
                  name: 'Unknown'
                },
                hideChildrenInitially: true,
                showOnlyTasks: [task.id],
                onAddTask: handleAddTask,
                listMode: true
              })}
                      </div>)}
                  </div> : <p className="text-muted-foreground p-4">No tasks in this group</p>}
              </CollapsibleContent>
            </Collapsible>)}
        </div> : <div className="space-y-4">
          {projects.map(project => <ProjectItem key={project.id} project={project} onAddTask={() => handleAddTask(project.id)} />)}
        </div>}

      {projects.length === 0 && <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No projects yet. Create your first project to get started!</p>
        </div>}

      <AddTaskDialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen} projectId={selectedProjectId || ''} />
    </div>;
};
export default ProjectView;
