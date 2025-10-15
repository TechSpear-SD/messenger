import { EventBus } from '../bus/event-bus';
import { EventPayloads } from '../bus/event-payloads';
import { Plugin } from './plugin';

export class PluginManager {
    constructor(private readonly bus: EventBus<EventPayloads>) {}

    register(pluginClass: new (bus: EventBus<EventPayloads>) => Plugin) {
        const plugin = new pluginClass(this.bus);
        plugin.registerListeners();
    }
}
