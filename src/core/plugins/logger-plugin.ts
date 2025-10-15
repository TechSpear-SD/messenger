import { EventBus } from '../bus/event-bus';
import { EventNames } from '../bus/event-names';
import { EventPayloads } from '../bus/event-payloads';
import { Plugin } from './plugin';

export class LoggerPlugin extends Plugin {
    constructor(bus: EventBus<EventPayloads>) {
        super(bus);
    }

    registerListeners(): void {
        this.bus.on(EventNames.WorkerMessageReceived, (payload) => {
            let logger = this.getContextLogger();
            logger.info(
                `[LoggerPlugin] Worker message received: ${payload.workerId}`,
            );
        });

        this.bus.on(EventNames.WorkerMessageProcessed, (payload) => {
            let logger = this.getContextLogger();
            logger.info(
                `[LoggerPlugin] Worker message processed: ${payload.workerId}`,
            );
        });

        this.bus.on(EventNames.WorkerConnected, (payload) => {
            let logger = this.getContextLogger();
            logger.info(`[LoggerPlugin] Worker connected: ${payload.workerId}`);
        });

        this.bus.on(EventNames.WorkerSubscribed, (payload) => {
            let logger = this.getContextLogger();
            logger.info(
                `[LoggerPlugin] Worker subscribed: ${payload.workerId}`,
            );
        });

        this.bus.on(EventNames.WorkerDisconnected, (payload) => {
            let logger = this.getContextLogger();
            logger.info(
                `[LoggerPlugin] Worker disconnected: ${payload.workerId}`,
            );
        });

        this.bus.on(EventNames.ScenarioBeforeExecute, (payload) => {
            let logger = this.getContextLogger();
            logger.info(
                `[LoggerPlugin] Before scenario: ${payload.scenarioId}`,
            );
        });

        this.bus.on(EventNames.ScenarioAfterExecute, (payload) => {
            let logger = this.getContextLogger();
            logger.info(`[LoggerPlugin] After scenario: ${payload.scenarioId}`);
        });

        this.bus.on(EventNames.TemplateBeforeRender, (payload) => {
            let logger = this.getContextLogger();
            logger.info(
                `[LoggerPlugin] Before template render: ${payload.templateId}`,
            );
        });

        this.bus.on(EventNames.TemplateAfterRender, (payload) => {
            let logger = this.getContextLogger();
            logger.info(
                `[LoggerPlugin] After template render: ${payload.templateId}`,
            );
        });

        this.bus.on(EventNames.TemplateRenderError, (payload) => {
            let logger = this.getContextLogger();
            logger.error(
                payload.error,
                `[LoggerPlugin] Template render error: ${payload.templateId}`,
            );
        });

        this.bus.on(EventNames.ProviderBeforeSend, (payload) => {
            let logger = this.getContextLogger();
            logger.info(
                `[LoggerPlugin] Before provider send: ${payload.providerId}`,
            );
        });

        this.bus.on(EventNames.ProviderAfterSend, (payload) => {
            let logger = this.getContextLogger();
            logger.info(
                `[LoggerPlugin] After provider send: ${payload.providerId}`,
            );
        });

        this.bus.on(EventNames.ProviderSendError, (payload) => {
            let logger = this.getContextLogger();
            logger.error(
                payload.error,
                `[LoggerPlugin] Provider send error: ${payload.providerId}`,
            );
        });

        this.bus.on(EventNames.SystemError, (payload) => {
            let logger = this.getContextLogger();
            logger.error(payload.error, '[LoggerPlugin] System error');
        });
    }
}
