type Listener<T> = (payload: T) => void;

export class EventBus<Events extends Record<string, any>> {
    private listeners = new Map<keyof Events, Listener<any>[]>();

    on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
        const arr = this.listeners.get(event) ?? [];
        arr.push(listener);
        this.listeners.set(event, arr);
    }

    off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
        const arr = this.listeners.get(event);
        if (!arr) return;
        const index = arr.indexOf(listener);
        if (index !== -1) arr.splice(index, 1);
    }

    emit<K extends keyof Events>(event: K, payload: Events[K]): void {
        const arr = this.listeners.get(event);
        if (!arr) return;
        for (const listener of arr) listener(payload);
    }
}
