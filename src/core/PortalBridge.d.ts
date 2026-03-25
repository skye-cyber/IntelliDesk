declare class StaticPortalBridge {
    constructor();
    registerContainer(containerId: string, domElement: any): void;
    showComponentInTarget(componentType: string, containerId: string, props?: {}, portal_prefix?: string): string;
    showComponent(componentType: string, props?: {}, portal_prefix?: string): string;
    closeComponent(portalId: string, prefix?: boolean): void;
    closeAllInContainer(containerId: string): void;
    showComponentAsync(componentType: string, props?: {}): Promise<unknown>;
    showComponentInTargetAsync(componentType: string, containerId: string, props?: {}): Promise<unknown>;
}
declare class StreamingPortalBridge {
    constructor();
    registerStreamingComponent(componentName: string, Component: any): void;
    createStreamingPortal(componentType: string, containerId: string, initialProps?: {}, portal_prefix?: string): {
        id: string;
        update: (newProps: {}) => void;
        close: () => void;
        append: (data: {}) => void;
        appendComponent: (componentType: string, componentProps: {}, options: {}) => {
            portalId: string;
            componentType: string;
            componentProps: {};
        };
    };
    updateStreamingPortal(portalId: string, newProps: {}): void;
    appendToStreamingPortal(portalId: string, data: {}, options?: {}): void;
    /**
     * Append a component to a streaming portal
     * @param {string} portalId - Target portal ID
     * @param {string} componentType - Component type from registry
     * @param {object} componentProps - Component props
     * @param {object} options - Append options
     * @param {string} options.target - 'componentChildren' (as children) or 'props' (as props.children)
     * @param {string} options.position - 'append' (default), 'prepend', 'insertAt'
     * @param {number} options.index - Index for insertAt
     */
    appendComponentToStreamingPortal(portalId: string, componentType: string, componentProps?: {}, options?: {}): {
        portalId: string;
        componentType: string;
        componentProps: {};
    };
    /**
     * Append a component as a child of the portal (in-place appending)
     */
    appendComponentAsChild(portalId: string, componentType: string, componentProps?: {}): {
        portalId: string;
        componentType: string;
        componentProps: {};
    };
    /**
     * Prepend a component as a child of the portal
     */
    prependComponentAsChild(portalId: string, componentType: string, componentProps?: {}): {
        portalId: string;
        componentType: string;
        componentProps: {};
    };
    /**
     * Insert a component at a specific position
     */
    insertComponentAt(portalId: string, componentType: string, componentProps?: {}, index?: number): {
        portalId: string;
        componentType: string;
        componentProps: {};
    };
    /**
     * Append a component as props.children (alternative approach)
     */
    appendComponentToProps(portalId: string, componentType: string, componentProps?: {}): {
        portalId: string;
        componentType: string;
        componentProps: {};
    };
    updateProps(portalId: string, props: {}): void;
    appendStreamData(portalId: string, data: {}): void;
    replaceProps(portalId: string, props: {}): void;
    closeStreamingPortal(portalId: string, prefix?: boolean): void;
    batchUpdate(updates: {}): void;
}
export declare function ClosePrefixed(): void;
export declare const staticPortalBridge: StaticPortalBridge;
export declare const streamingPortalBridge: StreamingPortalBridge;
export {};
//# sourceMappingURL=PortalBridge.d.ts.map