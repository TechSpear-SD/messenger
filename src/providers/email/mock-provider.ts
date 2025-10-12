import { ProviderExecutionContext } from '../../core/entities/provider-execution-ctx';
import { Provider, ProviderResult } from './provider.interface';
import pinoLogger from '../../logger';
import { SupportedChannel } from '../../config';
import { getContext } from '../../core/context';

export class MockProvider implements Provider {
    readonly id = 'mock-multi-provider';
    readonly supportedChannels: SupportedChannel[] = ['email', 'sms', 'push'];
    readonly defaultFrom = 'noreply@mock.com';

    async send(message: ProviderExecutionContext): Promise<ProviderResult> {
        const logger = getContext()?.logger || pinoLogger;
        logger.info({ message }, `[MOCK] Sending message via MockProvider`);
        return {
            success: true,
            providerMessageId: `mock-${Math.random().toString(36).substr(2, 9)}`,
        };
    }
}
