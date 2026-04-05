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
exports.SessionManager = exports.LockManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const ToolAgent_1 = require("./ToolAgent");
const shared_1 = require("./shared");
const session_root = path.join(os.homedir(), '.IntelliDesk/sessions');
const lock_root = path.join(os.homedir(), '.IntelliDesk/.locks');
const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
const write_file = (file, data) => {
    try {
        if (typeof data === 'object') {
            data = JSON.stringify(data, null, 2);
        }
        fs.writeFileSync(file, data);
        return true;
    }
    catch (err) {
        console.error('Error writing to file:', err);
        return false;
    }
};
exports.LockManager = {
    create: (session_id) => {
        const lock_id = `lock_${generateUUID()}`; //_${chat_id.slice(-4)}`
        const sessLock = {
            session_id: session_id,
            lock_id: lock_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        write_file(path.join(lock_root, `${lock_id}.json`), sessLock);
        return sessLock;
    },
    read: (lock_id) => {
        try {
            const file = path.join(lock_root, `${lock_id}.json`);
            const data = fs.readFileSync(file, 'utf8');
            if (data)
                return JSON.parse(data);
        }
        catch (err) {
            //
        }
        return null;
    },
    delete: (lock_id) => {
        // get session data first
        const sess_data = exports.SessionManager.read(lock_id);
        if (!sess_data)
            return false;
        try {
            fs.rmdirSync(path.join(lock_root, `${lock_id}.json`));
            return true;
        }
        catch (err) {
            return false;
        }
    },
    update: (lock_id, data) => {
        const lock_data = exports.LockManager.read(lock_id);
        const new_lock_data = {
            ...lock_data,
            ...data,
            updated_at: new Date().toISOString()
        };
        write_file(path.join(session_root, `${lock_id}.json`), new_lock_data);
        return new_lock_data;
    },
    purge: () => {
        const lock_files = fs.readdirSync(lock_root);
        try {
            for (const file of lock_files) {
                const lock_id = file.slice(8, -5);
                // console.log("Lock_id", lock_id)
                exports.SessionManager.delete(lock_id);
            }
            return true;
        }
        catch (err) {
            console.log(err);
            return false;
        }
    },
    validate: (lock_id) => {
        const sess_data = exports.SessionManager.read(lock_id);
        if (sess_data)
            return true;
        return false;
    },
    clear: () => undefined
};
exports.SessionManager = {
    create: (chat_id) => {
        const session_id = `session_${generateUUID()}_${chat_id.slice(-4)}`;
        // console.log("conversationId", chat_id)
        const tools = ToolAgent_1.Agent.get_config().tools;
        const enabled = {};
        const disabled = {};
        Object.keys(tools).forEach((key) => {
            if (tools[key].permission !== 'never') {
                enabled[key] = tools[key];
            }
            else {
                disabled[key] = tools[key];
            }
        });
        const session = {
            lock_id: null,
            session_id: session_id,
            session_chat_id: chat_id,
            enabled_tools: enabled,
            disabled_tools: disabled,
            autoapprove_action: 'allow',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        // Disable autolock for now
        // const lock = LockManager.create(session_id)
        // session.lock_id = lock.lock_id
        write_file(path.join(session_root, `${session_id}.json`), session);
        return { session: session, sessionId: session_id };
    },
    read: (session_id) => {
        try {
            const file = path.join(session_root, `${session_id}.json`);
            const data = fs.readFileSync(file, 'utf8');
            if (data)
                return JSON.parse(data);
        }
        catch (err) {
            //
        }
        return null;
    },
    delete: (session_id) => {
        // get session data first
        const sess_data = exports.SessionManager.read(session_id);
        if (!sess_data)
            return false;
        try {
            const lock_id = sess_data.lock_id;
            if (lock_id)
                exports.LockManager.delete(lock_id);
            fs.rmSync(path.join(session_root, `${session_id}.json`));
            return true;
        }
        catch (err) {
            return false;
        }
    },
    update: (session_id, data) => {
        const sess_data = exports.SessionManager.read(session_id);
        const new_sess_data = {
            ...sess_data,
            ...data,
            updated_at: new Date().toISOString()
        };
        write_file(path.join(session_root, `${session_id}.json`), new_sess_data);
        return new_sess_data;
    },
    update_permission: (session_id, permission, toolName) => {
        const session = exports.SessionManager.read(session_id);
        if (session && session.enabled_tools) {
            session.enabled_tools[toolName].permission = permission;
            write_file(path.join(session_root, `${session_id}.json`), session);
        }
        return session;
    },
    purge: () => {
        const session_files = fs.readdirSync(session_root);
        try {
            for (const file of session_files) {
                const session_id = file.slice(0, -5); // slice(0, -10)
                exports.SessionManager.delete(session_id);
            }
            return true;
        }
        catch (err) {
            console.log(err);
            return false;
        }
    },
    validate: (session_id) => {
        try {
            const sess_data = exports.SessionManager.read(session_id);
            if (!sess_data)
                return false;
            const conversationId = sess_data.session_chat_id;
            if (fs.statfsSync(path.join(shared_1.STORE_DIR, `${conversationId}.json`))) {
                return true;
            }
            return false;
        }
        catch (err) {
            return false;
        }
    },
    clear: (session_id) => {
        if (!exports.SessionManager.validate(session_id)) {
            exports.SessionManager.delete(session_id);
        }
        return true;
    }
};
//# sourceMappingURL=SessionManager.js.map