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

// Function to fetch conversation files and display their IDs
async function fetchConversations() {
    conversationsPanel.innerHTML = `<div class="justify-center items-center">
    <p class="text-center text-rose-400 dark:text-slate-400 text-md font-semibold h-full w-full">Empty!</p>
    </div>
    `;// Clear previous entries

    try {
        const files = await window.electron.readDir(storagePath);

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
        }
    } catch (err) {
        console.error('Error reading conversation files:', err);
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
