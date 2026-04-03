import { globalEventBus } from "./eventBus";
import type { EventMap } from "./types";

// Utility to wait for an event (returns Promise)
export function waitForEvent<K extends keyof EventMap>(
    event: K,
    timeoutMs?: number
): Promise<EventMap[K]> {
    return new Promise((resolve, reject) => {
        const subscription = globalEventBus.once(event, (...args) => {
            clearTimeout(timeoutId);
            resolve(args);
        });

        const timeoutId = timeoutMs ? setTimeout(() => {
            subscription.unsubscribe();
            reject(new Error(`Timeout waiting for event: ${String(event)}`));
        }, timeoutMs) : undefined;
    });
}
