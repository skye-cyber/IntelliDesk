import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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


const write_config = (config = null): boolean => {
    try {
        console.log(config_manager.config_file)
        const config_ = config ? config : config_manager.config
        fs.writeFileSync(config_manager.config_file, JSON.stringify(config_, null, 2));
        return true;
    } catch (err) {
        console.error('Error writing to local config:', err);
        return false;
    }
}

const load_config = (instance: any | null = null): string => {
    // config_manager.check_local_config();
    if(!instance) instance = config_manager
    try {
        const str_data = fs.readFileSync(instance.config_file, 'utf8');
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
        this.config_file = path.join(os.homedir(), '.IntelliDesk/.config/agent_mode_config.json');
        this.default_config = {
            tool_paths: [],
            mcp_servers: [],
            enabled_tools: [],
            disabled_tools: [],
            skill_paths: [],
            tools: {
                bash: {
                    permission: 'always',
                    max_output_bytes: 16000,
                    default_timeout: 30,
                    allowlist: [
                        'echo',
                        'find',
                        'git diff',
                        'git log',
                        'git status',
                        'tree',
                        'whoami',
                        'cat',
                        'file',
                        'head',
                        'ls',
                        'pwd',
                        'stat',
                        'tail',
                        'uname',
                        'wc',
                        'which',
                    ],
                    denylist: [
                        'gdb',
                        'pdb',
                        'passwd',
                        'nano',
                        'vim',
                        'vi',
                        'emacs',
                        'bash -i',
                        'sh -i',
                        'zsh -i',
                        'fish -i',
                        'dash -i',
                        'screen',
                        'tmux',
                    ],
                    denylist_standalone: [
                        'python',
                        'python3',
                        'ipython',
                        'bash',
                        'sh',
                        'nohup',
                        'vi',
                        'vim',
                        'emacs',
                        'nano',
                        'su',
                    ],
                },
                grep: {
                    permission: 'always',
                    allowlist: [],
                    denylist: [],
                    max_output_bytes: 64000,
                    default_max_matches: 100,
                    default_timeout: 60,
                    exclude_patterns: [
                        '.venv/',
                        'venv/',
                        '.env/',
                        'env/',
                        'node_modules/',
                        '.git/',
                        '__pycache__/',
                        '.pytest_cache/',
                        '.mypy_cache/',
                        '.tox/',
                        '.nox/',
                        '.coverage/',
                        'htmlcov/',
                        'dist/',
                        'build/',
                        '.idea/',
                        '.vscode/',
                        '*.egg-info',
                        '*.pyc',
                        '*.pyo',
                        '*.pyd',
                        '.DS_Store',
                        'Thumbs.db',
                    ],
                    codeignore_file: '.intellideskignore',
                },
                search_replace: {
                    permission: 'always',
                    allowlist: [],
                    denylist: [],
                    max_content_size: 100000,
                    create_backup: false,
                    fuzzy_threshold: 0.9,
                },
                todo: {
                    permission: 'always',
                    allowlist: [],
                    denylist: [],
                    max_todos: 100,
                },
                write_file: {
                    permission: 'always',
                    allowlist: [],
                    denylist: [],
                    max_write_bytes: 64000,
                    create_parent_dirs: true,
                },
                read_file: {
                    permission: 'always',
                    allowlist: [],
                    denylist: [],
                    max_read_bytes: 64000,
                    max_state_history: 10,
                },
                search_web: {
                    permission: 'ask',
                    max_results: 5,
                    timeout: 10,
                    safe_search: true,
                },
                get_weather: {
                    permission: 'ask',
                    default_unit: 'celsius',
                    cache_duration: 300, // 5 minutes in seconds
                    api_timeout: 5,
                },
                calculate: {
                    permission: 'always',
                    max_expression_length: 100,
                    max_precision: 10,
                    allow_complex_numbers: false,
                },
                file_operations: {
                    max_recurse_depth: 30, // prevents memory pressure for large directories
                    permission: 'ask',
                    allowlist: ['read', 'list', 'copy', 'stats', 'exists', 'read_dir'],
                    denylist: ['delete', 'write', 'move'],
                    max_file_size: 1048576, // 1MB
                    safe_paths: ['/home', '/tmp', '/var/tmp'],
                },
                database_query: {
                    permission: 'never',
                    max_rows: 100,
                    timeout: 15,
                },
                send_message: {
                    permission: 'ask',
                    max_message_length: 500,
                    allowed_types: ['text', 'email', 'sms'],
                },
            },
        };
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
        if (!fs.existsSync(this.config_file)) {
            return write_config();
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
        if (!fs.existsSync(config_manager.config_file)) {
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
        return JSON.parse(configContent) as AgentConfig;
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
    config: config_manager.config
}
