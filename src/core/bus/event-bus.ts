export enum EventNames {
    ScenarioBeforeExecute = 'scenario.beforeExecute',
    ScenarioAfterExecute = 'scenario.afterExecute',
    WorkerMessageReceived = 'worker.messageReceived',
    WorkerMessageProcessed = 'worker.messageProcessed',
    TemplateBeforeRender = 'template.beforeRender',
    TemplateAfterRender = 'template.afterRender',
    TemplateRenderError = 'template.renderError',
    ProviderBeforeSend = 'provider.beforeSend',
    ProviderAfterSend = 'provider.afterSend',
    ProviderSendError = 'provider.sendError',
    SystemError = 'system.error',
}

export type EventPayloads = {
    [EventNames.ScenarioBeforeExecute]: { scenarioId: string; data: any };
    [EventNames.ScenarioAfterExecute]: { scenarioId: string; result: any };
    [EventNames.WorkerMessageReceived]: { workerId: string; message: any };
    [EventNames.WorkerMessageProcessed]: {
        workerId: string;
        durationMs: number;
    };
    [EventNames.TemplateBeforeRender]: { templateId: string; context: any };
    [EventNames.TemplateAfterRender]: {
        templateId: string;
        renderedContent: string;
    };
    [EventNames.TemplateRenderError]: { templateId: string; error: Error };
    [EventNames.ProviderBeforeSend]: { providerId: string; payload: any };
    [EventNames.ProviderAfterSend]: { providerId: string; response: any };
    [EventNames.ProviderSendError]: { providerId: string; error: Error };
    [EventNames.SystemError]: { error: Error };
};

type Listener<T> = (payload: T) => void;

export class EventBus<Events extends Record<string, any>> {
    private listeners = new Map<keyof Events, Listener<any>[]>();

    on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
        const arr = this.listeners.get(event) ?? [];
        arr.push(listener);
        this.listeners.set(event, arr);
    }

    off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
        const arr = this.listeners.get(event);
        if (!arr) return;
        const index = arr.indexOf(listener);
        if (index !== -1) arr.splice(index, 1);
    }

    emit<K extends keyof Events>(event: K, payload: Events[K]): void {
        const arr = this.listeners.get(event);
        if (!arr) return;
        for (const listener of arr) listener(payload);
    }
}
