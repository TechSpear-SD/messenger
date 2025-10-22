import { Worker as BullWorker } from 'bullmq';
import IORedis from 'ioredis';
import { getRedisConnection } from '../core/queues/redis-connection';
import { BaseWorker } from './base-worker';
import pinoLogger from '../logger';
import { WorkerConfig } from '@prisma/client';
import { QueueService } from '../core/services/queue.service';
import { ScenarioService } from '../core/services/scenario.service';
import z from 'zod';
import { QueueMessage } from '../core/entities/queue-message';

export const BullWorkerOptionsSchema = z.object({ redisUrl: z.url() });
export type BullWorkerOptions = z.infer<typeof BullWorkerOptionsSchema>;

export class GenericBullWorker extends BaseWorker<BullWorkerOptions> {
    readonly id: string = 'generic-bull-worker';
    readonly workerConfig: WorkerConfig;
    protected readonly optionsSchema = BullWorkerOptionsSchema;

    private connection?: IORedis;
    private worker?: BullWorker;
    private queueTopic?: string;

    constructor(workerConfig: WorkerConfig) {
        super();
        this.workerConfig = workerConfig;
    }

    protected async handleConnect(): Promise<void> {
        const queueConfig = await QueueService.getByQueueId(
            this.workerConfig.queueId,
        );

        if (!queueConfig) {
            throw new Error(
                `Queue with ID ${this.workerConfig.queueId} not found`,
            );
        }

        this.validateQueueOptions(queueConfig);

        const { redisUrl } = queueConfig.options;
        this.queueTopic = queueConfig.topic;
        this.connection = getRedisConnection(redisUrl);

        await new Promise<void>((resolve) => {
            if (this.connection!.status === 'ready') {
                pinoLogger.info(
                    `[${this.workerConfig.workerId}] Redis already ready`,
                );
                resolve();
                return;
            }

            this.connection!.once('ready', () => {
                pinoLogger.info(
                    `[${this.workerConfig.workerId}] Redis connection ready`,
                );
                resolve();
            });
        });

        this.connection.on('end', async () => {
            pinoLogger.warn(
                this.workerConfig,
                `[${this.workerConfig.workerId}] Redis connection lost`,
            );
            await this.teardownWorker();
        });

        this.connection.on('error', (err) => {
            pinoLogger.error(
                err,
                `[${this.workerConfig.workerId}] Redis error`,
            );
        });
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

    protected async processMessage(message: QueueMessage): Promise<void> {
        await ScenarioService.execute(message);
    }
}
