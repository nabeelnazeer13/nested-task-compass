
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectView from '@/components/projects/ProjectView';
import CalendarView from '@/components/calendar/CalendarView';
import ListView from '@/components/list/ListView';
import { useTaskContext } from '@/context/TaskContext';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AddTaskFormDialog from '@/components/tasks/AddTaskFormDialog';

const AppLayout = () => {
  const { selectedView, setSelectedView, addProject } = useTaskContext();
  const [isAddingProject, setIsAddingProject] = React.useState(false);
  const [isAddingTask, setIsAddingTask] = React.useState(false);
  const [newProject, setNewProject] = React.useState({ name: '', description: '' });

  const handleAddProject = () => {
    if (newProject.name.trim()) {
      addProject(newProject);
      setNewProject({ name: '', description: '' });
      setIsAddingProject(false);
    }
  };

  const handleTabChange = (value: string) => {
    if (value === 'projects' || value === 'list' || value === 'calendar') {
      setSelectedView(value);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <Tabs 
        defaultValue="projects" 
        value={selectedView}
        onValueChange={handleTabChange}
      >
        {/* Header row with app name, tabs, and add buttons all on one line */}
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center w-full gap-4">
            <h1 className="text-3xl font-bold mr-4">Quire</h1>
            <TabsList className="grid grid-cols-3 w-72 shrink-0">
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
            {/* Flex grows so add buttons align right */}
            <span className="flex-1" />
            <div className="flex gap-2">
              <AddTaskFormDialog 
                open={isAddingTask}
                onOpenChange={setIsAddingTask}
                triggerElement={
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Task
                  </Button>
                }
              />
              <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Project Name</Label>
                      <Input 
                        id="name" 
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        placeholder="Enter project name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea 
                        id="description" 
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        placeholder="Enter project description"
                      />
                    </div>
                    <Button onClick={handleAddProject} className="w-full">
                      Create Project
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <TabsContent value="projects" className="mt-6">
          <ProjectView />
        </TabsContent>
        <TabsContent value="list" className="mt-6">
          <ListView />
        </TabsContent>
        <TabsContent value="calendar" className="mt-6">
          <CalendarView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppLayout;
