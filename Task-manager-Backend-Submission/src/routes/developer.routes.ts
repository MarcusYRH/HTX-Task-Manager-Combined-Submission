import { Router } from 'express';
import { DeveloperController } from '../controllers/developer.controller';

// todo: maybe look into centralising route definitions? if got time.
const router = Router();
const developerController = new DeveloperController();

router.get('/', developerController.getAllDevelopers);
router.get('/:id', developerController.getDeveloperById);

export default router;
