// src/config/index.ts
export * from './types';
export * from './workers';
export * from './templates';
export * from './scenarios';
export * from './providers';

import dotenv from 'dotenv';
import { providersConfig } from './providers';
import { workersConfig } from './workers';
import { scenariosConfig } from './scenarios';
import { queuesConfig } from './queues';
import { templatesConfig } from './templates';

dotenv.config();

export const config = {
    env: process.env.NODE_ENV || 'dev',
    port: Number(process.env.PORT) || 3000,
    transformsDir: process.env.TRANSFORMS_DIR || './transforms',

    providers: providersConfig,
    workers: workersConfig,
    scenarios: scenariosConfig,
    queues: queuesConfig,
    templates: templatesConfig,
};
