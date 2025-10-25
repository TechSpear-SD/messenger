import { QueueConfig } from '@prisma/client';
import prisma from '../../prisma';
import { ZodSchema } from 'zod';
import { BaseQueueOptions } from '../../config';
import { TypedQueueConfig } from '../queues/redis-connection';

export class QueueService {
    static async getAll(): Promise<QueueConfig[]> {
        return prisma.queueConfig.findMany();
    }

    static async getById(id: number): Promise<QueueConfig | null> {
        return prisma.queueConfig.findUnique({ where: { id } });
    }
    static async getByQueueId(queueId: string): Promise<QueueConfig | null> {
        return prisma.queueConfig.findUnique({ where: { queueId } });
    }

    static validateQueueOptions<
        TOptions extends BaseQueueOptions = BaseQueueOptions,
    >(
        config: QueueConfig,
        optionsSchema: ZodSchema<TOptions>,
    ): asserts config is TypedQueueConfig<TOptions> {
        if (!config.options) {
            throw new Error(
                `[${this.constructor.name}] queueConfig.options missing`,
            );
        }

        const parsed = optionsSchema.safeParse(config.options);

        if (!parsed.success) {
            const issues = parsed.error.issues
                .map((i) => `${i.path.join('.')}: ${i.message}`)
                .join(', ');
            throw new Error(
                `[${this.constructor.name}] Invalid queueConfig.options: ${issues}`,
            );
        }

        (config as any).options = parsed.data;
    }
}
