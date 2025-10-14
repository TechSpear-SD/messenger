import { EventBus, EventNames, EventPayloads } from '../bus/event-bus';
import { Plugin } from './plugin';

export class LoggerPlugin extends Plugin {
    constructor(bus: EventBus<EventPayloads>) {
        super(bus);
    }

    registerListeners(): void {
        let logger = this.getLogger();
        this.bus.on(EventNames.ScenarioBeforeExecute, (payload) => {
            logger.info(
                `[LoggerPlugin] Before scenario: ${payload.scenarioId}`,
            );
        });

        this.bus.on(EventNames.ScenarioAfterExecute, (payload) => {
            logger.info(`[LoggerPlugin] After scenario: ${payload.scenarioId}`);
        });

        this.bus.on(EventNames.WorkerMessageReceived, (payload) => {
            logger.info(
                `[LoggerPlugin] Worker message received: ${payload.workerId}`,
            );
        });

        this.bus.on(EventNames.WorkerMessageProcessed, (payload) => {
            logger.info(
                `[LoggerPlugin] Worker message processed: ${payload.workerId}`,
            );
        });

        this.bus.on(EventNames.TemplateBeforeRender, (payload) => {
            logger.info(
                `[LoggerPlugin] Before template render: ${payload.templateId}`,
            );
        });

        this.bus.on(EventNames.TemplateAfterRender, (payload) => {
            logger.info(
                `[LoggerPlugin] After template render: ${payload.templateId}`,
            );
        });

        this.bus.on(EventNames.TemplateRenderError, (payload) => {
            logger.error(
                payload.error,
                `[LoggerPlugin] Template render error: ${payload.templateId}`,
            );
        });

        this.bus.on(EventNames.ProviderBeforeSend, (payload) => {
            logger.info(
                `[LoggerPlugin] Before provider send: ${payload.providerId}`,
            );
        });

        this.bus.on(EventNames.ProviderAfterSend, (payload) => {
            logger.info(
                `[LoggerPlugin] After provider send: ${payload.providerId}`,
            );
        });

        this.bus.on(EventNames.ProviderSendError, (payload) => {
            logger.error(
                payload.error,
                `[LoggerPlugin] Provider send error: ${payload.providerId}`,
            );
        });

        this.bus.on(EventNames.SystemError, (payload) => {
            logger.error(payload.error, '[LoggerPlugin] System error');
        });
    }
}
