import { Repository } from 'typeorm';
import { Developer } from '../data/entities/Developer';
import { DeveloperDTO } from '../data/DTO/DeveloperDTO';
import { AppDataSource } from '../config/database';
import {EntityNotFoundException} from "../common/exceptions/EntityNotFoundException";

export class DeveloperService {
    private readonly developerRepository: Repository<Developer>;

    constructor() {
        this.developerRepository = AppDataSource.getRepository(Developer);
    }

    async getAllDevelopers(): Promise<DeveloperDTO[]> {
        const developers = await this.developerRepository.find({
            relations: ['skills'],
            order: { name: 'ASC' }
        });
        return developers.map(dev => this.buildDeveloperDTO(dev));
    }

    async getDeveloperById(id: number): Promise<DeveloperDTO | null> {
        const developer = await this.developerRepository.findOne({
            where: { id },
            relations: ['skills']
        });
        if (!developer) {
            throw new EntityNotFoundException('Developer', id);
        }

        return this.buildDeveloperDTO(developer);
    }

    private buildDeveloperDTO(developer: Developer): DeveloperDTO {
        return {
            id: developer.id,
            name: developer.name,
            skills: developer.skills.map(s => ({ id: s.id, name: s.name })),
            createdAt: developer.createdAt,
            updatedAt: developer.updatedAt
        };
    }
}
