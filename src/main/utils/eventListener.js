"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventhandler = exports.EventHandler = void 0;
class EventHandler {
    constructor() {
        this.listeners = new Map();
    }
    on(event, callback) {
        const { ipcRenderer } = require('electron');
        const listener = (event, data) => callback(event, data);
        ipcRenderer.on(event, listener);
        this.listeners.set(callback, { event, listener });
        return () => this.off(event, callback);
    }
    off(event, callback) {
        const { ipcRenderer } = require('electron');
        const listenerInfo = this.listeners.get(callback);
        if (listenerInfo) {
            ipcRenderer.off(event, listenerInfo.listener);
            this.listeners.delete(callback);
        }
    }
}
exports.EventHandler = EventHandler;
exports.eventhandler = new EventHandler();
//# sourceMappingURL=eventListener.js.map