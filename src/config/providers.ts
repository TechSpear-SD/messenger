import { ProviderConfig } from './types';

export const providersConfig: ProviderConfig[] = [
    {
        providerId: 'mock-multi-provider',
        name: 'mock',
        types: ['email'],
        description: 'Mock provider for testing',
    },
];
