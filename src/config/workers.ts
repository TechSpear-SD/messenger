import { WorkerConfig } from './types';

export const workersConfig: WorkerConfig[] = [
    {
        workerId: 'generic-bull-worker',
        options: {},
        queueId: 'tsd-messenger-queue',
    },
];
