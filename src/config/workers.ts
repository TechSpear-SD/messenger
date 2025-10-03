import { WorkerConfig } from './types';

export const workersConfig: WorkerConfig[] = [
    {
        workerId: 'worker-1',
        options: { redisUrl: 'redis://localhost:6379/0' },
        queueId: 'tsd-messenger',
    },
];
