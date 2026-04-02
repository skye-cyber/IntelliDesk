/**
 * Tool Integration for AI - Handles tool calls during AI conversations
 * Bridges between AI function calls and tool execution
 */
import toolManager from './ToolManager';
import { BaseErrorHandler } from "../../../ErrorHandler/BaseHandler";
import { staticPortalBridge } from '../../../PortalBridge';

export class IntegrateTools {
    constructor() {
        this.toolManager = toolManager;
        this.toolCallHistory = [];
        this.maxToolCalls = 20; // Prevent infinite tool loops
    }

    /**
     * Process AI tool calls and execute them
     */
    async processToolCalls(toolCalls, context = {}) {
        const results = [];

        for (const toolCall of toolCalls) {
            try {
                console.log("Call Index:", this.toolCallHistory.length)
                // Check if we've exceeded max tool calls
                if (this.toolCallHistory.length >= this.maxToolCalls) {
                    throw new Error(`Maximum tool calls (${this.maxToolCalls}) exceeded`);
                }

                const toolName = toolCall.function.name;
                const params = toolCall.function.arguments;
                const TOOL_AUTHORIZED = false  // Or set to default from agentConfig

                // Authorize tools here ...
                staticPortalBridge.showComponent('ToolPermissionRequest',
                    {
                        toolName: toolName,
                        toolArgs: params,
                        onDecision: () => { }
                    },
                    'tool_perm_request'
                )

                // Check redux store for authorization status
                // while not authorized wait until timeout then cance/deny-> Raise SIGINT for completion loop to stop here

                // Execute the tool
                const toolResult = await this.toolManager.executeTool(toolName, params, {
                    ...context,
                    toolCallId: toolCall.id
                });

                // Store in history
                this.toolCallHistory.push({
                    toolName,
                    params,
                    result: toolResult,
                    timestamp: new Date().toISOString()
                });

                results.push({
                    toolCallId: toolCall.id,
                    toolName: toolName,
                    result: toolResult
                });

            } catch (error) {
                await BaseErrorHandler(error, null, 'ToolIntegration');
                results.push({
                    toolCallId: toolCall.id,
                    toolName: toolCall.function.name,
                    error: error
                });
            }
        }

        return results;
    }

    /**
     * Get available tools for AI function calling
     */
    getAvailableToolsForAI() {
        return this.toolManager.getAvailableToolSchemas();
    }

    /**
     * Clear tool call history
     */
    clearHistory() {
        this.toolCallHistory = [];
    }

    /**
     * Get tool call history
     */
    getHistory() {
        return this.toolCallHistory;
    }

    /**
     * Check if tools are available
     */
    hasAvailableTools() {
        return this.toolManager.availableTools.length > 0;
    }

    /**
     * Get tool execution statistics
     */
    getStats() {
        return {
            totalToolCalls: this.toolCallHistory.length,
            availableTools: this.toolManager.availableTools.length,
            ...this.toolManager.getToolStats()
        };
    }

    /**
     * Process parallel tool calls
     */
    async processParallelToolCalls(toolCalls, context = {}) {
        const results = [];
        const promises = [];

        for (const toolCall of toolCalls) {
            promises.push(this.processSingleToolCall(toolCall, context));
        }

        const settledResults = await Promise.allSettled(promises);

        settledResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                results.push(result.value);
            } else {
                results.push({
                    toolCallId: toolCalls[index].id,
                    toolName: toolCalls[index].function.name,
                    error: result.reason.message
                });
            }
        });

        return results;
    }

    async processSingleToolCall(toolCall, context) {
        const toolName = toolCall.function.name;
        const params = toolCall.function.arguments;

        const toolResult = await this.toolManager.executeTool(toolName, params, {
            ...context,
            toolCallId: toolCall.id
        });

        return {
            toolCallId: toolCall.id,
            toolName: toolName,
            result: toolResult
        };
    }

    /**
     * Create tool context for AI
     */
    createToolContext() {
        return {
            availableTools: this.toolManager.availableTools.map(tool => ({
                name: tool.name,
                description: tool.description
            })),
            recentToolCalls: this.toolCallHistory.slice(-5).map(call => ({
                tool: call.toolName,
                success: call.result?.success || false
            }))
        };
    }

    /**
     * Reset tool integration state
     */
    reset() {
        this.clearHistory();
        this.toolManager.reloadConfig();
    }
}

// Singleton instance
const toolsIntegration = new IntegrateTools();
export default toolsIntegration;
