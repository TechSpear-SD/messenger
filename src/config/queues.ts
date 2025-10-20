import { QueueConfig } from './types';

export const queuesConfig: QueueConfig[] = [
    {
        queueId: 'messenger-queue',
        topic: process.env.QUEUE_TOPIC || 'messenger',
        type: 'bullmq',
        options: {
            redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
        },
    },
];
