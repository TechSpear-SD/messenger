import { Worker as BullWorker } from 'bullmq';
import { Worker } from './worker.interface';
import { QueueMessage } from '../core/entities/queue-message';
import { ScenarioService } from '../core/services/scenario.service';
import { QueueService } from '../core/services/queue.service';
import pinoLogger from '../logger';
import { WorkerConfig } from '../config';
import { getRedisConnection } from '../core/queues/bull-mq-connection';
import IORedis from 'ioredis';

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

    /**
     * Establish Redis connection & load queue configuration
     */
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
            '🔌 Redis connection established for worker',
        );
    }

    /**
     * Subscribe to the queue and start processing messages
     */
    async subscribe(): Promise<void> {
        if (!this.connection || !this.queueTopic) {
            throw new Error('Worker not connected. Call connect() first.');
        }

        this.worker = new BullWorker(
            this.queueTopic,
            async (job) => await this.handleMessage(job.data),
            {
                connection: this.connection,
                concurrency: this.workerConfig.concurrency ?? 1,
            },
        );

        this.registerWorkerEvents(this.worker);

        pinoLogger.info(
            { worker: this.workerConfig.workerId, queue: this.queueTopic },
            `👷 Subscribed to queue and listening for jobs`,
        );
    }

    /**
     * Gracefully close the worker
     */
    async disconnect(): Promise<void> {
        await this.worker?.close();
        pinoLogger.info(
            { worker: this.workerConfig.workerId },
            '🔌 Worker disconnected from Redis',
        );
    }

    /**
     * Attach BullMQ event handlers
     */
    private registerWorkerEvents(worker: BullWorker): void {
        worker.on('completed', (job) =>
            pinoLogger.info(
                { jobId: job.id, worker: this.workerConfig.workerId },
                '✅ Job completed',
            ),
        );

        worker.on('failed', (job, err) =>
            pinoLogger.error(
                { jobId: job?.id, worker: this.workerConfig.workerId, err },
                '❌ Job failed',
            ),
        );

        worker.on('error', (err) =>
            pinoLogger.error(
                { worker: this.workerConfig.workerId, err },
                '💥 Worker error',
            ),
        );

        worker.on('stalled', (job) =>
            pinoLogger.warn(
                { jobId: job, worker: this.workerConfig.workerId },
                '⚠️ Job stalled',
            ),
        );

        worker.on('drained', () =>
            pinoLogger.info(
                { worker: this.workerConfig.workerId },
                '🧹 All jobs processed, queue drained',
            ),
        );

        worker.on('paused', () =>
            pinoLogger.info(
                { worker: this.workerConfig.workerId },
                '⏸️ Worker paused',
            ),
        );

        worker.on('resumed', () =>
            pinoLogger.info(
                { worker: this.workerConfig.workerId },
                '▶️ Worker resumed',
            ),
        );
    }

    /**
     * Validate message structure
     */
    private isValidQueueMessage(msg: any): msg is QueueMessage {
        return (
            typeof msg?.templateId === 'string' &&
            typeof msg?.application === 'string' &&
            typeof msg?.businessData === 'object' &&
            Array.isArray(msg?.to)
        );
    }

    /**
     * Handle a single queue message
     */
    private async handleMessage(message: unknown): Promise<void> {
        if (!this.isValidQueueMessage(message)) {
            pinoLogger.warn({ message }, '⚠️ Invalid message format, skipped');
            return;
        }

        await ScenarioService.execute(message);
    }
}
