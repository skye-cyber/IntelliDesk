const { ConversationManager } = require('./managers/ConversationManager/ConversationManager.js')

InputPurify = window.InputPurify;

export class ChatManager {
    constructor() {
        this.currentConversationId;
        this.storagePath = window.desk.api.joinPath(window.desk.api.home_dir(), '.IntelliDesk/.store');
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
        this.conversationManager.fetchConversations();

        // Setup ipc recievers
        this.setupIPCRecievers()

        return this
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
        const chatOptionsOverlay = document.getElementById('chatOptions-overlay');
        const chatOptions = document.getElementById('chatOptions');
        chatOptionsOverlay.classList.remove('hidden');
        chatOptions.classList.remove('animate-exit');
        chatOptions.classList.add('animate-enter')
    }

    hideConversationOptions() {
        const chatOptionsOverlay = document.getElementById('chatOptions-overlay');
        const chatOptions = document.getElementById('chatOptions');
        chatOptions.classList.remove('animate-enter')
        chatOptions.classList.add('animate-exit');
        setTimeout(() => {
            chatOptionsOverlay.classList.add('hidden');
        }, 310)
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
        if (activeItem) {
            activeItem.classList.remove('animate-heartpulse');
        }
        activeItem = item;
        item.classList.add('animate-heartpulse');
        const [conversationData, model] = await conversationManager.loadConversation(conversationId);
        //console.log(conversationData, model)
        if (conversationData) {
            window.desk.api.setConversationId(conversationId);  //Set global conversation id to the current conversation id
            //console.log(conversationData)
            conversationManager.renderConversation(conversationData, model);
        } else {
            alert(`Conversation ${conversationId} not found.`);
        }
    }
}
