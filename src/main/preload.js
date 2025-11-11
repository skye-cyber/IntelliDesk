const { contextBridge, ipcRenderer, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Buffer } = require('node:buffer');
const { command } = require('./system.js')
const { getformatDateTime } = require('./utils.js')

let ConversationId = "";

window.global = window;

contextBridge.exposeInMainWorld('global', window);

try {
    const _fpath = path.join(os.homedir(), '.IntelliDesk/.config/.preference.json')
    if (fs.statfsSync(_fpath)) {
        const rprofile = fs.readFileSync(_fpath, 'utf-8')
        var profile = rprofile ? JSON.parse(rprofile)?.data?.preference : ''
    }
} catch (err) {
    if (!profile) profile = ''
}

const conversation_root = path.join(os.homedir(), '.IntelliDesk/.store')

let system_command = new command(profile).standard()

let ConversationHistory = [
    {
        metadata: {
            model: 'chat',
            type: 'normal',
            name: '',
            id: ConversationId,
            timestamp: getformatDateTime(),
            highlight: ''
        },
        chats: []
    }
]

const api = {
    getDownloadsPath: () => {
        const downloadsPath = path.join(os.homedir(), 'Downloads');
        return downloadsPath;
    },
    home_dir: () => {
        return os.homedir();
    },
    mkdir: async (dir) => {
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
    write: async (path, data) => {
        try {
            // Create a deep clone to avoid mutating original
            let dataToSave = JSON.parse(JSON.stringify(data));

            // Remove system instructions from clone only
            if (dataToSave[0].chats[0].role === 'system') {
                dataToSave[0].chats.shift();
            }

            dataToSave = api.clean(dataToSave);
            const fileData = JSON.stringify(dataToSave, null, 2);

            fs.writeFileSync(path, fileData);
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    },
    read: async (fpath) => {
        try {
            if (!fpath) return false
            const rdata = fs.readFileSync(fpath, 'utf-8')
            let jdata = rdata ? JSON.parse(rdata) : '';

            // Add compartibility feature to maintain conversations instegrity!
            if (jdata[0]?.chats[0].role === "system") {
                jdata[0].chats.shift()
            }
            return jdata
        } catch (err) {
            console.log(err);
            return false;
        }
    },
    readDir: async (dir) => {
        try {
            return fs.readdirSync(dir);
        } catch (err) {
            console.log(err);
            return false;
        }
    },
    stat: (filePath) => {
        try {
            return fs.statSync(filePath);
        } catch (err) {
            console.error(err);
            return false
        }
    },
    getExt: (file) => {
        return path.extname(file);
    },
    getBasename: (_path, ext) => {
        return path.basename(_path, ext);
    },
    joinPath: (node, child) => {
        return path.join(node, child);
    },
    RenameFile: (old_name, new_name, base_dir = conversation_root) => {
        try {
            fs.renameSync(path.join(base_dir, `${old_name}.json`), path.join(base_dir, `${new_name}.json`))
            return true
        } catch (err) {
            console.log(err)
            return false
        }
    },
    RenameConversation: async (id, name, base_dir = conversation_root) => {
        try {
            const fpath = path.join(base_dir, `${id}.json`)

            let data = await api.read(fpath)
            if (!data) return false

            data[0].metadata.name = name

            api.saveConversation(data, id)
            return true
        } catch (err) {
            console.log(err)
            return false
        }
    },
    deleteChat: (id, base_dir = conversation_root) => {
        try {
            const file = path.join(base_dir, `${id}.json`)
            if (fs.statSync(file)) {
                fs.rmSync(file)
                // Move the item to the trash
                //trash([file])
                return true
            } else {
                console.log('Item not found')
                return false
            }
        } catch (err) {
            console.log(err);
        }
    },
    addHistory: (item) => {
        if (!typeof (item) === "object") return console.log("Invalid conversation item")

        ConversationHistory[0].chats.push(item)

        if (!ConversationHistory[0].metadata.highlight) {
            ConversationHistory[0].metadata.highlight = item?.content.slice(0, 15)
        }
        if (ConversationHistory[0].metadata.type === "temporary") return console.log("In temporary chat Not saving!")
        console.log(JSON.stringify(ConversationHistory[0].chats))

        // Save to file
        api.saveConversation(ConversationHistory)
    },
    getHistory: (filter = false) => {
        console.log(JSON.stringify(ConversationHistory[0].chats))

        const data = filter ? ConversationHistory[0].chats : ConversationHistory;
        console.log(JSON.stringify(data))

        return data
    },
    popHistory: () => {
        ConversationHistory[0].chats.pop();
    },
    getModel: () => {
        return ConversationHistory[0].metadata.model
    },
    setModel: (model) => {
        try {
            model = model?.toLocaleLowerCase()

            if (!['chat', 'multimodal'].includes(model)) return

            ConversationHistory[0].metadata.model = model

            if (ConversationHistory[0].chats[0].role === 'system') {
                ConversationHistory[0].chats[0] = (model === "multimodal")
                    ? { role: "system", content: [{ type: "text", text: system_command }] }
                    : { role: "system", content: system_command }
            }
        } catch (error) {
            console.log(error)
            return false
        }
    },
    clean: (chats) => {
        return chats
            .map(chat => {
                const cleaned_chats = chat.chats
                    .map(item => {
                        let content = item?.content;

                        // Handle array-type content
                        if (Array.isArray(content)) {
                            content = content
                                .map(part => {
                                    let text = part?.text || '';

                                    // Apply your slice rule
                                    if (text.slice(-1) === ']') {
                                        text = text.substring(0, text.length - 22);
                                    }

                                    text = text.trim();
                                    return text ? { type: part?.type || 'text', text } : null;
                                })
                                .filter(Boolean);
                        }

                        // Handle string-type content
                        else if (typeof content === 'string') {
                            if (content.slice(-1) === ']') {
                                content = content.substring(0, content.length - 22);
                            }
                            content = content.trim();
                        }

                        // Invalid or empty content
                        else {
                            content = '';
                        }

                        // Skip empty entries
                        const isEmpty =
                            (Array.isArray(content) && content.length === 0) ||
                            (typeof content === 'string' && !content);

                        if (isEmpty) return null;

                        return { role: item.role, content };
                    })
                    .filter(Boolean); // remove nulls

                // Skip chats with no messages
                if (!cleaned_chats.length) return null;

                return { ...chat, chats: cleaned_chats };
            })
            .filter(Boolean); // remove empty chat objects
    },
    getmetadata: (file) => {
        try {
            const fpath = path.join(conversation_root, file)
            if (!api.stat(fpath)) return;
            const rdata = fs.readFileSync(fpath, 'utf-8')
            return rdata ? JSON.parse(rdata)[0]?.metadata : ''
        } catch (err) {
            return false
        }
    },
    updateName: (name, save = true) => {
        try {
            if (!name?.trim()) return false;
            console.log("Rename conversation to:", name)
            ConversationHistory[0].metadata.name = name
            if (save) api.saveConversation(ConversationHistory)
            return true
        } catch (err) {
            return false
        }
    },
    clearAllImages: (history) => {
        // Convert history to array and process each message
        return history[0].chats.map(item => {
            // Extract text content only and filter out image content
            const cleanedContent = item.content.filter(val => val.type === "text").map(textContent => ({
                ...textContent,
                // Optional: Process text further if needed
                text: textContent.text.trim() // Remove extra whitespace
            }));

            // Return the cleaned item with only text content
            return {
                ...item,
                content: cleanedContent
            };
        });
    },
    clearImages: (history) => {
        // Clean all messages by removing non-text content
        const cleanedHistory = history[0].chats.map(item => {
            const cleanedContent = item.content
                .filter(val => val.type === "text")
                .map(textContent => ({
                    ...textContent,
                    // Remove extra whitespace from text
                    text: textContent.text.trim()
                }));
            return {
                ...item,
                content: cleanedContent
            };
        });

        // Access the original last message before cleaning
        const lastMessage = history[history.length - 1];

        // Assuming messages have a property (for example: role) that distinguishes user messages,
        // and if the user message contains any image data
        if (
            lastMessage &&
            lastMessage.role === "user" &&  // adjust property if your structure differs
            lastMessage.content.some(val => ["image_url", "file_url"].includes(val.type))
        ) {
            // Replace the cleaned version of the last message with the original last message
            cleanedHistory[cleanedHistory.length - 1] = lastMessage;
        }

        return cleanedHistory;
    },
    CreateNew: (conversation, model) => {
        if (!ConversationId) ConversationId = api.generateUUID()
        ConversationHistory[0].chats = conversation
        ConversationHistory[0].metadata =
        {
            model: model,
            id: ConversationId,
            timestamp: getformatDateTime()
        }
        api.saveConversation(ConversationHistory)
    },
    saveConversation: async (conversationData, conversationId = ConversationId) => {
        const filePath = `${conversation_root}/${conversationId}.json`;
        //console.log(JSON.stringify(conversationData))
        try {
            if (ConversationHistory[0].metadata.type === "temporary") return console.log("In temporary chat Not saving")
            //console.log("Saving: " + conversationId + filePath)
            await api.write(filePath, conversationData);
            return filePath
        } catch (err) {
            console.error('Error saving conversation:', err);
        }
    },
    generateUUID: () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID(); // ✅ Modern secure UUID (v4)
        }

        // 🧩 Fallback for older browsers or runtimes
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
        //api.saveConversation(data, data[0].metadata.id)
        console.log("Setting conv")
        if (data[0].chats[0]?.role !== 'system') data[0].chats.unshift({ role: 'system', content: system_command })
        ConversationHistory = data;
        ConversationId = id ? id : data[0].metadata.id;
    },
    send: (channel, data) => {
        // List of valid channels
        const validChannels = ['dispatch-to-main-process', 'Notify'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        const validChannels = ['reply-from-main-process', 'from-main-process-ToVision', 'from-main-process-ToChat'];
        if (validChannels.includes(channel)) {
            // Strip event as it includes `sender` and other properties
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
    ThemeChangeDispatch: () => {
        // Dispatch a custom event 'animationReady' on the element
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
                    const buffer = Buffer.from(reader.result);
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

    cleanFile: async (file) => {
        fs.readFileSync(file, (err, data) => {
            if (err) throw err;
            data = JSON.parse(data);
            //for (let [i, res] of data.e)
            data[0].chats.forEach(res => {
                // console.log(data)
                if (res.role === "user") {

                    if (data[data.indexOf(res) + 1].role !== "assistant") {
                        console.log("Pair: !index", data.indexOf(res) + 1)
                        data.slice(data.indexOf(res), data.indexOf(res) + 1).values()
                    } else if (data[data.indexOf(res) + 1].role === "assistant") {
                        console.log("Pair: OK", data.indexOf(res))
                    }
                }
            })
            return true
        });
    },
    getDateTime: () => {
        return getformatDateTime(true);
    },
    savePreference: async (data) => {
        try {
            const skeleton = {
                data: data
            }
            const prefFile = ".preference.json"
            const prefPath = path.join(os.homedir(), '.IntelliDesk/.config');
            try {
                fs.mkdirSync(prefPath, { recursive: true });
                //console.log(`Directory created: ${prefPath}`);
            } catch (error) {
                console.error(`Error creating directory: ${error.message}`);
            }
            const prefFpath = path.join(prefPath, prefFile);
            fs.writeFileSync(prefFpath, JSON.stringify(skeleton));
            return true
        } catch (err) {
            //console.log(err);
            return false
        }
    },
    deletePreference: async (data = null) => {
        try {
            const prefPath = path.join(os.homedir(), '.IntelliDesk/.config/.preference.json');
            fs.rmSync(prefPath, data);
            return true
        } catch (err) {
            console.log(err);
            return false
        }
    },
    getPreferences: async () => {
        try {
            const _fpath = path.join(os.homedir(), '.IntelliDesk/.config/.preference.json')
            if (fs.statfsSync(_fpath)) {
                const prefData = fs.readFileSync(_fpath, 'utf-8')
                //console.log(JSON.parse(prefData))
                return JSON.parse(prefData)
            }
        } catch (err) {
            //console.log(err)
        }
    },
    saveRecording: async (blob) => {
        try {
            const randomFname = `hfaudio_${Math.random().toString(36).substring(1, 12)}`;
            const savePath = path.join(os.homedir(), `.IntelliDesk/.cache/${randomFname}.wav`)
            // Extract the directory path from the file path
            const dirPath = path.dirname(savePath);

            // Create the directory if it doesn't exist
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                console.log(`Directory '${dirPath}' created.`);
            }
            // Convert Blob to ArrayBuffer
            const arrayBuffer = await blob.arrayBuffer();

            // Convert ArrayBuffer to Buffer
            const buffer = Buffer.from(arrayBuffer);

            // Write the Buffer to a file
            fs.writeFileSync(savePath, buffer);
            console.log(`File saved at ${savePath}`);
            return savePath
        } catch (err) {
            console.log(err)
        }
    },
    readFileData: async (filePath) => {
        if (!fs.existsSync(filePath)) {
            return false
        }
        data = fs.readFileSync(filePath)
        return data
    },
    saveImageBuffer: async (canvas, path, url = null) => {
        try {
            return new Promise((resolve, reject) => {
                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        reject(new Error('Canvas to Blob returned null'));
                        return;
                    }

                    try {
                        // Convert the Blob to an ArrayBuffer
                        const arrayBuffer = await blob.arrayBuffer();
                        // Create a Buffer from the ArrayBuffer
                        const buffer = Buffer.from(arrayBuffer);

                        // Invoke the IPC method to save the image
                        const response = await ipcRenderer.invoke('save-dg-As-PNG', buffer, path);
                        console.log(response)
                        resolve(response === true);
                    } catch (err) {
                        reject(err);
                    }
                }, 'image/png');
            })

        } catch (err) {
            console.log(err)
            return 'Runtime error: Failed to save image'
        }
    }
};

const api2 = {
    saveKeys: async (keys) => ipcRenderer.invoke('save-keys', keys),
    getKeys: async (key = null) => ipcRenderer.invoke('get-keys', key),
    resetKeys: async (accounts) => ipcRenderer.invoke('reset-keys', accounts),
    appVersion: async () => ipcRenderer.invoke('get-app-version',),
    appIsDev: async () => ipcRenderer.invoke('get-dev-status',),

    // Chat functionality
    sendChatMessage: (message, model, options) =>
        ipcRenderer.invoke('send-chat-message', { message, model, options }),

    // File dialogs
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
    attachFiles: () => ipcRenderer.invoke('attach-files'),

    // Model management
    getAvailableModels: () => ipcRenderer.invoke('get-available-models'),

    // Settings
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

    // Theme
    getTheme: () => ipcRenderer.invoke('get-theme'),
    setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),

    // Voice recording
    startRecording: () => ipcRenderer.invoke('start-recording'),
    stopRecording: () => ipcRenderer.invoke('stop-recording'),

    // Code/Canvas
    saveCodeToFile: (code, filePath) => ipcRenderer.invoke('save-code-to-file', { code, filePath }),
    loadCodeFromFile: (filePath) => ipcRenderer.invoke('load-code-from-file', { filePath }),

    // Conversations
    getConversations: () => ipcRenderer.invoke('get-conversations'),
    saveConversation: (conversation) => ipcRenderer.invoke('save-conversation', conversation),
    deleteConversation: (conversationId) => ipcRenderer.invoke('delete-conversation', conversationId),

    // Event listeners for real-time updates
    onChatResponse: (callback) => {
        ipcRenderer.on('chat-response', (event, response) => callback(response));
        return () => ipcRenderer.removeAllListeners('chat-response');
    },

    onError: (callback) => {
        ipcRenderer.on('chat-error', (event, error) => callback(error));
        return () => ipcRenderer.removeAllListeners('chat-error');
    },

    onThemeChange: (callback) => {
        ipcRenderer.on('theme-changed', (event, theme) => callback(theme));
        return () => ipcRenderer.removeAllListeners('theme-changed');
    }
};

contextBridge.exposeInMainWorld('desk', {
    api,
    api2
});

document.addEventListener('DOMContentLoaded', function() {
    //initialize conversation histories when is ready/loaded
    ConversationHistory[0].chats = [{ role: "system", content: system_command }];
    ConversationId = api.generateUUID()

    ConversationHistory[0].metadata.id = ConversationId
})

document.addEventListener('NewConversation', function(e) {
    console.log("NewConversation Event Recieved")

    const details = e.detail

    if (details?.type.toLocaleLowerCase() === "temporary") ConversationHistory[0].metadata.type = "temporary";

    ConversationId = api.generateUUID()
    ConversationHistory[0].chats = [{ role: "system", content: system_command }]
    ConversationHistory[0].metadata.id = ConversationId
})


document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'D' || event.ctrlKey && event.key === 'd') {
        //event.preventDefault(); // Prevent any default action
        ipcRenderer.invoke('show-documentation')
    }
});
