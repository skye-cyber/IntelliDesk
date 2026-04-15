import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec, ExecException } from 'child_process';
import { Buffer } from 'buffer';
import { fsOperations as fsops } from "./utils/filesystem";
import { getformatDateTime } from './utils/datetime';
import { Agent as agent } from './utils/ToolAgent';
// import { dbManager } from './utils/db/DatabaseManager';
import { shell } from 'electron';
import {
    type ConversationMetadata,
    type ChatMessage,
    type Conversation,
    type UserSettingsData,
    type SaveDialogOptions,
    // KeyChainOptions,
    type OpenDialogOptions,
    type CommandOptions,
    type CommandResult,
    type ApiType,
    type Api2Type,
    type CmdType,
    MessageRole,
    ModelType,
    ConversationType,
    // ChatContent
} from './preload.type';
import { SessionManager as sessionmanager, LockManager as lockmanager } from './utils/SessionManager';
import { USER_PREFERENCE_CONFIG_FILE, STORE_DIR, DEFAULT_DOWNLOAD_PATH, CACHE_DIR } from './utils/shared';
import { PromptConfig, SystemPrompt } from './utils/PromptManager/Manager';

// Global variables
let ConversationId: string = "";
let profile: string = "";
let ConversationHistory: Conversation;


window.global = window;

contextBridge.exposeInMainWorld('global', window);

try {
    ;
    if (fs.statfsSync(USER_PREFERENCE_CONFIG_FILE)) {
        const settings = fs.readFileSync(USER_PREFERENCE_CONFIG_FILE, 'utf-8');
        profile = (settings ? (JSON.parse(settings) as UserSettingsData).profile : '') as string;
    }
} catch (err) {
    if (!profile) profile = '';
}

const conversation_root: string = STORE_DIR
let config: PromptConfig|undefined = {
    verbosity: "normal",
    userProfile: profile,
    capabilities: {
        multimodal: false,
        reasoning: false,
        tools: true,
        ocr: false
    }
};
let DEFAULT_SYSTEM_PROMPT: string = SystemPrompt.generate(config);
config = undefined

ConversationHistory = {
    metadata: {
        model: ModelType.multimodal,
        type: ConversationType.normal,
        name: '',
        id: ConversationId,
        sessionId: null,
        created_at: getformatDateTime(),
        updated_at: getformatDateTime(),
        highlight: ''
    },
    chats: []
};

const api: ApiType = {
    getDownloadsPath: (): string => {
        return DEFAULT_DOWNLOAD_PATH;
    },
    home_dir: (): string => {
        return os.homedir();
    },
    mkdir: async (dir: string): Promise<boolean> => {
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    },
    write: async (path: string, data: Conversation): Promise<Conversation> => {
        try {
            let dataToSave = JSON.parse(JSON.stringify(data));

            if (dataToSave.chats[0].role === 'system') {
                dataToSave.chats.shift();
            }

            const fileData = JSON.stringify(dataToSave, null, 2);
            fs.writeFileSync(path, fileData);
            return ConversationHistory;
        } catch (err) {
            console.log(err);
            return ConversationHistory;
        }
    },
    read: async (fpath: string): Promise<any> => {
        try {
            if (!fpath) return false;
            const rdata = fs.readFileSync(fpath, 'utf-8');
            let jdata = rdata ? JSON.parse(rdata) : '';

            if (jdata?.chats[0].role === "system") {
                jdata.chats.shift();
            }
            return jdata;
        } catch (err) {
            console.log(err);
        }
    },
    readDir: async (dir: string): Promise<string[] | false> => {
        try {
            return fs.readdirSync(dir);
        } catch (err) {
            console.log(err);
            return false;
        }
    },
    stat: (filePath: string): fs.Stats | false => {
        try {
            return fs.statSync(filePath);
        } catch (err) {
            console.error(err);
            return false;
        }
    },
    getExt: (file: string): string => {
        return path.extname(file);
    },
    getBasename: (_path: string, ext?: string): string => {
        return path.basename(_path, ext);
    },
    joinPath: (node: string, child: string): string => {
        return path.join(node, child);
    },
    RenameFile: (old_name: string, new_name: string, base_dir: string = conversation_root): boolean => {
        try {
            fs.renameSync(path.join(base_dir, `${old_name}.json`), path.join(base_dir, `${new_name}.json`));
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    },
    RenameConversation: async (id: string, name: string, base_dir: string = conversation_root): Promise<Conversation | boolean> => {
        console.log(name, id)
        try {
            const fpath = path.join(base_dir, `${id}.json`);
            let data = await api.read(fpath);
            if (!data) return ConversationHistory;

            data.metadata.name = name;
            ConversationHistory = data
            api.saveConversation();
            return true;
        } catch (err) {
            console.log(err);
            return ConversationHistory;
        }
    },
    readStore: async (): Promise<string[]> => {
        const files = await api.readDir(STORE_DIR)
        if (!files) return []
        return files
    },
    validateStore: async (): Promise<boolean> => {
        const files = await api.readDir(STORE_DIR)
        if (!files) return false
        return files.length > 0
    },
    loadConversation: async (id: string): Promise<Conversation | undefined> => {
        const filepath = path.join(STORE_DIR, `${id}.json`)
        // Check if file exists
        if (!api.stat(filepath)) return undefined
        const data: Conversation = await api.read(filepath)
        if (!data) return undefined
        api.setConversation(data)
        return ConversationHistory
    },
    deleteChat: (id: string | undefined, base_dir: string = conversation_root): boolean | undefined => {
        try {
            if (!id) id = ConversationHistory.metadata.id
            const file = path.join(base_dir, `${id}.json`);
            if (fs.statSync(file)) {
                // Delete session and lock first
                const sessionId = ConversationHistory.metadata.sessionId
                if (sessionId) sessionmanager.delete(sessionId)
                fs.rmSync(file);
                return true;
            } else {
                console.log('Item not found');
                return false;
            }
        } catch (err) {
            //console.log(err);
            return false
        }
    },
    updateSystemPrompt: async (isMultimodal: boolean = false, isReasoning: boolean = false, hasToolCalls: boolean = false, hasOCR: boolean = false): Promise<boolean> => {
        const userPreferences = await api.getUserSettings()
        const config: PromptConfig = {
            verbosity: "normal",
            userProfile: userPreferences ? userPreferences.profile : "",
            capabilities: {
                multimodal: isMultimodal,
                reasoning: isReasoning,
                tools: hasToolCalls,
                ocr: hasOCR
            }
        };
        const prompt = SystemPrompt.generate(config)
        if (ConversationHistory.chats.length > 1) {
            if (api.getRoleByIndex(0) !== MessageRole.system) return false
            if (Array.isArray(ConversationHistory.chats[0].content)) {
                ConversationHistory.chats[0].content[0].text = prompt
            }else{
                ConversationHistory.chats[0].content = prompt
            }
        }
        console.log("Prompt", prompt)
        return true
    },
    addHistory: (item: ChatMessage): Conversation => {
        try {
            if (typeof item !== "object") {
                console.log("Invalid conversation item");
                return ConversationHistory;
            }

            ConversationHistory.chats.push(item);

            // Create session here and Update sessionId to avoid session creation refresh that endup unused
            if (!ConversationHistory.metadata.sessionId) {
                ConversationHistory.metadata.sessionId = sessionmanager.create(ConversationId).sessionId
            }
            if (!ConversationHistory.metadata.highlight) {
                if (ConversationHistory.metadata.model !== ModelType.chat) {
                    if (item && item?.content && item.content.length > 0) {
                        if (typeof item?.content[0] == 'object' && item?.content[0].text && typeof (item?.content[0].text) === "string") {

                            const highlight = item?.content[0].text.split(' ').slice(0, 8).join(' ').replace(/`/, '');
                            ConversationHistory.metadata.highlight = highlight;
                        }
                    }
                } else {
                    if (typeof (item?.content) === "string") {
                        const highlight = item?.content?.split(' ').slice(0, 8).join(' ').replace(/`/, '');
                        ConversationHistory.metadata.highlight = highlight;
                    }
                }
            }
            if (ConversationHistory.metadata.type === "temporary") {
                console.log("In temporary chat Not saving!");
                return ConversationHistory;
            }

            ConversationHistory.metadata.updated_at = getformatDateTime();
            api.saveConversation();
            return ConversationHistory;
        } catch (err) {
            return ConversationHistory;
        }
    },
    getHistory: (filter: boolean = false): Conversation | ChatMessage[] => {
        const data = filter ? ConversationHistory.chats : ConversationHistory;
        return data;
    },
    popHistory: (role: string | null = null): Conversation => {
        try {
            if (!role) {
                ConversationHistory.chats.pop();
            } else if (MessageRole[ConversationHistory.chats?.slice(-1)[0]?.role] === role as MessageRole) {
                ConversationHistory.chats.pop();
            }
            ConversationHistory.metadata.updated_at = getformatDateTime();
            return ConversationHistory;
        } catch (err) {
            return ConversationHistory;
        }
    },
    getModel: (): string => {
        return ConversationHistory.metadata.model;
    },
    setModel: (model: string): void => {
        try {
            model = model?.toLocaleLowerCase();
            if (!['chat', 'multimodal'].includes(model)) return;

            ConversationHistory.metadata.model = ModelType[model as ModelType];

            if (ConversationHistory.chats[0].role === MessageRole.system) {
                // all other model types except chat use array
                ConversationHistory.chats[0] = (model !== ModelType.chat)
                    ? { role: MessageRole.system, content: [{ type: "text", text: DEFAULT_SYSTEM_PROMPT }] }
                    : { role: MessageRole.system, content: DEFAULT_SYSTEM_PROMPT };
            }
        } catch (error) {
            console.log(error);
        }
    },
    clean: (data: Conversation): Conversation | null => {
        try {
            const chat = data;
            const cleaned_chats = chat.chats
                .map(item => {
                    let content = item?.content;

                    if (Array.isArray(content)) {
                        content = content
                            .map(part => {
                                let text = part?.text || '';
                                if (text.slice(-1) === ']') {
                                    text = text.substring(0, text.length - 22);
                                }
                                text = text.trim();
                                return text ? { type: part?.type || 'text', text } : null;
                            })
                            .filter((item): item is { type: string; text: string } => item !== null);
                    } else if (typeof content === 'string') {
                        if (content.slice(-1) === ']') {
                            content = content.substring(0, content.length - 22);
                        }
                        content = content.trim();
                    } else {
                        content = '';
                    }

                    const isEmpty = (Array.isArray(content) && content.length === 0) || (typeof content === 'string' && !content);
                    if (isEmpty) return null;

                    return { role: item.role, content };
                })
                .filter(Boolean);

            if (!cleaned_chats.length) return null;
            return { ...chat, chats: cleaned_chats as ChatMessage[] };
        } catch (err) {
            console.log(err);
            return data;
        }
    },
    getmetadata: (file?: string | undefined | null): ConversationMetadata | undefined => {
        try {
            if (!file) return ConversationHistory.metadata
            const fpath = path.join(conversation_root, file);
            if (!api.stat(fpath)) return;
            const rdata = fs.readFileSync(fpath, 'utf-8');
            return rdata ? JSON.parse(rdata)?.metadata : undefined;
        } catch (err) {
            console.log(err, file);
            return undefined
        }
    },
    updateModel: (modeltype: string|ModelType): ConversationMetadata | undefined=>{
        if(modeltype && ModelType[modeltype as ModelType]){
            ConversationHistory.metadata.model = modeltype as ModelType
            return ConversationHistory.metadata
        }
        return undefined
    },
    getRoleByIndex: (index: number): MessageRole | undefined => {
        try {
            if (index === -1) return ConversationHistory.chats.slice(-1)[0].role
            return ConversationHistory.chats[index].role
        } catch (err) {
            return undefined
        }
    },
    updateName: (name: string, save: boolean = true): string | undefined => {
        try {
            if (!name?.trim()) return ConversationHistory.metadata.name;
            ConversationHistory.metadata.name = name;
            if (save) api.saveConversation();
            return ConversationHistory.metadata.name;
        } catch (err) {
            return ConversationHistory.metadata.name;
        }
    },
    updateContinueHistory: (item: ChatMessage): void | false => {
        try {
            if (!item) {
                console.log('Conversation item is null');
                return;
            }

            if (ConversationHistory.chats.slice(-1)[0].role === "user") api.popHistory();

            if (ConversationHistory.chats.slice(-1)[0].role === "assistant") {
                const target_ai_response = JSON.parse(JSON.stringify(ConversationHistory)).chats.slice(-1)[0];
                api.popHistory();

                if (typeof target_ai_response.content === "object" && Array.isArray(target_ai_response.content)) {
                    const new_text = `${target_ai_response.content[0].text} ${(item.content as any)[0].text}`;
                    target_ai_response.content[0] = { type: "text", text: new_text };
                } else {
                    const new_text = `${target_ai_response.content} ${item.content}`;
                    target_ai_response.content = new_text;
                }
                if (target_ai_response) api.addHistory(target_ai_response);
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    clearAllImages: (history: Conversation): any[] | false => {
        try {
            return history.chats.map(item => {
                const cleanedContent = (item.content as any[]).filter(val => val.type === "text").map(textContent => ({
                    ...textContent,
                    text: textContent.text.trim()
                }));
                return {
                    ...item,
                    content: cleanedContent
                };
            });
        } catch (err) {
            return false;
        }
    },
    clearImages: (history: Conversation): any[] | false => {
        try {
            const cleanedHistory = history.chats.map(item => {
                const cleanedContent = (item.content as any[])
                    .filter(val => val.type === "text")
                    .map(textContent => ({
                        ...textContent,
                        text: textContent.text.trim()
                    }));
                return {
                    ...item,
                    content: cleanedContent
                };
            });

            const lastMessage = history.chats[history.chats.length - 1];
            if (
                lastMessage &&
                lastMessage.role === "user" &&
                (lastMessage.content as any[]).some(val => ["image_url", "file_url"].includes(val.type))
            ) {
                (cleanedHistory as any)[cleanedHistory.length - 1] = lastMessage;
            }

            return cleanedHistory;
        } catch (err) {
            return false;
        }
    },
    startNew: (model: ModelType, temporary: boolean): string => {
        ConversationId = api.generateUUID();
        ConversationHistory.metadata = {
            model: ModelType[model as ModelType],
            id: ConversationId,
            created_at: getformatDateTime(),
            updated_at: getformatDateTime(),
            sessionId: null,
            type: temporary ? ConversationType.temporary : ConversationType.temporary,
            name: ConversationHistory.metadata.name,
            highlight: ConversationHistory.metadata.highlight
        };
        if (model) ConversationHistory.metadata.model = ModelType[model]
        if (model !== ModelType.chat) {
            ConversationHistory.chats = [{ role: MessageRole.system, content: [{ type: "text", text: DEFAULT_SYSTEM_PROMPT }] }];
        } else {
            ConversationHistory.chats = [{ role: MessageRole.system, content: DEFAULT_SYSTEM_PROMPT }];
        }
        // if (!temporary) api.saveConversation(); save shoul be done after conversation has some history to avoid blank files
        return ConversationId
    },
    saveConversation: async (): Promise<string> => {
        let conversationId = ConversationHistory.metadata.id
        if (!conversationId) {
            console.log("No conversationid create new:", ConversationHistory)
            conversationId = api.generateUUID()
        }
        const filePath = `${conversation_root}/${conversationId}.json`;
        try {
            if (ConversationHistory.metadata.type === ConversationType.temporary) {
                console.log("In temporary chat Not saving");
                return filePath;
            }
            // console.log(ConversationHistory.chats)
            // Actually save the conversation data to file
            if (ConversationHistory.chats.length > 1) {
                await api.write(filePath, ConversationHistory);
            }
            // console.log(`Conversation saved: ${conversationId}`);
            return filePath;
        } catch (err) {
            console.error('Error saving conversation:', err);
            return filePath;
        }
    },
    upgradeToArrayModel: (data: Conversation | null | undefined = null, save: boolean = true): Conversation => {
        let histroy = data ? data : ConversationHistory
        histroy.chats.filter((chat) => {
            if (!Array.isArray(chat.content)) {
                chat.content = [{ type: 'text', text: chat.content }]
            }
        })
        if (!data) {
            ConversationHistory = histroy
        }
        if (save) {
            api.saveConversation()
        }
        return histroy
    },
    generateUUID: (): string => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    getConversationId: (): string => {
        return ConversationId;
    },
    setConversationId: (id: string): void => {
        ConversationId = id;
    },
    setConversation: (data: Conversation, id?: string): boolean => {
        try {
            if (data.chats[0]?.role !== MessageRole.system) data.chats.unshift({ role: MessageRole.system, content: DEFAULT_SYSTEM_PROMPT });
            ConversationHistory = data;
            ConversationId = id ? id : data.metadata.id;
            return true
        } catch (err) {
            return false
        }
    },
    send: (channel: string, data: any): void => {
        const validChannels = ['dispatch-to-main-process', 'Notify'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel: string, func: (...args: any[]) => void): void => {
        const validChannels = ['reply-from-main-process', 'from-main-process-ToVision', 'from-main-process-ToChat'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (_: IpcRendererEvent, ...args: any[]) => func(...args));
        }
    },
    ThemeChangeDispatch: (): void => {
        const event = new CustomEvent('ThemeChange');
        document.dispatchEvent(event);
    },
    getNewChatUUId: (): string => {
        return ConversationId;
    },
    saveAndOpenImage: (downloadsPath: string, dataUrl: string): void => {
        fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const buffer = Buffer.from(reader.result as ArrayBuffer);
                    const outputPath = path.join(downloadsPath, 'IntelliDesk-output.jpg');
                    fs.writeFile(outputPath, buffer, (err) => {
                        if (err) {
                            console.error('Error saving image:', err);
                        } else {
                            shell.openPath(outputPath);
                        }
                    });
                };
                reader.readAsArrayBuffer(blob);
            })
            .catch((error) => {
                console.error('Error creating blob:', error);
            });
    },
    cleanFile: async (file: string): Promise<boolean | undefined> => {
        try {
            const data = await fs.promises.readFile(file, 'utf-8');
            const parsedData = JSON.parse(data);
            parsedData.chats.forEach((res: any) => {
                if (res.role === "user") {
                    if (parsedData.chats[parsedData.chats.indexOf(res) + 1].role !== "assistant") {
                        // console.log("Pair: !index", parsedData.chats.indexOf(res) + 1);
                        parsedData.chats.slice(parsedData.chats.indexOf(res), parsedData.chats.indexOf(res) + 1).values();
                    } else if (parsedData.chats[parsedData.chats.indexOf(res) + 1].role === "assistant") {
                        console.log("Pair: OK", parsedData.chats.indexOf(res));
                    }
                }
            });
            return true;
        } catch (err) {
            console.error(err);
            return false; // or return undefined
        }
    },
    getDateTime: (): string => {
        return getformatDateTime(true);
    },
    saveUserSettings: async (data: any): Promise<boolean> => {
        try {
            fs.writeFileSync(USER_PREFERENCE_CONFIG_FILE, JSON.stringify(data));
            return true;
        } catch (err) {
            return false;
        }
    },
    deleteUserSettings: async (): Promise<boolean> => {
        try {
            fs.rmSync(USER_PREFERENCE_CONFIG_FILE);
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    },
    getUserSettings: async (): Promise<UserSettingsData | undefined> => {
        try {
            if (fs.statfsSync(USER_PREFERENCE_CONFIG_FILE)) {
                const prefData = fs.readFileSync(USER_PREFERENCE_CONFIG_FILE, 'utf-8');
                return JSON.parse(prefData);
            }
            return undefined
        } catch (err) {
            return undefined
        }
    },
    saveRecording: async (blob: Blob): Promise<string | undefined> => {
        try {
            const randomFname = `hfaudio_${Math.random().toString(36).substring(1, 12)}`;
            const savePath = path.join(CACHE_DIR, `${randomFname}.wav`);

            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            fs.writeFileSync(savePath, buffer);
            console.log(`File saved at ${savePath}`);
            return savePath;
        } catch (err) {
            console.log(err);
            return undefined
        }
    },
    readFileData: async (filePath: string): Promise<Buffer | false> => {
        if (!fs.existsSync(filePath)) {
            return false;
        }
        const data = fs.readFileSync(filePath);
        return data;
    },
    saveImageBuffer: async (canvas: HTMLCanvasElement, path: string, _: string | null = null): Promise<boolean | string> => {
        try {
            return new Promise((resolve, reject) => {
                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        reject(new Error('Canvas to Blob returned null'));
                        return;
                    }

                    try {
                        const arrayBuffer = await blob.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        const response = await ipcRenderer.invoke('save-dg-As-PNG', buffer, path);
                        resolve(response === true);
                    } catch (err) {
                        reject(err);
                    }
                }, 'image/png');
            });
        } catch (err) {
            console.log(err);
            return 'Runtime error: Failed to save image';
        }
    }
};

const api2: Api2Type = {
    saveKeyChain: async (keychain: any): Promise<any> => ipcRenderer.invoke('save-key-chain', keychain),
    getKeyChain: async (account: string = 'mistral'): Promise<any> => ipcRenderer.invoke('get-key-chain', account),
    resetKeyChain: async (accounts: any): Promise<any> => ipcRenderer.invoke('reset-key-chain', accounts),
    appVersion: async (): Promise<string> => ipcRenderer.invoke('get-app-version'),
    appIsDev: async (): Promise<boolean> => ipcRenderer.invoke('get-dev-status'),
    sendChatMessage: (message: string, model: string, options: any): Promise<any> => ipcRenderer.invoke('send-chat-message', { message, model, options }),
    showSaveDialog: (options: SaveDialogOptions): Promise<any> => ipcRenderer.invoke('show-save-dialog', options),
    showOpenDialog: (options: OpenDialogOptions): Promise<any> => ipcRenderer.invoke('show-open-dialog', options),
    attachFiles: (): Promise<any> => ipcRenderer.invoke('attach-files'),
    getAvailableModels: (): Promise<string[]> => ipcRenderer.invoke('get-available-models'),
    getSettings: (): Promise<any> => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings: any): Promise<void> => ipcRenderer.invoke('save-settings', settings),
    getTheme: (): Promise<string> => ipcRenderer.invoke('get-theme'),
    setTheme: (theme: string): Promise<void> => ipcRenderer.invoke('set-theme', theme),
    startRecording: (): Promise<void> => ipcRenderer.invoke('start-recording'),
    stopRecording: (): Promise<void> => ipcRenderer.invoke('stop-recording'),
    saveCodeToFile: (code: string, filePath: string): Promise<void> => ipcRenderer.invoke('save-code-to-file', { code, filePath }),
    loadCodeFromFile: (filePath: string): Promise<string> => ipcRenderer.invoke('load-code-from-file', { filePath }),
    getConversations: (): Promise<Conversation[]> => ipcRenderer.invoke('get-conversations'),
    saveConversation: (conversation: Conversation): Promise<void> => ipcRenderer.invoke('save-conversation', conversation),
    deleteConversation: (conversationId: string): Promise<void> => ipcRenderer.invoke('delete-conversation', conversationId),
    onChatResponse: (callback: (response: any) => void): () => void => {
        ipcRenderer.on('chat-response', (_: IpcRendererEvent, response: any) => callback(response));
        return () => ipcRenderer.removeAllListeners('chat-response');
    },
    onError: (callback: (error: any) => void): () => void => {
        ipcRenderer.on('chat-error', (_: IpcRendererEvent, error: any) => callback(error));
        return () => ipcRenderer.removeAllListeners('chat-error');
    },
    onThemeChange: (callback: (theme: string) => void): () => void => {
        ipcRenderer.on('theme-changed', (_: IpcRendererEvent, theme: string) => callback(theme));
        return () => ipcRenderer.removeAllListeners('theme-changed');
    }
};

// {
//     encoding: 'utf8',
//     ...options
// },

const cmd: CmdType = {
    execute: (command: string, _: CommandOptions = {}): Promise<CommandResult> => {
        return new Promise((resolve) => {
            exec(command, (error: ExecException | null, stdout: string, stderr: string) => {
                resolve({
                    success: !error,
                    error: error,
                    stdout: stdout || '',
                    stderr: stderr || '',
                    code: error ? (error.code || 1) : 0,
                    message: error || stderr ? error?.message || "Command exited with an error" : 'Command executed successfully'
                });
            });
        });
    }
};

contextBridge.exposeInMainWorld('desk', {
    api,
    api2,
    agent,
    cmd,
    fsops,
    path,
    fs,
    sessionmanager,
    lockmanager
    // dbManager
});

document.addEventListener('DOMContentLoaded', function() {
    ConversationHistory.chats = [{ role: MessageRole.system, content: DEFAULT_SYSTEM_PROMPT }];
    ConversationId = api.generateUUID();
    ConversationHistory.metadata.id = ConversationId;
});

document.addEventListener('keydown', (event: KeyboardEvent) => {
    if ((event.ctrlKey && event.key === 'D') || (event.ctrlKey && event.key === 'd')) {
        ipcRenderer.invoke('show-documentation');
    }
});

window.addEventListener('onbeforeunload', () => {
    console.log("onUnload: Clear session")
    alert("Clear session")
    const sessonId = ConversationHistory.metadata.sessionId
    if (!sessonId) return
    sessionmanager.clear(sessonId)
})
