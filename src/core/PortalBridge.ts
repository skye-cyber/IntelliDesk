/**
 * Portal Bridge for managing dynamic component rendering
 */

// Type definitions
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

interface PortalEventDetail {
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

// Custom event types
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

class StaticPortalBridge {
    private portals: Map<string, Element>;
    private subscribers: Map<string, Element>;
    private portalContainers: Map<string, Element>;

    constructor() {
        this.portals = new Map<string, Element>();
        this.subscribers = new Map<string, Element>();
        this.portalContainers = new Map<string, Element>();
    }

    /**
     * Register a target container for specific components
     */
    registerContainer(containerId: string, domElement: Element): void {
        this.portalContainers.set(containerId, domElement);

        // Create a portal root inside the target container if it doesn't exist
        if (!domElement.querySelector('.data-portal-root')) {
            const portalRoot = document.createElement('div');
            portalRoot.className = 'data-portal-root';
            domElement.appendChild(portalRoot);
        }
    }

    /**
     * Show component in a specific target container
     */
    showComponentInTarget(
        componentType: string,
        containerId: string,
        props: ComponentProps = {},
        portalPrefix: string = ''
    ): string {
        const portalId = `${portalPrefix}${portalPrefix ? '-' : ''}portal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

        const newProps: ComponentProps = {
            ...props,
            portal_id: portalId
        };

        if (!this.portalContainers.has(containerId)) {
            // Fall back to global
            return this.showComponent(componentType, newProps);
        }

        const event = new CustomEvent('data-portal-show-targeted', {
            detail: { portalId, componentType, containerId, props: newProps }
        });

        document.dispatchEvent(event);

        return portalId;
    }

    /**
     * Original global show method
     */
    showComponent(componentType: string, props: ComponentProps = {}, portalPrefix: string = ''): string {
        const portalId = `${portalPrefix}${portalPrefix ? '-' : ''}portal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

        const event = new CustomEvent('data-portal-show', {
            detail: { portalId, componentType, props }
        });
        document.dispatchEvent(event);

        return portalId;
    }

    /**
     * Close a component
     */
    closeComponent(portalId: string, prefix: boolean = false): void {
        const event = new CustomEvent('data-portal-close', {
            detail: { id: portalId, prefix: prefix }
        });
        document.dispatchEvent(event);
    }

    /**
     * Close all components in a specific container
     */
    closeAllInContainer(containerId: string): void {
        const event = new CustomEvent('data-portal-close-container', {
            detail: { containerId }
        });
        document.dispatchEvent(event);
    }

    /**
     * Show component asynchronously with Promise
     */
    showComponentAsync(componentType: string, props: ComponentProps = {}): Promise<any> {
        return new Promise((resolve) => {
            this.showComponent(componentType, {
                ...props,
                onResolve: resolve
            });
        });
    }

    /**
     * Show component in target asynchronously with Promise
     */
    showComponentInTargetAsync(
        componentType: string,
        containerId: string,
        props: ComponentProps = {}
    ): Promise<any> {
        return new Promise((resolve) => {
            this.showComponentInTarget(componentType, containerId, {
                ...props,
                onResolve: resolve
            });
        });
    }
}

class StreamingPortalBridge {
    private portals: Map<string, Element>;
    private subscribers: Map<string, Element>;
    private streamingPortals: Map<string, any>; // Stores component references

    constructor() {
        this.portals = new Map<string, Element>();
        this.subscribers = new Map<string, Element>();
        this.streamingPortals = new Map<string, any>();
    }

    /**
     * Register a streaming component
     */
    registerStreamingComponent(componentName: string, Component: any): void {
        this.streamingPortals.set(componentName, Component);
    }

    /**
     * Create a streaming portal
     */
    createStreamingPortal(
        componentType: string,
        containerId: string,
        initialProps: ComponentProps = {},
        portalPrefix: string = ''
    ): StreamController {
        const portalId = `${portalPrefix}${portalPrefix ? '-' : ''}stream-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

        const streamController: StreamController = {
            id: portalId,
            update: (newProps: ComponentProps) => this.updateStreamingPortal(portalId, newProps),
            close: () => this.closeStreamingPortal(portalId),
            append: (data: ComponentProps) => this.appendToStreamingPortal(portalId, data),
            appendComponent: (componentType: string, componentProps: ComponentProps, options: AppendOptions) =>
            this.appendComponentToStreamingPortal(portalId, componentType, componentProps, options)
        };

        const event = new CustomEvent('stream-data-portal-create', {
            detail: {
                portalId,
                componentType,
                containerId,
                props: initialProps,
                controller: streamController
            }
        });
        document.dispatchEvent(event);

        return streamController;
    }

    /**
     * Update streaming portal with new props
     */
    updateStreamingPortal(portalId: string, newProps: ComponentProps): void {
        const event = new CustomEvent('stream-data-portal-update', {
            detail: { portalId, props: newProps }
        });
        document.dispatchEvent(event);
    }

    /**
     * Append data to streaming portal
     */
    appendToStreamingPortal(portalId: string, data: ComponentProps, options: StreamingPortalOptions = {}): void {
        const event = new CustomEvent('stream-data-portal-append', {
            detail: {
                portalId,
                data,
                options: {
                    mergeStrategy: 'append',
                    target: 'props',
                    ...options
                }
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Append a component to a streaming portal
     */
    appendComponentToStreamingPortal(
        portalId: string,
        componentType: string,
        componentProps: ComponentProps = {},
        options: AppendOptions = {}
    ): { portalId: string; componentType: string; componentProps: ComponentProps } {
        const event = new CustomEvent('stream-data-portal-append-component', {
            detail: {
                portalId,
                componentType,
                componentProps,
                options: {
                    target: 'componentChildren', // Append as children of the portal
                    position: 'append', // Default: append to end
                    ...options
                }
            }
        });
        document.dispatchEvent(event);

        return { portalId, componentType, componentProps };
    }

    /**
     * Convenience: Append a component as a child of the portal (in-place appending)
     */
    appendComponentAsChild(
        portalId: string,
        componentType: string,
        componentProps: ComponentProps = {}
    ): { portalId: string; componentType: string; componentProps: ComponentProps } {
        return this.appendComponentToStreamingPortal(portalId, componentType, componentProps, {
            target: 'componentChildren',
            position: 'append'
        });
    }

    /**
     * Convenience: Prepend a component as a child of the portal
     */
    prependComponentAsChild(
        portalId: string,
        componentType: string,
        componentProps: ComponentProps = {}
    ): { portalId: string; componentType: string; componentProps: ComponentProps } {
        return this.appendComponentToStreamingPortal(portalId, componentType, componentProps, {
            target: 'componentChildren',
            position: 'prepend'
        });
    }

    /**
     * Convenience: Insert a component at a specific position
     */
    insertComponentAt(
        portalId: string,
        componentType: string,
        componentProps: ComponentProps = {},
        index: number = 0
    ): { portalId: string; componentType: string; componentProps: ComponentProps } {
        return this.appendComponentToStreamingPortal(portalId, componentType, componentProps, {
            target: 'componentChildren',
            position: 'insertAt',
            index
        });
    }

    /**
     * Convenience: Append a component as props.children (alternative approach)
     */
    appendComponentToProps(
        portalId: string,
        componentType: string,
        componentProps: ComponentProps = {}
    ): { portalId: string; componentType: string; componentProps: ComponentProps } {
        return this.appendComponentToStreamingPortal(portalId, componentType, componentProps, {
            target: 'props',
            position: 'append'
        });
    }

    /**
     * Update props of a streaming portal
     */
    updateProps(portalId: string, props: ComponentProps): void {
        this.appendToStreamingPortal(portalId, props, {
            mergeStrategy: 'update',
            target: 'props'
        });
    }

    /**
     * Append stream data to portal
     */
    appendStreamData(portalId: string, data: ComponentProps): void {
        this.appendToStreamingPortal(portalId, data, {
            mergeStrategy: 'append',
            target: 'streamData'
        });
    }

    /**
     * Replace props of a streaming portal
     */
    replaceProps(portalId: string, props: ComponentProps): void {
        this.appendToStreamingPortal(portalId, props, {
            mergeStrategy: 'replace',
            target: 'props'
        });
    }

    /**
     * Close a streaming portal
     */
    closeStreamingPortal(portalId: string, prefix: boolean = false): void {
        const event = new CustomEvent('stream-data-portal-close', {
            detail: { portalId: portalId, prefix: prefix }
        });
        document.dispatchEvent(event);
    }

    /**
     * Batch update multiple portals
     */
    batchUpdate(updates: Record<string, any>): void {
        const event = new CustomEvent('batch-data-portal-update', {
            detail: { updates }
        });
        document.dispatchEvent(event);
    }
}

// Singleton instances
export const staticPortalBridge = new StaticPortalBridge();
export const streamingPortalBridge = new StreamingPortalBridge();

/**
 * Close all portals with specific prefixes
 */
export function closePrefixed(): void {
    const prefixes = ['user_message', 'ai_message'];
    for (const pid of prefixes) {
        staticPortalBridge.closeComponent(pid, true);
        streamingPortalBridge.closeStreamingPortal(pid, true);
    }
}
