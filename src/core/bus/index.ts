import { EventBus } from './event-bus';
import { EventPayloads } from './event-payloads';

export const bus = new EventBus<EventPayloads>();
