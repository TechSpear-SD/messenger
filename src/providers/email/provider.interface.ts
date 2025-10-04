import { SupportedChannel } from '../../config';
import { QueueMessage } from '../../core/entities/queue-message';

export interface Provider {
    readonly id: string;
    readonly supportedChannels: SupportedChannel[];

    send(message: QueueMessage): Promise<ProviderResult>;

    healthCheck?(): Promise<boolean>;
}

export interface ProviderResult {
    success: boolean;
    providerMessageId?: string;
    error?: string;
}
