import { QueueConfig } from './types';

export const queuesConfig: QueueConfig[] = [
    {
        queueId: 'tsd-messenger-queue',
        topic: process.env.QUEUE_TOPIC || 'tsd.messenger',
        redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
        type: 'bullmq',
    },
];
