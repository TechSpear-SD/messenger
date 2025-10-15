import { QueueMessage } from '../entities/queue-message';
import { ApplicationService } from './application.service';
import { config } from '../../config';
import { TemplateService } from './template.service';
import { Logger } from 'pino';
import { getContext } from '../context';
import pinoLogger from '../../logger';
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

        const ctx = getContext();
        const log: Logger = ctx?.logger || pinoLogger;

        log.info(
            { appId: message.applicationId, scenarioId: message.scenarioId },
            'Executing scenario for incoming message',
        );

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
                log.error(
                    { err, templateId: template },
                    'Template execution failed',
                );
            }
        }
        bus.emit(EventNames.ScenarioAfterExecute, {
            scenarioId: message.scenarioId,
            result: message,
        });
    }
}
