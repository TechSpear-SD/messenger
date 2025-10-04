import { QueueMessage } from '../../core/entities/queue-message';
import { Provider, ProviderResult } from './provider.interface';

export class MockProvider implements Provider {
    readonly id = 'mock-multi-provider';
    readonly supportedChannels: ('email' | 'sms' | 'push')[] = [
        'email',
        'sms',
        'push',
    ];

    async send(message: QueueMessage): Promise<ProviderResult> {
        console.log(`[MOCK] Sending message:`, message);
        return { success: true, providerMessageId: 'mock-123' };
    }
}
