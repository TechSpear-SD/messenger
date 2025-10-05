import { WorkerConfig } from '../config';
import { GenericBullWorker } from './generic-bullmq-worker';
import { Worker } from './worker.interface';

export class WorkerFactory {
    static create(config: WorkerConfig): Worker {
        const workers: Worker[] = [new GenericBullWorker(config)];
        const found = workers.find((p) => p.id === config.workerId);

        if (!found) {
            throw new Error(`Unknown worker: ${config.workerId}`);
        }

        return found;
    }
}
