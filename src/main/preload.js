const { contextBridge, ipcRenderer, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Buffer } = require('node:buffer');
const { command } = require('./system.js')
const { getformatDateTime } = require('./utils.js');

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

let ConversationHistory =
{
    metadata: {
        model: 'chat',
        type: 'normal',
        name: '',
        id: ConversationId,
        created_at: getformatDateTime(),
        updated_at: getformatDateTime(),
        highlight: ''
    },
    chats: []
}


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
            if (dataToSave.chats[0].role === 'system') {
                dataToSave.chats.shift();
            }

            dataToSave = api.clean(dataToSave);
            const fileData = JSON.stringify(dataToSave, null, 2);

            fs.writeFileSync(path, fileData);
            return ConversationHistory;
        } catch (err) {
            console.log(err);
            return ConversationHistory;
        }
    },
    read: async (fpath) => {
        try {
            if (!fpath) return false
            const rdata = fs.readFileSync(fpath, 'utf-8')
            let jdata = rdata ? JSON.parse(rdata) : '';

            // Add compartibility feature to maintain conversations instegrity!
            if (jdata?.chats[0].role === "system") {
                jdata.chats.shift()
            }
            return jdata
        } catch (err) {
            console.log(err);
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
            if (!data) return ConversationHistory

            data.metadata.name = name

            api.saveConversation(data, id)
            return true
        } catch (err) {
            console.log(err)
            return ConversationHistory
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
        try {
            if (!typeof (item) === "object") return console.log("Invalid conversation item")

            ConversationHistory.chats.push(item)

            if (!ConversationHistory.metadata.highlight) {
                if (ConversationHistory.metadata.model === "multimodal") {
                    if (item?.content?.type && typeof (item?.content?.text) === "string") {
                        highlight = item?.content?.split(' ').slice(0, 8).join(' ')
                        ConversationHistory.metadata.highlight = highlight
                    }
                } else {
                    if (typeof (item?.content) === "string") {
                        highlight = item?.content?.split(' ').slice(0, 8).join(' ')
                        ConversationHistory.metadata.highlight = highlight
                    }
                }
            }
            if (ConversationHistory.metadata.type === "temporary") return console.log("In temporary chat Not saving!")

            // Update update created_at
            ConversationHistory.metadata.updated_at = getformatDateTime()
            // Save to file
            api.saveConversation(ConversationHistory)
            return ConversationHistory
        } catch (err) {
            return ConversationHistory
        }
    },
    getHistory: (filter = false) => {
        const data = filter ? ConversationHistory.chats : ConversationHistory;

        return data
    },
    popHistory: (role = null) => {
        try {
            if (!role) {
                ConversationHistory.chats.pop();
            } else if (ConversationHistory.chats?.slice(-1)[0]?.role === role) {
                ConversationHistory.chats.pop();
                //console.log("Done, resting!")
            }
            // Update update created_at
            ConversationHistory.metadata.updated_at = getformatDateTime()
            return ConversationHistory
        } catch (err) {
            return ConversationHistory
        }
    },
    getModel: () => {
        return ConversationHistory.metadata.model
    },
    setModel: (model) => {
        try {
            model = model?.toLocaleLowerCase()

            if (!['chat', 'multimodal'].includes(model)) return

            ConversationHistory.metadata.model = model

            if (ConversationHistory.chats[0].role === 'system') {
                ConversationHistory.chats[0] = (model === "multimodal")
                    ? { role: "system", content: [{ type: "text", text: system_command }] }
                    : { role: "system", content: system_command }
            }
        } catch (error) {
            console.log(error)
            return ConversationHistory
        }
    },
    clean: (data) => {
        try {
            // Handle single conversation object instead of array
            const chat = data;
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

            // If no valid chats, return null or handle as needed
            if (!cleaned_chats.length) return null;

            return { ...chat, chats: cleaned_chats };
        } catch (err) {
            console.log(err);
            // Return the original data or handle error appropriately
            return data;
        }
    },
    getmetadata: (file) => {
        try {
            const fpath = path.join(conversation_root, file)
            if (!api.stat(fpath)) return;
            const rdata = fs.readFileSync(fpath, 'utf-8')
            return rdata ? JSON.parse(rdata)?.metadata : ''
        } catch (err) {
            console.log(err)
        }
    },
    updateName: (name, save = true) => {
        try {
            if (!name?.trim()) return ConversationHistory;
            //console.log("Rename conversation to:", name)
            ConversationHistory.metadata.name = name
            if (save) api.saveConversation(ConversationHistory)
            return ConversationHistory
        } catch (err) {
            return ConversationHistory
        }
    },
    updateContinueHistory: (item) => {
        try {
            if (!item) return console.log('Conversation item is null')
            //console.log(ConversationHistory.chats.slice(-1)[0])
            if (ConversationHistory.chats.slice(-1)[0].role === "user") api.popHistory() // Remove user message

            if (ConversationHistory.chats.slice(-1)[0].role === "assistant") {
                const target_ai_response = JSON.parse(JSON.stringify(ConversationHistory))[0].chats.slice(-1)[0] // Clone content to avoid mutation
                api.popHistory() // Remove the ai response

                if (target_ai_response.content === "object" && Array.isArray(target_ai_response.content)) {
                    const new_text = `${target_ai_response.content[0].text} ${item.content[0].text}`
                    target_ai_response.content[0] = { type: "text", text: new_text }
                } else {
                    const new_text = `${target_ai_response.content} ${item.content}`
                    target_ai_response.content = new_text
                }
                //console.log(JSON.stringify(target_ai_response))
                if (target_ai_response) api.addHistory(target_ai_response)
            }
        } catch (error) {
            console.error(error)
            return false
        }
    },
    clearAllImages: (history) => {
        try {
            // Convert history to array and process each message
            return history.chats.map(item => {
                // Extract text content only and filter out image content
                const cleanedContent = item.content.filter(val => val.type === "text").map(textContent => ({
                    ...textContent,
                    // Process text further
                    text: textContent.text.trim() // Remove extra whitespace
                }));

                // Return the cleaned item with only text content
                return {
                    ...item,
                    content: cleanedContent
                };
            });
        } catch (err) {
            return false
        }
    },
    clearImages: (history) => {
        try {
            // Clean all messages by removing non-text content
            const cleanedHistory = history.chats.map(item => {
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
            const lastMessage = history.chats[history.chats.length - 1];

            // Messages have a property role that distinguishes user messages,
            // and if the user message contains any image data
            if (
                lastMessage &&
                lastMessage.role === "user" &&  // adjust property if your structure differs
                lastMessage.content.some(val => ["image_url", "file_url"].includes(val.type))
            ) {
                // Replace the cleaned version of the last message with the original last message
                cleanedHistory.chats[cleanedHistory.chats.length - 1] = lastMessage;
            }

            return cleanedHistory;
        } catch (err) {
            return false
        }
    },
    CreateNew: (conversation, model) => {
        if (!ConversationId) ConversationId = api.generateUUID()
        ConversationHistory.chats = conversation
        ConversationHistory.metadata =
        {
            model: model,
            id: ConversationId,
            created_at: getformatDateTime(),
            updated_at: getformatDateTime()
        }
        api.saveConversation(ConversationHistory)
    },
    saveConversation: async (conversationData, conversationId = ConversationId) => {
        const filePath = `${conversation_root}/${conversationId}.json`;
        //console.log(JSON.stringify(conversationData))
        try {
            if (ConversationHistory.metadata.type === "temporary") return console.log("In temporary chat Not saving")
            //console.log("Saving: " + conversationId + filePath)
            await api.write(filePath, conversationData);
            return filePath
        } catch (err) {
            console.error('Error saving conversation:', err);
            return filePath
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
        if (data.chats[0]?.role !== 'system') data.chats.unshift({ role: 'system', content: system_command })
        ConversationHistory = data;
        ConversationId = id ? id : data.metadata.id;
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
            data.chats.forEach(res => {
                // console.log(data)
                if (res.role === "user") {

                    if (data.chats[data.chats.indexOf(res) + 1].role !== "assistant") {
                        console.log("Pair: !index", data.chats.indexOf(res) + 1)
                        data.chats.slice(data.chats.indexOf(res), data.chats.indexOf(res) + 1).values()
                    } else if (data.chats[data.chats.indexOf(res) + 1].role === "assistant") {
                        console.log("Pair: OK", data.chats.indexOf(res))
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
    ConversationHistory.chats = [{ role: "system", content: system_command }];
    ConversationId = api.generateUUID()

    ConversationHistory.metadata.id = ConversationId
})

document.addEventListener('NewConversation', function(e) {
    //console.log("NewConversation Event Recieved")

    const details = e.detail

    if (details?.type?.toLocaleLowerCase() === "temporary") ConversationHistory.metadata.type = "temporary";

    ConversationId = api.generateUUID()
    ConversationHistory.chats = [{ role: "system", content: system_command }]
    ConversationHistory.metadata.id = ConversationId
})


document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'D' || event.ctrlKey && event.key === 'd') {
        //event.preventDefault(); // Prevent any default action
        ipcRenderer.invoke('show-documentation')
    }
});
