import {In, Not, Repository, SelectQueryBuilder} from "typeorm";
import {Task} from "../data/entities/Task";
import {Skill} from "../data/entities/Skill";
import {Developer} from "../data/entities/Developer";
import {AppDataSource} from "../config/database";
import {TaskCreateDTO} from "../data/DTO/task/TaskCreateDTO";
import {TaskListItemDTO} from "../data/DTO/task/TaskListItemDTO";
import {TaskDetailDTO} from "../data/DTO/task/TaskDetailDTO";
import {UpdateTaskDTO} from "../data/DTO/task/UpdateTaskDTO";
import {PaginatedResponse} from "../data/DTO/common/PaginatedResponse";
import {EntityNotFoundException} from "../common/exceptions/EntityNotFoundException";
import {InvalidRequestException} from '../common/exceptions/InvalidRequestException';
import {LLMService} from './llm.service';
import {TaskContextService} from './taskContext.service';
import {TaskManagerException} from "../common/exceptions/TaskManagerException";

export class TaskService {
    private taskRepository: Repository<Task>;
    private developerRepository: Repository<Developer>;
    private skillRepository: Repository<Skill>;
    private llmService: LLMService;
    private taskContextService: TaskContextService;

    constructor() {
        this.skillRepository = AppDataSource.getRepository(Skill);
        this.taskRepository = AppDataSource.getRepository(Task);
        this.developerRepository = AppDataSource.getRepository(Developer);
        this.taskContextService = new TaskContextService();
        this.llmService = new LLMService(this.taskContextService);
    }

    // Ordering: CRUD tasks first. Then listing and retrieval.
    async createTask(taskRequest: TaskCreateDTO): Promise<TaskDetailDTO> {
        await this.validateTitle(taskRequest.title);
        let skillIds = taskRequest.skillIds;
        if (!skillIds || skillIds.length === 0) {
            skillIds = await this.predictSkillsWithLLM(taskRequest.title);
        }
        this.validateSkills(skillIds);
        await this.validateSkillsExist(skillIds);
        await this.validateParentTask(taskRequest.parentTaskId);
        await this.validateDeveloper(taskRequest.developerId, skillIds);
        return await this.createAndPersistTask({...taskRequest, skillIds});
    }

    async getTaskById(id: number): Promise<TaskDetailDTO | null> {
        const task = await this.loadTaskWithRelations(id, true, 2);

        if (!task) {
            return null;
        }

        return this.buildTaskDetailDTO(task);
    }

    async updateTask(id: number, updateRequest: UpdateTaskDTO): Promise<TaskDetailDTO> {
        await this.validateTaskExists(id);
        this.validateUpdateRequest(updateRequest);
        await this.validateDeveloperForUpdate(id, updateRequest.developerId);
        await this.validateStatusUpdate(id, updateRequest.status);
        return await this.updateAndPersistTask(id, updateRequest);
    }


    async getAllTasks(options: {
        page?: number;
        pageSize?: number;
        status?: string;
        developerId?: number;
        skillIds?: number[];
        parentOnly?: boolean;
    }): Promise<PaginatedResponse<TaskListItemDTO>> {
        const page = options.page || 1;
        const pageSize = options.pageSize || 10;
        const skip = (page - 1) * pageSize;

        const queryBuilder = this.taskRepository
            .createQueryBuilder('task')
            .leftJoinAndSelect('task.skills', 'skill')
            .leftJoinAndSelect('task.developer', 'developer')
            .loadRelationCountAndMap('task.subtaskCount', 'task.subtasks');
        this.enrichDbQueryWithFilterValues(options, queryBuilder);
        const totalItems = await queryBuilder.getCount();


        const tasks = await queryBuilder
            .orderBy('task.createdAt', 'DESC')
            .skip(skip)
            .take(pageSize)
            .getMany();

        return {
            data: tasks.map(task => this.buildTaskListItemDTO(task)),
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages: Math.ceil(totalItems / pageSize),
                hasNext: skip + pageSize < totalItems,
                hasPrevious: page > 1
            }
        };
    }

    private enrichDbQueryWithFilterValues(options: {
        page?: number;
        pageSize?: number;
        status?: string;
        developerId?: number;
        skillIds?: number[];
        parentOnly?: boolean
    }, queryBuilder: SelectQueryBuilder<Task>) {
        if (options.parentOnly) {
            queryBuilder.andWhere('task.parentTaskId IS NULL');
        }
// todo: implement remaining filters on the UI side as QOL improvements. Likely no time for that now.
        if (options.status) {
            queryBuilder.andWhere('task.status = :status', {status: options.status});
        }

        if (options.developerId) {
            queryBuilder.andWhere('task.developer_id = :developerId', {developerId: options.developerId});
        }

        if (options.skillIds && options.skillIds.length > 0) {
            queryBuilder.andWhere('skill.id IN (:...skillIds)', {skillIds: options.skillIds});
        }
    }

    private async createAndPersistTask(taskRequest: TaskCreateDTO): Promise<TaskDetailDTO> {
        const [skills, developer] = await Promise.all([
            this.skillRepository.find({ where: { id: In(taskRequest.skillIds || []) } }),
            taskRequest.developerId
                ? this.developerRepository.findOne({ where: { id: taskRequest.developerId } })
                : Promise.resolve(null)
        ]);

        const task = this.taskRepository.create({
            title: taskRequest.title,
            status: 'To-do',
            parentTaskId: taskRequest.parentTaskId || undefined,
            developer: developer,
            skills: skills
        });

        await this.taskRepository.save(task);

        task.subtasks = [];
        task.parentTask = null;

        return this.buildTaskDetailDTO(task);
    }

    private async loadTaskWithRelations(taskId: number, includeSubtasks: boolean = true, maxSubtaskDepth: number = 2): Promise<Task | null> {
        const queryBuilder = this.taskRepository
            .createQueryBuilder('task')
            .leftJoinAndSelect('task.skills', 'skills')
            .leftJoinAndSelect('task.developer', 'developer')
            .leftJoinAndSelect('task.parentTask', 'parentTask')
            .where('task.id = :taskId', { taskId });

        if (includeSubtasks && maxSubtaskDepth >= 1) {
            queryBuilder
                .leftJoinAndSelect('task.subtasks', 'subtasks')
                .leftJoinAndSelect('subtasks.skills', 'subtaskSkills')
                .leftJoinAndSelect('subtasks.developer', 'subtaskDeveloper');

            if (maxSubtaskDepth >= 2) {
                queryBuilder
                    .leftJoinAndSelect('subtasks.subtasks', 'subsubtasks')
                    .leftJoinAndSelect('subsubtasks.skills', 'subsubtaskSkills')
                    .leftJoinAndSelect('subsubtasks.developer', 'subsubtaskDeveloper');
            }
        }

        return await queryBuilder.getOne();
    }

    private buildTaskDetailDTO(task: Task): TaskDetailDTO {
        return {
            id: task.id,
            title: task.title,
            status: task.status,
            skills: task.skills.map(s => ({ id: s.id, name: s.name })),
            developer: task.developer ? { id: task.developer.id, name: task.developer.name } : null,
            parentTask: task.parentTask ? {
                id: task.parentTask.id,
                title: task.parentTask.title,
                status: task.parentTask.status
            } : null,
            subtasks: (task.subtasks || []).map(subtask => this.buildTaskDetailDTO(subtask)),
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
        };
    }

    private buildTaskListItemDTO(task: Task & { subtaskCount?: number }): TaskListItemDTO {
        return {
            id: task.id,
            title: task.title,
            status: task.status,
            skills: task.skills.map(s => ({id: s.id, name: s.name})),
            developer: task.developer ? {id: task.developer.id, name: task.developer.name} : null,
            parentTaskId: task.parentTaskId,
            subtaskCount: task.subtaskCount || 0,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
        };
    }

    private async validateDeveloper(developerId: number | null | undefined, skillIds: number[]) {
        if (developerId) {
            const developer = await this.developerRepository.findOne({
                where: {id: developerId},
                relations: ['skills']
            });

            if (!developer) {
                throw new EntityNotFoundException('Developer', developerId);
            }

            const developerSkillIds = new Set(developer.skills.map(s => s.id));
            const missingSkills = skillIds.filter(
                skillId => !developerSkillIds.has(skillId)
            );

            if (missingSkills.length > 0) {
                throw new InvalidRequestException(
                    `Developer ${developer.name} does not have required skill(s) with ID(s): ${missingSkills.join(', ')}`
                );
            }
        }
    }

    private async validateParentTask(parentTaskId?: number) {
        if (parentTaskId) {
            const parentExists = await this.taskRepository.existsBy({id: parentTaskId});
            if (!parentExists) {
                throw new EntityNotFoundException('Parent Task', parentTaskId);
            }
        }
    }

    private validateSkills(skillIds: number[] | undefined) {
        if (!skillIds || skillIds.length === 0) {
            return;
        }
        const uniqueSkillIds = new Set(skillIds);
        if (uniqueSkillIds.size !== skillIds.length) {
            throw new InvalidRequestException('Duplicate skill IDs are not allowed');
        }
    }

    private async validateSkillsExist(skillIds: number[]): Promise<void> {
        const skillRepository = AppDataSource.getRepository(Skill);
        const skills = await skillRepository.findByIds(skillIds);

        if (skills.length !== skillIds.length) {
            const foundIds = skills.map(s => s.id);
            const missingIds = skillIds.filter(id => !foundIds.includes(id));
            throw new EntityNotFoundException(
                `Skill(s) with ID(s) [${missingIds.join(', ')}]`,
                missingIds[0]
            );
        }
    }

    private async validateTitle(title: string) {
        if (await this.taskRepository.findOne({where: {title}})) {
            throw new InvalidRequestException(`Task with title "${title}" already exists`);
        }
        if (title.length > 100) {
            throw new InvalidRequestException('Task title cannot exceed 100 characters');
        }
    }

    private async validateTaskExists(id: number): Promise<void> {
        const taskExists = await this.taskRepository.existsBy({id});
        if (!taskExists) {
            throw new EntityNotFoundException('Task', id);
        }
    }

    private validateUpdateRequest(updateRequest: UpdateTaskDTO): void {
        if (updateRequest.developerId === undefined && updateRequest.status === undefined) {
            throw new InvalidRequestException('At least one field (developerId or status) must be provided for update');
        }
    }

    private async validateDeveloperForUpdate(taskId: number, developerId?: number | null): Promise<void> {
        if (developerId === undefined) {
            return;
        }
        if (developerId === null) {
            return;
        }
        const developer = await this.developerRepository.findOne({
            where: {id: developerId},
            relations: ['skills']
        });

        if (!developer) {
            throw new EntityNotFoundException('Developer', developerId);
        }
        const task = await this.taskRepository.findOne({
            where: {id: taskId},
            relations: ['skills']
        });

        if (!task) {
            throw new EntityNotFoundException('Task', taskId);
        }

        const requiredSkillIds = task.skills.map(s => s.id);
        const developerSkillIds = new Set(developer.skills.map(s => s.id));

        const missingSkills = requiredSkillIds.filter(
            skillId => !developerSkillIds.has(skillId)
        );

        if (missingSkills.length > 0) {
            throw new InvalidRequestException(
                `Developer ${developer.name} does not have required skill(s) with ID(s): ${missingSkills.join(', ')}`
            );
        }
    }

    private async validateStatusUpdate(taskId: number, status?: string): Promise<void> {
        if (status === undefined) {
            return;
        }

        const validStatuses = ['To-do', 'In Progress', 'Done'];
        if (!status || !validStatuses.includes(status)) {
            throw new InvalidRequestException(
                `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            );
        }

        if (status === 'Done') {
            const incompleteSubtasks = await this.taskRepository.count({
                where: {
                    parentTaskId: taskId,
                    status: Not('Done')
                }
            });

            if (incompleteSubtasks > 0) {
                throw new InvalidRequestException(
                    `Cannot mark task as Done. ${incompleteSubtasks} subtask(s) are not complete.`
                );
            }
        }
    }

    private async updateAndPersistTask(id: number, updateRequest: UpdateTaskDTO): Promise<TaskDetailDTO> {
        const task = await this.loadTaskWithRelations(id, true, 2);

        if (!task) {
            throw new EntityNotFoundException('Task', id);
        }

        if (updateRequest.developerId !== undefined) {
            if (updateRequest.developerId === null) {
                task.developer = null;
            } else {
                const developer = await this.developerRepository.findOne({
                    where: {id: updateRequest.developerId}
                });
                task.developer = developer;
            }
        }

        if (updateRequest.status !== undefined) {
            task.status = updateRequest.status;
        }

        await this.taskRepository.save(task);

        return this.buildTaskDetailDTO(task);
    }

    private async predictSkillsWithLLM(title: string): Promise<number[]> {
        const availableSkills = await this.skillRepository.find();
        if (availableSkills.length === 0) {
            throw new TaskManagerException('No skills configured in the system. Please add skills first.');
        }
        const prediction = await this.llmService.predictSkills(title, availableSkills);
        const skillNameToId = new Map(availableSkills.map(s => [s.name, s.id]));
        const skillIds = prediction.skillNames.map(name => skillNameToId.get(name)!);
        if (skillIds.length === 0) {
            throw new InvalidRequestException('LLM could not determine valid skills. Please specify skills manually.');
        }

        return skillIds;
    }
}