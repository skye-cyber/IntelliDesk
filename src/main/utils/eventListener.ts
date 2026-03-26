export class EventHandler {
  private listeners: Map<CallableFunction, { event: Event; listener: (event: Event, ...args: any[]) => void }>;

  constructor() {
    this.listeners = new Map();
  }

  on(event: Event, callback: CallableFunction): () => void {
    const { ipcRenderer } = require('electron');
    const listener = (event: Event, data: any) => callback(event, data);
    ipcRenderer.on(event, listener);

    this.listeners.set(callback, { event, listener });
    return () => this.off(event, callback);
  }

  off(event: Event, callback: CallableFunction): void {
    const { ipcRenderer } = require('electron');
    const listenerInfo = this.listeners.get(callback);
    if (listenerInfo) {
      ipcRenderer.off(event, listenerInfo.listener);
      this.listeners.delete(callback);
    }
  }
}

export const eventhandler = new EventHandler();
