import { waitForElement } from '../../Utils/dom_utils.js';
import { ConversationManager } from './ConversationManager.js'

//InputPurify = window.InputPurify;

export class ChatManager {
    constructor() {
        this.currentConversationId;
        this.storagePath = window.desk.api.joinPath(window.desk.api.home_dir(), '.IntelliDesk/.store');
        this.conversationManager = new ConversationManager(this.storagePath);
        this.activeItem
        this.init()
    }

    init() {
        document.addEventListener('NewConversationOpened', function() {
            waitForElement('#conversations', (el) => this.conversationManager.fetchConversations(el));
        })

        this.checkAndCreateDirectory();
        // Fetch and display conversations on page load
        //this.conversationManager.fetchConversations();

        // Setup ipc recievers
        this.setupIPCRecievers()

        return this
    }

    _get_conversation_id() {
        return this._get_conversation_id
    }

    // Function to fetch conversation files and display their IDs
    async fetchConversations(conversationsPanel) {
        if (!conversationsPanel) return false;
        try {
            const files = await window.desk.api.readDir(this.storagePath);
            if (files.length > 0) {
                // Hide only if there are files/conversation items
                document.getElementById('empty-conversations').classList.add('hidden');

                // Define the colors you want to cycle through

                for (let [index, file] of files.entries()) {
                    if (window.desk.api.getExt(file) === '.json') {
                        // Cmpartibility logic for older conversations with C- and V- to denote models
                        let conversationId
                        let timestamp
                        if (file.startsWith('C-') || file.startsWith('C-')) {
                            conversationId = window.desk.api.getBasename(file, '.json');
                        } else {
                            const metadata = window.desk.api.getmetadata(file)
                            conversationId = metadata?.id || metadata?.name
                            timestamp = metadata?.timestamp
                        }

                        const conversationItem = document.createElement('div');
                        conversationItem.className = `conversation-item group`

                        conversationItem.setAttribute('data-text', conversationId);

                        conversationItem.innerHTML = `
                        <div class="flex items-center space-x-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-700/50 cursor-pointer transition-all duration-200">
                            <div class="relative flex-shrink-0">
                                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md">
                                    <span class="text-white font-semibold text-sm">GN</span>
                                </div>
                                <div id="active-dot" class="hidden absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        ${conversationId}
                                    </h3>
                                    <span class="text-xs text-blue-600 dark:text-blue-400 font-medium">${this.formatRelativeTime(timestamp || conversationId)}</span>
                                </div>
                                <p class="text-xs text-gray-600 dark:text-gray-300 truncate mt-1">
                                    Working on the new interface...
                                </p>
                            </div>
                        </div>`

                        conversationItem.onclick = () => this.renderConversationFromFile(conversationItem, conversationId);
                        conversationsPanel.appendChild(conversationItem);

                        //Chat Options
                        conversationItem.addEventListener('contextmenu', (event) => {
                            // Prevent the default context menu
                            event.preventDefault();
                            this.currentConversationId = conversationId
                        });
                    } else {
                        console.log("No conversations saved!")
                    }
                }
                return true
            }
            return false
        } catch (err) {
            throw(err)
            //console.error('Error reading conversation files:', err);
            //return false
        }
    }

    /**
     * Converts a timestamp like "C-24-12-21-10-43-39"
     * into a short relative time like "10min", "2h", "3d", etc.
     */
    formatRelativeTime(code) {
        if (!code || !code.startsWith("C-")) return "Invalid";

        const parts = code.split("-");
        if (parts.length < 7) return "Invalid";

        const [_, yy, MM, dd, hh, mm, ss] = parts.map(Number);
        const fullYear = 2000 + yy; // adjust if your years start from 2000

        // Construct date (assume UTC)
        const date = new Date(fullYear, MM - 1, dd, hh, mm, ss);
        const diff = Date.now() - date.getTime();
        const seconds = Math.floor(diff / 1000);

        if (seconds < 0) return "In the future";
        if (seconds < 5) return "Now";
        if (seconds < 60) return `${seconds}s`;

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}min`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;

        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d`;

        const months = Math.floor(days / 30);
        if (months < 12) return `${months}m`;

        const years = Math.floor(months / 12);
        return `${years}y`;
    }

    setupIPCRecievers() {
        // Listen for updates messages from ipc for Chat models and update the history files
        window.desk.api.receive('fromMain-ToChat', (data) => {
            let Chat = data
            try {
                let conversationId = window.desk.api.getConversationId() || window.desk.api.getNewChatUUId();
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
        window.desk.api.receive('fromMain-ToVision', (data) => {
            try {
                let VChat = data
                //console.log(JSON.stringify(VChat));
                let VconversationId = window.desk.api.getConversationId() || window.desk.api.getNewVisionUUId()
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
                const exists = await window.desk.api.mkdir(this.storagePath);
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
                const rename = window.desk.api.Rename(storagePath, currentConversationId, newName);
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
        const _delete = window.desk.api.deleteChat(storagePath, currentConversationId);
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
        if (this.activeItem) {
            this.activeItem.classList.remove('animate-heartpulse');
            this.activeItem.querySelector('#active-dot').classList.add('hidden')
        }
        this.activeItem = item;
        item.classList.add('animate-heartpulse-slow');
        item.querySelector('#active-dot').classList.remove('hidden')
        const [conversationData, model] = await this.conversationManager.loadConversation(conversationId);
        //console.log(conversationData, model)
        if (conversationData) {
            window.desk.api.setConversationId(conversationId);  //Set global conversation id to the current conversation id
            //console.log(conversationData)
            this.conversationManager.renderConversation(conversationData, model);
        } else {
            window.ModalManager.showMessage(`Conversation ${conversationId} not found.`, 'warning');
        }
    }
}

