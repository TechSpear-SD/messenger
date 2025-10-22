import { Provider } from '@prisma/client';
import { MockProvider } from './email/mock-provider';
import { AbstractProvider } from './email/provider.interface';

export class ProviderFactory {
    /**
     * Returns an instance of the provider corresponding to the given provider ID.
     */
    static create(provider: Provider): AbstractProvider {
        const providers: AbstractProvider[] = [new MockProvider(provider)];
        const found = providers.find((p) => p.id === provider.providerId);

        if (!found) {
            throw new Error(`Unknown provider: ${provider.providerId}`);
        }

        return found;
    }
}
