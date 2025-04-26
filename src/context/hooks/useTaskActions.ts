
import { useState } from 'react';
import { Task, RecurrencePattern } from '../TaskTypes';
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

  // New methods for recurring tasks
  const updateRecurringTask = (
    task: Task,
    updateMode: 'single' | 'future' | 'all' = 'single'
  ) => {
    if (updateMode === 'single' || !task.recurrenceParentId) {
      // Just update this instance
      updateTask(task);
      return;
    }
    
    const allTasks = getCurrentTasks();
    const parentTask = findTaskById(task.recurrenceParentId, allTasks);
    
    if (!parentTask) {
      console.error('Parent task not found:', task.recurrenceParentId);
      return;
    }
    
    if (updateMode === 'all') {
      // Update the parent task
      const updatedParent = {
        ...parentTask,
        title: task.title,
        description: task.description,
        priority: task.priority,
        notes: task.notes,
        estimatedTime: task.estimatedTime,
        // Update recurrence pattern if needed
        recurrencePattern: task.recurrencePattern || parentTask.recurrencePattern
      };
      updateTask(updatedParent);
      
      // Update all instances
      const instances = allTasks.filter(t => t.recurrenceParentId === parentTask.id);
      instances.forEach(instance => {
        const updatedInstance = {
          ...instance,
          title: task.title,
          description: task.description,
          priority: task.priority,
          notes: task.notes, 
          estimatedTime: task.estimatedTime
        };
        updateTask(updatedInstance);
      });
    } else if (updateMode === 'future') {
      // Update this instance and all future instances
      updateTask(task);
      
      const taskDate = task.dueDate;
      if (taskDate) {
        const instances = allTasks.filter(t => 
          t.recurrenceParentId === parentTask.id && 
          t.dueDate && 
          t.dueDate >= taskDate
        );
        instances.forEach(instance => {
          if (instance.id !== task.id) {
            const updatedInstance = {
              ...instance,
              title: task.title,
              description: task.description,
              priority: task.priority,
              notes: task.notes,
              estimatedTime: task.estimatedTime
            };
            updateTask(updatedInstance);
          }
        });
      }
    }
  };

  const deleteRecurringTask = (
    taskId: string,
    deleteMode: 'single' | 'future' | 'all' = 'single'
  ) => {
    const allTasks = getCurrentTasks();
    const taskToDelete = findTaskById(taskId, allTasks);
    
    if (!taskToDelete) return;
    
    if (deleteMode === 'single') {
      // Just delete this instance or add an exception
      if (taskToDelete.recurrenceParentId) {
        // This is an instance, just delete it
        deleteTask(taskId);
        
        // If it's a generated instance, add an exception to the parent
        if (taskToDelete.dueDate) {
          const parentTask = findTaskById(taskToDelete.recurrenceParentId, allTasks);
          if (parentTask && parentTask.isRecurring) {
            const updatedParent = {
              ...parentTask,
              recurrenceExceptions: [
                ...(parentTask.recurrenceExceptions || []),
                taskToDelete.dueDate
              ]
            };
            updateTask(updatedParent);
          }
        }
      } else if (taskToDelete.isRecurring) {
        // This is a recurring task template, just delete this instance
        deleteTask(taskId);
      }
    } else if (deleteMode === 'future') {
      if (taskToDelete.recurrenceParentId) {
        // This is an instance, delete it and all future instances
        const parentTask = findTaskById(taskToDelete.recurrenceParentId, allTasks);
        if (parentTask && taskToDelete.dueDate) {
          // Update the parent's end date
          if (parentTask.recurrencePattern) {
            const updatedParent = {
              ...parentTask,
              recurrencePattern: {
                ...parentTask.recurrencePattern,
                endDate: new Date(taskToDelete.dueDate.getTime() - 86400000) // Day before
              }
            };
            updateTask(updatedParent);
          }
          
          // Delete all future instances
          const instancesToDelete = allTasks.filter(t => 
            t.recurrenceParentId === parentTask.id && 
            t.dueDate && 
            t.dueDate >= taskToDelete.dueDate
          );
          instancesToDelete.forEach(instance => {
            deleteTask(instance.id);
          });
        }
      } else if (taskToDelete.isRecurring && taskToDelete.dueDate) {
        // This is a recurring task template, update its end date
        if (taskToDelete.recurrencePattern) {
          const updatedTask = {
            ...taskToDelete,
            recurrencePattern: {
              ...taskToDelete.recurrencePattern,
              endDate: new Date() // End now
            }
          };
          updateTask(updatedTask);
        }
        
        // Delete all future instances
        const instancesToDelete = allTasks.filter(t => 
          t.recurrenceParentId === taskToDelete.id && 
          t.dueDate && 
          t.dueDate >= new Date()
        );
        instancesToDelete.forEach(instance => {
          deleteTask(instance.id);
        });
      }
    } else if (deleteMode === 'all') {
      if (taskToDelete.recurrenceParentId) {
        // This is an instance, delete the parent and all instances
        const parentId = taskToDelete.recurrenceParentId;
        const allInstances = allTasks.filter(t => t.recurrenceParentId === parentId);
        
        // Delete the parent
        deleteTask(parentId);
        
        // Delete all instances
        allInstances.forEach(instance => {
          deleteTask(instance.id);
        });
      } else if (taskToDelete.isRecurring) {
        // This is a recurring task template, delete it and all instances
        const allInstances = allTasks.filter(t => t.recurrenceParentId === taskToDelete.id);
        
        // Delete the template
        deleteTask(taskToDelete.id);
        
        // Delete all instances
        allInstances.forEach(instance => {
          deleteTask(instance.id);
        });
      }
    }
  };

  return { 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskExpanded,
    updateRecurringTask,
    deleteRecurringTask
  };
}
