import { AsyncLocalStorage } from 'async_hooks';
import { Logger } from 'pino';
import pinoLogger from '../logger';

export interface ExecutionContext {
    correlationId: string;
    logger: Logger;
}

const asyncLocalStorage = new AsyncLocalStorage<ExecutionContext>();

export function runWithContext(correlationId: string, fn: () => Promise<void>) {
    const context = {
        correlationId,
        logger: pinoLogger.child({ correlationId }),
    };
    return asyncLocalStorage.run(context, fn);
}

export function getContext(): ExecutionContext | undefined {
    return (
        asyncLocalStorage.getStore() ?? {
            correlationId: '',
            logger: pinoLogger,
        }
    );
}
