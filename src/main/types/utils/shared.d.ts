import { AgentConfig } from './ToolAgent';
export declare const BASE_DIR: string;
export declare const STORE_DIR: string;
export declare const CONFIG_DIR: string;
export declare const CACHE_DIR: string;
export declare const LOCKS_DIR: string;
export declare const SESSIONS_DIR: string;
export declare const AGENT_CONFIG_FILE: string;
export declare const USER_PREFERENCE_CONFIG_FILE: string;
export declare const DEFAULT_DOWNLOAD_PATH: string;
export declare const DEFAULT_SKILLS_PATH: string;
export declare const DEFAULT_AGENT_CONFIG: AgentConfig;
export interface Tool {
    permission: 'allow' | 'ask' | 'never';
    allowlist?: string[];
    denylist?: string[];
    [key: string]: any;
}
export declare const PREP_AGENT_CONFIG: (config?: AgentConfig) => AgentConfig;
export declare const PREPED_DEFAULT_AGENT_CONFIG: AgentConfig;
//# sourceMappingURL=shared.d.ts.map