import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
    AGENT_CONFIG_FILE,
    PREPED_DEFAULT_AGENT_CONFIG as DEFAULT_AGENT_CONFIG,
    PREP_AGENT_CONFIG
} from './shared';

// Type definitions for the configuration structure
export interface ToolConfig {
    permission: 'always' | 'ask' | 'never';
    allowlist?: string[];
    denylist?: string[];
    [key: string]: any; // Allow other tool-specific properties
}

export interface AgentConfig {
    tool_paths: string[];
    mcp_servers: any[];
    enabled_tools: string[];
    disabled_tools: string[];
    skill_paths: string[];
    tools: {
        [toolName: string]: ToolConfig;
    };
}


const write_config = (config: AgentConfig | null = null): boolean => {
    try {
        let conf = config
        if (!config && config_manager) {
            conf = config_manager.config
        }
        fs.mkdirSync(path.dirname(AGENT_CONFIG_FILE), { recursive: true })
        fs.writeFileSync(AGENT_CONFIG_FILE, JSON.stringify(conf, null, 2), { flag: 'w' });
        return true;
    } catch (err) {
        console.error('Error writing to local config:', err);
        return false;
    }
}

const load_config = (instance: any | null = null): string => {
    // config_manager.check_local_config();
    if (!instance) instance = config_manager
    try {
        const str_data = fs.readFileSync(AGENT_CONFIG_FILE, 'utf8');
        try {
            const local_config: AgentConfig = JSON.parse(str_data)
            if (local_config) instance.config = local_config
        } catch (err) { }
        return str_data
    } catch (err) {
        console.error('Error reading config file:', err);
        return JSON.stringify(instance.default_config);
    }
}

/**
 * Manage Agent mode configuration for tool use etc
 */
export class AgentConfigManager {
    public config_file: string;
    public default_config: AgentConfig;
    public config: AgentConfig;
    public ignore_file: string;

    constructor() {
        this.config_file = path.join(os.homedir(), '.IntelliDesk/.config/agent_config.json');
        this.default_config = DEFAULT_AGENT_CONFIG as AgentConfig
        this.config = this.default_config;
        this.ignore_file = path.join(
            os.homedir(),
            '.IntelliDesk/.config/',
            this.config.tools.grep.codeignore_file as string
        );

        this.check_local_config();
        this.ensure_ignore_file_exist();
    }
    /**
     * Check if local config file exists; create it if missing
     */
    check_local_config(): boolean {
        if (!fs.existsSync(AGENT_CONFIG_FILE)) {
            return write_config(DEFAULT_AGENT_CONFIG);
        }
        load_config(this)
        return true;
    }
    /**
     * Ensure the ignore file exists (used by grep tool)
     */
    ensure_ignore_file_exist(): boolean {
        if (!fs.existsSync(this.ignore_file)) {
            try {
                const patterns = this.config.tools.grep.exclude_patterns;
                const content = patterns ? patterns.join('\n') : '';
                fs.writeFileSync(this.ignore_file, content);
            } catch (err) {
                console.error('Error writing to local ignore file:', err);
                return false;
            }
        }
        return true;
    }
}

// Singleton instance
export const config_manager = new AgentConfigManager();

export interface AgentType {
    set_config: (config: AgentConfig | string) => AgentType;
    check_local_config: () => boolean;
    ensure_ignore_file_exist: () => boolean;
    get_config: () => AgentConfig;
    write_config: () => boolean;
    update_local_config: () => boolean;
    read_config: () => string;
    validate_config: () => boolean;
    get_tool_config: (toolName: string) => ToolConfig;
    set_tool_permission: (toolName: string, permission: 'always' | 'ask' | 'never') => AgentType;
    enable_tool: (toolName: string) => AgentType;
    disable_tool: (toolName: string) => AgentType;
    require_confirmation_for_tool: (toolName: string) => AgentType;
    get_default_config: () => AgentConfig,
    config: AgentConfig;
}

export const Agent: AgentType = {
    /**
     * Set a new configuration
     * @param config New config (object or JSON string)
     * @returns this
     */
    set_config(config: AgentConfig | string): AgentType {
        let new_config: AgentConfig | undefined;
        if (typeof config === 'string') {
            try {
                new_config = JSON.parse(config);
            } catch (e) {
                console.error('Failed to parse JSON config:', e);
                return Agent;
            }
        } else if (typeof config === 'object' && config !== null) {
            new_config = config;
        }
        if (!new_config) return Agent;
        config_manager.config = new_config;
        return Agent;
    },

    /**
     * Check if local config file exists; create it if missing
     */
    check_local_config(): boolean {
        if (!fs.existsSync(AGENT_CONFIG_FILE)) {
            return Agent.write_config();
        }
        return true;
    },

    /**
     * Ensure the ignore file exists (used by grep tool)
     */
    ensure_ignore_file_exist(): boolean {
        if (!fs.existsSync(config_manager.ignore_file)) {
            try {
                const patterns = config_manager.config.tools.grep.exclude_patterns;
                const content = patterns ? patterns.join('\n') : '';
                fs.writeFileSync(config_manager.ignore_file, content);
            } catch (err) {
                console.error('Error writing to local ignore file:', err);
                return false;
            }
        }
        return true;
    },

    /**
     * Get the current configuration as an object
     */
    get_config(): AgentConfig {
        const configContent = Agent.read_config();
        const config = JSON.parse(configContent) as AgentConfig;
        return PREP_AGENT_CONFIG(config)
    },

    /**
     * Write the current configuration to disk
     */
    write_config: write_config,

    /**
     * Update the local config file if the in-memory config differs
     */
    update_local_config(): boolean {
        const currentConfig = Agent.get_config();
        if (JSON.stringify(currentConfig) !== JSON.stringify(config_manager.config)) {
            return Agent.write_config();
        }
        return true;
    },

    /**
     * Read the configuration file from disk
     */
    read_config: load_config,

    /**
     * Validate and normalize the current configuration
     */
    validate_config(): boolean {
        const tools = config_manager.config.tools || {};
        const validPermissions: Array<'always' | 'ask' | 'never'> = ['always', 'ask', 'never'];

        for (const [toolName, toolConfig] of Object.entries(tools)) {
            // Ensure permission is valid
            if (toolConfig.permission && !validPermissions.includes(toolConfig.permission)) {
                console.warn(
                    `Invalid permission "${toolConfig.permission}" for tool ${toolName}. Defaulting to "never".`
                );
                toolConfig.permission = 'never';
            }

            // Set default permission if missing
            if (!toolConfig.permission) {
                toolConfig.permission = 'never';
            }
        }
        return true;
    },

    /**
     * Get configuration for a specific tool
     */
    get_tool_config(toolName: string): ToolConfig {
        // Bypass for tool rename since it is an internal tool
        if (toolName === 'name_conversation') return { permission: 'always' }
        return config_manager.config.tools[toolName] || { permission: 'never' };
    },

    /**
     * Set permission for a specific tool
     */
    set_tool_permission(toolName: string, permission: 'always' | 'ask' | 'never'): typeof Agent {
        if (!config_manager.config.tools[toolName]) {
            config_manager.config.tools[toolName] = { permission };
        } else {
            config_manager.config.tools[toolName].permission = permission;
        }
        return Agent;
    },

    /**
     * Enable a tool (set permission to "always")
     */
    enable_tool(toolName: string): AgentType {
        return Agent.set_tool_permission(toolName, 'always');
    },

    /**
     * Disable a tool (set permission to "never")
     */
    disable_tool(toolName: string): AgentType {
        return Agent.set_tool_permission(toolName, 'never');
    },

    /**
     * Require confirmation for a tool (set permission to "ask")
     */
    require_confirmation_for_tool(toolName: string): typeof Agent {
        return Agent.set_tool_permission(toolName, 'ask');
    },
    /**
     * Create getter for private default config
     */
    get_default_config(): AgentConfig {
        return config_manager.default_config
    },
    config: PREP_AGENT_CONFIG(config_manager.config)
}
