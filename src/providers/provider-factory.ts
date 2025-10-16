import { ProviderConfig } from '../config/types';
import { MockProvider } from './email/mock-provider';

import { AbstractProvider } from './email/provider.interface';

export class ProviderFactory {
    static create(config: ProviderConfig): AbstractProvider {
        const providers: AbstractProvider[] = [new MockProvider()];
        const found = providers.find((p) => p.id === config.providerId);

        if (!found) {
            throw new Error(`Unknown provider: ${config.providerId}`);
        }

        return found;
    }
}
