import { PrismaClient, QueueType } from '@prisma/client';

export async function seedQueues(prisma: PrismaClient) {
    console.log('Seeding queue configurations...');
    await prisma.queueConfig.upsert({
        where: { queueId: 'messenger-queue' },
        update: {},
        create: {
            queueId: 'messenger-queue',
            topic: process.env.QUEUE_TOPIC || 'messenger',
            type: QueueType.bullmq,
            options: {
                redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
            },
        },
    });
    console.log('✅ Queue configurations seeded');
}
