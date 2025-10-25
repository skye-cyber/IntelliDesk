class EventHandler {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    const { ipcRenderer } = require('electron');
    const listener = (event, data) => callback(data);
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

module.exports = { EventHandler };
