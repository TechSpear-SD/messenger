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
        this.bus.on(EventNames.WorkerMessageReceived, (payload) => {
            contextLogger.info(
                `[LoggerPlugin] Worker message received: ${payload.workerId}`,
            );
        });

        this.bus.on(EventNames.WorkerMessageProcessed, (payload) => {
            contextLogger.info(
                `[LoggerPlugin] Worker message processed: ${payload.workerId}`,
            );
        });

        this.bus.on(EventNames.WorkerConnected, (payload) => {
            contextLogger.info(
                `[LoggerPlugin] Worker connected: ${payload.workerId}`,
            );
        });

        this.bus.on(EventNames.WorkerSubscribed, (payload) => {
            contextLogger.info(
                `[LoggerPlugin] Worker subscribed: ${payload.workerId}`,
            );
        });

        this.bus.on(EventNames.WorkerDisconnected, (payload) => {
            contextLogger.info(
                `[LoggerPlugin] Worker disconnected: ${payload.workerId}`,
            );
        });

        this.bus.on(EventNames.ScenarioBeforeExecute, (payload) => {
            contextLogger.info(
                `[LoggerPlugin] Before scenario: ${payload.scenarioId}`,
            );
        });

        this.bus.on(EventNames.ScenarioAfterExecute, (payload) => {
            contextLogger.info(
                `[LoggerPlugin] After scenario: ${payload.scenarioId}`,
            );
        });

        this.bus.on(EventNames.TemplateBeforeRender, (payload) => {
            contextLogger.info(
                `[LoggerPlugin] Before template render: ${payload.templateId}`,
            );
        });

        this.bus.on(EventNames.TemplateAfterRender, (payload) => {
            contextLogger.info(
                `[LoggerPlugin] After template render: ${payload.templateId}`,
            );
        });

        this.bus.on(EventNames.TemplateRenderError, (payload) => {
            contextLogger.error(
                `[LoggerPlugin] Template render error: ${payload.templateId}`,
                payload,
            );
        });

        this.bus.on(EventNames.ProviderBeforeSend, (payload) => {
            contextLogger.info(
                `[LoggerPlugin] Before provider send: ${payload.providerId}`,
            );
        });

        this.bus.on(EventNames.ProviderAfterSend, (payload) => {
            contextLogger.info(
                `[LoggerPlugin] After provider send: ${payload.providerId}`,
            );
        });

        this.bus.on(EventNames.ProviderError, (payload) => {
            contextLogger.error(
                `[LoggerPlugin] Provider send error: ${payload.providerId}`,
                payload,
            );
        });

        this.bus.on(EventNames.SystemError, (payload) => {
            contextLogger.error('[LoggerPlugin] System error', payload);
        });
    }
}
