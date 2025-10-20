import { PrismaClient, SupportedChannel } from '@prisma/client';

export async function seedProviders(prisma: PrismaClient) {
    console.log('Seeding providers...');
    await prisma.provider.upsert({
        where: { providerId: 'mock-multi-provider' },
        update: {},
        create: {
            providerId: 'mock-multi-provider',
            name: 'mock',
            description: 'Mock provider for testing',
            supportedChannels: [
                SupportedChannel.email,
                SupportedChannel.sms,
                SupportedChannel.push,
                SupportedChannel.webhook,
            ],
        },
    });
    console.log('✅ Provider seeded');
}
