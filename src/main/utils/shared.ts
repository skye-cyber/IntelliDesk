import * as path from 'path';
import * as os from 'os';
import { AgentConfig, ToolConfig } from './ToolAgent';

export const BASE_DIR = path.join(os.homedir(), '.IntelliDesk')
export const STORE_DIR = path.join(BASE_DIR, '.store')
export const CONFIG_DIR = path.join(BASE_DIR, '.config')
export const CACHE_DIR = path.join(BASE_DIR, '.cache')
export const LOCKS_DIR = path.join(BASE_DIR, '.locks')
export const SESSIONS_DIR = path.join(BASE_DIR, 'sessions')
export const AGENT_CONFIG_FILE = path.join(CONFIG_DIR, 'agent_config.json')
export const USER_PREFERENCE_CONFIG_FILE = path.join(CONFIG_DIR, 'user_preference.json')
export const DEFAULT_DOWNLOAD_PATH = path.join(os.homedir(), 'Downloads')

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
    tool_paths: [],
    mcp_servers: [],
    enabled_tools: [],
    disabled_tools: [],
    skill_paths: [],
    tools: {
        bash: {
            permission: 'ask',
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
            permission: 'ask',
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
            permission: 'ask',
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
            permission: 'always',
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

export interface Tool {
    permission: 'allow' | 'ask' | 'never';
    allowlist?: string[];
    denylist?: string[];
    [key: string]: any; // Allow other tool-specific properties
}

export const PREP_AGENT_CONFIG = (config: AgentConfig = DEFAULT_AGENT_CONFIG) => {
    const tools: Record<string, ToolConfig> = config.tools
    const ENABLED: Array<string> = []
    const DISABLED: Array<string> = []

    Object.keys(tools).forEach((key: string) => {
        if (tools[key].permission !== 'never') {
            ENABLED.push(key)
        } else {
            DISABLED.push(key)
        }
    })
    config.enabled_tools = ENABLED
    config.disabled_tools = DISABLED

    return config
}

export const PREPED_DEFAULT_AGENT_CONFIG = PREP_AGENT_CONFIG()
