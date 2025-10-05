import { workersConfig } from '../../config';
import { WorkerFactory } from '../../workers/worker-factory';
import { Worker } from '../../workers/worker.interface';

export class WorkerService {
    private static workers = new Map<string, Worker>();

    /**
     * This method should be called once at application startup.
     * Initializes all workers based on the configuration and validates their supported channels.
     *
     * @throws Will throw an error if any worker declares unsupported types.
     *
     */
    static async init() {
        for (const config of workersConfig) {
            const instance: Worker = WorkerFactory.create(config);

            this.workers.set(config.workerId, instance);
        }
    }

    static get(workerId: string): Worker {
        const provider = this.workers.get(workerId);
        if (!provider) throw new Error(`Provider ${workerId} not found`);
        return provider;
    }

    static disconnectAll() {
        for (const worker of this.workers.values()) {
            worker.disconnect();
        }
    }
}
