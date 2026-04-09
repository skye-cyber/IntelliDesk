/**
 * Enhanced Function Call Handler - Integrates AI tool calls with ToolManager
 * Handles the complete lifecycle of function/tool calls during conversations
 */
import toolManager from './ToolManager';
import toolsIntegration from './ToolIntegration';
import { BaseErrorHandler } from "../../../ErrorHandler/BaseHandler";
import { StateManager } from '../managers/StatesManager.ts';

export class FunctionCallHandler {
    constructor(client) {
        this.client = client;
        this.toolManager = toolManager;
        this.integration = toolsIntegration;
        this.maxToolIterations = 3; // Prevent infinite loops
    }

    /**
     * Process a message with potential tool calls
     */
    async processMessage(userMessage, conversationHistory = [], options = {}) {
        const {
            model = StateManager.get('currentModel') || "mistral-large-latest",
            temperature = 0.1,
            maxToolCalls = 5
        } = options;

        let messages = [
            ...conversationHistory,
            { role: "user", content: userMessage }
        ];

        let toolCallResults = [];
        let iteration = 0;
        let finalResponse = null;

        // Reset tool integration for this conversation
        this.integration.reset();

        while (iteration < this.maxToolIterations) {
            iteration++;

            // Get available tools for this iteration
            const availableTools = this.toolManager.getAvailableToolSchemas();

            // Step 1: Get AI response (potentially with tool calls)
            const response = await this.getAIResponse(messages, {
                model,
                temperature,
                tools: availableTools.length > 0 ? availableTools : undefined
            });

            const assistantMessage = response.choices[0].message;

            // Step 2: Check for tool calls
            if (assistantMessage.toolCalls?.length > 0) {
                // Execute tool calls
                const toolResults = await this.executeToolCalls(assistantMessage.toolCalls);

                // Add tool results to conversation history
                toolResults.forEach(result => {
                    messages.push({
                        role: "tool",
                        tool_call_id: result.toolCallId,
                        content: JSON.stringify(result.result)
                    });
                });

                toolCallResults.push(...toolResults);

                // Check if we should continue or break
                if (toolResults.length === 0 || iteration >= this.maxToolIterations) {
                    break;
                }

                continue; // Go to next iteration to get final response
            } else {
                // No tool calls, return streaming response
                finalResponse = await this.getStreamingResponse(messages, { model, temperature });
                break;
            }
        }

        return {
            type: "stream",
            stream: finalResponse,
            toolCallResults: toolCallResults,
            iterations: iteration
        };
    }

    /**
     * Get AI response (non-streaming for tool call detection)
     */
    async getAIResponse(messages, options) {
        return await this.client.chat.complete({
            ...options,
            messages: messages,
            stream: false
        });
    }

    /**
     * Get streaming response
     */
    async getStreamingResponse(messages, options) {
        const stream = await this.client.chat.complete({
            ...options,
            messages: messages,
            stream: true
        });

        return stream;
    }

    /**
     * Execute tool calls
     */
    async executeToolCalls(toolCalls) {
        const results = [];

        for (const toolCall of toolCalls) {
            try {
                const toolName = toolCall.function.name;
                const params = JSON.parse(toolCall.function.arguments);

                // Execute through AI tool integration
                const executionResult = await this.integration.processToolCalls([{
                    id: toolCall.id,
                    function: {
                        name: toolName,
                        arguments: params
                    }
                }]);

                results.push(executionResult[0]);

            } catch (error) {
                const errorResult = await BaseErrorHandler(error, null, 'FunctionCallHandler');
                results.push({
                    toolCallId: toolCall.id,
                    toolName: toolCall.function.name,
                    error: errorResult.error || error.message
                });
            }
        }

        return results;
    }

    /**
     * Process streaming response with tool call context
     */
    async *processStream(streamResult, context = {}) {
        if (streamResult.type === "stream") {
            // Add tool context to the stream
            const toolContext = this.integration.createToolContext();

            for await (const chunk of streamResult.stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    yield {
                        content: content,
                        toolContext: toolContext
                    };
                }
            }
        }
    }

    /**
     * Get tool schemas for AI
     */
    getToolSchemas() {
        return this.toolManager.getAvailableToolSchemas();
    }

    /**
     * Check if tools are available
     */
    hasAvailableTools() {
        return this.toolManager.availableTools.length > 0;
    }

    /**
     * Get execution statistics
     */
    getStats() {
        return {
            availableTools: this.toolManager.getToolStats(),
            toolCallHistory: this.integration.getHistory(),
            maxToolIterations: this.maxToolIterations
        };
    }

    /**
     * Register custom tools
     */
    registerCustomTools(tools) {
        tools.forEach(tool => {
            this.toolManager.registerTool(tool.name, tool.instance);
        });
        this.toolManager.updateAvailableTools();
    }
}
