import { EventNames } from './event-names';

export type EventPayloads = {
    [EventNames.WorkerDisconnected]: { workerId: string };
    [EventNames.WorkerMessageReceived]: {
        workerId: string;
        workerClass: string;
        message: any;
    };
    [EventNames.WorkerConnected]: { workerConfig: any; workerId: string };
    [EventNames.WorkerSubscribed]: { workerConfig: any; workerId: string };
    [EventNames.WorkerMessageProcessed]: {
        workerId: string;
        durationMs: number;
        correlationId: string;
    };

    [EventNames.ScenarioBeforeExecute]: { scenarioId: string; data: any };
    [EventNames.ScenarioAfterExecute]: { scenarioId: string; result: any };

    [EventNames.TemplateBeforeExecute]: { templateId: string; data: any };
    [EventNames.TemplateAfterExecute]: { templateId: string; result: any };
    [EventNames.TemplateBeforeTransform]: { templateId: string; data: any };
    [EventNames.TemplateAfterTransform]: {
        templateId: string;
        transformedData: any;
    };
    [EventNames.TemplateError]: { templateId: string; error: Error };
    [EventNames.TemplateBeforeRender]: { templateId: string; context: any };
    [EventNames.TemplateAfterRender]: {
        templateId: string;
        rendered: { subject: string; body: string };
        context: any;
    };
    [EventNames.TemplateRenderError]: { templateId: string; error: Error };

    [EventNames.ProviderSendStart]: { providerId: string; payload: any };
    [EventNames.ProviderSendEnd]: { providerId: string; results: any[] };
    [EventNames.ProviderBeforeSend]: { providerId: string; payload: any };
    [EventNames.ProviderAfterSend]: { providerId: string; response: any };
    [EventNames.ProviderError]: { providerId: string; error: Error };

    [EventNames.SystemError]: { error: Error };
};
