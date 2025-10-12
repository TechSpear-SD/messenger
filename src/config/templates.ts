import { TemplateConfig } from './types';

export const templatesConfig: TemplateConfig[] = [
    {
        templateId: 'mqr_user_welcome',
        providerId: 'mock-multi-provider',
        path: 'generic_user_welcome',
        dataTransformFiles: [],
    },
    {
        templateId: 'mqr_confirmation_email',
        providerId: 'mock-multi-provider',
        path: 'mqr_confirmation_email',
        dataTransformFiles: [],
    },
];
