import { Queue } from 'bullmq';
import { getRedisConnection } from '../queues/bull-mq-connection';
import { QueueService } from '../services/queue.service';

export class QueueProducer {
    static async enqueue(
        data: any,
        topic?: string,
        redisUrl?: string,
        queueId?: string,
    ) {
        const queueConfig = await QueueService.getQueueById(
            queueId || 'messenger-queue',
        );

        if (!queueConfig) {
            throw new Error('Queue configuration not found');
        }

        const connection = getRedisConnection(redisUrl || queueConfig.redisUrl);
        const queue = new Queue(topic || queueConfig.topic, { connection });

        await queue.add('default', data);
        await queue.close();
        await connection.quit();
    }
}
