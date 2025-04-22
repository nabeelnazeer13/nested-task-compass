
import { Task } from './TaskTypes';

export const generateId = () => Math.random().toString(36).substring(2, 11);

export const findTaskById = (taskId: string, taskList: Task[]): Task | undefined => {
  for (const task of taskList) {
    if (task.id === taskId) return task;
    if (task.children.length > 0) {
      const foundTask = findTaskById(taskId, task.children);
      if (foundTask) return foundTask;
    }
  }
  return undefined;
};

export const updateTaskInHierarchy = (
  taskId: string,
  updateFn: (task: Task) => Task,
  taskList: Task[]
): Task[] =>
  taskList.map(task =>
    task.id === taskId
      ? updateFn(task)
      : {
          ...task,
          children: updateTaskInHierarchy(taskId, updateFn, task.children)
        }
  );

export const getRootTasks = (tasks: Task[]) => tasks.filter(task => !task.parentId);

export const deleteTaskFromHierarchy = (
  taskId: string,
  taskList: Task[]
): Task[] =>
  taskList.filter(task => {
    if (task.id === taskId) return false;
    if (task.children.length > 0) {
      task.children = deleteTaskFromHierarchy(taskId, task.children);
    }
    return true;
  });
