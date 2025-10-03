import { ScenarioConfig } from './types';

export const scenariosConfig: ScenarioConfig[] = [
    {
        scenarioId: 'mqr_welcome_email',
        description: 'Email de bienvenue',
        templateIds: ['mqr_welcome_html', 'mqr_welcome_text'],
    },
    {
        scenarioId: 'mqr_confirmation_email',
        description: 'Email de confirmation',
        templateIds: ['mqr_confirmation_html', 'mqr_confirmation_text'],
    },
];
