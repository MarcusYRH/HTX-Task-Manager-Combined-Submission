import {Repository} from 'typeorm';
import {Task} from '../data/entities/Task';
import {AppDataSource} from '../config/database';

/**
 * Initially meant to use caching here, but I reused this service to fetch from DB instead due to key-matching over-complexity.
 */
export interface ContextTask {
    id: number;
    title: string;
    skills: { id: number; name: string }[];
}

export class TaskContextService {
    private taskRepository: Repository<Task>;

    constructor() {
        this.taskRepository = AppDataSource.getRepository(Task);
    }

    async findSimilarTasks(title: string, keywords?: string[], limit: number = 5): Promise<ContextTask[]> {
        const searchTerms = keywords && keywords.length > 0 ? keywords.join(' ') : title;

        const tasks = await this.taskRepository
            .createQueryBuilder('task')
            .leftJoinAndSelect('task.skills', 'skill')
            .where(
                `similarity(task.title, :title) > 0.2 OR word_similarity(:searchTerms, task.title) > 0.3`,
                {title, searchTerms}
            )
            .orderBy(
                `GREATEST(similarity(task.title, :title), word_similarity(:searchTerms, task.title))`,
                'DESC'
            )
            .setParameter('title', title)
            .setParameter('searchTerms', searchTerms)
            .limit(limit)
            .getMany();

        console.log('Found similar tasks:', tasks);

        return tasks.map(task => ({
            id: task.id,
            title: task.title,
            skills: task.skills.map(s => ({id: s.id, name: s.name}))
        }));
    }
}
