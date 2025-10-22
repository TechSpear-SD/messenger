import { QueueConfig } from '@prisma/client';
import prisma from '../../prisma';

class QueueService {
    public async getById(id: number): Promise<QueueConfig | null> {
        return prisma.queueConfig.findUnique({ where: { id } });
    }
    public async getByQueueId(queueId: string): Promise<QueueConfig | null> {
        return prisma.queueConfig.findUnique({ where: { queueId } });
    }
}

export const queueService = new QueueService();
