"use strict";
/**
 * Portal Bridge for managing dynamic component rendering
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamingPortalBridge = exports.staticPortalBridge = void 0;
exports.clearMessages = clearMessages;
class StaticPortalBridge {
    constructor() {
        this.portals = new Map();
        this.subscribers = new Map();
        this.portalContainers = new Map();
    }
    /**
     * Register a target container for specific components
     */
    registerContainer(containerId, domElement) {
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
    showComponentInTarget(componentType, containerId, props = {}, portalPrefix = '') {
        const portalId = `${portalPrefix}${portalPrefix ? '-' : ''}portal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const newProps = {
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
    showComponent(componentType, props = {}, portalPrefix = '') {
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
    closeComponent(portalId, prefix = false) {
        const event = new CustomEvent('data-portal-close', {
            detail: { id: portalId, prefix: prefix }
        });
        document.dispatchEvent(event);
    }
    /**
     * Close all components in a specific container
     */
    closeAllInContainer(containerId) {
        const event = new CustomEvent('data-portal-close-container', {
            detail: { containerId }
        });
        document.dispatchEvent(event);
    }
    /**
     * Show component asynchronously with Promise
     */
    showComponentAsync(componentType, props = {}) {
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
    showComponentInTargetAsync(componentType, containerId, props = {}) {
        return new Promise((resolve) => {
            this.showComponentInTarget(componentType, containerId, {
                ...props,
                onResolve: resolve
            });
        });
    }
}
class StreamingPortalBridge {
    constructor() {
        this.portals = new Map();
        this.subscribers = new Map();
        this.streamingPortals = new Map();
    }
    /**
     * Register a streaming component
     */
    registerStreamingComponent(componentName, Component) {
        this.streamingPortals.set(componentName, Component);
    }
    /**
     * Create a streaming portal
     */
    createStreamingPortal(componentType, containerId, initialProps = {}, portalPrefix = '') {
        const portalId = `${portalPrefix}${portalPrefix ? '-' : ''}stream-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const streamController = {
            id: portalId,
            update: (newProps) => this.updateStreamingPortal(portalId, newProps),
            close: () => this.closeStreamingPortal(portalId),
            append: (data) => this.appendToStreamingPortal(portalId, data),
            appendComponent: (componentType, componentProps, options) => this.appendComponentToStreamingPortal(portalId, componentType, componentProps, options)
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
    updateStreamingPortal(portalId, newProps) {
        const event = new CustomEvent('stream-data-portal-update', {
            detail: { portalId, props: newProps }
        });
        document.dispatchEvent(event);
    }
    /**
     * Append data to streaming portal
     */
    appendToStreamingPortal(portalId, data, options = {}) {
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
    appendComponentToStreamingPortal(portalId, componentType, componentProps = {}, options = {}) {
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
    appendComponentAsChild(portalId, componentType, componentProps = {}) {
        return this.appendComponentToStreamingPortal(portalId, componentType, componentProps, {
            target: 'componentChildren',
            position: 'append'
        });
    }
    /**
     * Convenience: Prepend a component as a child of the portal
     */
    prependComponentAsChild(portalId, componentType, componentProps = {}) {
        return this.appendComponentToStreamingPortal(portalId, componentType, componentProps, {
            target: 'componentChildren',
            position: 'prepend'
        });
    }
    /**
     * Convenience: Insert a component at a specific position
     */
    insertComponentAt(portalId, componentType, componentProps = {}, index = 0) {
        return this.appendComponentToStreamingPortal(portalId, componentType, componentProps, {
            target: 'componentChildren',
            position: 'insertAt',
            index
        });
    }
    /**
     * Convenience: Append a component as props.children (alternative approach)
     */
    appendComponentToProps(portalId, componentType, componentProps = {}) {
        return this.appendComponentToStreamingPortal(portalId, componentType, componentProps, {
            target: 'props',
            position: 'append'
        });
    }
    /**
     * Update props of a streaming portal
     */
    updateProps(portalId, props) {
        this.appendToStreamingPortal(portalId, props, {
            mergeStrategy: 'update',
            target: 'props'
        });
    }
    /**
     * Append stream data to portal
     */
    appendStreamData(portalId, data) {
        this.appendToStreamingPortal(portalId, data, {
            mergeStrategy: 'append',
            target: 'streamData'
        });
    }
    /**
     * Replace props of a streaming portal
     */
    replaceProps(portalId, props) {
        this.appendToStreamingPortal(portalId, props, {
            mergeStrategy: 'replace',
            target: 'props'
        });
    }
    /**
     * Close a streaming portal
     */
    closeStreamingPortal(portalId, prefix = false) {
        const event = new CustomEvent('stream-data-portal-close', {
            detail: { portalId: portalId, prefix: prefix }
        });
        document.dispatchEvent(event);
    }
    /**
     * Batch update multiple portals
     */
    batchUpdate(updates) {
        const event = new CustomEvent('batch-data-portal-update', {
            detail: { updates }
        });
        document.dispatchEvent(event);
    }
}
// Singleton instances
exports.staticPortalBridge = new StaticPortalBridge();
exports.streamingPortalBridge = new StreamingPortalBridge();
/**
 * Close all portals with specific prefixes
 */
function clearMessages() {
    const prefixes = ['user_message', 'ai_message'];
    for (const pid of prefixes) {
        exports.staticPortalBridge.closeComponent(pid, true);
        exports.streamingPortalBridge.closeStreamingPortal(pid, true);
    }
}
//# sourceMappingURL=PortalBridge.js.map
