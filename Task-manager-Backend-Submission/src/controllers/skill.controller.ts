import { Request, Response, NextFunction } from 'express';
import { SkillService } from '../services/skill.service';
import { InvalidRequestException } from '../common/exceptions/InvalidRequestException';
import { EntityNotFoundException } from '../common/exceptions/EntityNotFoundException';

export class SkillController {
    private skillService: SkillService;

    constructor() {
        this.skillService = new SkillService();
    }

    getAllSkills = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const skills = await this.skillService.getAllSkills();
            return res.json(skills);
        } catch (error) {
            return next(error);
        }
    };

    getSkillById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new InvalidRequestException('Invalid skill ID');
            }
            const skill = await this.skillService.getSkillById(id);

            if (!skill) {
                throw new EntityNotFoundException('Skill', id);
            }

            return res.json(skill);
        } catch (error) {
            return next(error);
        }
    };
}
