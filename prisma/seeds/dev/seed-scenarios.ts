import { PrismaClient } from '@prisma/client';

export async function seedScenarios(prisma: PrismaClient) {
    console.log('Seeding scenarios...');
    const scenarios = [
        {
            scenarioId: 'mqr_welcome_email',
            description: 'Email de bienvenue',
            templateIds: ['mqr_user_welcome'],
        },
    ];

    for (const sc of scenarios) {
        await prisma.scenario.upsert({
            where: { scenarioId: sc.scenarioId },
            update: {},
            create: { scenarioId: sc.scenarioId, description: sc.description },
        });

        for (const tplId of sc.templateIds) {
            await prisma.scenarioTemplate.upsert({
                where: {
                    scenarioId_templateId: {
                        scenarioId: sc.scenarioId,
                        templateId: tplId,
                    },
                },
                update: {},
                create: { scenarioId: sc.scenarioId, templateId: tplId },
            });
        }
    }
    console.log('✅ Scenario templates seeded');
}
