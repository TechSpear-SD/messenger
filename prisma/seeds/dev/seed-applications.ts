import { PrismaClient } from '@prisma/client';

export async function seedApplications(prisma: PrismaClient) {
    console.log('Seeding applications...');
    const applications = [
        {
            appId: 'mqr',
            name: 'MenuQR',
            description: 'Menu QR code application',
            scenarioIds: ['mqr_welcome_email', 'mqr_confirmation_email'],
        },
        {
            appId: 'tst',
            name: 'Test App',
            description: 'Mock test application for development',
            scenarioIds: ['mqr_welcome_email', 'mqr_confirmation_email'],
        },
    ];

    for (const app of applications) {
        const createdApp = await prisma.application.upsert({
            where: { appId: app.appId },
            update: {},
            create: {
                appId: app.appId,
                name: app.name,
                description: app.description,
            },
        });

        for (const scId of app.scenarioIds) {
            const scenario = await prisma.scenario.findUnique({
                where: { scenarioId: scId },
            });
            if (!scenario) continue;

            await prisma.applicationScenario.upsert({
                where: {
                    applicationId_scenarioId: {
                        applicationId: createdApp.id,
                        scenarioId: scenario.id,
                    },
                },
                update: {},
                create: {
                    applicationId: createdApp.id,
                    scenarioId: scenario.id,
                    enabled: true,
                },
            });
        }
    }
    console.log('✅ Application scenarios seeded');
}
