
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Task, ReactNode } from '../TaskTypes';
import { sampleProjects, sampleTasks } from '../TaskMockData';
import { useProjectActions } from '../hooks/useProjectActions';
import { useTaskActions } from '../hooks/useTaskActions';

// This provider is used when user is not authenticated
// It stores data in localStorage as a fallback

interface TaskContextProviderType {
  projects: Project[];
  tasks: Task[];
  addProject: (project: Omit<Project, 'id' | 'isExpanded'>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  toggleProjectExpanded: (projectId: string) => void;
  addTask: (task: Omit<Task, 'id' | 'children' | 'isExpanded' | 'timeTracked'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskExpanded: (taskId: string) => void;
}

const TaskContext = createContext<TaskContextProviderType | undefined>(undefined);

export const TaskContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const storedProjects = localStorage.getItem('quire-projects');
    const storedTasks = localStorage.getItem('quire-tasks');
    
    if (!storedProjects) {
      setProjects(sampleProjects);
      localStorage.setItem('quire-projects', JSON.stringify(sampleProjects));
    } else {
      setProjects(JSON.parse(storedProjects));
    }

    if (!storedTasks) {
      setTasks(sampleTasks);
      localStorage.setItem('quire-tasks', JSON.stringify(sampleTasks));
    } else {
      const parsedTasks = JSON.parse(storedTasks);
      parsedTasks.forEach((task: any) => {
        if (task.dueDate) task.dueDate = new Date(task.dueDate);
        if (task.status !== undefined) {
          delete task.status;
        }
        if (task.timeTracked === undefined) {
          task.timeTracked = 0;
        }
      });
      setTasks(parsedTasks);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('quire-projects', JSON.stringify(projects));
    localStorage.setItem('quire-tasks', JSON.stringify(tasks));
  }, [projects, tasks]);

  const projectActions = useProjectActions(projects, setProjects);
  const taskActions = useTaskActions(tasks, setTasks, () => tasks);

  const value: TaskContextProviderType = {
    projects,
    tasks,
    ...projectActions,
    ...taskActions,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskContextProvider');
  }
  return context;
};
