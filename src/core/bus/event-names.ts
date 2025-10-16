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
    TemplateBeforeRender = 'template.beforeRender',
    TemplateAfterRender = 'template.afterRender',
    TemplateRenderError = 'template.renderError',
    TemplateError = 'template.error',
    TemplateBeforeTransform = 'template.beforeTransform',
    TemplateAfterTransform = 'template.afterTransform',

    ProviderSendStart = 'provider.sendStart',
    ProviderSendEnd = 'provider.sendEnd',
    ProviderBeforeSend = 'provider.beforeSend',
    ProviderAfterSend = 'provider.afterSend',
    ProviderError = 'provider.error',

    SystemError = 'system.error',
}
