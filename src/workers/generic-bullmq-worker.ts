import { Worker as BullWorker } from 'bullmq';
import IORedis from 'ioredis';
import { WorkerConfig } from '../config';
import { QueueService } from '../core/services/queue.service';
import { ScenarioService } from '../core/services/scenario.service';
import { getRedisConnection } from '../core/queues/bull-mq-connection';
import { BaseWorker } from './base-worker';
import pinoLogger from '../logger';

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

    protected async handleConnect(): Promise<void> {
        const queueConfig = await QueueService.getQueueById(
            this.workerConfig.queueId,
        );

        if (!queueConfig) {
            throw new Error(
                `Queue with ID ${this.workerConfig.queueId} not found`,
            );
        }

        if (!queueConfig.options || !queueConfig.options.redisUrl) {
            throw new Error(
                `[GenericBullWorker] redisUrl required in queueConfig.options`,
            );
        }

        this.queueTopic = queueConfig.topic;

        const connection = getRedisConnection(queueConfig.options.redisUrl);
        this.connection = connection;

        this.connection.on('ready', async () => {
            pinoLogger.info(
                this.workerConfig,
                `[GenericBullWorker] Redis connection ready`,
            );
            await this.subscribe();
        });

        this.connection.on('end', async () => {
            pinoLogger.warn(
                this.workerConfig,
                `[GenericBullWorker] Redis connection lost`,
            );
            await this.teardownWorker();
        });

        this.connection.on('error', (err) => {
            pinoLogger.error(err, `[GenericBullWorker] Redis error`);
        });

        if (this.connection.status === 'ready') {
            await this.subscribe();
        } else {
            pinoLogger.info(
                this.workerConfig,
                `[GenericBullWorker] Waiting for Redis connection...`,
            );
        }
    }

    protected async handleSubscribe(): Promise<void> {
        if (this.worker || !this.connection || !this.queueTopic) return;

        pinoLogger.info(
            this.workerConfig,
            `[GenericBullWorker] Initializing BullMQ worker for queue: ${this.queueTopic}`,
        );

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

        this.worker.on('failed', (job, err) => {
            pinoLogger.error(
                { ...err, ...this.workerConfig },
                `[GenericBullWorker] Job failed`,
            );
        });

        this.worker.on('completed', (job) => {
            pinoLogger.info(
                this.workerConfig,
                `[GenericBullWorker] Job completed: ${job.id}`,
            );
        });
    }

    protected async teardownWorker(): Promise<void> {
        if (!this.worker) return;
        pinoLogger.info(
            this.workerConfig,
            '[GenericBullWorker] Closing BullMQ worker',
        );
        await this.worker.close();
        this.worker = undefined;
    }

    protected async handleDisconnect(): Promise<void> {
        await this.teardownWorker();
        await this.connection?.quit();
        this.connection = undefined;
    }

    protected async processMessage(message: any): Promise<void> {
        await ScenarioService.execute(message);
    }
}
