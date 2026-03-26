/**
 * Portal Bridge for managing dynamic component rendering
 */
interface ComponentProps {
    [key: string]: any;
    portal_id?: string;
    onResolve?: (value: any) => void;
}
interface StreamController {
    id: string;
    update: (newProps: ComponentProps) => void;
    close: () => void;
    append: (data: ComponentProps) => void;
    appendComponent: (componentType: string, componentProps: ComponentProps, options: AppendOptions) => void;
}
interface AppendOptions {
    target?: 'componentChildren' | 'props';
    position?: 'append' | 'prepend' | 'insertAt';
    index?: number;
    mergeStrategy?: 'append' | 'update' | 'replace';
}
interface StreamingPortalOptions {
    mergeStrategy?: 'append' | 'update' | 'replace';
    target?: 'props' | 'streamData';
    [key: string]: any;
}
export interface PortalEventDetail {
    portalId?: string;
    componentType?: string;
    containerId?: string;
    props?: ComponentProps;
    controller?: StreamController;
    data?: ComponentProps;
    options?: AppendOptions;
    componentProps?: ComponentProps;
    id?: string;
    prefix?: boolean;
    updates?: Record<string, any>;
}
interface DataPortalShowEvent extends CustomEvent {
    detail: {
        portalId: string;
        componentType: string;
        props: ComponentProps;
    };
}
interface DataPortalShowTargetedEvent extends CustomEvent {
    detail: {
        portalId: string;
        componentType: string;
        containerId: string;
        props: ComponentProps;
    };
}
interface DataPortalCloseEvent extends CustomEvent {
    detail: {
        id: string;
        prefix: boolean;
    };
}
interface DataPortalCloseContainerEvent extends CustomEvent {
    detail: {
        containerId: string;
    };
}
interface StreamDataPortalCreateEvent extends CustomEvent {
    detail: {
        portalId: string;
        componentType: string;
        containerId: string;
        props: ComponentProps;
        controller: StreamController;
    };
}
interface StreamDataPortalUpdateEvent extends CustomEvent {
    detail: {
        portalId: string;
        props: ComponentProps;
    };
}
interface StreamDataPortalAppendEvent extends CustomEvent {
    detail: {
        portalId: string;
        data: ComponentProps;
        options: StreamingPortalOptions;
    };
}
interface StreamDataPortalAppendComponentEvent extends CustomEvent {
    detail: {
        portalId: string;
        componentType: string;
        componentProps: ComponentProps;
        options: AppendOptions;
    };
}
interface StreamDataPortalCloseEvent extends CustomEvent {
    detail: {
        portalId: string;
        prefix: boolean;
    };
}
interface BatchDataPortalUpdateEvent extends CustomEvent {
    detail: {
        updates: Record<string, any>;
    };
}
declare global {
    interface DocumentEventMap {
        'data-portal-show': DataPortalShowEvent;
        'data-portal-show-targeted': DataPortalShowTargetedEvent;
        'data-portal-close': DataPortalCloseEvent;
        'data-portal-close-container': DataPortalCloseContainerEvent;
        'stream-data-portal-create': StreamDataPortalCreateEvent;
        'stream-data-portal-update': StreamDataPortalUpdateEvent;
        'stream-data-portal-append': StreamDataPortalAppendEvent;
        'stream-data-portal-append-component': StreamDataPortalAppendComponentEvent;
        'stream-data-portal-close': StreamDataPortalCloseEvent;
        'batch-data-portal-update': BatchDataPortalUpdateEvent;
    }
}
declare class StaticPortalBridge {
    private portals;
    private subscribers;
    private portalContainers;
    constructor();
    /**
     * Register a target container for specific components
     */
    registerContainer(containerId: string, domElement: Element): void;
    /**
     * Show component in a specific target container
     */
    showComponentInTarget(componentType: string, containerId: string, props?: ComponentProps, portalPrefix?: string): string;
    /**
     * Original global show method
     */
    showComponent(componentType: string, props?: ComponentProps, portalPrefix?: string): string;
    /**
     * Close a component
     */
    closeComponent(portalId: string, prefix?: boolean): void;
    /**
     * Close all components in a specific container
     */
    closeAllInContainer(containerId: string): void;
    /**
     * Show component asynchronously with Promise
     */
    showComponentAsync(componentType: string, props?: ComponentProps): Promise<any>;
    /**
     * Show component in target asynchronously with Promise
     */
    showComponentInTargetAsync(componentType: string, containerId: string, props?: ComponentProps): Promise<any>;
}
declare class StreamingPortalBridge {
    private portals;
    private subscribers;
    private streamingPortals;
    constructor();
    /**
     * Register a streaming component
     */
    registerStreamingComponent(componentName: string, Component: any): void;
    /**
     * Create a streaming portal
     */
    createStreamingPortal(componentType: string, containerId: string, initialProps?: ComponentProps, portalPrefix?: string): StreamController;
    /**
     * Update streaming portal with new props
     */
    updateStreamingPortal(portalId: string, newProps: ComponentProps): void;
    /**
     * Append data to streaming portal
     */
    appendToStreamingPortal(portalId: string, data: ComponentProps, options?: StreamingPortalOptions): void;
    /**
     * Append a component to a streaming portal
     */
    appendComponentToStreamingPortal(portalId: string, componentType: string, componentProps?: ComponentProps, options?: AppendOptions): {
        portalId: string;
        componentType: string;
        componentProps: ComponentProps;
    };
    /**
     * Convenience: Append a component as a child of the portal (in-place appending)
     */
    appendComponentAsChild(portalId: string, componentType: string, componentProps?: ComponentProps): {
        portalId: string;
        componentType: string;
        componentProps: ComponentProps;
    };
    /**
     * Convenience: Prepend a component as a child of the portal
     */
    prependComponentAsChild(portalId: string, componentType: string, componentProps?: ComponentProps): {
        portalId: string;
        componentType: string;
        componentProps: ComponentProps;
    };
    /**
     * Convenience: Insert a component at a specific position
     */
    insertComponentAt(portalId: string, componentType: string, componentProps?: ComponentProps, index?: number): {
        portalId: string;
        componentType: string;
        componentProps: ComponentProps;
    };
    /**
     * Convenience: Append a component as props.children (alternative approach)
     */
    appendComponentToProps(portalId: string, componentType: string, componentProps?: ComponentProps): {
        portalId: string;
        componentType: string;
        componentProps: ComponentProps;
    };
    /**
     * Update props of a streaming portal
     */
    updateProps(portalId: string, props: ComponentProps): void;
    /**
     * Append stream data to portal
     */
    appendStreamData(portalId: string, data: ComponentProps): void;
    /**
     * Replace props of a streaming portal
     */
    replaceProps(portalId: string, props: ComponentProps): void;
    /**
     * Close a streaming portal
     */
    closeStreamingPortal(portalId: string, prefix?: boolean): void;
    /**
     * Batch update multiple portals
     */
    batchUpdate(updates: Record<string, any>): void;
}
export declare const staticPortalBridge: StaticPortalBridge;
export declare const streamingPortalBridge: StreamingPortalBridge;
/**
 * Close all portals with specific prefixes
 */
export declare function closePrefixed(): void;
export {};
//# sourceMappingURL=PortalBridge.d.ts.map