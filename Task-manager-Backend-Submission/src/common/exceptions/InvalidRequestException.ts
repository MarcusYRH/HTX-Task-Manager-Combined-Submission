import { TaskManagerException } from './TaskManagerException';

export class InvalidRequestException extends TaskManagerException {
    statusCode = 400;

    constructor(message: string) {
        super(message);
    }
}