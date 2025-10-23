import { Queue } from 'bullmq';
import { getNewRedisConnection } from './redis-connection';

export class BullMQProducer {
    static async enqueue(data: any, redisUrl: string, topic: string) {
        const connection = getNewRedisConnection(redisUrl);
        const queue = new Queue(topic, { connection });

        await queue.add('default', data);
        await queue.close();
        await connection.quit();
    }
}
