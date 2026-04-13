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
    config_file: string;
    default_config: AgentConfig;
    config: AgentConfig;
    ignore_file: string;
    constructor();
    /**
     * Check if local config file exists; create it if missing
     */
    check_local_config(): boolean;
    /**
     * Ensure the ignore file exists (used by grep tool)
     */
    ensure_ignore_file_exist(): boolean;
}
export declare const config_manager: AgentConfigManager;
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
    get_default_config: () => AgentConfig;
    config: AgentConfig;
}
export declare const Agent: AgentType;
//# sourceMappingURL=ToolAgent.d.ts.map