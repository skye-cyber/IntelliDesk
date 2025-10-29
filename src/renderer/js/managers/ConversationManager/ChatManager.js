const { ConversationManager } = require('./ConversationManager.js')

InputPurify = window.InputPurify;

class ChatManager {
    constructor() {
        this.currentConversationId;
        this.storagePath = window.electron.joinPath(window.electron.home_dir(), '.IntelliDesk/.store');
        this.conversationManager = new ConversationManager(storagePath);
        this.activeItem
        this.init()
    }

    init() {
        document.addEventListener('NewConversationOpened', function() {
            this.conversationManager.fetchConversations();
        })

        this.checkAndCreateDirectory();
        // Fetch and display conversations on page load
        //this.conversationManager.fetchConversations();

        // Setup ipc recievers
        this.setupIPCRecievers()

        return this
    }

    // Function to fetch conversation files and display their IDs
    async fetchConversations(conversationsPanel) {
        try {
            const files = await window.electron.readDir(this.storagePath);

            if (files.length > 0) {
                conversationsPanel.innerHTML = ''; // Clear the pane if conversations exist
                // Define the colors you want to cycle through
                const colors = ['bg-amber-500', 'bg-rose-900', 'bg-teal-700', 'bg-red-500', 'bg-blue-500', 'bg-green-600', 'bg-yellow-800', 'bg-purple-500', 'bg-fuchsia-500'];
                for (let [index, file] of files.entries()) {
                    if (window.electron.getExt(file) === '.json') {
                        const conversationId = window.electron.getBasename(file, '.json');
                        const conversationItem = document.createElement('div');
                        const color = (index <= colors.length - 1) ? colors[index] : colors[Math.floor(Math.random() * colors.length)]
                        conversationItem.classList.add('p-2', color, 'transition-transform', "text-black", 'tranform', 'hover:scale-105', 'transition', 'duration-700', 'ease-in-out', 'scale-100', 'infinite', 'hover:bg-blue-800', 'decoration-underline', 'decoration-pink-400', 'dark:decoration-fuchsia-500', 'dark:hover:bg-cyan-700', 'cursor-pointer', 'rounded-lg', "space-y-2", "w-full", "sm:w-[90%]", "md:w-[80%]", "lg:w-[90%]", "whitespace-nowrap", "max-w-full", "overflow-auto", "scrollbar-hide");
                        conversationItem.setAttribute('data-text', conversationId);

                        conversationItem.textContent = conversationId;
                        conversationItem.onclick = () => renderConversationFromFile(conversationItem, conversationId);
                        conversationsPanel.appendChild(conversationItem);

                        //Chat Options
                        conversationItem.addEventListener('contextmenu', (event) => {
                            // Prevent the default context menu
                            event.preventDefault();
                            ConversationAdmin(conversationId)
                        });
                    } else {
                        console.log("No conversations saved!")
                    }
                }
                return true
            }
            return false
        } catch (err) {
            console.error('Error reading conversation files:', err);
            return false
        }
    }

    setupIPCRecievers() {
        // Listen for updates messages from ipc for Chat models and update the history files
        window.electron.receive('fromMain-ToChat', (data) => {
            let Chat = data
            try {
                let conversationId = window.electron.getSuperCId() || window.electron.getNewChatUUId();
                console.log('ChatUpdated::');
                if (Chat.length > 1) {
                    this.conversationManager.saveConversation(Chat, conversationId);
                    console.log("Saved conversation, size:", Chat.length);
                }
            } catch (err) {
                console.log("Outer loop error:", err);
            }

        });


        // Listen for updates messages from ipc for Vision models and update the history files
        window.electron.receive('fromMain-ToVision', (data) => {
            try {
                let VChat = data
                //console.log(JSON.stringify(VChat));
                let VconversationId = window.electron.getSuperCId() || window.electron.getNewVisionUUId()
                console.log("VChatUpdated::");
                if (VChat && VChat.length > 1) {
                    this.conversationManager.saveConversation(VChat, VconversationId);
                    console.log("Saved V conversation, size:", VChat.length);
                } else if (typeof VChat === 'object' && Object.keys(VChat).length > 1) {
                    this.conversationManager.saveConversation(VChat, VconversationId);
                    console.log("Saved V conversation, size length", VChat.length);
                } else {
                    console.log("VChat is not an array or object with more than one entry.");
                }
            } catch (err) {
                console.error("Error in VChatUpdated handler:", err);
            }
        });
    }

    async checkAndCreateDirectory() {
        if (this.storagePath) {
            try {
                // Check if the directory exists
                const exists = await window.electron.mkdir(this.storagePath);
                if (!exists) {
                    console.log("Error creating directory", this.storagePath)
                } else {
                    //console.log('Directory exists');
                }
            } catch (error) {
                console.error('Error checking or creating directory:', error);
            }
        }
    }

    updateActiveConversation(conversationId) {
        this.currentConversationId = conversationId;
        this.showConversationOptions();
    }

    showConversationOptions() {
        try {
            const chatOptionsOverlay = document.getElementById('chatOptions-overlay');
            const chatOptions = document.getElementById('chatOptions');
            chatOptionsOverlay.classList.remove('hidden');
            chatOptions.classList.remove('animate-exit');
            chatOptions.classList.add('animate-enter')
            return true
        } catch (err) {
            return false
        }
    }

    hideConversationOptions() {
        try {
            const chatOptionsOverlay = document.getElementById('chatOptions-overlay');
            const chatOptions = document.getElementById('chatOptions');
            chatOptions.classList.remove('animate-enter')
            chatOptions.classList.add('animate-exit');
            setTimeout(() => {
                chatOptionsOverlay.classList.add('hidden');
            }, 310)
            return true
        } catch (err) {
            return false
        }
    }

    showLoadingModal(message = null) {

        const loadingModal = document.getElementById('loadingModal');
        const modalMainBox = document.getElementById('modalMainBox');

        if (message) {
            const msgBox = document.getElementById('loadingMSG');
            msgBox.textContent = message;
        }
        loadingModal.classList.remove('hidden');
        modalMainBox.classList.remove('animate-exit');
        modalMainBox.classList.add('animate-enter')

    }

    hideLoadingModal() {
        const loadingModal = document.getElementById('loadingModal');
        const modalMainBox = document.getElementById('modalMainBox');
        modalMainBox.classList.remove('animate-enter')
        modalMainBox.classList.add('animate-exit');
        setTimeout(() => {
            loadingModal.classList.add('hidden');
        }, 310)
    }

    RenameConversation(name) {
        this.showLoadingModal(`Renaming ${currentConversationId} ...`);
        try {
            const newName = `${this.currentConversationId[0]}-${name}`;
            const conversationItem = document.querySelector(`[data-text="${currentConversationId}"]`);
            if (conversationItem && newName !== '') {
                const rename = window.electron.Rename(storagePath, currentConversationId, newName);
                if (rename) {
                    conversationItem.textContent = newName;
                    conversationItem.setAttribute('data-text', newName);
                }
            }
            this.hideConversationOptions();
            this.hideConversationOptions();
            this.conversationManager.fetchConversations();
        } catch (err) {
            this.hideConversationOptions()
            console.log("Failed to rename file", err);
        }
    }

    DeleteConversation() {
        this.showLoadingModal(`Deleting ${currentConversationId}`);
        const _delete = window.electron.deleteChat(storagePath, currentConversationId);
        if (_delete) {
            this.hideLoadingModal();
            this.hideConversationOptions();
            window.showDeletionStatus("text-red-400", `Deleted ${currentConversationId}`);
            console.log(`Deleted ${currentConversationId}`);
        } else {
            this.hideConversationOptions();
        }
        // Hide options and refresh
        this.hideConversationOptions();
        this.conversationManager.fetchConversations();
        return _delete
    }

    // Function to render a conversation from a file
    async renderConversationFromFile(item, conversationId) {
        // Remove animation from previous item as it active item is changing
        if (activeItem) {
            activeItem.classList.remove('animate-heartpulse');
        }
        activeItem = item;
        item.classList.add('animate-heartpulse');
        const [conversationData, model] = await conversationManager.loadConversation(conversationId);
        //console.log(conversationData, model)
        if (conversationData) {
            window.electron.setSuperCId(conversationId);  //Set global conversation id to the current conversation id
            //console.log(conversationData)
            conversationManager.renderConversation(conversationData, model);
        } else {
            alert(`Conversation ${conversationId} not found.`);
        }
    }
}

module.exports = { ChatManager };
