import { workersConfig } from '../../config';
import { BaseWorker } from '../../workers/base-worker';
import { WorkerFactory } from '../../workers/worker-factory';
import { Worker } from '../../workers/worker.interface';

export class WorkerService {
    private static workers = new Map<string, BaseWorker>();

    /**
     * This method should be called once at application startup.
     * Initializes all workers based on the configuration and validates their supported channels.
     *
     * @throws Will throw an error if any worker declares unsupported types.
     *
     */
    static async init() {
        for (const config of workersConfig) {
            const instance: BaseWorker = WorkerFactory.create(config);
            await instance.connect();

            this.workers.set(config.workerId, instance);
        }
    }

    static get(workerId: string): BaseWorker {
        const provider = this.workers.get(workerId);
        if (!provider) throw new Error(`Provider ${workerId} not found`);
        return provider;
    }

    static async disconnectAll() {
        for (const worker of this.workers.values()) {
            await worker.disconnect();
        }
    }
}
