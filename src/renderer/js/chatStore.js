const storagePath = window.electron.joinPath(window.electron.home_dir(), '.quickai/.quickai.store');
const { ConversationManager } = require('./managers/ConversationManager/ConversationManager.js')

const chatArea = document.getElementById('chatArea');
const conversationsPanel = document.getElementById('conversations');
InputPurify = window.InputPurify;
const modalTitle = document.getElementById('modalTitle');
const newNameInput = document.getElementById('newName');
const renameButton = document.getElementById('renameButton');
const cancelButton = document.getElementById('cancelButton');
const selectedModelText = document.getElementById('selectedModelText');
const modelSelect = document.getElementById('model');
let activeItem;

async function checkAndCreateDirectory() {
    if (storagePath) {
        try {
            // Check if the directory exists
            const exists = await window.electron.mkdir(storagePath);
            if (!exists) {
                console.log("Error creating directory", storagePath)
            } else {
                //console.log('Directory exists');
            }
        } catch (error) {
            console.error('Error checking or creating directory:', error);
        }
    }
}


const conversationManager = new ConversationManager(storagePath);


// Global variable to store current conversationId
let currentConversationId = null;

// Attach event listeners only once after DOM load
const cancelOptsBt = document.getElementById('renameOptionsBt');
const DeleteOption = document.getElementById('DeleteOption');
const cancelDeleteBt = document.getElementById('CancelDeleteBt');
const canceRenamelButton = document.getElementById('canceRenamelButton');
const renameModal = document.getElementById('renameModal');
const renameOption = document.getElementById('renameOption');
const confirmDeleteBt = document.getElementById('ConfirmDelete');
const SubmitRenameButton = document.getElementById('SubmitRenameButton');


cancelOptsBt.addEventListener('click', () => {
    HandleOptions('hide');
});

DeleteOption.addEventListener('click', () => {
    HandleConfirmDelete();
});

confirmDeleteBt.addEventListener('click', () => {
    HandleLoading('show', `Deleting ${currentConversationId}`);
    const _delete = window.electron.deleteChat(storagePath, currentConversationId);
    if (_delete) {
        HandleLoading('hide');
        HandleConfirmDelete();
        HandleOptions('hide');
        window.showDeletionStatus("text-red-400", `Deleted ${currentConversationId}`);
        console.log(`Deleted ${currentConversationId}`);
    } else {
        HandleConfirmDelete();
        HandleOptions('hide');
    }
    // Hide options and refresh
    HandleConfirmDelete();
    HandleOptions('hide');
    fetchConversations();
});

cancelDeleteBt.addEventListener('click', () => {
    HandleConfirmDelete();
});

renameOption.addEventListener('click', () => {
    HandleRenameModal();
    modalTitle.textContent = `Rename ${currentConversationId}`;

    canceRenamelButton.addEventListener('click', () => {
        HandleRenameModal();
    }, { once: true });

    renameModal.addEventListener('click', (event) => {
        if (event.target === renameModal) {
            HandleRenameModal();
        }
    }, { once: true });

    SubmitRenameButton.addEventListener('click', () => {
        HandleLoading('show', `Renaming ${currentConversationId} ...`);
        try {
            const newName = `${currentConversationId[0]}-${newNameInput.value.trim()}`;
            const conversationItem = document.querySelector(`[data-text="${currentConversationId}"]`);
            if (conversationItem && newNameInput.value.trim() !== '') {
                const rename = window.electron.Rename(storagePath, currentConversationId, newName);
                if (rename) {
                    conversationItem.textContent = newName;
                    conversationItem.setAttribute('data-text', newName);
                    HandleRenameModal();
                }
            }
            HandleLoading('hide');
            HandleOptions('hide');
            fetchConversations();
        } catch (err) {
            HandleLoading('hide');
            console.log("Failed to rename file", err);
        }
    });

    newNameInput.addEventListener('keypress', (event) => {
        event.stopPropagation();
        if (event.key === 'Enter') {
            SubmitRenameButton.click();
        }
    }, { once: true });
});

// Function called on context menu event to update currentConversationId
function ConversationAdmin(conversationId) {
    currentConversationId = conversationId;
    HandleOptions('show');
}


function HandleOptions(task) {
    const chatOptionsOverlay = document.getElementById('chatOptions-overlay');
    const chatOptions = document.getElementById('chatOptions');
    if (task === "show") {
        chatOptionsOverlay.classList.remove('hidden');
        chatOptions.classList.remove('animate-exit');
        chatOptions.classList.add('animate-enter')
    } else {
        chatOptions.classList.remove('animate-enter')
        chatOptions.classList.add('animate-exit');
        setTimeout(() => {
            chatOptionsOverlay.classList.add('hidden');
        }, 310)
    }
}

function HandleConfirmDelete() {
    const confirmDeleteModal = document.getElementById('confirm-delete-modal');
    confirmDeleteModal.classList.toggle('-translate-x-full');
    confirmDeleteModal.classList.toggle('-translate-x-1')
}

function HandleRenameModal() {
    const renameModal = document.getElementById('renameModal');
    renameModal.classList.toggle('translate-y-full');
    renameModal.classList.toggle('translate-y-1')
}

function HandleLoading(task, message = null) {

    const loadingModal = document.getElementById('loadingModal');
    const modalMainBox = document.getElementById('modalMainBox');
    if (task === "show") {
        if (message) {
            const msgBox = document.getElementById('loadingMSG');
            msgBox.textContent = message;
        }
        loadingModal.classList.remove('hidden');
        modalMainBox.classList.remove('animate-exit');
        modalMainBox.classList.add('animate-enter')
    } else {
        modalMainBox.classList.remove('animate-enter')
        modalMainBox.classList.add('animate-exit');
        setTimeout(() => {
            loadingModal.classList.add('hidden');
        }, 310)
    }
}

// Function to render a conversation from a file
async function renderConversationFromFile(item, conversationId) {
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

// Listen for updates messages from ipc for Chat models and update the history files
window.electron.receive('fromMain-ToChat', (data) => {
    let Chat = data
    try {
        let conversationId = window.electron.getSuperCId() || window.electron.getNewChatUUId();
        console.log('ChatUpdated::');
        if (Chat.length > 1) {
            conversationManager.saveConversation(Chat, conversationId);
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
            conversationManager.saveConversation(VChat, VconversationId);
            console.log("Saved V conversation, size:", VChat.length);
        } else if (typeof VChat === 'object' && Object.keys(VChat).length > 1) {
            conversationManager.saveConversation(VChat, VconversationId);
            //console.log("Saved V conversation, size length", VChat.length);
        } else {
            console.log("VChat is not an array or object with more than one entry.");
        }
    } catch (err) {
        console.error("Error in VChatUpdated handler:", err);
    }
});

checkAndCreateDirectory();
// Fetch and display conversations on page load
fetchConversations();

//AutoChatHistSync();
document.addEventListener('NewConversationOpened', function() {
    fetchConversations();
})

module.exports = {
    checkAndCreateDirectory,
    renderConversationFromFile,

};
