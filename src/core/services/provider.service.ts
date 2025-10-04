import { providersConfig, SupportedChannel } from '../../config';
import { Provider } from '../../providers/email/provider.interface';
import { ProviderFactory } from '../../providers/provider-factory';

export class ProviderService {
    private static providers = new Map<string, Provider>();

    /**
     * This method should be called once at application startup.
     * Initializes all providers based on the configuration and validates their supported channels.
     *
     * @throws Will throw an error if any provider declares unsupported types.
     *
     */
    static async init() {
        for (const config of providersConfig) {
            const instance: Provider = ProviderFactory.create(config);

            await this.validateSupportedChannels(instance, config.types);

            this.providers.set(config.providerId, instance);
        }
    }

    static get(providerId: string): Provider {
        const provider = this.providers.get(providerId);
        if (!provider) throw new Error(`Provider ${providerId} not found`);
        return provider;
    }

    static async validateSupportedChannels(
        providerInstance: Provider,
        channels: SupportedChannel[],
    ) {
        const invalid = channels.filter(
            (t) => !providerInstance.supportedChannels.includes(t),
        );

        if (invalid.length > 0) {
            throw new Error(
                `Provider "${providerInstance.constructor.name}" does not support channels: ${invalid.join(
                    ', ',
                )}. Supported channels are: ${providerInstance.supportedChannels.join(
                    ', ',
                )}`,
            );
        }
    }
}
