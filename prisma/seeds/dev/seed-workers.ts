import { PrismaClient } from '@prisma/client';

export async function seedWorkers(prisma: PrismaClient) {
    console.log('Seeding workers...');
    await prisma.worker.upsert({
        where: { workerId: 'generic-bull-worker' },
        update: {},
        create: {
            workerId: 'generic-bull-worker',
            description:
                'Generic Bull Worker Implementation. Requires redisUrl in options.',
        },
    });
    console.log('✅ Workers seeded');
}
