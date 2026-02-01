/**
 * Base class for all tool handlers
 * Provides common functionality for tool execution, validation, and error handling
 */
import { StateManager } from '../../StatesManager';


export class ToolBase {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.agent = window.desk.agent
        this.config = this.agent.config.tools[name] || {};
        this.schema = this.defineSchema();
    }

    /**
     * Define the tool schema (to be implemented by subclasses)
     */
    defineSchema() {
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
    validateExecution() {
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
    async execute(params, context = {}) {
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
            const result = await this._execute(params, executionContext);

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
    async _execute(params, context) {
        throw new Error(`Tool ${this.name} execution not implemented`);
    }

    /**
     * Format the result for AI consumption
     */
    formatResult(result) {
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
    async handleError(error, params) {
        return {
            success: false,
            tool: this.name,
            error: error.message,
            params: params,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Log tool execution
     */
    logExecution(status, params, result) {
        console.log(`[TOOL:${this.name}] ${status.toUpperCase()}`, {
            params: params,
            result: status === 'error' ? result.error : 'success',
            timestamp: new Date().toISOString()
        });

        // Store in state for debugging
        StateManager.set('lastToolExecution', {
            tool: this.name,
            status: status,
            params: params,
            result: result,
            timestamp: new Date().toISOString()
        });
        console.log( StateManager.get('lastToolExecution'))
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
    getConfig() {
        return this.config;
    }
}
