import { PrismaClient } from '@prisma/client';
import { seedQueues } from './dev/seed-queues';
import { seedApplications } from './dev/seed-applications';
import { seedProviders } from './dev/seed-providers';
import { seedTemplates } from './dev/seed-templates';
import { seedScenarios } from './dev/seed-scenarios';
import { seedWorkers } from './dev/seed-workers';

export async function seedDev(prisma: PrismaClient) {
    await seedQueues(prisma);
    await seedWorkers(prisma);
    await seedProviders(prisma);

    await seedTemplates(prisma);
    await seedScenarios(prisma);
    await seedApplications(prisma);
}
