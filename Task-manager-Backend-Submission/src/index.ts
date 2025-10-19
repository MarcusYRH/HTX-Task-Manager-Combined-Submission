import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import './config/env';
import { config } from './config/env';
import { AppDataSource } from './config/database';
import skillRoutes from './routes/skill.routes';
import developerRoutes from './routes/developer.routes';
import taskRoutes from './routes/task.routes';

const app = express();

app.use(helmet());
app.use(cors({
    origin: config.frontendUrl,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100000,
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', limiter);

try {
    const swaggerDocument = YAML.load(path.join(__dirname, '..', 'openapi.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
    console.warn('Failed to load openapi.yaml for Swagger UI:', e);
}

app.get('/health', (_, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/skills', skillRoutes);
app.use('/api/developers', developerRoutes);
app.use('/api/tasks', taskRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: {
            message,
            ...(config.nodeEnv === 'development' && { stack: err.stack })
        }
    });
});

const startServer = async () => {
    try {
        console.log('Connecting to database...');
        await AppDataSource.initialize();
        console.log('✓ Database connected successfully');

        app.listen(config.port, () => {
            console.log(`✓ Server running on port ${config.port}`);
            console.log(`✓ Environment: ${config.nodeEnv}`);
            console.log(`✓ Health check: http://localhost:${config.port}/health`);
            console.log(`✓ API Documentation: http://localhost:${config.port}/api-docs`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
