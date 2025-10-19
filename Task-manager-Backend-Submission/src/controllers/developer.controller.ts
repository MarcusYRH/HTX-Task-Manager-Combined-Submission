import { Request, Response, NextFunction } from 'express';
import { DeveloperService } from '../services/developer.service';
import { InvalidRequestException } from '../common/exceptions/InvalidRequestException';

export class DeveloperController {
    private developerService: DeveloperService;

    constructor() {
        this.developerService = new DeveloperService();
    }

    getAllDevelopers = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const developers = await this.developerService.getAllDevelopers();
            return res.json(developers);
        } catch (error) {
            return next(error);
        }
    };

    getDeveloperById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                throw new InvalidRequestException('Invalid developer ID');
            }
            const developer = await this.developerService.getDeveloperById(id);
            return res.json(developer);
        } catch (error) {
            return next(error);
        }
    };
}
