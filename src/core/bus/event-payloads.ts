import { EventNames } from './event-names';

export type EventPayloads = {
    [EventNames.ScenarioBeforeExecute]: { scenarioId: string; data: any };
    [EventNames.ScenarioAfterExecute]: { scenarioId: string; result: any };
    [EventNames.WorkerDisconnected]: { workerId: string };
    [EventNames.WorkerMessageReceived]: { workerId: string; message: any };
    [EventNames.WorkerConnected]: { workerConfig: any; workerId: string };
    [EventNames.WorkerSubscribed]: { workerConfig: any; workerId: string };
    [EventNames.WorkerMessageProcessed]: {
        workerId: string;
        durationMs: number;
    };
    [EventNames.TemplateBeforeRender]: { templateId: string; context: any };
    [EventNames.TemplateAfterRender]: {
        templateId: string;
        rendered: { subject: string; body: string };
        context: any;
    };
    [EventNames.TemplateRenderError]: { templateId: string; error: Error };
    [EventNames.ProviderBeforeSend]: { providerId: string; payload: any };
    [EventNames.ProviderAfterSend]: { providerId: string; response: any };
    [EventNames.ProviderSendError]: { providerId: string; error: Error };
    [EventNames.SystemError]: { error: Error };
};
