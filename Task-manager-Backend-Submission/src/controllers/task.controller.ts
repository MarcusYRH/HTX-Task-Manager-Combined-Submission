import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { TaskCreateDTO } from '../data/DTO/task/TaskCreateDTO';
import { UpdateTaskDTO } from '../data/DTO/task/UpdateTaskDTO';
import { InvalidRequestException } from '../common/exceptions/InvalidRequestException';
import { EntityNotFoundException } from '../common/exceptions/EntityNotFoundException';

export class TaskController {
    private taskService: TaskService;

    constructor() {
        this.taskService = new TaskService();
    }

    createTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const createDTO: TaskCreateDTO = req.body;
            const task = await this.taskService.createTask(createDTO);
            return res.status(201).json(task);
        } catch (error) {
            return next(error);
        }
    };

    getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string);
            const pageSize = parseInt(req.query.pageSize as string);
            const status = req.query.status as string;
            const developerId = req.query.developerId ? parseInt(req.query.developerId as string) : undefined;
            const skillIds = req.query.skillIds ?
                (req.query.skillIds as string).split(',').map(id => parseInt(id)) :
                undefined;
            const parentOnly = req.query.parentOnly === 'true';

            const result = await this.taskService.getAllTasks({
                page,
                pageSize,
                status,
                developerId,
                skillIds,
                parentOnly
            });

            return res.json(result);
        } catch (error) {
            return next(error);
        }
    };

    getTaskById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                throw new InvalidRequestException('Invalid task ID');
            }

            const task = await this.taskService.getTaskById(id);

            if (!task) {
                throw new EntityNotFoundException('Task', id);
            }

            return res.json(task);
        } catch (error) {
            return next(error);
        }
    };

    updateTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                throw new InvalidRequestException('Invalid task ID');
            }

            const updateRequest: UpdateTaskDTO = req.body;
            const updatedTask = await this.taskService.updateTask(id, updateRequest);

            return res.json(updatedTask);
        } catch (error) {
            return next(error);
        }
    };

}
