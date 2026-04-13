import { EventMap, EventSubscription, EventCallback } from "./types";
import { EventBus } from "./eventBus.ts";

export class EventBusWithWeakRefs extends EventBus {
    private weakListeners = new Map<keyof EventMap, Set<WeakRef<EventCallback<any>>>>();

    onWeak<K extends keyof EventMap>(
        event: K,
        callback: EventCallback<K>
    ): EventSubscription {
        if (!this.weakListeners.has(event)) {
            this.weakListeners.set(event, new Set());
        }

        const weakRef = new WeakRef(callback);
        this.weakListeners.get(event)!.add(weakRef);

        // Periodically clean up dead references
        this.cleanupWeakRefs(event);

        return {
            unsubscribe: () => {
                const refs = this.weakListeners.get(event);
                if (refs) {
                    refs.forEach(ref => {
                        if (ref.deref() === callback) {
                            refs.delete(ref);
                        }
                    });
                }
            }
        };
    }

    private cleanupWeakRefs(event: keyof EventMap): void {
        const refs = this.weakListeners.get(event);
        if (!refs) return;

        for (const ref of refs) {
            if (!ref.deref()) {
                refs.delete(ref);
            }
        }

        if (refs.size === 0) {
            this.weakListeners.delete(event);
        }
    }
}
