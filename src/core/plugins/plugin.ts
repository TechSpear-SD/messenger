import pino from 'pino';
import pinoLogger from '../../logger';
import { EventBus, EventPayloads } from '../bus/event-bus';
import { getContext } from '../context';

export abstract class Plugin {
    constructor(protected readonly bus: EventBus<EventPayloads>) {}

    protected getLogger(): pino.Logger {
        return getContext()?.logger || pinoLogger;
    }

    abstract registerListeners(): void;
}
