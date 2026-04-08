import path from 'path';
import fs from 'fs';
import { ExecException } from 'child_process';
import { AgentType } from './utils/ToolAgent';
import { SessionManagerType, LockManagerType } from './utils/SessionManager';
import { FunctionCall } from '@mistralai/mistralai/models/components';
export declare enum ModelType {
    multimodal = "multimodal",
    chat = "chat"
}
export declare enum ConversationType {
    temporary = "temporary",
    normal = "normal"
}
export interface ConversationMetadata {
    model: ModelType;
    type?: ConversationType;
    name?: string;
    id: string;
    sessionId: string | null;
    created_at: string;
    updated_at: string;
    highlight?: string;
}
export type ToolTypes = {
    Function: "function";
};
export interface ToolCall {
    id?: string | undefined;
    type?: ToolTypes | undefined;
    function: FunctionCall;
    index?: number | undefined;
}
export type MultimodalMessage = Array<{
    type: string;
    text?: string;
    [key: string]: any;
}>;
export type ChatContent = string | MultimodalMessage;
export declare enum MessageRole {
    system = "system",
    user = "user",
    assistant = "assistant",
    tool = "tool"
}
export interface ChatMessage {
    role: MessageRole;
    content?: ChatContent;
    toolCalls?: Array<ToolCall>;
}
export interface Conversation {
    metadata: ConversationMetadata;
    chats: ChatMessage[];
}
export interface PreferenceData {
    data: {
        preference?: string;
    };
}
export interface KeyChainOptions {
    account?: string;
    [key: string]: any;
}
export interface SaveDialogOptions {
    title?: string;
    defaultPath?: string;
    filters?: Array<{
        name: string;
        extensions: string[];
    }>;
    [key: string]: any;
}
export interface OpenDialogOptions {
    title?: string;
    defaultPath?: string;
    properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory'>;
    filters?: Array<{
        name: string;
        extensions: string[];
    }>;
    [key: string]: any;
}
export interface CommandOptions {
    encoding?: string;
    timeout?: number;
    maxBuffer?: number;
    killSignal?: string;
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    shell?: boolean | string;
    [key: string]: any;
}
export interface CommandResult {
    success: boolean;
    error: ExecException | null;
    stdout: string;
    stderr: string;
    code: number;
    message: string;
}
export interface ApiType {
    getDownloadsPath: () => string;
    home_dir: () => string;
    mkdir: (dir: string) => Promise<boolean>;
    write: (path: string, data: Conversation) => Promise<Conversation>;
    read: (fpath: string) => Promise<any>;
    readDir: (dir: string) => Promise<string[] | false>;
    stat: (filePath: string) => fs.Stats | false;
    getExt: (file: string) => string;
    getBasename: (_path: string, ext?: string) => string;
    joinPath: (node: string, child: string) => string;
    RenameFile: (old_name: string, new_name: string, base_dir?: string) => boolean;
    RenameConversation: (id: string, name: string, base_dir?: string) => Promise<Conversation | boolean>;
    readStore: () => Promise<string[]>;
    validateStore: () => Promise<boolean>;
    loadConversation: (id: string) => Promise<Conversation | undefined>;
    deleteChat: (id: string, base_dir?: string) => boolean | undefined;
    addHistory: (item: ChatMessage) => Conversation;
    getHistory: (filter?: boolean) => Conversation | ChatMessage[];
    popHistory: (role?: string | null) => Conversation;
    getModel: () => string;
    setModel: (model: string) => void;
    clean: (data: Conversation) => Conversation | null;
    getmetadata: (file?: string | undefined | null) => ConversationMetadata | undefined;
    getRoleByIndex: (index: number) => MessageRole | undefined;
    updateName: (name: string, save?: boolean) => string | undefined;
    updateContinueHistory: (item: ChatMessage) => void | false;
    clearAllImages: (history: Conversation) => any[] | false;
    clearImages: (history: Conversation) => any[] | false;
    CreateNew: (conversation: ChatMessage[], model: string) => void;
    startNew: (model: 'chat' | 'multimodal', temporary: boolean) => void;
    saveConversation: () => Promise<string>;
    generateUUID: () => string;
    getConversationId: () => string;
    setConversationId: (id: string) => void;
    setConversation: (data: Conversation, id?: string) => boolean;
    send: (channel: string, data: any) => void;
    receive: (channel: string, func: (...args: any[]) => void) => void;
    ThemeChangeDispatch: () => void;
    getNewChatUUId: () => string;
    saveAndOpenImage: (downloadsPath: string, dataUrl: string) => void;
    cleanFile: (file: string) => Promise<boolean | undefined>;
    getDateTime: () => string;
    savePreference: (data: any) => Promise<boolean>;
    deletePreference: (data?: any) => Promise<boolean>;
    getPreferences: () => Promise<PreferenceData | undefined>;
    saveRecording: (blob: Blob) => Promise<string | undefined>;
    readFileData: (filePath: string) => Promise<Buffer | false>;
    saveImageBuffer: (canvas: HTMLCanvasElement, path: string, url?: string | null) => Promise<boolean | string>;
}
export interface Api2Type {
    saveKeyChain: (keychain: any) => Promise<any>;
    getKeyChain: (account?: string) => Promise<any>;
    resetKeyChain: (accounts: any) => Promise<any>;
    appVersion: () => Promise<string>;
    appIsDev: () => Promise<boolean>;
    sendChatMessage: (message: string, model: string, options: any) => Promise<any>;
    showSaveDialog: (options: SaveDialogOptions) => Promise<any>;
    showOpenDialog: (options: OpenDialogOptions) => Promise<any>;
    attachFiles: () => Promise<any>;
    getAvailableModels: () => Promise<string[]>;
    getSettings: () => Promise<any>;
    saveSettings: (settings: any) => Promise<void>;
    getTheme: () => Promise<string>;
    setTheme: (theme: string) => Promise<void>;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<void>;
    saveCodeToFile: (code: string, filePath: string) => Promise<void>;
    loadCodeFromFile: (filePath: string) => Promise<string>;
    getConversations: () => Promise<Conversation[]>;
    saveConversation: (conversation: Conversation) => Promise<void>;
    deleteConversation: (conversationId: string) => Promise<void>;
    onChatResponse: (callback: (response: any) => void) => () => void;
    onError: (callback: (error: any) => void) => () => void;
    onThemeChange: (callback: (theme: string) => void) => () => void;
}
export interface CmdType {
    execute: (command: string, options?: CommandOptions) => Promise<CommandResult>;
}
declare global {
    interface Window {
        global: Window;
        desk: {
            api: ApiType;
            api2: Api2Type;
            agent: AgentType;
            cmd: CmdType;
            fsops: any;
            path: typeof path;
            fs: typeof fs;
            sessionmanager: SessionManagerType;
            lockmanager: LockManagerType;
        };
    }
    interface DocumentEventMap {
        'NewConversation': CustomEvent<{
            type?: string;
        }>;
        'ThemeChange': CustomEvent;
    }
}
//# sourceMappingURL=preload.type.d.ts.map