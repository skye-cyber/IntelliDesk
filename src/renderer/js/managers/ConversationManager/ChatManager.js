import { waitForElement } from '../../Utils/dom_utils.js';
import { ConversationManager } from './ConversationManager.js'
import { ClosePrefixed } from '../../react-portal-bridge.js';

//InputPurify = window.InputPurify;

function colorMap() {
    //
}

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
            let files = await window.desk.api.readDir(this.storagePath);
            if (files.length > 0) {
                // Hide only if there are files/conversation items
                document.getElementById('empty-conversations').classList.add('hidden');

                // Define the colors you want to cycle through

                for (let [index, file] of files.entries()) {
                    if (window.desk.api.getExt(file) === '.json') {
                        // Cmpartibility logic for older conversations with C- and V- to denote models

                        const metadata = window.desk.api.getmetadata(file)
                        window.reactPortalBridge.showComponentInTarget('ConversationItem', 'conversations', { metadata: metadata }, 'chatItem')

                        /*
                         if (!typeof (metadata) === 'object') continue

                        const conversationId = metadata?.id
                        const timestamp = metadata?.timestamp
                        const highlight = metadata?.highlight || ''
                        const name = metadata?.name || conversationId

                        const conversationItem = document.createElement('div');
                        conversationItem.className = `conversation-item group`
                        conversationItem.id = "chat-item"

                        conversationItem.setAttribute('data-name', conversationId);
                        conversationItem.setAttribute('data-id', name);
                        conversationItem.setAttribute('data-hightlight', highlight);

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
                                    <h3 id="chat-name" class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        ${conversationId}
                                    </h3>
                                    <span class="text-xs text-blue-600 dark:text-blue-400 font-medium">${this.formatRelativeTime(timestamp)}</span>
                                </div>
                                <p id="chat-highlight" class="text-xs text-gray-600 dark:text-gray-300 truncate mt-1">
                                    ${highlight}
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
                            conversationItem.dataset.id = conversationId
                            this.showConversationOptions(event)
                        });
                        */
                    } else {
                        console.log("No conversations saved!")
                    }
                }
                files = null
                return true
            }
            return false
        } catch (err) {
            console.error('Error reading conversation files:', err);
            return false
        }
    }

    /**
     * Converts a timestamp like "24-12-21-10-43-39"
     * into a short relative time like "10min", "2h", "3d", etc.
     */
    formatRelativeTime(code) {
        const datePattern = /^\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/;
        if (!code) return 'invalid';

        if (code.toLocaleLowerCase().startsWith("v-") || code.toLocaleLowerCase().startsWith("v-")) {
            if (!datePattern.test(code.slice(2))) {
                return "Invalid";
            }
            code = code.slice(2)
        }

        const parts = code.split("-");

        if (parts.length < 6) return "Invalid";

        const [yy, MM, dd, hh, mm, ss] = parts.map(Number);
        const fullYear = 2000 + yy; // years starting from 2024

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

    /**
     * DEPRECATED In favour of preload handler via api
     */
    setupIPCRecievers() {
        // DEPRECATED:
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
        //this.showConversationOptions();
    }

    showConversationOptions(event) {
        try {
            //event.preventDefault();

            const chatOptionsOverlay = document.getElementById('chatOptions-overlay');
            const chatOptions = document.getElementById('chatOptions');

            // Store conversation ID and position
            this.currentConversationId = this.conversationId;
            this.currentPosition = { x: event.clientX, y: event.clientY };

            // Position the tooltip near cursor
            const rect = chatOptions.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Adjust position to keep within viewport
            let posX = event.clientX;
            let posY = event.clientY;

            if (posX + rect.width > viewportWidth) {
                posX = viewportWidth - rect.width - 10;
            }

            if (posY + rect.height > viewportHeight) {
                posY = viewportHeight - rect.height - 10;
            }

            chatOptions.style.left = `${posX}px`;
            chatOptions.style.top = `${posY}px`;

            // Show tooltip with animation
            chatOptionsOverlay.classList.remove('hidden');
            chatOptions.classList.remove('animate-exit');
            chatOptions.classList.add('animate-enter');

            return true;
        } catch (err) {
            console.error('Error showing conversation options:', err);
            return false;
        }
    }

    hideConversationOptions() {
        try {
            const chatOptionsOverlay = document.getElementById('chatOptions-overlay');
            const chatOptions = document.getElementById('chatOptions');

            chatOptions.classList.remove('animate-enter');
            chatOptions.classList.add('animate-exit');

            setTimeout(() => {
                chatOptionsOverlay.classList.add('hidden');
            }, 200);

            return true;
        } catch (err) {
            console.error('Error hiding conversation options:', err);
            return false;
        }
    }

    async showLoadingModal(message = null) {

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

    async hideLoadingModal() {
        const loadingModal = document.getElementById('loadingModal');
        const modalMainBox = document.getElementById('modalMainBox');
        modalMainBox.classList.remove('animate-enter')
        modalMainBox.classList.add('animate-exit');
        setTimeout(() => {
            loadingModal.classList.add('hidden');
        }, 310)
    }

    async RenameConversation(name, id = null) {
        await this.showLoadingModal(`Renaming ${this.currentConversationId} ...`);
        if (!this.currentConversationId || (id && this.currentConversationId != id)) this.currentConversationId = id

        try {
            const conversationItem = document.querySelector(`[data-id="${this.currentConversationId}"]`);
            if (conversationItem && name !== '') {

                const rename = window.desk.api.Rename(this.currentConversationId, name, this.storagePath);
                if (rename) {
                    conversationItem.dataset.name = name;
                    conversationItem.querySelector('#chat-name').textContent = name
                }
            }
            this.hideConversationOptions();
            this.fetchConversations();
            await this.hideLoadingModal()
        } catch (err) {
            this.hideConversationOptions()
            console.log("Failed to rename file", err);
            await this.hideLoadingModal()
        }
    }

    async DeleteConversation(id = null) {
        try {
            this.showLoadingModal(`Deleting ${this.currentConversationId}`);
            if (!this.currentConversationId || (id && this.currentConversationId != id)) this.currentConversationId = id

            const _delete = window.desk.api.deleteChat(this.currentConversationId, this.storagePath);
            if (_delete) {
                await this.hideLoadingModal();
                this.hideConversationOptions();
                window.showDeletionStatus("text-red-400", `Deleted ${this.currentConversationId}`);
                console.log(`Deleted ${this.currentConversationId}`);
            } else {
                this.hideConversationOptions();
            }
            // Hide options and refresh
            this.hideConversationOptions();
            await this.hideLoadingModal()
            this.fetchConversations();
            return _delete
        } catch (err) {
            this.hideConversationOptions()
            console.log("Failed to rename file", err);
            await this.hideLoadingModal()
        }
    }

    // Function to render a conversation from a file
    // Function to render a conversation from a file
    async renderConversationFromFile(conversationId) {
        ClosePrefixed()

        // Show loading modal immediately without awaiting
        this.showLoadingModal('Preparing conversation');

        // Use requestAnimationFrame to ensure the modal has a chance to render
        await new Promise(resolve => requestAnimationFrame(resolve));

        try {
            // Remove animation from previous item as the active item is changing
            /*
             if (this.activeItem) {
                this.activeItem.classList.remove('animate-heartpulse');
                this.activeItem.querySelector('#active-dot').classList.add('hidden');
            }
            this.activeItem = item;

            item.classList.add('animate-heartpulse-slow');
            item.querySelector('#active-dot').classList.remove('hidden');
            */

            let [conversationData, model] = await this.conversationManager.loadConversation(conversationId);

            if (conversationData) {
                window.desk.api.setConversation(conversationData, conversationId);  // Set global
                this.conversationManager.renderConversation(conversationData, model);

                // Clear references
                conversationData = null;
                model = null;
            } else {
                window.ModalManager.showMessage(`Conversation ${conversationId} not found.`, 'warning');
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
            window.ModalManager.showMessage('Failed to load conversation', 'error');
        } finally {
            // Always hide the loading modal
            await this.hideLoadingModal();
        }
    }
}

export const chatmanager = new ChatManager()
