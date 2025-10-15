import { Worker as BullWorker } from 'bullmq';
import IORedis from 'ioredis';
import { WorkerConfig } from '../config';
import { QueueService } from '../core/services/queue.service';
import { ScenarioService } from '../core/services/scenario.service';
import { getRedisConnection } from '../core/queues/bull-mq-connection';
import { BaseWorker } from './base-worker';

export class GenericBullWorker extends BaseWorker {
    readonly id: string;
    readonly workerConfig: WorkerConfig;

    private connection?: IORedis;
    private worker?: BullWorker;
    private queueTopic?: string;

    constructor(workerConfig: WorkerConfig, id = 'generic-bull-worker') {
        super();
        this.workerConfig = workerConfig;
        this.id = id;
    }

    async handleConnect(): Promise<void> {
        const queueConfig = await QueueService.getQueueById(
            this.workerConfig.queueId,
        );
        if (!queueConfig)
            throw new Error(
                `Queue with ID ${this.workerConfig.queueId} not found`,
            );

        const connection = getRedisConnection(queueConfig.redisUrl);

        if (connection.status !== 'ready') {
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Redis connection timeout'));
                }, 5000);

                connection.once('ready', () => {
                    clearTimeout(timeout);
                    resolve();
                });
                connection.once('error', (err) => {
                    clearTimeout(timeout);
                    reject(err);
                });
            });
        }

        this.connection = connection;
        this.queueTopic = queueConfig.topic;
    }

    async handleSubscribe(): Promise<void> {
        if (!this.connection || !this.queueTopic) {
            throw new Error('Worker not connected. Call connect() first.');
        }

        const connectionOptions = {
            host: (this.connection as any).options.host,
            port: (this.connection as any).options.port,
            password: (this.connection as any).options.password,
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
        };

        this.worker = new BullWorker(
            this.queueTopic,
            async (job) => await this.handleMessage(job.data),
            {
                connection: connectionOptions,
                concurrency: this.workerConfig.concurrency ?? 1,
            },
        );
    }

    async handleDisconnect(): Promise<void> {
        if (this.worker) {
            await this.worker.close();
        }
    }

    protected async processMessage(message: any): Promise<void> {
        await ScenarioService.execute(message);
    }
}
