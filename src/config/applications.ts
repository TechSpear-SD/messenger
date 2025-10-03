import { ApplicationConfig } from './types';

export const applicationsConfig: ApplicationConfig[] = [
    {
        appId: 'mqr',
        name: 'MenuQR',
        description: 'Menu QR code application',
        scenarioIds: ['mqr_welcome_email', 'mqr_confirmation_email'],
    },
];
