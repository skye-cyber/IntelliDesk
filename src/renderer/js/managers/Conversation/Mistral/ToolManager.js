/**
 * Tool Manager - Centralized management of all available tools
 * Handles tool registration, execution, and integration with AI
 */
import { ToolBase } from './ToolBase';
import { StateManager } from '../../StatesManager';
import { BashTool } from './tools/BashTool';
import { GrepTool } from './tools/GrepTool';
import { GetWeatherTool } from './tools/GetWeatherTool'
import { TodoTool } from './tools/TodoTool';
import { WriteFileTool } from './tools/WriteFileTool';
import { ReadFileTool } from './tools/ReadFileTool';
import { SearchReplaceTool } from './tools/SearchReplaceTool';
import { SearchWebTool } from './tools/SearchWebTool';
import { CalculateTool } from './tools/CalculateTool';
import { FileOperationsTool } from './tools/FileOperationsTool';
import { DatabaseQueryTool } from './tools/DatabaseQueryTool';
import { NameConversationTool } from './tools/NameConversationTool';
//import { SendMessageTool } from './tools/SendMessageTool';


StateManager.set('enable_tools', true)

export class ToolManager {
    constructor() {
        this.agent = window.desk.agent
        this.tools = new Map();
        this.availableTools = [];
        this.registerCoreTools();
    }

    /**
     * Register all core tools
     */
    registerCoreTools() {
        //Import and register each tool
        this.registerTool('bash', new BashTool());
        this.registerTool('grep', new GrepTool());
        this.registerTool('search_replace', new SearchReplaceTool());
        this.registerTool('todo', new TodoTool());
        this.registerTool('write_file', new WriteFileTool());
        this.registerTool('read_file', new ReadFileTool());
        this.registerTool('search_web', new SearchWebTool());
        this.registerTool('get_weather', new GetWeatherTool());
        this.registerTool('calculate', new CalculateTool());
        this.registerTool('file_operations', new FileOperationsTool());
        this.registerTool('database_query', new DatabaseQueryTool());
        this.registerTool('name_conversation', new NameConversationTool());
        //this.registerTool('send_message', new SendMessageTool());

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
            tool.config = this.agent.config.tools[name] || {};
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
