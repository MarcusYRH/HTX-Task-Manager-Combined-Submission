import axios, { AxiosInstance } from 'axios';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';
import { Developer } from '../types/developer';
import { Skill } from '../types/skill';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

interface TaskQueryParams {
  page?: number;
  pageSize?: number;
  parentOnly?: boolean;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchTasks(params?: TaskQueryParams): Promise<PaginatedResponse<Task>> {
  try {
    const response = await apiClient.get('/tasks', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch tasks');
  }
}

export async function fetchTaskById(taskId: number): Promise<Task> {
  try {
    const response = await apiClient.get(`/tasks/${taskId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching task ${taskId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch task');
  }
}

export async function createTask(taskData: CreateTaskRequest): Promise<Task> {
  try {
    const response = await apiClient.post('/tasks', taskData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating task:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create task');
  }
}

export async function updateTask(
  taskId: number,
  updateData: UpdateTaskRequest
): Promise<Task> {
  try {
    const response = await apiClient.put(`/tasks/${taskId}`, updateData);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating task ${taskId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update task');
  }
}

export async function fetchDevelopers(): Promise<Developer[]> {
  try {
    const response = await apiClient.get('/developers');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching developers:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch developers');
  }
}

export async function fetchDeveloperById(developerId: number): Promise<Developer> {
  try {
    const response = await apiClient.get(`/developers/${developerId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching developer ${developerId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch developer');
  }
}

export async function fetchSkills(): Promise<Skill[]> {
  try {
    const response = await apiClient.get('/skills');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching skills:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch skills');
  }
}

export async function fetchSkillById(skillId: number): Promise<Skill> {
  try {
    const response = await apiClient.get(`/skills/${skillId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching skill ${skillId}:`, error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch skill');
  }
}

export default apiClient;
