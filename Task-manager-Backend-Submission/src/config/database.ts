import { DataSource } from 'typeorm';
import {Task} from '../data/entities/Task';
import { Skill } from '../data/entities/Skill';
import {Developer} from '../data/entities/Developer';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(<string>process.env.DB_PORT) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Developer, Task, Skill],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
});
