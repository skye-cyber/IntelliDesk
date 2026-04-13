import type { EventMap, EventCallback, EventSubscription } from "./types";
import { waitForEvent } from "./busEventPromise.ts";

export class EventBus {
    private listeners = new Map<keyof EventMap, Set<EventCallback<any>>>();
    private onceListeners = new Map<keyof EventMap, Set<EventCallback<any>>>();
    private debugMode = false;

    constructor(debug = false) {
        this.debugMode = debug;
    }

    /**
     * Emit an event to all subscribers
     */
    emit<K extends keyof EventMap>(event: K, ...args: EventMap[K]): void {
        if (this.debugMode) {
            console.debug(`[EventBus] Emitting: ${event}`, ...args);
        }

        // Call regular listeners
        const regularListeners = this.listeners.get(event);
        if (regularListeners) {
            regularListeners.forEach(callback => {
                this.safeInvoke(callback, event, args);
            });
        }

        // Call once listeners and clear them
        const onceListeners = this.onceListeners.get(event);
        if (onceListeners) {
            onceListeners.forEach(callback => {
                this.safeInvoke(callback, event, args);
            });
            this.onceListeners.delete(event);
        }
    }

    /**
     * Subscribe to an event
     */
    on<K extends keyof EventMap>(
        event: K,
        callback: EventCallback<K>,
        options?: { once?: boolean }
    ): EventSubscription {
        const targetMap = options?.once ? this.onceListeners : this.listeners;

        if (!targetMap.has(event)) {
            targetMap.set(event, new Set());
        }

        const callbacks = targetMap.get(event)!;
        callbacks.add(callback);

        if (this.debugMode) {
            console.debug(`[EventBus] Subscribed to: ${event}, total: ${callbacks.size}`);
        }

        return {
            unsubscribe: () => this.off(event, callback, options?.once)
        };
    }

    /**
     * Subscribe once (auto-unsubscribe after first emission)
     */
    once<K extends keyof EventMap>(
        event: K,
        callback: EventCallback<K>
    ): EventSubscription {
        return this.on(event, callback, { once: true });
    }

    /**
     * Unsubscribe from an event
     */
    off<K extends keyof EventMap>(
        event: K,
        callback?: EventCallback<K>,
        once = false
    ): void {
        const targetMap = once ? this.onceListeners : this.listeners;
        const callbacks = targetMap.get(event);

        if (!callbacks) return;

        if (callback) {
            callbacks.delete(callback);
            if (this.debugMode) {
                console.debug(`[EventBus] Unsubscribed from: ${event}, remaining: ${callbacks.size}`);
            }
        } else {
            // Remove all listeners for this event
            targetMap.delete(event);
            if (this.debugMode) {
                console.debug(`[EventBus] Removed all listeners for: ${event}`);
            }
        }

        // Clean up empty sets to prevent memory leaks
        if (callbacks && callbacks.size === 0) {
            targetMap.delete(event);
        }
    }

    /**
     * Clear all listeners (useful for testing or app reset)
     */
    clear(): void {
        this.listeners.clear();
        this.onceListeners.clear();
        if (this.debugMode) {
            console.debug('[EventBus] All listeners cleared');
        }
    }

    /**
     * Get statistics about current subscriptions
     */
    getStats(): { totalEvents: number; totalListeners: number; events: Record<string, number> } {
        let totalListeners = 0;
        const events: Record<string, number> = {};

        this.listeners.forEach((callbacks, event) => {
            const count = callbacks.size;
            totalListeners += count;
            events[String(event)] = count;
        });

        this.onceListeners.forEach((callbacks, event) => {
            const count = callbacks.size;
            totalListeners += count;
            events[`${String(event)} (once)`] = count;
        });

        return {
            totalEvents: this.listeners.size + this.onceListeners.size,
            totalListeners,
            events
        };
    }

    /**
     * Safe invocation wrapper to prevent callback errors from breaking other listeners
     */
    private safeInvoke<K extends keyof EventMap>(
        callback: EventCallback<K>,
        event: K,
        args: EventMap[K]
    ): void {
        try {
            callback(...args);
        } catch (error) {
            console.error(`[EventBus] Error in listener for event "${event}":`, error);
            // Optionally emit error event if you want to handle globally
        }
    }
}

// Singleton instance with lazy initialization
let globalEventBusInstance: EventBus | null = null;

export function getEventBus(debug = false): EventBus {
    if (!globalEventBusInstance) {
        globalEventBusInstance = new EventBus(debug);
    }
    return globalEventBusInstance;
}

export const globalEventBus = getEventBus();

// Convenience exports
export const emit = <K extends keyof EventMap>(event: K, ...args: EventMap[K]) =>
globalEventBus.emit(event, ...args);
export const on = <K extends keyof EventMap>(event: K, callback: EventCallback<K>) =>
globalEventBus.on(event, callback);
export const once = <K extends keyof EventMap>(event: K, callback: EventCallback<K>) =>
globalEventBus.once(event, callback);


export const sigint = {
    raise: (timestamp: number = Date.now()) => {
        globalEventBus.emit('sigint', timestamp);
    },
    on: (callback: (timestamp: number) => void) =>
        globalEventBus.on('sigint', callback),
    once: (callback: (timestamp: number) => void) =>
        globalEventBus.once('sigint', callback),
    wait: (timeoutMs?: number) => waitForEvent('sigint', timeoutMs)
};

export const execution = {
    abort: (reason: string) => {
        globalEventBus.emit('execution:abort', reason);
    },
    onAbort: (callback: (reason: string) => void) =>
        globalEventBus.on('execution:abort', callback)
};
