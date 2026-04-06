/**
 * Tool Manager - Centralized management of all available tools
 * Handles tool registration, execution, and integration with AI
 */
import { ToolBase } from './ToolBase';
import { StateManager } from '../managers/StatesManager';
import { BashTool } from './tools/BashTool';
import { GrepTool } from './tools/GrepTool';
// import { GetWeatherTool } from './tools/GetWeatherTool'
// import { TodoTool } from './tools/TodoTool';
import { WriteFileTool } from './tools/WriteFileTool';
import { ReadFileTool } from './tools/ReadFileTool';
import { SearchReplaceTool } from './tools/SearchReplaceTool';
import { SearchWebTool } from './tools/SearchWebTool';
import { CalculateTool } from './tools/CalculateTool';
import { FileSystemTool } from './tools/FileSystemTool';
import { DatabaseQueryTool } from './tools/DatabaseQueryTool';
import { NameConversationTool } from './tools/NameConversationTool';
//import { SendMessageTool } from './tools/SendMessageTool';
import type { AgentType, ToolConfig } from "../../main/utils/ToolAgent";
import type { ToolError, ToolResult, ToolSchema, ToolCall, ToolStat } from './types';


// StateManager.set('enable_tools', true)

const instBase = new ToolBase('', '')

interface Tool {
    name: string
    description: string
    schema: ToolSchema
}

export class ToolManager {
    private agent: AgentType
    public tools: Map<string, typeof instBase>;
    public availableTools: Tool[]

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
        this.registerTool('bash', new BashTool() as any);
        this.registerTool('grep', new GrepTool() as any);
        this.registerTool('search_replace', new SearchReplaceTool() as any);
        //this.registerTool('todo', new TodoTool());
        this.registerTool('write_file', new WriteFileTool() as any);
        this.registerTool('read_file', new ReadFileTool() as any);
        this.registerTool('search_web', new SearchWebTool() as any);
        //this.registerTool('get_weather', new GetWeatherTool());
        this.registerTool('calculate', new CalculateTool() as any);
        this.registerTool('file_operations', new FileSystemTool() as any);
        this.registerTool('database_query', new DatabaseQueryTool() as any);
        this.registerTool('name_conversation', new NameConversationTool() as any);
        //this.registerTool('send_message', new SendMessageTool());

        this.updateAvailableTools();
    }

    /**
     * Register a tool
     */
    registerTool(name: string, tool: typeof ToolBase) {
        if (tool instanceof ToolBase) {
            try {
                // Check if tool is hard disabled: if so do not register it
                const config = this.agent.config
                if (Object.keys(config.disabled_tools).includes(name) || config.tools[name]?.permission === 'never') return

                this.tools.set(name, tool);
            } catch (err) {
                console.error(`During tool: ${name} registration: ${err}`)
            }
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
    async executeTool(toolName: string, params: string, context: Record<any, any> = {}) {
        const tool = this.tools.get(toolName);

        if (!tool) {
            throw new Error(`Tool ${toolName} not found`);
        }

        return tool.execute(params, context);
    }

    /**
     * Get all available tool schemas for AI function calling
     */
    getAvailableToolSchemas(): Array<ToolSchema> {
        return this.availableTools.map(tool => tool.schema);
    }

    /**
     * Get tool by name
     */
    getTool(toolName: string): typeof instBase | undefined {
        return this.tools.get(toolName);
    }

    /**
     * Check if tool is available
     */
    isToolAvailable(toolName: string): boolean {
        const tool = this.tools.get(toolName);
        return tool ? tool.isAvailable() : false;
    }

    /**
     * Get all tool configurations
     */
    getAllToolConfigs(): Record<string, ToolConfig> {
        const configs: Record<string, ToolConfig> = {};
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
    async executeToolSequence(sequence: Array<ToolCall>, sharedContext = {}) {
        const results: Array<ToolResult | ToolError> = [];

        for (const toolCall of sequence) {     //{ tool: toolName, params }
            const toolName = toolCall.function.name
            const params = toolCall.function.arguments
            try {
                const result = await this.executeTool(toolName, params as any, sharedContext);
                results.push(result);

                // Update shared context with result
                sharedContext[`${toolName}_result`] = result;

            } catch (error) {
                const tool_error: ToolError = {
                    tool: toolName,
                    success: false,
                    result: {},
                    error: error.message,
                    params: params as any,
                    timestamp: new Date().toISOString()
                }
                results.push(tool_error as ToolError);
            }
        }

        return results;
    }

    /**
     * Get tool statistics
     */
    getToolStats(): ToolStat {
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
