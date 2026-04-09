/**
 * Conversation Naming Utility
 * Handles both legacy name tag system and new tool-based naming
 * Provides a unified interface for conversation naming
 */

import nameConversationTool from "../../../Tools/tools/NameConversationTool";

/**
 * Conversation Naming Utility
 * Manages conversation names using either legacy tags or the new tool system
 */
export class ConversationNaming {
    constructor() {
        this.currentConversationName = null;
        this.useToolBasedNaming = true; // Default to new tool-based system
    }

    /**
     * Set whether to use tool-based naming or legacy tags
     */
    setUseToolBasedNaming(enabled) {
        this.useToolBasedNaming = enabled;
        console.log(`🏷️ Conversation naming: Using ${enabled ? 'tool-based' : 'legacy tag'} system`);
    }

    /**
     * Extract conversation name using the appropriate method
     */
    extractConversationName(content, context = {}) {
        if (this.useToolBasedNaming) {
            // Use the tool-based approach
            return this.extractNameUsingTool(content, context);
        } else {
            // Use legacy tag approach
            return this.extractNameFromLegacyTags(content);
        }
    }

    /**
     * Extract name using the NameConversationTool
     */
    async extractNameUsingTool(content, context = {}) {
        try {
            // Check if content contains name information
            if (NameConversationTool.hasConversationName(content)) {
                // Extract using the tool
                const extractedName = NameConversationTool.extractConversationName(content);
                
                if (extractedName) {
                    // Use the tool to properly handle the name
                    const result = await nameConversationTool.execute({
                        conversation_name: extractedName,
                        extract_from_content: true
                    }, context);
                    
                    this.currentConversationName = result.conversation_name;
                    return result.conversation_name;
                }
            }
            
            // If no name found in content, check if we should generate one
            if (this.shouldGenerateConversationName(content)) {
                const generatedName = this.generateConversationNameFromContent(content);
                if (generatedName) {
                    const result = await nameConversationTool.execute({
                        conversation_name: generatedName
                    }, context);
                    
                    this.currentConversationName = result.conversation_name;
                    return result.conversation_name;
                }
            }
            
            return null;
        } catch (error) {
            console.error('🚨 Error extracting conversation name with tool:', error.message);
            return null;
        }
    }

    /**
     * Extract name from legacy <name> tags (for backward compatibility)
     */
    extractNameFromLegacyTags(content) {
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
     * Check if we should generate a conversation name from content
     */
    shouldGenerateConversationName(content) {
        if (!content || typeof content !== 'string') {
            return false;
        }

        // Generate names for certain types of conversations
        const lowerContent = content.toLowerCase();
        
        // Conversations that typically need names
        const nameWorthyConversations = [
            'analyze', 'analysis', 'report', 'summary', 'review',
            'document', 'file', 'data', 'project', 'research',
            'system', 'diagnostic', 'audit', 'evaluation'
        ];

        return nameWorthyConversations.some(keyword => 
            lowerContent.includes(keyword)
        );
    }

    /**
     * Generate a conversation name from content
     */
    generateConversationNameFromContent(content) {
        if (!content || typeof content !== 'string') {
            return null;
        }

        // Try to extract meaningful phrases for the name
        const lowerContent = content.toLowerCase();
        
        // Common patterns for conversation names
        const patterns = [
            { keyword: 'analyze', prefix: 'Analysis: ' },
            { keyword: 'report', prefix: 'Report: ' },
            { keyword: 'summary', prefix: 'Summary: ' },
            { keyword: 'review', prefix: 'Review: ' },
            { keyword: 'document', prefix: 'Document: ' },
            { keyword: 'file', prefix: 'File: ' },
            { keyword: 'system', prefix: 'System: ' }
        ];

        for (const pattern of patterns) {
            if (lowerContent.includes(pattern.keyword)) {
                // Extract the part after the keyword
                const keywordIndex = lowerContent.indexOf(pattern.keyword);
                const afterKeyword = content.substring(keywordIndex + pattern.keyword.length);
                
                // Get first sentence or reasonable length
                const firstSentence = afterKeyword.split('.')[0] || afterKeyword;
                const reasonableName = firstSentence.substring(0, 50).trim();
                
                return pattern.prefix + reasonableName;
            }
        }

        // Default: use first few words
        const firstWords = content.split(' ').slice(0, 5).join(' ');
        return `Conversation: ${firstWords}`;
    }

    /**
     * Get the current conversation name
     */
    getCurrentConversationName() {
        return this.currentConversationName;
    }

    /**
     * Clear the current conversation name
     */
    clearCurrentConversationName() {
        this.currentConversationName = null;
    }

    /**
     * Process content to remove name tags (for cleanup)
     */
    cleanContentFromNameTags(content) {
        if (!content || typeof content !== 'string') {
            return content;
        }

        // Remove all name tags
        return content
            .replace(/<name>.*?<\/name>/gi, '')
            .replace(/<name[^>]*>/gi, '');
    }

    /**
     * Check if content contains conversation naming information
     */
    static hasConversationName(content) {
        return NameConversationTool.hasConversationName(content);
    }

    /**
     * Extract conversation name from content (static method)
     */
    static extractConversationName(content) {
        const instance = new ConversationNaming();
        return instance.extractNameFromLegacyTags(content);
    }
};

// Export singleton instance
export const conversationNaming = new ConversationNaming();
export default conversationNaming;
