import { TemplateConfig } from './types';

export const templatesConfig: TemplateConfig[] = [
    {
        templateId: 'mqr_user_welcome',
        providerId: 'mock-multi-provider',
        path: 'generic_user_welcome',
        channels: ['email', 'sms'],
        dataTransformFiles: [],
    },
    {
        templateId: 'mqr_confirmation_email',
        providerId: 'mock-multi-provider',
        path: 'mqr_confirmation_email',
        channels: ['email', 'sms'],
        dataTransformFiles: [],
    },
];
