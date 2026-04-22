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
exports.PREPED_DEFAULT_AGENT_CONFIG = exports.PREP_AGENT_CONFIG = exports.DEFAULT_AGENT_CONFIG = exports.DEFAULT_SKILLS_PATH = exports.DEFAULT_DOWNLOAD_PATH = exports.USER_PREFERENCE_CONFIG_FILE = exports.AGENT_CONFIG_FILE = exports.SESSIONS_DIR = exports.LOCKS_DIR = exports.CACHE_DIR = exports.CONFIG_DIR = exports.STORE_DIR = exports.BASE_DIR = void 0;
const path = __importStar(require("path"));
const os = __importStar(require("os"));
exports.BASE_DIR = path.join(os.homedir(), '.IntelliDesk');
exports.STORE_DIR = path.join(exports.BASE_DIR, '.store');
exports.CONFIG_DIR = path.join(exports.BASE_DIR, '.config');
exports.CACHE_DIR = path.join(exports.BASE_DIR, '.cache');
exports.LOCKS_DIR = path.join(exports.BASE_DIR, '.locks');
exports.SESSIONS_DIR = path.join(exports.BASE_DIR, 'sessions');
exports.AGENT_CONFIG_FILE = path.join(exports.CONFIG_DIR, 'agent_config.json');
exports.USER_PREFERENCE_CONFIG_FILE = path.join(exports.CONFIG_DIR, 'user_preference.json');
exports.DEFAULT_DOWNLOAD_PATH = path.join(os.homedir(), 'Downloads');
exports.DEFAULT_SKILLS_PATH = path.join(exports.BASE_DIR, 'skills');
exports.DEFAULT_AGENT_CONFIG = {
    tool_paths: [],
    mcp_servers: [],
    enabled_tools: [],
    disabled_tools: [],
    skill_paths: [exports.DEFAULT_SKILLS_PATH],
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
                'df',
                'print',
                'cd',
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
                'unlink',
                'sudo',
                'su'
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
            max_output_bytes: 1200,
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
        filesystem: {
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
const PREP_AGENT_CONFIG = (config = exports.DEFAULT_AGENT_CONFIG) => {
    const tools = config.tools;
    const ENABLED = [];
    const DISABLED = [];
    Object.keys(tools).forEach((key) => {
        if (tools[key].permission !== 'never') {
            ENABLED.push(key);
        }
        else {
            DISABLED.push(key);
        }
    });
    config.enabled_tools = ENABLED;
    config.disabled_tools = DISABLED;
    return config;
};
exports.PREP_AGENT_CONFIG = PREP_AGENT_CONFIG;
exports.PREPED_DEFAULT_AGENT_CONFIG = (0, exports.PREP_AGENT_CONFIG)();
//# sourceMappingURL=shared.js.map