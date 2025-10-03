import { QueueConfig } from './types';

export const queuesConfig: QueueConfig[] = [
    {
        queueId: 'tsd-messenger',
        topic: 'tsd.messenger',
        redisUrl: 'redis://localhost:6379/0',
        type: 'bullmq',
    },
];
