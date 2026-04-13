export interface ToolConfig {
    permission: 'always' | 'ask' | 'never';
    allowlist?: string[];
    denylist?: string[];
    [key: string]: any;
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
/**
 * Manage Agent mode configuration for tool use etc
 */
export declare class AgentConfigManager {
    private config_file;
    private default_config;
    private config;
    private ignore_file;
    constructor();
    /**
     * Set a new configuration
     * @param config New config (object or JSON string)
     * @returns this
     */
    set_config(config: AgentConfig | string): this;
    /**
     * Check if local config file exists; create it if missing
     */
    check_local_config(): boolean;
    /**
     * Ensure the ignore file exists (used by grep tool)
     */
    ensure_ignore_file_exist(): boolean;
    /**
     * Get the current configuration as an object
     */
    get_config(): AgentConfig;
    /**
     * Write the current configuration to disk
     */
    write_config(): boolean;
    /**
     * Update the local config file if the in-memory config differs
     */
    update_local_config(): boolean;
    /**
     * Read the configuration file from disk
     */
    read_config(): string;
    /**
     * Validate and normalize the current configuration
     */
    validate_config(): boolean;
    /**
     * Get configuration for a specific tool
     */
    get_tool_config(toolName: string): ToolConfig;
    /**
     * Set permission for a specific tool
     */
    set_tool_permission(toolName: string, permission: 'always' | 'ask' | 'never'): this;
    /**
     * Enable a tool (set permission to "always")
     */
    enable_tool(toolName: string): this;
    /**
     * Disable a tool (set permission to "never")
     */
    disable_tool(toolName: string): this;
    /**
     * Require confirmation for a tool (set permission to "ask")
     */
    require_confirmation_for_tool(toolName: string): this;
    /**
     * Create getter for private default config
     */
    get_default_config(): AgentConfig;
}
export declare const agent: AgentConfigManager;
//# sourceMappingURL=config.d.ts.map