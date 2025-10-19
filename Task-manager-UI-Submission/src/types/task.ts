import { Skill } from './skill';
import { Developer } from './developer';

export type TaskStatus = 'To-do' | 'In Progress' | 'Done';

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  developerId: number | null;
  skills: Skill[];
  parentTaskId: number | null;
  subtasks: Task[];
  developer?: Developer;
}

export interface CreateTaskRequest {
  title: string;
  skillIds: number[];
  parentTaskId?: number;
}

export interface UpdateTaskRequest {
  status?: TaskStatus;
  developerId?: number | null;
}
