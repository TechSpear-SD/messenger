import helmet from 'helmet';
import express, { Express } from 'express';
import { morganConfig } from './middlewares/config/morgan';
import { corsConfig } from './middlewares/config/cors';
import { errorHandlerMiddleware } from './middlewares/error-handler.middleware';
import { config } from '../config';
import baseRouter from './routers/base.router';

/**
 * The server class is a singleton class that creates an instance of the express app.
 * It also configures the app with middleware and routes.
 */
export class Server {
    private static instance: Server;
    public app: Express;

    public static getInstance(): Server {
        if (!Server.instance) {
            Server.instance = new Server();
        }
        return Server.instance;
    }

    private constructor() {
        this.app = express();
        this.config();
        this.routes();
        this.errorHandlers();
    }

    // Configure the app with middleware
    private config() {
        this.app.use(morganConfig);
        this.app.use(corsConfig);
        this.app.use(express.json({ limit: '10mb', strict: true }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use(helmet());
    }
    // Configure the app routes
    private routes() {
        this.app.use(config.apiBaseUri, baseRouter);
    }

    // Configure the app with error handlers middleware
    private errorHandlers() {
        this.app.use(errorHandlerMiddleware);
    }
}
