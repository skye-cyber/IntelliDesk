/**
 * Name Conversation Tool
 * Handles conversation naming logic separately from content
 * Replaces the <name></name> tag system with a dedicated tool
 */

import { ToolBase } from '../ToolBase';

/**
 * Tool for naming conversations
 * Extracts conversation names from content and stores them separately
 */
export class NameConversationTool extends ToolBase {
    constructor() {
        super('name_conversation', 'Tool for naming conversations. Extracts and manages conversation names.');
    }

    /**
     * Define the tool schema
     */
    defineSchema() {
        return {
            type: "function",
            function: {
                name: this.name,
                description: this.description,
                parameters: {
                    type: "object",
                    properties: {
                        conversation_name: {
                            type: "string",
                            description: "The name to assign to the conversation"
                        },
                        // extract_from_content: {
                        //     type: "boolean",
                        //     description: "Whether to extract the name from the content using legacy <name> tags"
                        // }
                    },
                    required: ["conversation_name"]
                }
            }
        };
    }

    /**
     * Execute the name conversation tool
     */
    async _execute(params, context) {
        const { conversation_name, extract_from_content = false } = params;

        let finalName = conversation_name;

        console.log("Fname:", finalName)
        // If we should extract from content (legacy support)
        if (extract_from_content && context?.content) {
            finalName = this.extractNameFromContent(context.content) || finalName;
        }

        // Validate the name
        if (!finalName || typeof finalName !== 'string') {
            throw new Error('Invalid conversation name provided');
        }

        // Store the conversation name
        const result = {
            success: true,
            conversation_name: finalName,
            action: 'name_conversation',
            timestamp: new Date().toISOString()
        };

        // Store in state for later retrieval
        if (context?.conversationId) {
            // In a real implementation, you would store this in your state management
            console.log(`[NameConversationTool] Named conversation ${context.conversationId}: "${finalName}"`);
        }

        // Rename via api
        const newName = window.desk.api.updateName(finalName, false)
        console.log("New name:", newName)

        return result;
    }

    /**
     * Extract name from content using legacy <name> tags
     * This provides backward compatibility
     */
    extractNameFromContent(content) {
        if (!content || typeof content !== 'string') {
            return null;
        }

        // Try to extract from <name> tags
        const nameTagMatch = content.match(/<name>(.*?)<\/name>/i);
        if (nameTagMatch && nameTagMatch[1]) {
            return nameTagMatch[1].trim();
        }

        // Try to extract from <name (without closing tag - legacy support)
        const nameTagOpenMatch = content.match(/<name[^>]*>(.*?)$/i);
        if (nameTagOpenMatch && nameTagOpenMatch[1]) {
            return nameTagOpenMatch[1].trim();
        }

        return null;
    }

    /**
     * Format the result for display
     */
    formatResult(result) {
        return {
            ...result,
            formatted_message: `Conversation named: "${result.conversation_name}"`
        };
    }

    /**
     * Check if content contains conversation naming information
     */
    static hasConversationName(content) {
        if (!content || typeof content !== 'string') {
            return false;
        }

        // Check for name tags
        return content.includes('<name>') || content.includes('<name ');
    }

    /**
     * Extract conversation name from content (static method for external use)
     */
    static extractConversationName(content) {
        const tool = new NameConversationTool();
        return tool.extractNameFromContent(content);
    }
};

// Export singleton instance
export const nameConversationTool = new NameConversationTool();
export default nameConversationTool;
