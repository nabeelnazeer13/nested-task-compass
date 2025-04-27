import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Task } from '../TaskTypes';
import { sampleProjects, sampleTasks } from '../TaskMockData';
import { useProjectActions } from '../hooks/useProjectActions';
import { useTaskActions } from '../hooks/useTaskActions';
import type { TaskContextType } from '../types/TaskContextTypes';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const value: TaskContextType = {
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
