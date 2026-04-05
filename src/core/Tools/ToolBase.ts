/**
 * Base class for all tool handlers
 * Provides common functionality for tool execution, validation, and error handling
 */
import { ToolConfig, AgentType } from "../../main/utils/ToolAgent";
import { StateManager } from "../managers/StatesManager";
import { ToolError, ToolResult, ToolSchema } from "./types";


export class ToolBase {
    public name: string
    public description: string
    public agent: AgentType
    public config: ToolConfig
    public schema: ToolSchema

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
        this.agent = window.desk.agent
        this.config = this.agent.config.tools[name] || {};
        this.schema = this.defineSchema();
    }

    /**
     * Define the tool schema (to be implemented by subclasses)
     */
    defineSchema(): ToolSchema {
        return {
            type: "function",
            function: {
                name: this.name,
                description: this.description,
                parameters: {
                    type: "object",
                    properties: {},
                    required: []
                }
            }
        };
    }

    /**
     * Validate tool execution based on configuration
     */
    validateExecution(): boolean {
        const permission = this.config.permission || "always";

        if (permission === "never") {
            throw new Error(`Tool ${this.name} is disabled by configuration`);
        }

        // Check if tool is in disabled list
        if (this.agent.config.disabled_tools && this.agent.config.disabled_tools.includes(this.name)) {
            throw new Error(`Tool ${this.name} is disabled`);
        }

        return true;
    }

    /**
     * Execute the tool with error handling
     */
    async execute(params: string, context: Record<any, any> = {}) {
        try {
            this.validateExecution();

            // Add execution context
            const executionContext = {
                timestamp: new Date().toISOString(),
                user: StateManager.get('currentUser'),
                conversationId: StateManager.get('currentConversationId'),
                ...context
            };

            // Execute the tool
            const result = await this._execute(JSON.parse(params), executionContext);

            // Log successful execution
            this.logExecution('success', params, result);

            return this.formatResult(result);
        } catch (error) {
            // Handle errors consistently
            const errorResult = await this.handleError(error, params);
            this.logExecution('error', params, errorResult);
            return errorResult;
        }
    }

    /**
     * Actual tool execution (to be implemented by subclasses)
     */
    async _execute(params: Map<any, any> | string, context: Record<any, any> = {}): Promise<Record<any, any>> {
        throw new Error(`Tool ${this.name} execution not implemented`);
    }

    /**
     * Format the result for AI consumption
     */
    formatResult(result: Record<any, any>): ToolResult {
        return {
            success: true,
            tool: this.name,
            result: result,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Handle errors consistently
     */
    async handleError(error: Error, params: string): Promise<ToolError> {
        return {
            success: false,
            tool: this.name,
            error: error.message,
            params: params,
            result: {},
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Log tool execution
     */
    logExecution(status: string, params: string, result: Record<any, any>) {
        console.log(`[TOOL:${this.name}] ${status.toUpperCase()}`, {
            //params: params,
            result: status === 'error' ? result.error : 'success',
            //timestamp: new Date().toISOString()
        });

        // Store in state for debugging
        StateManager.set('lastToolExecution', {
            tool: this.name,
            status: status,
            params: params,
            result: result,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Check if tool is available
     */
    isAvailable() {
        try {
            this.validateExecution();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get tool configuration
     */
    getConfig(): ToolConfig {
        return this.config;
    }
}
