import { AsyncLocalStorage } from 'async_hooks';
import { Logger } from 'pino';
import pinoLogger from '../logger';
import { randomUUID } from 'crypto';

export interface AppContext {
    correlationId: string;
    requestId?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
    logger: Logger;
}

const asyncLocalStorage = new AsyncLocalStorage<AppContext>();

export function runWithContext<T>(
    partialContext: Partial<Omit<AppContext, 'logger'>> = {},
    fn: () => Promise<T>,
): Promise<T> {
    const correlationId = partialContext.correlationId ?? randomUUID();

    const context: AppContext = {
        correlationId,
        requestId: partialContext.requestId,
        userId: partialContext.userId,
        metadata: partialContext.metadata ?? {},
        logger: pinoLogger.child({
            correlationId,
            requestId: partialContext.requestId,
            userId: partialContext.userId,
        }),
    };

    return asyncLocalStorage.run(context, fn);
}

export function getContextNoLogger(): Omit<AppContext, 'logger'> {
    const store = asyncLocalStorage.getStore();
    if (!store) {
        return { correlationId: 'unknown' };
    }
    const { logger, ...rest } = store;
    return rest;
}

export function getContext(): AppContext {
    const store = asyncLocalStorage.getStore();
    if (!store) {
        return { correlationId: 'unknown', logger: pinoLogger };
    }
    return store;
}

export const contextLogger = {
    info: (msg: string, data?: Record<string, unknown>) =>
        getContext().logger.info(data ?? {}, msg),
    error: (msg: string, data?: Record<string, unknown>) =>
        getContext().logger.error(data ?? {}, msg),
    warn: (msg: string, data?: Record<string, unknown>) =>
        getContext().logger.warn(data ?? {}, msg),
    fatal: (msg: string, data?: Record<string, unknown>) =>
        getContext().logger.fatal(data ?? {}, msg),
    debug: (msg: string, data?: Record<string, unknown>) =>
        getContext().logger.debug(data ?? {}, msg),
};
