import { WorkerConfig } from '@prisma/client';
import { BaseWorker } from './base-worker';
import { GenericBullWorker } from './generic-bullmq-worker';

const workerClasses = (): (new (...args: any[]) => BaseWorker)[] => [
    GenericBullWorker,
];

export class WorkerFactory {
    static create(config: WorkerConfig): BaseWorker {
        const workers: BaseWorker[] = workerClasses().map(
            (WorkerClass) => new WorkerClass(config),
        );

        const found = workers.find((p) => p.id === config.workerImplId);

        if (!found) {
            throw new Error(`Unknown worker: ${config.workerConfigId}`);
        }

        return found;
    }
}
