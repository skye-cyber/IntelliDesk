"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const child_process_1 = require("child_process");
const buffer_1 = require("buffer");
const filesystem_1 = require("./utils/filesystem");
const datetime_1 = require("./utils/datetime");
const ToolAgent_1 = require("./utils/ToolAgent");
// import { dbManager } from './utils/db/DatabaseManager';
const electron_2 = require("electron");
const preload_type_1 = require("./preload.type");
const SessionManager_1 = require("./utils/SessionManager");
const shared_1 = require("./utils/shared");
const Manager_1 = require("./utils/PromptManager/Manager");
// Global variables
let ConversationId = "";
let profile = "";
let ConversationHistory;
window.global = window;
electron_1.contextBridge.exposeInMainWorld('global', window);
try {
    ;
    if (fs_1.default.statfsSync(shared_1.USER_PREFERENCE_CONFIG_FILE)) {
        const settings = fs_1.default.readFileSync(shared_1.USER_PREFERENCE_CONFIG_FILE, 'utf-8');
        profile = (settings ? JSON.parse(settings).profile : '');
    }
}
catch (err) {
    if (!profile)
        profile = '';
}
const conversation_root = shared_1.STORE_DIR;
let config = {
    verbosity: "normal",
    userProfile: profile,
    capabilities: {
        multimodal: false,
        reasoning: false,
        tools: true,
        ocr: false
    }
};
let DEFAULT_SYSTEM_PROMPT = Manager_1.SystemPrompt.generate(config);
config = undefined;
ConversationHistory = {
    metadata: {
        model: preload_type_1.ModelType.multimodal,
        type: preload_type_1.ConversationType.normal,
        name: '',
        id: ConversationId,
        sessionId: null,
        created_at: (0, datetime_1.getformatDateTime)(),
        updated_at: (0, datetime_1.getformatDateTime)(),
        highlight: ''
    },
    chats: []
};
const api = {
    getDownloadsPath: () => {
        return shared_1.DEFAULT_DOWNLOAD_PATH;
    },
    home_dir: () => {
        return os_1.default.homedir();
    },
    mkdir: async (dir) => {
        try {
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir);
            }
            return true;
        }
        catch (err) {
            console.log(err);
            return false;
        }
    },
    write: async (path, data) => {
        try {
            let dataToSave = JSON.parse(JSON.stringify(data));
            if (dataToSave.chats[0].role === 'system') {
                dataToSave.chats.shift();
            }
            const fileData = JSON.stringify(dataToSave, null, 2);
            fs_1.default.writeFileSync(path, fileData);
            return ConversationHistory;
        }
        catch (err) {
            console.log(err);
            return ConversationHistory;
        }
    },
    read: async (fpath) => {
        try {
            if (!fpath)
                return false;
            const rdata = fs_1.default.readFileSync(fpath, 'utf-8');
            let jdata = rdata ? JSON.parse(rdata) : '';
            if (jdata?.chats[0].role === "system") {
                jdata.chats.shift();
            }
            return jdata;
        }
        catch (err) {
            console.log(err);
        }
    },
    readDir: async (dir) => {
        try {
            return fs_1.default.readdirSync(dir);
        }
        catch (err) {
            console.log(err);
            return false;
        }
    },
    stat: (filePath) => {
        try {
            return fs_1.default.statSync(filePath);
        }
        catch (err) {
            console.error(err);
            return false;
        }
    },
    getExt: (file) => {
        return path_1.default.extname(file);
    },
    getBasename: (_path, ext) => {
        return path_1.default.basename(_path, ext);
    },
    joinPath: (node, child) => {
        return path_1.default.join(node, child);
    },
    RenameFile: (old_name, new_name, base_dir = conversation_root) => {
        try {
            fs_1.default.renameSync(path_1.default.join(base_dir, `${old_name}.json`), path_1.default.join(base_dir, `${new_name}.json`));
            return true;
        }
        catch (err) {
            console.log(err);
            return false;
        }
    },
    RenameConversation: async (id, name, base_dir = conversation_root) => {
        console.log(name, id);
        try {
            const fpath = path_1.default.join(base_dir, `${id}.json`);
            let data = await api.read(fpath);
            if (!data)
                return ConversationHistory;
            data.metadata.name = name;
            ConversationHistory = data;
            api.saveConversation();
            return true;
        }
        catch (err) {
            console.log(err);
            return ConversationHistory;
        }
    },
    readStore: async () => {
        const files = await api.readDir(shared_1.STORE_DIR);
        if (!files)
            return [];
        return files;
    },
    validateStore: async () => {
        const files = await api.readDir(shared_1.STORE_DIR);
        if (!files)
            return false;
        return files.length > 0;
    },
    loadConversation: async (id) => {
        const filepath = path_1.default.join(shared_1.STORE_DIR, `${id}.json`);
        // Check if file exists
        if (!api.stat(filepath))
            return undefined;
        const data = await api.read(filepath);
        if (!data)
            return undefined;
        api.setConversation(data);
        return ConversationHistory;
    },
    deleteChat: (id, base_dir = conversation_root) => {
        try {
            if (!id)
                id = ConversationHistory.metadata.id;
            const file = path_1.default.join(base_dir, `${id}.json`);
            if (fs_1.default.statSync(file)) {
                // Delete session and lock first
                const sessionId = ConversationHistory.metadata.sessionId;
                if (sessionId)
                    SessionManager_1.SessionManager.delete(sessionId);
                fs_1.default.rmSync(file);
                return true;
            }
            else {
                console.log('Item not found');
                return false;
            }
        }
        catch (err) {
            //console.log(err);
            return false;
        }
    },
    updateSystemPrompt: async (isMultimodal = false, isReasoning = false, hasToolCalls = false, hasOCR = false) => {
        const userPreferences = await api.getUserSettings();
        const config = {
            verbosity: "normal",
            userProfile: userPreferences ? userPreferences.profile : "",
            capabilities: {
                multimodal: isMultimodal,
                reasoning: isReasoning,
                tools: hasToolCalls,
                ocr: hasOCR
            }
        };
        const prompt = Manager_1.SystemPrompt.generate(config);
        if (ConversationHistory.chats.length > 1) {
            if (api.getRoleByIndex(0) !== preload_type_1.MessageRole.system)
                return false;
            if (Array.isArray(ConversationHistory.chats[0].content)) {
                ConversationHistory.chats[0].content[0].text = prompt;
            }
            else {
                ConversationHistory.chats[0].content = prompt;
            }
        }
        console.log("Prompt", prompt);
        return true;
    },
    addHistory: (item) => {
        try {
            if (typeof item !== "object") {
                console.log("Invalid conversation item");
                return ConversationHistory;
            }
            ConversationHistory.chats.push(item);
            // Create session here and Update sessionId to avoid session creation refresh that endup unused
            if (!ConversationHistory.metadata.sessionId) {
                ConversationHistory.metadata.sessionId = SessionManager_1.SessionManager.create(ConversationId).sessionId;
            }
            if (!ConversationHistory.metadata.highlight) {
                if (ConversationHistory.metadata.model !== preload_type_1.ModelType.chat) {
                    if (item && item?.content && item.content.length > 0) {
                        if (typeof item?.content[0] == 'object' && item?.content[0].text && typeof (item?.content[0].text) === "string") {
                            const highlight = item?.content[0].text.split(' ').slice(0, 8).join(' ').replace(/`/, '');
                            ConversationHistory.metadata.highlight = highlight;
                        }
                    }
                }
                else {
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
            ConversationHistory.metadata.updated_at = (0, datetime_1.getformatDateTime)();
            api.saveConversation();
            return ConversationHistory;
        }
        catch (err) {
            return ConversationHistory;
        }
    },
    getHistory: (filter = false) => {
        const data = filter ? ConversationHistory.chats : ConversationHistory;
        return data;
    },
    popHistory: (role = null) => {
        try {
            if (!role) {
                ConversationHistory.chats.pop();
            }
            else if (preload_type_1.MessageRole[ConversationHistory.chats?.slice(-1)[0]?.role] === role) {
                console.log("B4pop:", ConversationHistory.chats.length);
                ConversationHistory.chats.pop();
                console.log("Pop:", ConversationHistory.chats.length);
            }
            ConversationHistory.metadata.updated_at = (0, datetime_1.getformatDateTime)();
            return ConversationHistory;
        }
        catch (err) {
            return ConversationHistory;
        }
    },
    getModel: () => {
        return ConversationHistory.metadata.model;
    },
    setModel: (model) => {
        try {
            model = model?.toLocaleLowerCase();
            if (!['chat', 'multimodal'].includes(model))
                return;
            ConversationHistory.metadata.model = preload_type_1.ModelType[model];
            if (ConversationHistory.chats[0].role === preload_type_1.MessageRole.system) {
                // all other model types except chat use array
                ConversationHistory.chats[0] = (model !== preload_type_1.ModelType.chat)
                    ? { role: preload_type_1.MessageRole.system, content: [{ type: "text", text: DEFAULT_SYSTEM_PROMPT }] }
                    : { role: preload_type_1.MessageRole.system, content: DEFAULT_SYSTEM_PROMPT };
            }
        }
        catch (error) {
            console.log(error);
        }
    },
    clean: (data) => {
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
                        .filter((item) => item !== null);
                }
                else if (typeof content === 'string') {
                    if (content.slice(-1) === ']') {
                        content = content.substring(0, content.length - 22);
                    }
                    content = content.trim();
                }
                else {
                    content = '';
                }
                const isEmpty = (Array.isArray(content) && content.length === 0) || (typeof content === 'string' && !content);
                if (isEmpty)
                    return null;
                return { role: item.role, content };
            })
                .filter(Boolean);
            if (!cleaned_chats.length)
                return null;
            return { ...chat, chats: cleaned_chats };
        }
        catch (err) {
            console.log(err);
            return data;
        }
    },
    getmetadata: (file) => {
        try {
            if (!file)
                return ConversationHistory.metadata;
            const fpath = path_1.default.join(conversation_root, file);
            if (!api.stat(fpath))
                return;
            const rdata = fs_1.default.readFileSync(fpath, 'utf-8');
            return rdata ? JSON.parse(rdata)?.metadata : undefined;
        }
        catch (err) {
            console.log(err, file);
            return undefined;
        }
    },
    updateModel: (modeltype) => {
        if (modeltype && preload_type_1.ModelType[modeltype]) {
            ConversationHistory.metadata.model = modeltype;
            return ConversationHistory.metadata;
        }
        return undefined;
    },
    getRoleByIndex: (index) => {
        try {
            if (index === -1)
                return ConversationHistory.chats.slice(-1)[0].role;
            return ConversationHistory.chats[index].role;
        }
        catch (err) {
            return undefined;
        }
    },
    updateName: (name, save = true) => {
        try {
            if (!name?.trim())
                return ConversationHistory.metadata.name;
            ConversationHistory.metadata.name = name;
            if (save)
                api.saveConversation();
            return ConversationHistory.metadata.name;
        }
        catch (err) {
            return ConversationHistory.metadata.name;
        }
    },
    updateContinueHistory: (item) => {
        try {
            if (!item) {
                console.log('Conversation item is null');
                return;
            }
            if (ConversationHistory.chats.slice(-1)[0].role === "user")
                api.popHistory();
            if (ConversationHistory.chats.slice(-1)[0].role === "assistant") {
                const target_ai_response = JSON.parse(JSON.stringify(ConversationHistory)).chats.slice(-1)[0];
                api.popHistory();
                if (typeof target_ai_response.content === "object" && Array.isArray(target_ai_response.content)) {
                    const new_text = `${target_ai_response.content[0].text} ${item.content[0].text}`;
                    target_ai_response.content[0] = { type: "text", text: new_text };
                }
                else {
                    const new_text = `${target_ai_response.content} ${item.content}`;
                    target_ai_response.content = new_text;
                }
                if (target_ai_response)
                    api.addHistory(target_ai_response);
            }
        }
        catch (error) {
            console.error(error);
            return false;
        }
    },
    clearAllImages: (history) => {
        try {
            return history.chats.map(item => {
                const cleanedContent = item.content.filter(val => val.type === "text").map(textContent => ({
                    ...textContent,
                    text: textContent.text.trim()
                }));
                return {
                    ...item,
                    content: cleanedContent
                };
            });
        }
        catch (err) {
            return false;
        }
    },
    clearImages: (history) => {
        try {
            const cleanedHistory = history.chats.map(item => {
                const cleanedContent = item.content
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
            if (lastMessage &&
                lastMessage.role === "user" &&
                lastMessage.content.some(val => ["image_url", "file_url"].includes(val.type))) {
                cleanedHistory[cleanedHistory.length - 1] = lastMessage;
            }
            return cleanedHistory;
        }
        catch (err) {
            return false;
        }
    },
    startNew: (model, temporary) => {
        ConversationId = api.generateUUID();
        ConversationHistory.metadata = {
            model: preload_type_1.ModelType[model],
            id: ConversationId,
            created_at: (0, datetime_1.getformatDateTime)(),
            updated_at: (0, datetime_1.getformatDateTime)(),
            sessionId: null,
            type: temporary ? preload_type_1.ConversationType.temporary : preload_type_1.ConversationType.temporary,
            name: ConversationHistory.metadata.name,
            highlight: ConversationHistory.metadata.highlight
        };
        if (model)
            ConversationHistory.metadata.model = preload_type_1.ModelType[model];
        if (model !== preload_type_1.ModelType.chat) {
            ConversationHistory.chats = [{ role: preload_type_1.MessageRole.system, content: [{ type: "text", text: DEFAULT_SYSTEM_PROMPT }] }];
        }
        else {
            ConversationHistory.chats = [{ role: preload_type_1.MessageRole.system, content: DEFAULT_SYSTEM_PROMPT }];
        }
        // if (!temporary) api.saveConversation(); save shoul be done after conversation has some history to avoid blank files
        return ConversationId;
    },
    saveConversation: async () => {
        let conversationId = ConversationHistory.metadata.id;
        if (!conversationId) {
            console.log("No conversationid create new:", ConversationHistory);
            conversationId = api.generateUUID();
        }
        const filePath = `${conversation_root}/${conversationId}.json`;
        try {
            if (ConversationHistory.metadata.type === preload_type_1.ConversationType.temporary) {
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
        }
        catch (err) {
            console.error('Error saving conversation:', err);
            return filePath;
        }
    },
    upgradeToArrayModel: (data = null, save = true) => {
        let histroy = data ? data : ConversationHistory;
        histroy.chats.filter((chat) => {
            if (!Array.isArray(chat.content)) {
                chat.content = [{ type: 'text', text: chat.content }];
            }
        });
        if (!data) {
            ConversationHistory = histroy;
        }
        if (save) {
            api.saveConversation();
        }
        return histroy;
    },
    generateUUID: () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    getConversationId: () => {
        return ConversationId;
    },
    setConversationId: (id) => {
        ConversationId = id;
    },
    setConversation: (data, id) => {
        try {
            if (data.chats[0]?.role !== preload_type_1.MessageRole.system)
                data.chats.unshift({ role: preload_type_1.MessageRole.system, content: DEFAULT_SYSTEM_PROMPT });
            ConversationHistory = data;
            ConversationId = id ? id : data.metadata.id;
            return true;
        }
        catch (err) {
            return false;
        }
    },
    send: (channel, data) => {
        const validChannels = ['dispatch-to-main-process', 'Notify'];
        if (validChannels.includes(channel)) {
            electron_1.ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        const validChannels = ['reply-from-main-process', 'from-main-process-ToVision', 'from-main-process-ToChat'];
        if (validChannels.includes(channel)) {
            electron_1.ipcRenderer.on(channel, (_, ...args) => func(...args));
        }
    },
    ThemeChangeDispatch: () => {
        const event = new CustomEvent('ThemeChange');
        document.dispatchEvent(event);
    },
    getNewChatUUId: () => {
        return ConversationId;
    },
    saveAndOpenImage: (downloadsPath, dataUrl) => {
        fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const buffer = buffer_1.Buffer.from(reader.result);
                const outputPath = path_1.default.join(downloadsPath, 'IntelliDesk-output.jpg');
                fs_1.default.writeFile(outputPath, buffer, (err) => {
                    if (err) {
                        console.error('Error saving image:', err);
                    }
                    else {
                        electron_2.shell.openPath(outputPath);
                    }
                });
            };
            reader.readAsArrayBuffer(blob);
        })
            .catch((error) => {
            console.error('Error creating blob:', error);
        });
    },
    cleanFile: async (file) => {
        try {
            const data = await fs_1.default.promises.readFile(file, 'utf-8');
            const parsedData = JSON.parse(data);
            parsedData.chats.forEach((res) => {
                if (res.role === "user") {
                    if (parsedData.chats[parsedData.chats.indexOf(res) + 1].role !== "assistant") {
                        // console.log("Pair: !index", parsedData.chats.indexOf(res) + 1);
                        parsedData.chats.slice(parsedData.chats.indexOf(res), parsedData.chats.indexOf(res) + 1).values();
                    }
                    else if (parsedData.chats[parsedData.chats.indexOf(res) + 1].role === "assistant") {
                        console.log("Pair: OK", parsedData.chats.indexOf(res));
                    }
                }
            });
            return true;
        }
        catch (err) {
            console.error(err);
            return false; // or return undefined
        }
    },
    getDateTime: () => {
        return (0, datetime_1.getformatDateTime)(true);
    },
    saveUserSettings: async (data) => {
        try {
            fs_1.default.writeFileSync(shared_1.USER_PREFERENCE_CONFIG_FILE, JSON.stringify(data));
            return true;
        }
        catch (err) {
            return false;
        }
    },
    deleteUserSettings: async () => {
        try {
            fs_1.default.rmSync(shared_1.USER_PREFERENCE_CONFIG_FILE);
            return true;
        }
        catch (err) {
            console.log(err);
            return false;
        }
    },
    getUserSettings: async () => {
        try {
            if (fs_1.default.statfsSync(shared_1.USER_PREFERENCE_CONFIG_FILE)) {
                const prefData = fs_1.default.readFileSync(shared_1.USER_PREFERENCE_CONFIG_FILE, 'utf-8');
                return JSON.parse(prefData);
            }
            return undefined;
        }
        catch (err) {
            return undefined;
        }
    },
    saveRecording: async (blob) => {
        try {
            const randomFname = `hfaudio_${Math.random().toString(36).substring(1, 12)}`;
            const savePath = path_1.default.join(shared_1.CACHE_DIR, `${randomFname}.wav`);
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = buffer_1.Buffer.from(arrayBuffer);
            fs_1.default.writeFileSync(savePath, buffer);
            console.log(`File saved at ${savePath}`);
            return savePath;
        }
        catch (err) {
            console.log(err);
            return undefined;
        }
    },
    readFileData: async (filePath) => {
        if (!fs_1.default.existsSync(filePath)) {
            return false;
        }
        const data = fs_1.default.readFileSync(filePath);
        return data;
    },
    saveImageBuffer: async (canvas, path, _ = null) => {
        try {
            return new Promise((resolve, reject) => {
                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        reject(new Error('Canvas to Blob returned null'));
                        return;
                    }
                    try {
                        const arrayBuffer = await blob.arrayBuffer();
                        const buffer = buffer_1.Buffer.from(arrayBuffer);
                        const response = await electron_1.ipcRenderer.invoke('save-dg-As-PNG', buffer, path);
                        resolve(response === true);
                    }
                    catch (err) {
                        reject(err);
                    }
                }, 'image/png');
            });
        }
        catch (err) {
            console.log(err);
            return 'Runtime error: Failed to save image';
        }
    }
};
const api2 = {
    saveKeyChain: async (keychain) => electron_1.ipcRenderer.invoke('save-key-chain', keychain),
    getKeyChain: async (account = 'mistral') => electron_1.ipcRenderer.invoke('get-key-chain', account),
    resetKeyChain: async (accounts) => electron_1.ipcRenderer.invoke('reset-key-chain', accounts),
    appVersion: async () => electron_1.ipcRenderer.invoke('get-app-version'),
    appIsDev: async () => electron_1.ipcRenderer.invoke('get-dev-status'),
    sendChatMessage: (message, model, options) => electron_1.ipcRenderer.invoke('send-chat-message', { message, model, options }),
    showSaveDialog: (options) => electron_1.ipcRenderer.invoke('show-save-dialog', options),
    showOpenDialog: (options) => electron_1.ipcRenderer.invoke('show-open-dialog', options),
    attachFiles: () => electron_1.ipcRenderer.invoke('attach-files'),
    getAvailableModels: () => electron_1.ipcRenderer.invoke('get-available-models'),
    getSettings: () => electron_1.ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => electron_1.ipcRenderer.invoke('save-settings', settings),
    getTheme: () => electron_1.ipcRenderer.invoke('get-theme'),
    setTheme: (theme) => electron_1.ipcRenderer.invoke('set-theme', theme),
    startRecording: () => electron_1.ipcRenderer.invoke('start-recording'),
    stopRecording: () => electron_1.ipcRenderer.invoke('stop-recording'),
    saveCodeToFile: (code, filePath) => electron_1.ipcRenderer.invoke('save-code-to-file', { code, filePath }),
    loadCodeFromFile: (filePath) => electron_1.ipcRenderer.invoke('load-code-from-file', { filePath }),
    getConversations: () => electron_1.ipcRenderer.invoke('get-conversations'),
    saveConversation: (conversation) => electron_1.ipcRenderer.invoke('save-conversation', conversation),
    deleteConversation: (conversationId) => electron_1.ipcRenderer.invoke('delete-conversation', conversationId),
    onChatResponse: (callback) => {
        electron_1.ipcRenderer.on('chat-response', (_, response) => callback(response));
        return () => electron_1.ipcRenderer.removeAllListeners('chat-response');
    },
    onError: (callback) => {
        electron_1.ipcRenderer.on('chat-error', (_, error) => callback(error));
        return () => electron_1.ipcRenderer.removeAllListeners('chat-error');
    },
    onThemeChange: (callback) => {
        electron_1.ipcRenderer.on('theme-changed', (_, theme) => callback(theme));
        return () => electron_1.ipcRenderer.removeAllListeners('theme-changed');
    }
};
// {
//     encoding: 'utf8',
//     ...options
// },
const cmd = {
    execute: (command, _ = {}) => {
        return new Promise((resolve) => {
            (0, child_process_1.exec)(command, (error, stdout, stderr) => {
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
electron_1.contextBridge.exposeInMainWorld('desk', {
    api,
    api2,
    agent: ToolAgent_1.Agent,
    cmd,
    fsops: filesystem_1.fsOperations,
    path: path_1.default,
    fs: fs_1.default,
    sessionmanager: SessionManager_1.SessionManager,
    lockmanager: SessionManager_1.LockManager
    // dbManager
});
document.addEventListener('DOMContentLoaded', function () {
    ConversationHistory.chats = [{ role: preload_type_1.MessageRole.system, content: DEFAULT_SYSTEM_PROMPT }];
    ConversationId = api.generateUUID();
    ConversationHistory.metadata.id = ConversationId;
});
document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey && event.key === 'D') || (event.ctrlKey && event.key === 'd')) {
        electron_1.ipcRenderer.invoke('show-documentation');
    }
});
window.addEventListener('onbeforeunload', () => {
    console.log("onUnload: Clear session");
    alert("Clear session");
    const sessonId = ConversationHistory.metadata.sessionId;
    if (!sessonId)
        return;
    SessionManager_1.SessionManager.clear(sessonId);
});
//# sourceMappingURL=preload.js.map