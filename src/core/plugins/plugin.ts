import pino from 'pino';
import pinoLogger from '../../logger';
import { EventBus } from '../bus/event-bus';
import { getContext } from '../context';
import { EventPayloads } from '../bus/event-payloads';

export abstract class Plugin {
    constructor(protected readonly bus: EventBus<EventPayloads>) {}

    protected getContextLogger(): pino.Logger {
        return getContext()?.logger || pinoLogger;
    }

    abstract registerListeners(): void;
}
