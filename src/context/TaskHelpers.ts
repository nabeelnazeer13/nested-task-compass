
import { Task } from './TaskTypes';
import { v4 as uuidv4 } from 'uuid';

export const generateId = () => uuidv4();

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
