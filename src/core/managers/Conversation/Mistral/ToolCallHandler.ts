/**
 * Tool Integration for AI - Handles tool calls during AI conversations
 * Bridges between AI function calls and tool execution
 */
import toolManager from './ToolManager';
import { BaseErrorHandler } from "../../../ErrorHandler/BaseHandler";
import { staticPortalBridge } from '../../../PortalBridge.ts';
import { useSelector } from 'react-redux';
import type { ToolCall } from './types';
import { Session } from '../../../../main/utils/SessionManager.ts';
import { emit } from '../../../Globals/eventBus.ts';

interface toolHistoryItem {
    toolName: string
    params: any
    result: Record<any, any>
    timestamp: Date | string
}

export interface ToolResultItem {
    toolCallId: number | string
    toolName: string
    result?: any
    error?: string
}

type ToolResult = Array<ToolResultItem>

export class ToolExecutor {
    private toolManager: typeof toolManager
    private toolCallHistory: Array<toolHistoryItem>
    private maxToolCalls: number
    constructor() {
        this.toolManager = toolManager;
        this.toolCallHistory = [];
        this.maxToolCalls = 20; // Prevent infinite tool loops
    }

    /**
     * Process AI tool calls and execute them
     */
    async processToolCalls(toolCalls: Array<ToolCall>, context = {}) {
        const results: ToolResult = [];

        for (const toolCall of toolCalls) {
            try {
                console.log("Call Index:", this.toolCallHistory.length)
                // Check if we've exceeded max tool calls
                if (this.toolCallHistory.length >= this.maxToolCalls) {
                    throw new Error(`Maximum tool calls (${this.maxToolCalls}) exceeded`);
                }

                const toolName = toolCall.function.name;
                const params = toolCall.function.arguments;
                const metadata = window.desk.api.getmetadata()
                const sessionId = metadata ? metadata.sessionId : null

                let session: Session | null = null
                if (sessionId) {
                    session = window.desk.sessionmanager.read(sessionId)
                }
                let toolConfig = window.desk.agent.get_tool_config(toolName)

                let TOOL_AUTHORIZED = false
                let TOOL_BLOCKED = false

                // If session exists use session config
                if (session) {
                    TOOL_AUTHORIZED = Object.keys(session.enabled_tools).includes(toolName)
                    // TODO: Remove disabled tools from available too instead
                    // Session replicates global agent config for te initial setup so should safely reflect it's state' unless user explicitly modifyied it in which case session takes precedence
                    TOOL_BLOCKED = Object.keys(session.disabled_tools).includes(toolName)

                    // Set config to session config Only if tool is in enabled else use agent config
                    toolConfig = TOOL_AUTHORIZED ? session.enabled_tools[toolName] : toolConfig
                } else {
                    // Use agent config if session not found
                    TOOL_AUTHORIZED = toolConfig.permission === 'always'  // set to default from agentConfig
                    TOOL_BLOCKED = toolConfig.permission === "never"
                }

                console.log(TOOL_AUTHORIZED, TOOL_BLOCKED)

                // if tool is blocked raise sigint
                if ((toolConfig.permission === 'never' && !TOOL_AUTHORIZED) || TOOL_BLOCKED) {
                    // Raise sigint here
                    return results
                }

                // Request tool Authorization here ...
                // If tool is not authorized or agent config is set to ask
                // If permission is 'never' ie BLOCKED Sigint shall ba raise before here
                // Decide if we need to ask for permission
                const needPermission = !TOOL_AUTHORIZED || toolConfig.permission === 'ask';
                let authorized = TOOL_AUTHORIZED;

                if (needPermission) {
                    // Wait for user decision or timeout (12 seconds)
                    const decision = await this.requestPermissionWithTimeout(
                        toolName,
                        params,
                        session?.autoapprove_action,
                        12000
                    );
                    // decision is 'allow', 'always_allow', or 'deny'
                    if (!['allow', 'always_allow'].includes(decision)) {
                        // User denied → raise SIGINT or skip this tool
                        return results; // or throw
                    }
                    authorized = true;
                    // If user chose 'always_allow', you might want to persist that preference
                    if (decision === 'always_allow') {
                        // TODO: Update session config so future calls are auto‑approved
                    }
                }

                // while not authorized wait until timeout then -> Raise SIGINT for completion loop to stop here

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
                    toolCallId: toolCall.id || new Date().toISOString(),
                    toolName: toolName,
                    result: toolResult
                });
                return results

            } catch (error) {
                await BaseErrorHandler(error, null, 'ToolIntegration');
                results.push({
                    toolCallId: toolCall.id || new Date().toISOString(),
                    toolName: toolCall.function.name,
                    error: error
                });
            }
        }

        return results;
    }


    // Helper: shows permission UI and returns a Promise that resolves with the decision string
    private requestPermissionWithTimeout(
        toolName: string,
        toolArgs: any,
        defaultAction: string | undefined,
        timeoutMs: number
    ): Promise<string> {
        return new Promise((resolve, _) => {
            // Timeout handler
            const timeoutId = setTimeout(() => {
                // On timeout, treat as 'deny' or raise SIGINT
                // reject(new Error(`Permission request timed out after ${timeoutMs}ms`));
                return 'deny'
            }, timeoutMs);

            // Show the component
            staticPortalBridge.showComponent(
                'ToolPermissionRequest',
                {
                    toolName: toolName,
                    toolArgs: toolArgs,
                    onDecision: (decision: string) => {
                        clearTimeout(timeoutId);
                        if (decision === 'deny') emit('permission:denied', toolName)
                        resolve(decision);
                    },
                    defaultAction: defaultAction
                },
                'tool_perm_request'
            );
        });
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
            ...this.toolManager.getToolStats()
        };
    }

    /**
     * Process parallel tool calls
     */
    async processParallelToolCalls(toolCalls: Array<ToolCall>, context: Map<any, any>) {
        const results: Array<ToolResultItem> = [];
        const promises: Array<Promise<ToolResultItem>> = [];

        for (const toolCall of toolCalls) {
            promises.push(this.processSingleToolCall(toolCall, context));
        }

        const settledResults = await Promise.allSettled(promises);

        settledResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                results.push(result.value);
            } else {
                results.push({
                    toolCallId: toolCalls[index].id || new Date().toISOString(),
                    toolName: toolCalls[index].function.name,
                    error: result.reason.message
                });
            }
        });

        return results;
    }

    async processSingleToolCall(toolCall: ToolCall, context: Map<any, any>) {
        const toolName = toolCall.function.name;
        const params = toolCall.function.arguments;

        const toolResult = await this.toolManager.executeTool(toolName, params, {
            ...context,
            toolCallId: toolCall.id || new Date().toISOString()
        });

        return {
            toolCallId: toolCall.id || new Date().toISOString(),
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
const toolExecutor = new ToolExecutor();
export default toolExecutor;
