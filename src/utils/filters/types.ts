
import { Task } from '@/context/TaskTypes';

export interface TaskGroup {
  id: string;
  title: string;
  tasks: Task[];
}
