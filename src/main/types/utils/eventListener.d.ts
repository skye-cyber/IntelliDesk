export declare class EventHandler {
    private listeners;
    constructor();
    on(event: Event, callback: CallableFunction): () => void;
    off(event: Event, callback: CallableFunction): void;
}
export declare const eventhandler: EventHandler;
//# sourceMappingURL=eventListener.d.ts.map