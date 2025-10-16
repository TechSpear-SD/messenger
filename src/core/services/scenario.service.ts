import { QueueMessage } from '../entities/queue-message';
import { ApplicationService } from './application.service';
import { config, scenariosConfig } from '../../config';
import { TemplateService } from './template.service';
import { contextLogger } from '../context';
import { bus } from '../bus';
import { EventNames } from '../bus/event-names';

export class ScenarioService {
    static async getById(scenarioId: string) {
        return (
            config.scenarios.find(
                (scenario) => scenario.scenarioId === scenarioId,
            ) || null
        );
    }

    /**
     * Main entry point for executing a queued message
     */
    static async execute(message: QueueMessage): Promise<void> {
        bus.emit(EventNames.ScenarioBeforeExecute, {
            scenarioId: message.scenarioId,
            data: message,
        });

        contextLogger.info('Executing scenario for incoming message', {
            appId: message.applicationId,
            scenarioId: message.scenarioId,
        });

        const app = await ApplicationService.getById(message.applicationId);
        if (!app) {
            throw new Error(`Unknown application: ${message.applicationId}`);
        }

        const scenario = await ScenarioService.getById(message.scenarioId);
        if (!scenario) {
            throw new Error(
                `No scenario with scenarioId ${message.scenarioId}`,
            );
        }

        for (const template of scenario.templateIds) {
            try {
                await TemplateService.execute({
                    applicationId: app.appId,
                    templateId: template,
                    businessData: message.businessData,
                    to: message.to,
                    cc: message.cc,
                    bcc: message.bcc,
                    meta: message.meta,
                    subject: message.subject,
                    bodyOverride: message.bodyOverride,
                    tracking: message.tracking,
                });
            } catch (err) {
                contextLogger.error('Template execution failed for scenario ', {
                    err,
                    templateId: template,
                    scenarioId: scenario.scenarioId,
                });
            }
        }
        bus.emit(EventNames.ScenarioAfterExecute, {
            scenarioId: message.scenarioId,
            result: message,
        });
    }
}
