import { TaskManagerException } from './TaskManagerException';

export class EntityNotFoundException extends TaskManagerException {
    statusCode = 404;

    constructor(entityName: string, id: number) {
        super(`${entityName} with ID ${id} not found`);
    }
}