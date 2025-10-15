import { WorkerConfig } from '../config';
import { BaseWorker } from './base-worker';
import { GenericBullWorker } from './generic-bullmq-worker';

export class WorkerFactory {
    static create(config: WorkerConfig): BaseWorker {
        const workers: BaseWorker[] = [new GenericBullWorker(config)];
        const found = workers.find((p) => p.id === config.workerId);

        if (!found) {
            throw new Error(`Unknown worker: ${config.workerId}`);
        }

        return found;
    }
}
