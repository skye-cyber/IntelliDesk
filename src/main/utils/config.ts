import fs from 'fs'
import path from 'path'
import os from 'os'

/**
 * Manage Agent mode configuration for tool use etc
 */
export class AgentConfigManager {
    constructor() {
        this.config_file = path.join(os.homedir(), '.IntelliDesk/.config/agent_mode_config.json')

        this.default_config = {
            tool_paths: [],
            mcp_servers: [],
            enabled_tools: [],
            disabled_tools: [],
            skill_paths: [],
            tools: {
                bash: {
                    permission: "always",
                    max_output_bytes: 16000,
                    default_timeout: 30,
                    allowlist: [
                        "echo",
                        "find",
                        "git diff",
                        "git log",
                        "git status",
                        "tree",
                        "whoami",
                        "cat",
                        "file",
                        "head",
                        "ls",
                        "pwd",
                        "stat",
                        "tail",
                        "uname",
                        "wc",
                        "which"
                    ],
                    denylist: [
                        "gdb",
                        "pdb",
                        "passwd",
                        "nano",
                        "vim",
                        "vi",
                        "emacs",
                        "bash -i",
                        "sh -i",
                        "zsh -i",
                        "fish -i",
                        "dash -i",
                        "screen",
                        "tmux"
                    ],
                    denylist_standalone: [
                        "python",
                        "python3",
                        "ipython",
                        "bash",
                        "sh",
                        "nohup",
                        "vi",
                        "vim",
                        "emacs",
                        "nano",
                        "su"
                    ],
                },
                grep: {
                    permission: "always",
                    allowlist: [],
                    denylist: [],
                    max_output_bytes: 64000,
                    default_max_matches: 100,
                    default_timeout: 60,
                    exclude_patterns: [
                        ".venv/",
                        "venv/",
                        ".env/",
                        "env/",
                        "node_modules/",
                        ".git/",
                        "__pycache__/",
                        ".pytest_cache/",
                        ".mypy_cache/",
                        ".tox/",
                        ".nox/",
                        ".coverage/",
                        "htmlcov/",
                        "dist/",
                        "build/",
                        ".idea/",
                        ".vscode/",
                        "*.egg-info",
                        "*.pyc",
                        "*.pyo",
                        "*.pyd",
                        ".DS_Store",
                        "Thumbs.db"
                    ],
                    codeignore_file: ".intellideskignore"
                },
                search_replace: {
                    permission: "always",
                    allowlist: [],
                    denylist: [],
                    max_content_size: 100000,
                    create_backup: false,
                    fuzzy_threshold: 0.9
                },
                todo: {
                    permission: "always",
                    allowlist: [],
                    denylist: [],
                    max_todos: 100
                },
                write_file: {
                    permission: "always",
                    allowlist: [],
                    denylist: [],
                    max_write_bytes: 64000,
                    create_parent_dirs: true
                },
                read_file: {
                    permission: "always",
                    allowlist: [],
                    denylist: [],
                    max_read_bytes: 64000,
                    max_state_history: 10
                },
                search_web: {
                    permission: "ask",
                    max_results: 5,
                    timeout: 10,
                    safe_search: true
                },
                get_weather: {
                    permission: "ask",
                    default_unit: "celsius",
                    cache_duration: 300, // 5 minutes in seconds
                    api_timeout: 5
                },
                calculate: {
                    permission: "always",
                    max_expression_length: 100,
                    max_precision: 10,
                    allow_complex_numbers: false
                },
                file_operations: {
                    max_recurse_depth: 30, // prevents memory pressure for large directories
                    permission: "ask",
                    allowlist: [
                        "read",
                        "list",
                        "copy",
                        "stats",
                        "exists",
                        "read_dir",
                    ],
                    denylist: [
                        "delete",
                        "write",
                        "move",
                    ],
                    max_file_size: 1048576, // 1MB
                    safe_paths: [
                        "/home",
                        "/tmp",
                        "/var/tmp"
                    ]
                },
                database_query: {
                    permission: "never",
                    max_rows: 100,
                    timeout: 15
                },
                send_message: {
                    permission: "ask",
                    max_message_length: 500,
                    allowed_types: ["text", "email", "sms"]
                }
            },
        }
        this.config = this.default_config

        this.ignore_file = path.join(os.homedir(), '.IntelliDesk/.config/', this.config.tools.grep.codeignore_file)

        this.check_local_config()
        this.ensure_ignore_file_exist()
    }
    /**
     * @param {JSON} config New config
     * @returns  {this} this
     */
    set_config(config) {
        let new_config = config

        if (typeof config === 'string') {
            new_config = JSON.parse(config)
        } else if (typeof config === 'json') {
            new_config = config
        }
        if (!new_config) return this

        this.config = new_config

        return this
    }
    /**
     * Check if local config file exist and create it in not
     */
    check_local_config() {
        if (!fs.existsSync(this.config_file) || !fs.statfsSync(this.config_file)) {
            return this.write_config()
        }
        return true
    }
    ensure_ignore_file_exist() {
        if (!fs.existsSync(this.ignore_file) || !fs.statfsSync(this.config_file)) {
            fs.writeFile(this.ignore_file, this.config.tools.grep.exclude_patterns.toString().replaceAll(',', '\n'), (err) => {
                console.log("Error writing to local ignore file:", err)
                return false
            })
        }
        return true
    }
    get_config() {
        const config = this.read_config()
        return JSON.parse(config)
    }
    write_config() {
        fs.writeFile(this.config_file, JSON.stringify(this.config, null, 2), (err) => {
            console.log("Error writing to local config:", err)
            return false
        })
        return true
    }
    update_local_config() {
        const local_config = this.get_config()
        if (local_config !== this.config) {
            return this.write_config()
        }
        return true
    }
    read_config() {
        this.check_local_config()
        return fs.readFile(this.config_file)
    }
    validate_config() {
        // Validate tool configurations
        const tools = this.config.tools || {};

        for (const [toolName, toolConfig] of Object.entries(tools)) {
            // Ensure permission is valid
            const validPermissions = ["always", "ask", "never"];
            if (toolConfig.permission && !validPermissions.includes(toolConfig.permission)) {
                console.warn(`Invalid permission "${toolConfig.permission}" for tool ${toolName}. Defaulting to "never".`);
                toolConfig.permission = "never";
            }

            // Set defaults for missing configurations
            if (!toolConfig.permission) {
                toolConfig.permission = "never";
            }
        }

        return true;
    }

    get_tool_config(toolName) {
        return this.config.tools[toolName] || {
            permission: "never"
        };
    }

    set_tool_permission(toolName, permission) {
        if (!this.config.tools[toolName]) {
            this.config.tools[toolName] = {};
        }
        this.config.tools[toolName].permission = permission;
        return this;
    }

    enable_tool(toolName) {
        return this.set_tool_permission(toolName, "always");
    }

    disable_tool(toolName) {
        return this.set_tool_permission(toolName, "never");
    }

    require_confirmation_for_tool(toolName) {
        return this.set_tool_permission(toolName, "ask");
    }
}

export const agent = new AgentConfigManager()

