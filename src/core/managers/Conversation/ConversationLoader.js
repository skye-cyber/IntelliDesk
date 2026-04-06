import { waitForElement } from "../../Utils/dom_utils";
import { chatutil } from "./util";
import { clearMessages } from "../../PortalBridge.ts";
import { modalmanager } from "../../StatusUIManager/Manager";
import { streamingPortalBridge } from "../../PortalBridge.ts";
import { StateManager } from "../StatesManager";
import { debounceRenderKaTeX } from "../../MathBase/mathRenderer.js";

export class ConversationLoader {
    constructor() {
        this.chatArea
        this.chatutil = chatutil
        waitForElement('#chatArea', (el) => this.chatArea = el)
        this.portal = null
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
    async renderConversation(conversationData) {
        try {
            const model = conversationData.chats.model
            if (conversationData.chats) this.chatutil.hide_suggestions()

            clearMessages()
            const vmodels = this.chatutil.get_multimodal_models()


            if (model === 'multimodal') {
                if (!vmodels.includes(StateManager.get('currentModel'))) this.change_model('mistral-small-latest')

                conversationData.chats.forEach(async message => {

                    if (message.content) {
                        if (message.role === "user") {
                            this.renderUserMessage(message.content, model);
                            this.portal = null
                        } else if (message.role === "assistant") {
                            // Handle carefuly incase some chats are model mislabeled
                            let textContent = null
                            if (typeof message.content === 'object') {
                                textContent = message.content[0]?.text
                            } else {
                                textContent = message.content
                            }
                            if (textContent) await this.renderAIMessage(textContent);
                        } else if (message.role === "tool") {
                            this.renderToolContent(message)
                        }
                    }
                });
            } else {

                conversationData.chats.forEach(async message => {
                    vmodels.includes(StateManager.get('currentModel')) && StateManager.get('currentModel') !== 'mistral-small-latest' ? this.change_model() : ''
                    let content
                    if (typeof message?.content === 'string') {
                        content = message.content?.trim();
                    } else {
                        content = message?.content.length > 0 ? message?.content[0]?.text : '';
                    }

                    if (content) {
                        if (message.role === "user") {
                            this.portal = null
                            this.renderUserMessage(content, model);
                        } else if (message.role === "assistant") {
                            await this.renderAIMessage(content);
                        } else if (message.role === "tool") {
                            this.renderToolContent(message)
                        }
                    }
                });
            }

            // force gc
            conversationData = null
            window.gc = true
            this.chatutil.render_math()
            // debounceRenderKaTeX(null, null, true);
        } catch (err) {
            console.log(err)
            modalmanager.showMessage('Failed to load conversation', 'error');
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
            const fileMessages = content?.filter(item => item.type === "image_url");

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
        var userText = null;

        let files
        if (model.toLocaleLowerCase() === 'multimodal' && typeof content === 'object') {
            files = content.filter(c => c.type === "document_url")

            // Check if content is an array and has at least one element before accessing content[0]
            if (content && content?.length > 0 && content[0]?.text) {
                userText = content[0]?.text;
                files

            } else {
                userText = ''; // Set a default if the content is missing
            }
        } else {
            userText = content
        }

        if (userText) streamingPortalBridge.createStreamingPortal('UserMessage', 'chatArea', { message: userText, files: files, save: false }, 'user_message')

        //const message_id = GenerateId('user_msg')
    }

    async renderToolContent(message) {
        if (!this.portal) return //portal = streamingPortalBridge.createStreamingPortal('AiMessage', 'chatArea', undefined, 'ai_message')

        const toolCall = {
            result: JSON.parse(message.content),
            toolName: message.name,
            toolCallId: message.tool_call_id
        }

        // streamingPortalBridge.appendComponentAsChild(this.portal.id, 'ToolCallDisplay', {toolCall: toolCall})

        this.portal.appendComponent('ToolCallDisplay', {
            toolCall: toolCall
        });
    }

    // Render text-based assistant message
    async renderAIMessage(content) {
        let actualContent = "";
        let thinkContent = "";

        let message_portal
        if (this.portal) {
            message_portal = this.portal
        } else {
            message_portal = streamingPortalBridge.createStreamingPortal('AiMessage', 'chatArea', undefined, 'ai_message')
            this.portal = message_portal
        }

        //this.portal = message_portal

        if (!content) return

        // Check whether it is a thinking model response ie if it has thinking tags.
        const hasThinkTag = content.includes("<think>");

        if (hasThinkTag) {
            const start = (content.indexOf('<think>') !== -1) ? 7 : 0
            thinkContent = content.slice(start, content.indexOf('</think>'));
            actualContent = content.slice(content.indexOf('</think>') + 8);
        } else {
            actualContent = content;
        }

        message_portal.appendComponent('ResponseWrapper', { actualContent: actualContent, thinkContent: thinkContent });
        this.chatutil.render_math()
        return message_portal
    }
}

export const conversationloader = new ConversationLoader()
