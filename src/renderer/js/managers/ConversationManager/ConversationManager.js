import { waitForElement } from "../../Utils/dom_utils";
import { ChatUtil } from "./util";
import { ChatDisplay } from "./util";
import { ClosePrefixed } from "../../react-portal-bridge";

export class ConversationManager {
    constructor(storagePath) {
        this.storagePath = storagePath;
        this.chatArea
        this.chatutil = new ChatUtil()
        this.chatdisplay = new ChatDisplay()
        waitForElement('#chatArea', (el) => this.chatArea = el)
    }

    // Load conversation from a JSON file
    async loadConversation(conversationId) {
        const filePath = `${this.storagePath}/${conversationId}.json`;
        try {
            if (window.desk.api.stat(filePath)) {
                const data = await window.desk.api.read(filePath);

                return [data, data?.metadata?.model || 'chat']
            }
        } catch (err) {
            console.error('Error loading conversation:', err);
        }
        return null;
    }

    change_model(value = 'mistral-large-latest') {
        try {
            waitForElement('#model-selector', (context) => {
                waitForElement(`[data-value^="${value}"]`, (el) => el.click(), { context: context })
            })
        } catch (err) {
            console.log(err)
            //selector?.classList?.add('hidden')
        }
    }
    // Render the conversation in the web interface
    async renderConversation(conversationData, model = "chat") {
        try {
            if (conversationData.chats) this.chatutil.hide_suggestions()

            ClosePrefixed()
            const vmodels = this.chatutil.get_multimodal_models()

            if (model === 'multimodal') {
                if (!vmodels.includes(window.currentModel)) this.change_model('mistral-small-latest')

                conversationData.chats.forEach(message => {

                    if (message.content) {
                        if (message.role === "user") {
                            this.renderUserMessage(message.content, model);
                        } else if (message.role === "assistant") {
                            this.renderAIMessage(message.content[0]?.text);
                        }
                    }
                    //window.debounceRenderKaTeX(null, null, true);
                });
            } else {

                conversationData.chats.forEach(message => {
                    vmodels.includes(window.currentModel) && window.currentModell !== 'mistral-small-latest' ? this.change_model() : ''
                    const content = typeof message?.content === 'string'
                        ? message.content.trim()
                        : '';


                    if (content) {
                        if (message.role === "user") {
                            this.renderUserMessage(content, model);
                        } else if (message.role === "assistant") {
                            this.renderAIMessage(content);
                        }
                    }
                });
            }

            // force gc
            conversationData = null
            window.gc
            this.chatutil.render_math()
        } catch (err) {
            console.log(err)
            window.ModalManager.showMessage('Failed to load conversation', 'error');
        }
    }

    // Get file type from message content
    getFileType(content) {
        try {
            const fileDict = {
                "image_url": "image",
                "file_url": "document"
            };

            // Find the item with type "image_url" or "file_url"
            const fileTypeItem = content.find(item => item.type === "image_url" || item.type === "document_url");

            // Check if the found item exists and has a valid type
            if (fileTypeItem && fileDict[fileTypeItem.type]) {
                //console.log(fileTypeItem?.type);
                return fileDict[fileTypeItem.type];
            }

            // If no valid file type is found, log and return null
            //console.log('No file attachment!');
            return null;

        } catch (error) {
            if (error.name === "TypeError") {
                //console.log('No file attachment!');
            } else {
                console.error("Error determining file type:", error.name);
            }
            return null;
        }
    }
    getFileUrl(content) {
        try {
            // Find all items with type "image_url"
            const fileMessages = content.filter(item => item.type === "image_url");

            // Extract all URLs from the image_url properties
            return fileMessages.map(fileMessage => fileMessage.imageUrl.url);
        } catch (error) {
            console.error("Error extracting file URL:", error);
            return [];
        }
    }

    // Get message type (text or vision) from message content
    getMessageType(content) {
        const fileMessage = content.find(item => item.type === "image_url" || item.type === "file_url");
        return fileMessage ? "multimodal" : "chat";
    }

    // Render user message
    renderUserMessage(content, model = 'chat') {
        const fileType = this.getFileType(content);
        var fileDataUrl = null;
        var userText = null;

        if (fileType) {
            fileDataUrl = this.getFileUrl(content);
        }

        if (model.toLocaleLowerCase() === 'multimodal') {

            // Check if content is an array and has at least one element before accessing content[0]
            if (content && content?.length > 0 && content[0]?.text) {
                const lastChar = content[0]?.text?.slice(-1) || '';
                if (lastChar === ']') {
                    userText = content[0]?.text?.substring(0, content[0]?.text?.length - 22);
                } else {
                    userText = content[0]?.text;
                }
            } else {
                userText = ''; // Set a default if the content is missing
            }
        } else {
            userText = content?.slice(-1) === ']' ? content?.substring(0, content?.length - 22) : content
        }

        if (userText) window.reactPortalBridge.showComponentInTarget('UserMessage', 'chatArea', { message: userText, file_type: fileType, file_data_url: fileDataUrl, save: false }, 'user_message')

        //const message_id = GenerateId('user_msg')
    }

    // Render text-based assistant message
    async renderAIMessage(content) {
        let actualResponse = "";
        let thinkContent = "";

        if (!content) return

        // Check whether it is a thinking model response ie if it has thinking tags.
        const hasThinkTag = content.includes("<think>");

        if (hasThinkTag) {
            const start = (content.indexOf('<think>') !== -1) ? 7 : 0
            thinkContent = content.slice(start, content.indexOf('</think>'));
            actualResponse = content.slice(content.indexOf('</think>') + 8);
        } else {
            actualResponse = content;
        }
        window.reactPortalBridge.showComponentInTarget('AiMessage', 'chatArea', { actual_response: actualResponse, isThinking: false, think_content: thinkContent }, 'ai_message');
    }
}

