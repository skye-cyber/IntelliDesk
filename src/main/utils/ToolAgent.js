"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = exports.config_manager = exports.AgentConfigManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const shared_1 = require("./shared");
const write_config = (config = null) => {
    try {
        let conf = config;
        if (!config && exports.config_manager) {
            conf = exports.config_manager.config;
        }
        fs.mkdirSync(path.dirname(shared_1.AGENT_CONFIG_FILE), { recursive: true });
        fs.writeFileSync(shared_1.AGENT_CONFIG_FILE, JSON.stringify(conf, null, 2), { flag: 'w' });
        return true;
    }
    catch (err) {
        console.error('Error writing to local config:', err);
        return false;
    }
};
const load_config = (instance = null) => {
    // config_manager.check_local_config();
    if (!instance)
        instance = exports.config_manager;
    try {
        const str_data = fs.readFileSync(shared_1.AGENT_CONFIG_FILE, 'utf8');
        try {
            const local_config = JSON.parse(str_data);
            if (local_config)
                instance.config = local_config;
        }
        catch (err) { }
        return str_data;
    }
    catch (err) {
        console.error('Error reading config file:', err);
        return JSON.stringify(instance.default_config);
    }
};
/**
 * Manage Agent mode configuration for tool use etc
 */
class AgentConfigManager {
    constructor() {
        this.config_file = path.join(os.homedir(), '.IntelliDesk/.config/agent_config.json');
        this.default_config = shared_1.PREPED_DEFAULT_AGENT_CONFIG;
        this.config = this.default_config;
        this.ignore_file = path.join(os.homedir(), '.IntelliDesk/.config/', this.config.tools.grep.codeignore_file);
        this.check_local_config();
        this.ensure_ignore_file_exist();
    }
    /**
     * Check if local config file exists; create it if missing
     */
    check_local_config() {
        if (!fs.existsSync(shared_1.AGENT_CONFIG_FILE)) {
            return write_config(shared_1.PREPED_DEFAULT_AGENT_CONFIG);
        }
        load_config(this);
        return true;
    }
    /**
     * Ensure the ignore file exists (used by grep tool)
     */
    ensure_ignore_file_exist() {
        if (!fs.existsSync(this.ignore_file)) {
            try {
                const patterns = this.config.tools.grep.exclude_patterns;
                const content = patterns ? patterns.join('\n') : '';
                fs.writeFileSync(this.ignore_file, content);
            }
            catch (err) {
                console.error('Error writing to local ignore file:', err);
                return false;
            }
        }
        return true;
    }
}
exports.AgentConfigManager = AgentConfigManager;
// Singleton instance
exports.config_manager = new AgentConfigManager();
exports.Agent = {
    /**
     * Set a new configuration
     * @param config New config (object or JSON string)
     * @returns this
     */
    set_config(config) {
        let new_config;
        if (typeof config === 'string') {
            try {
                new_config = JSON.parse(config);
            }
            catch (e) {
                console.error('Failed to parse JSON config:', e);
                return exports.Agent;
            }
        }
        else if (typeof config === 'object' && config !== null) {
            new_config = config;
        }
        if (!new_config)
            return exports.Agent;
        exports.config_manager.config = new_config;
        return exports.Agent;
    },
    /**
     * Check if local config file exists; create it if missing
     */
    check_local_config() {
        if (!fs.existsSync(shared_1.AGENT_CONFIG_FILE)) {
            return exports.Agent.write_config();
        }
        return true;
    },
    /**
     * Ensure the ignore file exists (used by grep tool)
     */
    ensure_ignore_file_exist() {
        if (!fs.existsSync(exports.config_manager.ignore_file)) {
            try {
                const patterns = exports.config_manager.config.tools.grep.exclude_patterns;
                const content = patterns ? patterns.join('\n') : '';
                fs.writeFileSync(exports.config_manager.ignore_file, content);
            }
            catch (err) {
                console.error('Error writing to local ignore file:', err);
                return false;
            }
        }
        return true;
    },
    /**
     * Get the current configuration as an object
     */
    get_config() {
        const configContent = exports.Agent.read_config();
        const config = JSON.parse(configContent);
        return (0, shared_1.PREP_AGENT_CONFIG)(config);
    },
    /**
     * Write the current configuration to disk
     */
    write_config: write_config,
    /**
     * Update the local config file if the in-memory config differs
     */
    update_local_config() {
        const currentConfig = exports.Agent.get_config();
        if (JSON.stringify(currentConfig) !== JSON.stringify(exports.config_manager.config)) {
            return exports.Agent.write_config();
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
    validate_config() {
        const tools = exports.config_manager.config.tools || {};
        const validPermissions = ['always', 'ask', 'never'];
        for (const [toolName, toolConfig] of Object.entries(tools)) {
            // Ensure permission is valid
            if (toolConfig.permission && !validPermissions.includes(toolConfig.permission)) {
                console.warn(`Invalid permission "${toolConfig.permission}" for tool ${toolName}. Defaulting to "never".`);
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
    get_tool_config(toolName) {
        // Bypass for tool rename since it is an internal tool
        if (toolName === 'name_conversation')
            return { permission: 'always' };
        return exports.config_manager.config.tools[toolName] || { permission: 'never' };
    },
    /**
     * Set permission for a specific tool
     */
    set_tool_permission(toolName, permission) {
        if (!exports.config_manager.config.tools[toolName]) {
            exports.config_manager.config.tools[toolName] = { permission };
        }
        else {
            exports.config_manager.config.tools[toolName].permission = permission;
        }
        return exports.Agent;
    },
    /**
     * Enable a tool (set permission to "always")
     */
    enable_tool(toolName) {
        return exports.Agent.set_tool_permission(toolName, 'always');
    },
    /**
     * Disable a tool (set permission to "never")
     */
    disable_tool(toolName) {
        return exports.Agent.set_tool_permission(toolName, 'never');
    },
    /**
     * Require confirmation for a tool (set permission to "ask")
     */
    require_confirmation_for_tool(toolName) {
        return exports.Agent.set_tool_permission(toolName, 'ask');
    },
    /**
     * Create getter for private default config
     */
    get_default_config() {
        return exports.config_manager.default_config;
    },
    config: (0, shared_1.PREP_AGENT_CONFIG)(exports.config_manager.config),
    /**
     * Get configuration for a specific tool
     */
    get_tool_paths() {
        // Bypass for tool rename since it is an internal tool
        return exports.config_manager.config.tool_paths;
    },
    get_mcp_servers() {
        // Bypass for tool rename since it is an internal tool
        return exports.config_manager.config.mcp_servers;
    },
    get_skill_paths() {
        // Bypass for tool rename since it is an internal tool
        return exports.config_manager.config.skill_paths;
    },
};
//# sourceMappingURL=ToolAgent.js.map