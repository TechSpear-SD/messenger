import { PrismaClient } from '@prisma/client';

export async function seedWorkers(prisma: PrismaClient) {
    console.log('Seeding worker configurations...');
    await prisma.workerConfig.upsert({
        where: { workerId: 'generic-bull-worker' },
        update: {},
        create: {
            workerId: 'bull-worker',
            workerImplId: 'generic-bull-worker',
            queueId: 'messenger-queue',
            options: {},
        },
    });
    console.log('✅ Worker configurations seeded');
}
