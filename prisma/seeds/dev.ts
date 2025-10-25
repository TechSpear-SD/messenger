import { PrismaClient } from '@prisma/client';
import { seedQueues } from './dev/seed-queues';
import { seedApplications } from './dev/seed-applications';
import { seedProviders } from './dev/seed-providers';
import { seedTemplates } from './dev/seed-templates';
import { seedScenarios } from './dev/seed-scenarios';
import { seedWorkers } from './dev/seed-workers';
import { seedWorkersConfigs } from './dev/seed-worker-configs';

export async function seedDev(prisma: PrismaClient) {
    await seedQueues(prisma);
    await seedWorkers(prisma);
    await seedWorkersConfigs(prisma);
    await seedProviders(prisma);

    await seedTemplates(prisma);
    await seedScenarios(prisma);
    await seedApplications(prisma);
}
