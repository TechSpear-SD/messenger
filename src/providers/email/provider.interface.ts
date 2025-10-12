import { SupportedChannel } from '../../config';
import { ProviderExecutionContext } from '../../core/entities/provider-execution-ctx';

export interface Provider {
    readonly id: string;
    readonly supportedChannels: SupportedChannel[];
    readonly defaultFrom?: string;

    send(message: ProviderExecutionContext): Promise<ProviderResult>;

    healthCheck?(): Promise<boolean>;
}

export interface ProviderResult {
    success: boolean;
    providerMessageId?: string;
    error?: string;
}
