import { conversationloader } from './ConversationLoader.ts'
import { clearMessages, staticPortalBridge } from '../../PortalBridge.ts';
import { modalmanager } from '../../StatusUIManager/Manager.js';
import { globalEventBus } from '../../Globals/eventBus.ts';


export class ChatManager {
    constructor() {
        this.currentConversationId;
        this.storagePath = window.desk.api.joinPath(window.desk.api.home_dir(), '.IntelliDesk/.store');
        this.activeItem
        //this.init()

        this.splitstr
    }

    _get_conversation_id() {
        return this._get_conversation_id
    }

    async sortFn(fl) {
        const metadata = window.desk.api.getmetadata(fl)
        const datetime = metadata?.updated_at ? metadata?.updated_at : metadata?.created_at

        if (!datetime) return -1
        const date = this.loadDate(datetime)
        const year = date.getFullYear().toString().slice(-2); // Get the last two digits of the year
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based, so add 1
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        const formattedDateTime = `${year}${month}${day}${hours}${minutes}${seconds}`;

        //const datestr = `${date.getFullYear()}${date.getMonth()}${date.getDate()}`
        const intdate = Number(formattedDateTime)
        // console.log(Number(formattedDateTime))

        return intdate ? intdate : -1
    }

    async sortFiles(files) {
        const filesWithSortValues = await Promise.all(files.map(async (file) => {
            const sortValue = await this.sortFn(file);
            return { file, sortValue };
        }));

        filesWithSortValues.sort((a, b) => a.sortValue - b.sortValue);

        files = filesWithSortValues.map((obj) => obj.file);
        return files.reverse()
    }

    // Function to fetch conversation files and display their IDs
    async fetchConversations() {
        try {
            let files = await window.desk.api.readStore()
            if (files.length > 0) {

                staticPortalBridge.closeComponent('chatItem', true)

                // sort files for time-based display
                //files = files.sort((a, b) => this.sortFn(a) - this.sortFn(b))

                files = await this.sortFiles(files).catch((error) => {
                    console.error('Error sorting files:', error);
                });

                for (let [index, file] of files.entries()) {
                    if (window.desk.api.getExt(file) === '.json') {

                        const metadata = window.desk.api.getmetadata(file)
                        if (!metadata) {
                            continue;
                        }

                        if (typeof (metadata.highlight) !== "string") {
                            metadata.highlight = ""
                        }
                        // Date split
                        let datestr = this.dateStrDisplay(metadata.updated_at)
                        //console.log(datestr?.split('/')[1], this.splitstr?.split('/')[1])
                        if (datestr && datestr !== this.splitstr) {
                            //staticPortalBridge.showComponentInTarget('DateSplit', 'conversations', { displaystr: datestr }, 'chatItem')
                        }else{
                            datestr = null
                        }

                        this.splitstr = datestr

                        staticPortalBridge.showComponentInTarget('ConversationItem', 'conversations', { metadata: metadata, datestr: datestr }, 'chatItem')

                        globalEventBus.emit('panel:loader:hide')

                    } else {
                        console.log("No conversations saved!")
                    }
                }
                files = null
                return true
            }
            else {
                globalEventBus.emit('panel:loader:hide')
            }
            return false
        } catch (err) {
            globalEventBus.emit('panel:loader:hide')
            console.error('Error reading conversation files:', err);
            return false
        } finally {
            window.gc = true
        }
    }

    loadDate(code) {
        let date

        // Handle ISO format (2025-07-27T02:20:05.779000+08:00)
        if (code.includes('T') && code.includes(':')) {
            try {
                date = new Date(code);
                if (isNaN(date.getTime())) {
                    return "Invalid";
                }
            } catch {
                return "Invalid";
            }
        }
        // Handle custom format (v-25-07-27-02-20-05 or 25-07-27-02-20-05)
        else {
            const datePattern = /^\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/;

            if (code.toLowerCase().startsWith("v-")) {
                if (!datePattern.test(code.slice(2))) {
                    return "Invalid";
                }
                code = code.slice(2);
            } else if (!datePattern.test(code)) {
                return "Invalid";
            }

            const parts = code.split("-").map(Number);
            if (parts.length < 6) return "Invalid";

            const [yy, MM, dd, hh, mm, ss] = parts;
            const fullYear = 2000 + yy;
            date = new Date(fullYear, MM - 1, dd, hh, mm, ss);
        }
        return date
    }

    dateStrDisplay(dstr) {
        if (!dstr) return;
        const date = this.loadDate(dstr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const days = Math.floor(seconds / 86400);
        const year = date.getFullYear();
        const thisYear = now.getFullYear();
        const month = date.getMonth();
        const currentMonth = now.getMonth();

        if (days < 1) return 'Today';
        if (days < 2) return 'Yesterday';
        if (days <= 7) return 'Last 7 Days';
        if (month === currentMonth && year === thisYear) return 'This month';
        if (month === currentMonth - 1 && year === thisYear) return 'Last month';
        return `${month + 1}/${year}`;
    }

    /**
     * Converts a timestamp like "24-12-21-10-43-39"
     * into a short relative time like "10min", "2h", "3d", etc.
     */
    formatRelativeTime(code) {
        if (!code) return 'invalid';

        const date = this.loadDate(code)

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

    updateActiveConversation(conversationId) {
        this.currentConversationId = conversationId;
        //this.showConversationOptions();
    }

    showConversationOptions(event) {
        try {
            // First render the tooltip
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
            // Show tooltip with animation
            chatOptionsOverlay.classList.remove('hidden');
            chatOptions.classList.remove('animate-exit');
            chatOptions.classList.add('animate-enter');

            chatOptionsOverlay.dataset.id = id
            chatOptionsOverlay.dataset.portalid = portal_id

            return { posX: posX, posY: posY };
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
        setTimeout(() => {
            modalMainBox.classList.remove('animate-enter')
            modalMainBox.classList.add('animate-exit');
            setTimeout(() => {
                loadingModal.classList.add('hidden');
            }, 0)
        }, 300)
    }

    async RenameConversation(name, id = null) {
        await this.showLoadingModal(`Renaming ${this.currentConversationId} ...`);
        if (!this.currentConversationId || (id && this.currentConversationId != id)) this.currentConversationId = id

        try {
            const conversationItem = document.querySelector(`[data-id="${this.currentConversationId}"]`);
            if (conversationItem && name !== '') {

                const rename = window.desk.api.RenameConversation(this.currentConversationId, name, this.storagePath);
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
                //console.log(`Deleted ${this.currentConversationId}`);
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
            return false
        }
    }

    // Function to render a conversation from a file
    // Function to render a conversation from a file
    async renderConversationFromFile(conversationId) {
        clearMessages()

        // Show loading modal immediately without awaiting
        await this.showLoadingModal('Preparing conversation');

        // Use requestAnimationFrame to ensure the modal has a chance to render
        await new Promise(resolve => requestAnimationFrame(resolve));

        try {

            let conversationData = await window.desk.api.loadConversation(conversationId)

            if (conversationData) {
                await conversationloader.renderConversation(conversationData);

                // Clear references
                conversationData = undefined;
            } else {
                modalmanager.showMessage(`Conversation ${conversationId} not found.`, 'warning');
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
            modalmanager.showMessage('Failed to load conversation', 'error');
        } finally {
            // Always hide the loading modal
            await this.hideLoadingModal();
            window.gc = true
        }
    }
}

export const chatmanager = new ChatManager()
