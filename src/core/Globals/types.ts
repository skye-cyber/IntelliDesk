import { RefAttributes } from "react";

interface copyDtetail {
    head: string
    body: string
}

export type EventMap = {
    'sigint': [timestamp: number];
    'execution:abort': [reason: string];
    'execution:complete': [results: unknown];
    'permission:granted': [toolName: string, decision: string];
    'permission:denied': [toolName: string];
    'executioncycle:start': []
    'executioncycle:end': []
    'useraction:submit:incycle': [text: string]
    'opencode:in:canvas': [ref: RefAttributes<any>['ref']]
    'copy:feedback': [detail: copyDtetail]
    'clone:feedback': []
};

export type EventCallback<T extends keyof EventMap> = (...args: EventMap[T]) => void;
export type EventSubscription = { unsubscribe: () => void };
