import { EventBus } from '../bus/event-bus';
import { EventNames } from '../bus/event-names';
import { EventPayloads } from '../bus/event-payloads';
import { contextLogger } from '../context';
import { Plugin } from './plugin';

export class LoggerPlugin extends Plugin {
    constructor(bus: EventBus<EventPayloads>) {
        super(bus);
    }

    registerListeners(): void {
        // Info events mapped to messages
        const infoEvents: Partial<{
            [K in keyof EventPayloads]: (payload: EventPayloads[K]) => string;
        }> = {
            [EventNames.WorkerMessageReceived]: (p) =>
                `Worker message received: ${p.workerId}`,
            [EventNames.WorkerMessageProcessed]: (p) =>
                `Worker message processed: ${p.workerId} (${p.durationMs}ms)`,
            [EventNames.WorkerConnected]: (p) =>
                `Worker connected: ${p.workerId}`,
            [EventNames.WorkerSubscribed]: (p) =>
                `Worker subscribed: ${p.workerId}`,
            [EventNames.WorkerDisconnected]: (p) =>
                `Worker disconnected: ${p.workerId}`,

            [EventNames.ScenarioBeforeExecute]: (p) =>
                `Before scenario: ${p.scenarioId}`,
            [EventNames.ScenarioAfterExecute]: (p) =>
                `After scenario: ${p.scenarioId}`,

            [EventNames.TemplateBeforeExecute]: (p) =>
                `Before template execute: ${p.templateId}`,
            [EventNames.TemplateAfterExecute]: (p) =>
                `After template execute: ${p.templateId}`,
            [EventNames.TemplateBeforeTransform]: (p) =>
                `Before transform: ${p.templateId}`,
            [EventNames.TemplateAfterTransform]: (p) =>
                `After transform: ${p.templateId}`,
            [EventNames.TemplateBeforeRender]: (p) =>
                `Before template render: ${p.templateId}`,
            [EventNames.TemplateAfterRender]: (p) =>
                `After template render: ${p.templateId}`,

            [EventNames.ProviderBeforeSend]: (p) =>
                `Before provider send: ${p.providerId}`,
            [EventNames.ProviderAfterSend]: (p) =>
                `After provider send: ${p.providerId}`,
        };

        // Error events mapped to messages
        const errorEvents: Partial<Record<keyof EventPayloads, string>> = {
            [EventNames.TemplateError]: 'Template error',
            [EventNames.TemplateRenderError]: 'Template render error',
            [EventNames.ProviderError]: 'Provider error',
            [EventNames.SystemError]: 'System error',
        };

        
        for (const [eventName, messageFn] of Object.entries(infoEvents) as [
            keyof EventPayloads,
            (payload: any) => string,
        ][]) {
            if (!messageFn) continue;
            this.bus.on(
                eventName,
                (payload: EventPayloads[typeof eventName]) => {
                    contextLogger.info(`[LoggerPlugin] ${messageFn(payload)}`);
                },
            );
        }

        for (const [eventName, baseMessage] of Object.entries(errorEvents) as [
            keyof EventPayloads,
            string,
        ][]) {
            if (!baseMessage) continue;
            this.bus.on(
                eventName,
                (payload: EventPayloads[typeof eventName]) => {
                    const id =
                        (payload as any)?.templateId ||
                        (payload as any)?.providerId ||
                        '';
                    contextLogger.error(
                        `[LoggerPlugin] ${baseMessage}: ${id}`,
                        payload,
                    );
                },
            );
        }
    }
}
