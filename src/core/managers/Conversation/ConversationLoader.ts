import { waitForElement } from "../../Utils/dom_utils";
import { chatutil } from "./util.ts";
import { modalmanager } from "../../StatusUIManager/Manager";
import { clearMessages } from "../../PortalBridge.ts";
import { modelManager } from "./ModelManager.ts";
import { streamingPortalBridge } from "../../PortalBridge.ts";
import { StateManager } from "../StatesManager";

export class ConversationLoader {
    private chatArea: any
    private portal: any
    constructor() {
        this.chatArea
        waitForElement('#chatArea', (el) => this.chatArea = el)
        this.portal = null
    }

    /**
     * Parse content into text and thinking parts
     * Handles: string (legacy), array (modern), and object formats
     */
    parseContent(content: any): { text: string; thinking: string | null; type: 'string' | 'array' | 'object' } {
        // Handle null/undefined
        if (!content) return { text: '', thinking: null, type: 'string' };

        // Handle string (legacy format with <think> tags or plain text)
        if (typeof content === 'string') {
            const hasThinkTag = content.includes("<think>");
            if (hasThinkTag) {
                const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
                const thinking = thinkMatch ? thinkMatch[1].trim() : null;
                const text = content.replace(/<think>[\s\S]*?<\/think>/, '').trim();
                return { text, thinking, type: 'string' };
            }
            return { text: content, thinking: null, type: 'string' };
        }

        // Handle array (modern multimodal/thinking format)
        if (Array.isArray(content)) {
            let text = '';
            let thinking: string | null = null;

            for (const item of content) {
                if (!item) continue;

                if (item.type === 'text' && item.text) {
                    text += item.text;
                } else if (item.type === 'thinking' && item.thinking) {
                    thinking = (thinking || '') + item.thinking;
                } else if (item.type === 'image_url' || item.type === 'document_url') {
                    // Skip file attachments - handled separately
                    continue;
                }
            }

            return { text, thinking, type: 'array' };
        }

        // Handle unexpected object format
        console.warn('Unexpected content format:', content);
        return { text: String(content), thinking: null, type: 'object' };
    }

    /**
     * Extract files from content array
     */
    extractFiles(content: any[]): any[] {
        if (!Array.isArray(content)) return [];

        return content.filter(item =>
            item && (item.type === 'image_url' || item.type === 'document_url')
        ).map(item => {
            if (item.type === 'image_url') {
                return {
                    type: 'image_url',
                    url: item.imageUrl?.url || item.image_url?.url
                };
            } else if (item.type === 'document_url') {
                return {
                    type: 'document_url',
                    url: item.documentUrl || item.document_url || item.document_url.documentUrl,
                    name: item.documentName || ''
                };
            }
            return item;
        });
    }

    /**
     * Render the conversation in the web interface
     */
    async renderConversation(conversationData) {
        try {
            const model = conversationData.metadata?.model || 'chat';
            // ['vision', 'multimodal', 'reasoning', 'ocr']
            const isMultimodal = model.toLowerCase() !== 'chat'

            if (conversationData.chats?.length > 0) {
                chatutil.hideSuggestions();
            }

            clearMessages();
            this.portal = null;

            // Ensure correct model is selected
            if (!modelManager.usesArrayStructure(StateManager.get('currentModel'))) {
                modelManager.changeModel('pixtral-large-latest');
            } else if (modelManager.usesArrayStructure(StateManager.get('currentModel'))) {
                modelManager.changeModel('mistral-large-latest');
            }

            // Process all messages
            for (const message of conversationData.chats) {
                if (!message?.content && message?.role !== 'tool') continue;

                const role = message.role;

                if (role === "user") {
                    await this.renderUserMessage(message.content, isMultimodal);
                    this.portal = null; // Reset portal after user message

                } else if (role === "assistant") {
                    await this.renderAssistantMessage(message.content, message.tool_calls || message.toolCalls);

                } else if (role === "tool") {
                    await this.renderToolContent(message);
                }
            }

            // Cleanup
            conversationData = null;

            chatutil.renderMath();

        } catch (err) {
            console.error('Failed to render conversation:', err);
            modalmanager.showMessage('Failed to load conversation', 'error');
        }
    }

    /**
     * Render user message - handles both string and array content
     */
    async renderUserMessage(content: any, isMultimodal: boolean) {
        let userText = '';
        let files: any[] = [];

        if (isMultimodal && Array.isArray(content)) {
            // Extract text and files from array
            const textItem = content.find(item => item?.type === 'text');
            userText = textItem?.text || '';

            files = this.extractFiles(content);
        } else if (typeof content === 'string') {
            userText = content;
        } else if (content?.text) {
            userText = content.text;
        }

        if (userText || files.length > 0) {
            streamingPortalBridge.createStreamingPortal(
                'UserMessage',
                'chatArea',
                { message: userText, files: files, save: false },
                'user_message'
            );
        }
    }

    /**
     * Render assistant message with thinking support
     */
    async renderAssistantMessage(content: any, toolCalls?: any[]) {
        // Get or create portal
        let message_portal = this.portal;
        if (!message_portal) {
            message_portal = streamingPortalBridge.createStreamingPortal(
                'AiMessage',
                'chatArea',
                undefined,
                'ai_message'
            );
            this.portal = message_portal;
        }

        // Parse content to extract text and thinking
        const parsed = this.parseContent(content);

        let actualContent = parsed.text;
        let thinkContent = parsed.thinking || '';

        // Handle legacy <think> tags if present in text (double check)
        if (actualContent.includes('<think>')) {
            const legacyParsed = this.parseContent(actualContent);
            actualContent = legacyParsed.text;
            thinkContent = thinkContent || legacyParsed.thinking || '';
        }

        // Handle tool calls if present
        if (toolCalls && toolCalls.length > 0) {
            // Render tool calls
            for (const toolCall of toolCalls) {
                message_portal.appendComponent('ToolCallDisplay', {
                    toolCall: {
                        id: toolCall.id,
                        name: toolCall.function?.name,
                        arguments: toolCall.function?.arguments
                    }
                });
            }
        }

        // Render the message content
        if (actualContent || thinkContent) {
            message_portal.appendComponent('ResponseWrapper', {
                actualContent: actualContent,
                thinkContent: thinkContent
            });
        }

        chatutil.renderMath();
    }

    /**
     * Render tool message content
     */
    async renderToolContent(message: any) {
        // Get or create portal
        let message_portal = this.portal;
        if (!message_portal) {
            message_portal = streamingPortalBridge.createStreamingPortal(
                'AiMessage',
                'chatArea',
                undefined,
                'ai_message'
            );
            this.portal = message_portal;
        }

        try {
            const toolCall = {
                result: typeof message.content === 'string' ? JSON.parse(message.content) : message.content,
                toolName: message.name,
                toolCallId: message.tool_call_id || message.toolCallId
            };

            message_portal.appendComponent('ToolCallDisplay', { toolCall: toolCall });
        } catch (err) {
            console.error('Failed to render tool content:', err);
        }
    }
}

export const conversationloader = new ConversationLoader();
