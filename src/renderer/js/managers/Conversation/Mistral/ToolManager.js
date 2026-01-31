/**
 * Tool Manager - Centralized management of all available tools
 * Handles tool registration, execution, and integration with AI
 */
import { ToolBase } from './ToolBase';
import { StateManager } from '../../StatesManager';
import { agent } from "../../../../../main/config";

export class ToolManager {
    constructor() {
        this.tools = new Map();
        this.availableTools = [];
        this.registerCoreTools();
    }

    /**
     * Register all core tools
     */
    registerCoreTools() {
        // Import and register each tool
        this.registerTool('bash', new (require('./tools/BashTool').BashTool)());
        this.registerTool('grep', new (require('./tools/GrepTool').GrepTool)());
        this.registerTool('search_replace', new (require('./tools/SearchReplaceTool').SearchReplaceTool)());
        this.registerTool('todo', new (require('./tools/TodoTool').TodoTool)());
        this.registerTool('write_file', new (require('./tools/WriteFileTool').WriteFileTool)());
        this.registerTool('read_file', new (require('./tools/ReadFileTool').ReadFileTool)());
        this.registerTool('search_web', new (require('./tools/SearchWebTool').SearchWebTool)());
        this.registerTool('get_weather', new (require('./tools/GetWeatherTool').GetWeatherTool)());
        this.registerTool('calculate', new (require('./tools/CalculateTool').CalculateTool)());
        this.registerTool('file_operations', new (require('./tools/FileOperationsTool').FileOperationsTool)());
        this.registerTool('database_query', new (require('./tools/DatabaseQueryTool').DatabaseQueryTool)());
        this.registerTool('send_message', new (require('./tools/SendMessageTool').SendMessageTool)());

        this.updateAvailableTools();
    }

    /**
     * Register a tool
     */
    registerTool(name, tool) {
        if (tool instanceof ToolBase) {
            this.tools.set(name, tool);
        } else {
            console.error(`Tool ${name} must extend ToolBase`);
        }
    }

    /**
     * Update the list of available tools based on configuration
     */
    updateAvailableTools() {
        this.availableTools = [];

        this.tools.forEach((tool, name) => {
            if (tool.isAvailable()) {
                this.availableTools.push({
                    name: name,
                    description: tool.description,
                    schema: tool.schema
                });
            }
        });
    }

    /**
     * Execute a tool by name
     */
    async executeTool(toolName, params, context = {}) {
        const tool = this.tools.get(toolName);

        if (!tool) {
            throw new Error(`Tool ${toolName} not found`);
        }

        return tool.execute(params, context);
    }

    /**
     * Get all available tool schemas for AI function calling
     */
    getAvailableToolSchemas() {
        return this.availableTools.map(tool => tool.schema);
    }

    /**
     * Get tool by name
     */
    getTool(toolName) {
        return this.tools.get(toolName);
    }

    /**
     * Check if tool is available
     */
    isToolAvailable(toolName) {
        const tool = this.tools.get(toolName);
        return tool ? tool.isAvailable() : false;
    }

    /**
     * Get all tool configurations
     */
    getAllToolConfigs() {
        const configs = {};
        this.tools.forEach((tool, name) => {
            configs[name] = tool.getConfig();
        });
        return configs;
    }

    /**
     * Reload tool configurations from config manager
     */
    reloadConfig() {
        this.tools.forEach((tool, name) => {
            tool.config = agent.config.tools[name] || {};
        });
        this.updateAvailableTools();
    }

    /**
     * Execute multiple tools in sequence
     */
    async executeToolSequence(sequence, sharedContext = {}) {
        const results = [];

        for (const { tool: toolName, params } of sequence) {
            try {
                const result = await this.executeTool(toolName, params, sharedContext);
                results.push(result);

                // Update shared context with result
                sharedContext[`${toolName}_result`] = result;

            } catch (error) {
                results.push({
                    tool: toolName,
                    success: false,
                    error: error.message,
                    params: params
                });
            }
        }

        return results;
    }

    /**
     * Get tool statistics
     */
    getToolStats() {
        const stats = {
            totalTools: this.tools.size,
            availableTools: this.availableTools.length,
            toolList: Array.from(this.tools.keys())
        };

        return stats;
    }
}

// Singleton instance
const toolManager = new ToolManager();
export default toolManager;
