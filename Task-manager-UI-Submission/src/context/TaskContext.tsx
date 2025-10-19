import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';
import { Developer } from '../types/developer';
import { Skill } from '../types/skill';
import {
    fetchTasks,
    fetchDevelopers,
    fetchSkills,
    createTask as apiCreateTask,
    updateTask as apiUpdateTask
} from '../utils/apiHelpers';

interface PaginationInfo {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

interface TaskContextType {
    tasks: Task[];
    developers: Developer[];
    skills: Skill[];
    isLoading: boolean;
    error: string | null;
    pagination: PaginationInfo | null;

    loadTasks: (options?: { parentOnly?: boolean; page?: number; pageSize?: number }) => Promise<void>;
    loadDevelopers: () => Promise<void>;
    loadSkills: () => Promise<void>;
    createTask: (data: CreateTaskRequest) => Promise<Task | null>;
    updateTask: (taskId: number, updates: UpdateTaskRequest) => Promise<boolean>;
    refreshAll: () => Promise<void>;
    isTaskUpdating: (taskId: number) => boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
    children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [developers, setDevelopers] = useState<Developer[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);

    const [isUpdating, setIsUpdating] = useState<boolean>(false);

    const isTaskUpdating = (taskId: number): boolean => {
        return isUpdating;
    };

    const loadTasks = async (options?: { parentOnly?: boolean; page?: number; pageSize?: number }) => {
        const { parentOnly = false, page = 1, pageSize = 10 } = options || {};
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchTasks({ parentOnly, page, pageSize });
            setTasks(response.data || []);
            setPagination(response.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const loadDevelopers = async () => {
        try {
            const developersData = await fetchDevelopers();
            setDevelopers(developersData || []);
        } catch (err) {
            console.error('Failed to load developers:', err);
        }
    };

    const loadSkills = async () => {
        try {
            const skillsData = await fetchSkills();
            setSkills(skillsData || []);
        } catch (err) {
            console.error('Failed to load skills:', err);
        }
    };

    const createTask = async (data: CreateTaskRequest): Promise<Task | null> => {
        setIsLoading(true);
        try {
            const createdTask = await apiCreateTask(data);
            await loadTasks();
            return createdTask;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create task');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const updateTask = async (taskId: number, updates: UpdateTaskRequest): Promise<boolean> => {
        setIsUpdating(true);
        try {
            await apiUpdateTask(taskId, updates);
            await loadTasks();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update task');
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    const refreshAll = async () => {
        await Promise.all([loadTasks(), loadDevelopers(), loadSkills()]);
    };

    useEffect(() => {
        refreshAll();
    }, []);

    const value: TaskContextType = {
        tasks,
        developers,
        skills,
        isLoading,
        error,
        pagination,
        loadTasks,
        loadDevelopers,
        loadSkills,
        createTask,
        updateTask,
        refreshAll,
        isTaskUpdating,
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTaskContext() {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTaskContext must be used within a TaskProvider');
    }
    return context;
}
