import { ProviderExecutionContext } from '../../core/entities/provider-execution-ctx';
import { contextLogger } from '../../core/context';
import { bus } from '../../core/bus';
import { EventNames } from '../../core/bus/event-names';
import { Provider, SupportedChannel } from '@prisma/client';

export interface ProviderChannelResult {
    channel: SupportedChannel;
    success: boolean;
    providerMessageId?: string;
    error?: string;
}

export abstract class AbstractProvider {
    abstract readonly id: string;
    abstract get implementedChannels(): SupportedChannel[];

    supportedChannels: SupportedChannel[] = [];
    defaultFrom?: string;

    constructor(provider: Provider) {
        this.defaultFrom = provider.defaultFrom || undefined;
        this.setSupportedChannels(provider.supportedChannels);
    }

    public setSupportedChannels(channels: SupportedChannel[]) {
        this.supportedChannels = this.implementedChannels.filter((c) =>
            channels.includes(c),
        );
    }

    async send(
        message: ProviderExecutionContext,
    ): Promise<ProviderChannelResult[]> {
        const results: ProviderChannelResult[] = [];

        bus.emit(EventNames.ProviderSendStart, {
            providerId: this.id,
            payload: message,
        });

        const invalidChannels = message.channels.filter(
            (c) => !this.supportedChannels.includes(c),
        );

        if (invalidChannels.length) {
            const errorMsg = `Provider ${this.id} does not support channels: ${invalidChannels.join(', ')}`;
            contextLogger.error(errorMsg, { message });
            for (const c of invalidChannels) {
                results.push({ channel: c, success: false, error: errorMsg });
            }
        }

        const validChannels = message.channels.filter((c) =>
            this.supportedChannels.includes(c),
        );

        for (const channel of validChannels) {
            try {
                bus.emit(EventNames.ProviderBeforeSend, {
                    providerId: this.id,
                    payload: message,
                });

                const providerMessageId = await this.sendByChannel(
                    channel,
                    message,
                );

                const result: ProviderChannelResult = {
                    channel,
                    success: true,
                    providerMessageId:
                        providerMessageId || `unknown-${Date.now()}`,
                };

                results.push(result);

                bus.emit(EventNames.ProviderAfterSend, {
                    providerId: this.id,
                    response: result,
                });
            } catch (err: any) {
                const errorMsg = err?.message || 'Unknown error';
                contextLogger.error(
                    `Error sending message via provider ${this.id} on channel ${channel}`,
                    { message, error: err },
                );

                const result: ProviderChannelResult = {
                    channel,
                    success: false,
                    error: errorMsg,
                };

                results.push(result);

                bus.emit(EventNames.ProviderError, {
                    providerId: this.id,
                    error: err,
                });
            }
        }

        bus.emit(EventNames.ProviderSendEnd, { providerId: this.id, results });

        return results;
    }

    protected abstract sendByChannel(
        channel: SupportedChannel,
        message: ProviderExecutionContext,
    ): Promise<string | undefined>;

    healthCheck?(): Promise<boolean>;
}
