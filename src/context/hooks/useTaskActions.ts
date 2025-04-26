
import { useState } from 'react';
import { Task } from '../TaskTypes';
import { generateId, findTaskById, updateTaskInHierarchy, getRootTasks } from '../TaskHelpers';

export function useTaskActions(tasksInit: Task[], setTasks: (tasks: Task[]) => void, getCurrentTasks: () => Task[]) {
  const addTask = (task: Omit<Task, 'id' | 'children' | 'isExpanded' | 'timeTracked'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      children: [],
      isExpanded: true,
      timeTracked: 0
    };
    if (task.parentId) {
      // Add as a child task to parent
      const updatedTasks = updateTaskInHierarchy(
        task.parentId,
        (parent) => ({
          ...parent,
          children: [...parent.children, newTask]
        }),
        getRootTasks(getCurrentTasks())
      );
      setTasks(updatedTasks);
    } else {
      setTasks([...getRootTasks(getCurrentTasks()), newTask]);
    }
  };

  const updateTask = (task: Task) => {
    if (task.parentId) {
      const updatedTasks = updateTaskInHierarchy(
        task.id,
        () => task,
        getRootTasks(getCurrentTasks())
      );
      setTasks(updatedTasks);
    } else {
      setTasks(getCurrentTasks().map((t) => (t.id === task.id ? task : t)));
    }
  };

  const deleteTask = (taskId: string) => {
    const taskToDelete = findTaskById(taskId, getRootTasks(getCurrentTasks()));
    if (!taskToDelete) return;

    if (taskToDelete.parentId) {
      const updatedTasks = updateTaskInHierarchy(
        taskToDelete.parentId,
        (parent) => ({
          ...parent,
          children: parent.children.filter((child) => child.id !== taskId)
        }),
        getRootTasks(getCurrentTasks())
      );
      setTasks(updatedTasks);
    } else {
      setTasks(getCurrentTasks().filter((t) => t.id !== taskId));
    }
  };

  const toggleTaskExpanded = (taskId: string) => {
    const taskToToggle = findTaskById(taskId, getRootTasks(getCurrentTasks()));
    if (!taskToToggle) return;
    if (taskToToggle.parentId) {
      const updatedTasks = updateTaskInHierarchy(
        taskId,
        (task) => ({ ...task, isExpanded: !task.isExpanded }),
        getRootTasks(getCurrentTasks())
      );
      setTasks(updatedTasks);
    } else {
      setTasks(
        getCurrentTasks().map((t) =>
          t.id === taskId ? { ...t, isExpanded: !t.isExpanded } : t
        )
      );
    }
  };

  return { addTask, updateTask, deleteTask, toggleTaskExpanded };
}
