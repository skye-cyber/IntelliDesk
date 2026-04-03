import { useEffect, useRef } from 'react';
import { globalEventBus } from '../../core/Globals/eventBus';
import { EventMap, EventCallback } from '../../core/Globals/types';

export function useEventBus<K extends keyof EventMap>(
    event: K,
    callback: EventCallback<K>,
    dependencies: any[] = []
) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        const handler: EventCallback<K> = (...args) => callbackRef.current(...args);
        const subscription = globalEventBus.on(event, handler);
        return () => subscription.unsubscribe();
    }, [event, ...dependencies]);
}

// Usage in React component
function ToolComponent() {
    useEventBus('sigint', (timestamp) => {
        console.log('SIGINT received at:', timestamp);
        // Handle SIGINT
    });

    useEventBus('execution:abort', (reason) => {
        console.log('Aborted because:', reason);
    });
}
