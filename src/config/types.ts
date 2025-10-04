export type TemplateType = 'html' | 'text';
export type SupportedChannel = 'email' | 'sms' | 'push' | 'webhook';
export type QueueType = 'bullmq';

export interface QueueConfig {
    queueId: string; // unique identifier
    topic: string; // e.g., 'tsd.messenger'
    redisUrl: string;
    type: QueueType;

    description?: string;
    options?: Record<string, any>;
}

export interface WorkerConfig {
    workerId: string;
    queueId: string;

    description?: string;
    options?: Record<string, any>;
    concurrency?: number;
}

export type ApplicationConfig = {
    appId: string;
    name: string;
    scenarioIds: string[];

    description?: string;
};

export interface ScenarioConfig {
    scenarioId: string;
    description?: string;

    templateIds: string[];
}

export type TemplateConfig = {
    templateId: string;
    providerId: string;
    path: string;

    dataTransformFiles?: string[];
    description?: string;
    validationSchema?: Record<string, any>;
};

export type ProviderConfig = {
    providerId: string;
    name: string;
    types: SupportedChannel[];

    description?: string;
    options?: Record<string, any>;
};
