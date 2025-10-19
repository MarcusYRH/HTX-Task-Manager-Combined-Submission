import { Repository } from 'typeorm';
import { Skill } from '../data/entities/Skill';
import { SkillDTO } from '../data/DTO/SkillDTO';
import { AppDataSource } from '../config/database';

export class SkillService {
    private readonly skillRepository: Repository<Skill>;

    constructor() {
        this.skillRepository = AppDataSource.getRepository(Skill);
    }

    async getAllSkills(): Promise<SkillDTO[]> {
        const skills = await this.skillRepository.find({
            order: { name: 'ASC' }
        });
        return skills.map(skill => this.buildSkillDTO(skill));
    }

    async getSkillById(id: number): Promise<SkillDTO | null> {
        const skill = await this.skillRepository.findOne({
            where: { id }
        });

        if (!skill) {
            return null;
        }
        return this.buildSkillDTO(skill);
    }

    private buildSkillDTO(skill: Skill): SkillDTO {
        const dto = new SkillDTO();
        dto.id = skill.id;
        dto.name = skill.name;
        return dto;
    }
}
