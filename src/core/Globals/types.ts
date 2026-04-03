export type EventMap = {
    'sigint': [timestamp: number];
    'execution:abort': [reason: string];
    'execution:complete': [results: unknown];
    'permission:granted': [toolName: string, decision: string];
    'permission:denied': [toolName: string];
    'executioncycle:start': []
    'executioncycle:end': []
};

export type EventCallback<T extends keyof EventMap> = (...args: EventMap[T]) => void;
export type EventSubscription = { unsubscribe: () => void };
