import * as path from 'path';
export interface ToolConfigEnabled {
    permission: 'always' | 'ask';
    allowlist?: string[];
    denylist?: string[];
    [key: string]: any;
}
export interface ToolConfigDisabled {
    permission: 'never' | 'deny';
    allowlist?: string[];
    denylist?: string[];
    [key: string]: any;
}
export interface Session {
    lock_id: string | null;
    session_id: string;
    session_chat_id: string | typeof path;
    enabled_tools: Record<string, ToolConfigEnabled>;
    disabled_tools: Record<string, ToolConfigDisabled>;
    autoapprove_action: 'allow' | 'deny';
    created_at: string;
    updated_at: string;
}
export interface SessionLock {
    session_id: string;
    lock_id: string;
    created_at: string;
    updated_at: string;
}
export interface LockManagerType {
    create: (session_id: string) => SessionLock;
    delete: (lock_id: string) => boolean;
    clear: () => undefined;
    purge: () => boolean;
    update: (lock_id: string, data: Partial<SessionLock>) => SessionLock;
    read: (lock_id: string) => SessionLock | null;
    validate: (lock_id: string) => boolean;
}
export interface SessionManagerType {
    create: (chat_id: string) => SessionInfor;
    delete: (session_id: string) => boolean;
    clear: (session_id: string) => boolean;
    purge: () => boolean;
    update: (session_id: string, data: Partial<Session>) => Session;
    update_permission: (session_id: string, permission: 'ask' | 'always', toolName: string) => Session;
    read: (session_id: string) => Session | null;
    validate: (session_id: string) => boolean;
}
interface SessionInfor {
    session: Session;
    sessionId: string;
}
export declare const LockManager: LockManagerType;
export declare const SessionManager: SessionManagerType;
export {};
//# sourceMappingURL=SessionManager.d.ts.map