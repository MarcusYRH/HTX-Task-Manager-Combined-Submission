import dotenv from 'dotenv';
import { TaskManagerException } from '../common/exceptions/TaskManagerException';

// Load .env file into process.env
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new TaskManagerException(`Missing required environment variable: ${envVar}`);
    }
}

export const config = {
    port: parseInt(process.env.PORT || '5000'),
    nodeEnv: process.env.NODE_ENV || 'development',
    database: {
        host: process.env.DB_HOST,
        port: parseInt(<string> process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME,
    },
    llm: {
        provider: process.env.LLM_PROVIDER || 'gemini',
        apiKey: process.env.GEMINI_API_KEY,
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};
