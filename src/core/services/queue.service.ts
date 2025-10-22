import { QueueConfig } from '@prisma/client';
import { queuesConfig } from '../../config/queues';
import prisma from '../../prisma';

export class QueueService {
    static async getQueueById(queueId: string) {
        return queuesConfig.find((q) => q.queueId === queueId);
    }

    static async getAll(): Promise<QueueConfig[]> {
        return prisma.queueConfig.findMany();
    }

    static async getById(id: number): Promise<QueueConfig | null> {
        return prisma.queueConfig.findUnique({ where: { id } });
    }
    static async getByQueueId(queueId: string): Promise<QueueConfig | null> {
        return prisma.queueConfig.findUnique({ where: { queueId } });
    }
}
