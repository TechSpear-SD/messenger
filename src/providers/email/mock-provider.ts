import { ProviderExecutionContext } from '../../core/entities/provider-execution-ctx';
import { SupportedChannel } from '../../config';
import { contextLogger } from '../../core/context';
import { AbstractProvider } from './provider.interface';

export class MockProvider extends AbstractProvider {
    readonly id = 'mock-multi-provider';
    readonly supportedChannels: SupportedChannel[] = ['email', 'sms', 'push'];
    readonly defaultFrom = 'noreply@mock.com';

    protected async sendByChannel(
        channel: SupportedChannel,
        message: ProviderExecutionContext,
    ): Promise<string | undefined> {
        switch (channel) {
            case 'email':
                contextLogger.info(`[MOCK][EMAIL] Sending message`, {
                    message,
                });
                break;
            case 'sms':
                contextLogger.info(`[MOCK][SMS] Sending message`, { message });
                break;
            case 'push':
                contextLogger.info(`[MOCK][PUSH] Sending message`, { message });
                break;
            default:
                throw new Error(`Unsupported channel: ${channel}`);
        }
        return 'mock-provider-message-id';
    }
}
