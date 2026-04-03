import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Agent, ToolConfig } from './ToolAgent';

export interface ToolConfigEnabled {
    permission: 'always' | 'ask';
    allowlist?: string[];
    denylist?: string[];
    [key: string]: any; // Allow other tool-specific properties
}

export interface ToolConfigDisabled {
    permission: 'never' | 'deny';
    allowlist?: string[];
    denylist?: string[];
    [key: string]: any; // Allow other tool-specific properties
}

export interface Session {
    lock_id: string | null
    session_id: string // Embraces a random string plus 4 rightmost strings of the conversation bound
    session_chat_id: string | typeof path // Chat/conversation file bound to session
    enabled_tools: Record<string, ToolConfigEnabled>
    disabled_tools: Record<string, ToolConfigDisabled>
    autoapprove_action: 'allow' | 'deny'
    created_at: string
    updated_at: string
}

export interface SessionLock {
    session_id: string
    lock_id: string
    created_at: string
    updated_at: string
}

const session_root: string = path.join(os.homedir(), '.IntelliDesk/sessions');
const lock_root: string = path.join(os.homedir(), '.IntelliDesk/.locks');

export interface LockManagerType {
    create: (session_id: string) => SessionLock  // Create new lock on conversation creation
    delete: (lock_id: string) => boolean // Delete certain lock
    clear: () => undefined // Clear old locks
    purge: () => boolean // Nuke all locks
    update: (lock_id: string, data: Partial<SessionLock>) => SessionLock // Update lock
    read: (lock_id: string) => SessionLock | null  // Read lock content
    validate: (lock_id: string) => boolean // check if lock is valid
}

export interface SessionManagerType {
    create: (chat_id: string) => SessionInfor
    delete: (session_id: string) => boolean
    clear: () => undefined
    purge: () => boolean
    update: (session_id: string, data: Partial<Session>) => Session // Update session
    read: (session_id: string) => Session | null // Read session content
    validate: (session_id: string) => boolean //check if session is valid
}

interface SessionInfor {
    session: Session
    sessionId: string
}

const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const write_file = (file: string, data: string | Object): boolean => {
    try {
        if (typeof data === 'object') {
            data = JSON.stringify(data, null, 2)
        }
        fs.writeFileSync(file, data as string);
        return true;
    } catch (err) {
        console.error('Error writing to file:', err);
        return false;
    }
}

export const LockManager: LockManagerType = {
    create: (session_id: string): SessionLock => {
        const lock_id = `lock_${generateUUID()}` //_${chat_id.slice(-4)}`
        const sessLock: SessionLock = {
            session_id: session_id,
            lock_id: lock_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
        write_file(path.join(lock_root, `${lock_id}.json`), sessLock)
        return sessLock
    },
    read: (lock_id: string): SessionLock | null => {
        try {
            const file = path.join(lock_root, `${lock_id}.json`)
            const data = fs.readFileSync(file, 'utf8')
            if (data) return JSON.parse(data) as SessionLock
        } catch (err) {
            //
        }
        return null
    },
    delete: (lock_id: string): boolean => {
        // get session data first
        const sess_data = SessionManager.read(lock_id)
        if (!sess_data) return false

        try {
            fs.rmdirSync(path.join(lock_root, `${lock_id}.json`))
            return true
        } catch (err) {
            return false
        }
    },
    update: (lock_id: string, data: Partial<SessionLock>): SessionLock => {
        const lock_data = LockManager.read(lock_id)
        const new_lock_data = {
            ...lock_data,
            ...data,
            updated_at: new Date().toISOString()
        }
        write_file(path.join(session_root, `${lock_id}.json`), new_lock_data)
        return new_lock_data as SessionLock
    },
    purge: (): boolean => {
        const lock_files = fs.readdirSync(lock_root)
        try {
            for (const file of lock_files) {
                const lock_id = file.slice(8, -5)
                console.log("Lock_id", lock_id)
                SessionManager.delete(lock_id)
            }
            return true
        } catch (err) {
            console.log(err)
            return false
        }
    },
    validate: (lock_id: string): boolean => {
        const sess_data = SessionManager.read(lock_id) as Session
        if (sess_data) return true
        return false
    },
    clear: () => undefined
}

export const SessionManager: SessionManagerType = {
    create: (chat_id: string): SessionInfor => {
        const session_id = `session_${generateUUID()}_${chat_id.slice(-4)}`
        console.log("OnversationId", chat_id)

        const tools: Record<string, ToolConfig> = Agent.get_config().tools
        const enabled: Record<string, ToolConfigEnabled> = {}
        const disabled: Record<string, ToolConfigDisabled> = {}

        Object.keys(tools).forEach((key: string) => {
            if (tools[key].permission !== 'never') {
                enabled[key] = tools[key] as ToolConfigEnabled
            } else {
                disabled[key] = tools[key] as ToolConfigDisabled
            }
        })
        const session: Session = {
            lock_id: null,
            session_id: session_id,
            session_chat_id: chat_id,
            enabled_tools: enabled,
            disabled_tools: disabled,
            autoapprove_action: 'allow',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
        // Disable autolock for now
        // const lock = LockManager.create(session_id)
        // session.lock_id = lock.lock_id
        write_file(path.join(session_root, `${session_id}.json`), session)
        return { session: session, sessionId: session_id } as SessionInfor
    },
    read: (session_id: string): Session | null => {
        try {
            const file = path.join(session_root, `${session_id}.json`)
            const data = fs.readFileSync(file, 'utf8')
            if (data) return JSON.parse(data) as Session
        } catch (err) {
            //
        }
        return null
    },
    delete: (session_id: string): boolean => {
        // get session data first
        const sess_data = SessionManager.read(session_id)
        if (!sess_data) return false

        try {
            const lock_id = sess_data.lock_id
            if (lock_id) LockManager.delete(lock_id)
            fs.rmdirSync(path.join(session_root, `${session_id}.json`))
            return true
        } catch (err) {
            return false
        }
    },
    update: (session_id: string, data: Partial<Session>): Session => {
        const sess_data = SessionManager.read(session_id)
        const new_sess_data = {
            ...sess_data,
            ...data,
            updated_at: new Date().toISOString()
        }
        write_file(path.join(session_root, `${session_id}.json`), new_sess_data)
        return new_sess_data as Session
    },
    purge: (): boolean => {
        const session_files = fs.readdirSync(session_root)
        try {
            for (const file of session_files) {
                const session_id = file.slice(8, -5) // slice(8, -10)
                console.log("Sess_id", session_id)
                SessionManager.delete(session_id)
            }
            return true
        } catch (err) {
            console.log(err)
            return false
        }
    },
    validate: (session_id: string): boolean => {
        const sess_data = SessionManager.read(session_id) as Session
        if (sess_data) return true
        return false
    },
    clear: () => undefined
}
