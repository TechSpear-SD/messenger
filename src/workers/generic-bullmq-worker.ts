import { Worker as BullWorker } from 'bullmq';
import { Worker } from './worker.interface';
import { QueueMessage } from '../core/entities/queue-message';
import { ScenarioService } from '../core/services/scenario.service';
import { QueueService } from '../core/services/queue.service';
import pinoLogger from '../logger';
import { WorkerConfig } from '../config';
import { getRedisConnection } from '../core/queues/bull-mq-connection';
import IORedis from 'ioredis';
import { getContext, runWithContext } from '../core/context';

export class GenericBullWorker implements Worker {
    readonly id: string;
    readonly workerConfig: WorkerConfig;

    private connection?: IORedis;
    private worker?: BullWorker;
    private queueTopic?: string;

    constructor(workerConfig: WorkerConfig, id = 'generic-bull-worker') {
        this.workerConfig = workerConfig;
        this.id = id;
    }

    async connect(): Promise<void> {
        const queueConfig = await QueueService.getQueueById(
            this.workerConfig.queueId,
        );
        if (!queueConfig) {
            throw new Error(
                `Queue with ID ${this.workerConfig.queueId} not found`,
            );
        }

        this.connection = getRedisConnection(queueConfig.redisUrl);
        this.queueTopic = queueConfig.topic;

        pinoLogger.info(
            { workerId: this.workerConfig.workerId, queue: this.queueTopic },
            `Worker ${this.workerConfig.workerId} established Redis connection`,
        );
    }

    async subscribe(): Promise<void> {
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

        this.registerWorkerEvents(this.worker);

        pinoLogger.info(
            { worker: this.workerConfig.workerId, queue: this.queueTopic },
            `Subscribed to queue and listening for jobs`,
        );
    }

    async disconnect(): Promise<void> {
        await this.worker?.close();
        await this.connection?.quit();
        pinoLogger.info(
            { worker: this.workerConfig.workerId },
            'Worker disconnected from Redis',
        );
    }

    private registerWorkerEvents(worker: BullWorker): void {
        worker.on('completed', (job) =>
            pinoLogger.info(
                { jobId: job.id, worker: this.workerConfig.workerId },
                'Job completed',
            ),
        );

        worker.on('failed', (job, err) =>
            pinoLogger.error(
                { jobId: job?.id, worker: this.workerConfig.workerId, err },
                'Job failed',
            ),
        );

        worker.on('error', (err) =>
            pinoLogger.error(
                { worker: this.workerConfig.workerId, err },
                'Worker error',
            ),
        );

        worker.on('drained', () =>
            pinoLogger.info(
                { worker: this.workerConfig.workerId },
                'All jobs processed, queue drained',
            ),
        );
    }

    private isValidQueueMessage(msg: any): msg is QueueMessage {
        return typeof msg?.applicationId === 'string' && Array.isArray(msg?.to);
    }

    private async handleMessage(message: QueueMessage): Promise<void> {
        if (!message.meta) {
            message.meta = {};
        }

        if (!message.meta.correlationId) {
            message.meta.correlationId = crypto.randomUUID();
            pinoLogger.debug(
                { correlationId: message.meta.correlationId },
                'Generated new correlationId for message',
            );
        }

        const correlationId = message.meta.correlationId;

        await runWithContext(correlationId, async () => {
            const ctx = getContext();
            const logger = ctx?.logger ?? pinoLogger;

            logger.info({ message }, 'New message received');

            if (!this.isValidQueueMessage(message)) {
                logger.warn({ message }, 'Invalid message format, skipped');
                return;
            }

            await ScenarioService.execute(message);
        });
    }
}
