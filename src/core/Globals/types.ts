import { RefAttributes } from "react";
import { File } from "../managers/Conversation/Mistral/InputProcessor";

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
    'useraction:request:execution': [text: string]
    'opencode:in:canvas': [ref: RefAttributes<any>['ref']]
    'copy:feedback': [detail: copyDtetail]
    'clone:feedback': []
    'canvas:open': []
    'canvas:toggle': []
    'canvas:content:update': [content: string]
    'agent:editor:open': []
    'agent:editor:close': []
    'setting:open': []
    'settings:close': []
    'setting:toggle': []
    'tool:result:open': []
    'tool:result:close': []
    'panel:chats:expand': []
    'panel:chats:shrink': []
    'panel:chats:toggle': []
    'panel:loader:show': []
    'panel:loader:hide': []
    'key:down': [event: KeyboardEvent]
    'key:up': [event: KeyboardEvent]
    'key:press': [event: KeyboardEvent]
    'scroll:bottom': [check: boolean]
    'fileupload:preview:open': []
    'fileupload:preview:close': []
    'dropzone:open': []
    'dropzone:close': []
    'model:change': [model: string]
    'model:selector:show': []
    'model:selector:hide': []
    'conversation:new': [temporary?: boolean]
    'suggestions:show': []
    'suggestions:hide': []
    'keychain:manager:show': []
    'keychain:error': [message: string]
    'apikey:missing': []
    'apikey:missing:warning:show': []
    'apikey:missing:warning:hide': []
    'apikey:set:request:show': []
    'apikey:set:request:hide': []
    'userinput:menu:open': []
    'userinput:menu:close': []
    'userinput:menu:toggle': []
    'files:uploaded': [files: File[]]
    'file:removed': [id: string]
    'files:cleared': []
    'file:remove-request': [id: string]
    'files:clear-request': []
    'files:submitted': [files: File[]]
};


export type EventCallback<T extends keyof EventMap> = (...args: EventMap[T]) => void;
export type EventSubscription = { unsubscribe: () => void };
