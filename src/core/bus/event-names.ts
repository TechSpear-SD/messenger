export enum EventNames {
    WorkerMessageReceived = 'worker.messageReceived',
    WorkerMessageProcessed = 'worker.messageProcessed',
    WorkerConnected = 'worker.connected',
    WorkerSubscribed = 'worker.subscribed',
    WorkerDisconnected = 'worker.disconnected',

    ScenarioBeforeExecute = 'scenario.beforeExecute',
    ScenarioAfterExecute = 'scenario.afterExecute',

    TemplateBeforeExecute = 'template.beforeExecute',
    TemplateAfterExecute = 'template.afterExecute',
    TemplateExecuteError = 'template.executeError',
    TemplateBeforeRender = 'template.beforeRender',
    TemplateAfterRender = 'template.afterRender',
    TemplateRenderError = 'template.renderError',

    ProviderBeforeSend = 'provider.beforeSend',
    ProviderAfterSend = 'provider.afterSend',
    ProviderError = 'provider.error',

    SystemError = 'system.error',
}
