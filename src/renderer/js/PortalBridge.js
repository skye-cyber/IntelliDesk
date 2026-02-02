class StaticPortalBridge {
    constructor() {
        this.portals = new Map();
        this.subscribers = new Map();
        this.portalContainers = new Map(); // For targeted containers
    }

    // Register a target container for specific components
    registerContainer(containerId, domElement) {
        this.portalContainers.set(containerId, domElement);

        // Create a portal root inside the target container if it doesn't exist
        if (!domElement.querySelector('.data-portal-root')) {
            const portalRoot = document.createElement('div');
            portalRoot.className = 'data-portal-root';
            domElement.appendChild(portalRoot);
        }
    }

    // Show component in a specific target container
    showComponentInTarget(componentType, containerId, props = {}, portal_prefix = '') {
        const portalId = `${portal_prefix}${portal_prefix ? '-' : ''}portal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        props = {
            ...props,
            portal_id: portalId
        }

        if (!this.portalContainers.has(containerId)) {
            //console.warn(`Container ${containerId} not registered. Falling back to global.`);
            return this.showComponent(componentType, props);
        }

        props.portal_id = portalId

        const event = new CustomEvent('data-portal-show-targeted', {
            detail: { portalId, componentType, containerId, props }
        });

        document.dispatchEvent(event);

        return portalId;
    }

    // Original global show method
    showComponent(componentType, props = {}, portal_prefix = '') {
        const portalId = `${portal_prefix}${portal_prefix ? '-' : ''}portal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const event = new CustomEvent('data-portal-show', {
            detail: { portalId, componentType, props }
        });
        document.dispatchEvent(event);

        return portalId;
    }

    closeComponent(portalId, prefix = false) {
        const event = new CustomEvent('data-portal-close', {
            detail: { id: portalId, prefix: prefix }
        });
        document.dispatchEvent(event);
    }

    // Close all components in a specific container
    closeAllInContainer(containerId) {
        const event = new CustomEvent('data-portal-close-container', {
            detail: { containerId }
        });
        document.dispatchEvent(event);
    }

    showComponentAsync(componentType, props = {}) {
        return new Promise((resolve) => {
            const portalId = this.showComponent(componentType, {
                ...props,
                onResolve: resolve
            });
        });
    }

    showComponentInTargetAsync(componentType, containerId, props = {}) {
        return new Promise((resolve) => {
            const portalId = this.showComponentInTarget(componentType, containerId, {
                ...props,
                onResolve: resolve
            });
        });
    }
}

class StreamingPortalBridge {
    constructor() {
        this.portals = new Map();
        this.streamingPortals = new Map();
    }

    registerStreamingComponent(componentName, Component) {
        this.streamingPortals.set(componentName, Component);
    }

    createStreamingPortal(componentType, containerId, initialProps = {}, portal_prefix = '') {
        const portalId = `${portal_prefix}${portal_prefix ? '-' : ''}stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const streamController = {
            id: portalId,
            update: (newProps) => this.updateStreamingPortal(portalId, newProps),
            close: () => this.closeStreamingPortal(portalId),
            append: (data) => this.appendToStreamingPortal(portalId, data),
            appendComponent: (componentType, componentProps, options) =>
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

    updateStreamingPortal(portalId, newProps) {
        const event = new CustomEvent('stream-data-portal-update', {
            detail: { portalId, props: newProps }
        });
        document.dispatchEvent(event);
    }

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
     * @param {string} portalId - Target portal ID
     * @param {string} componentType - Component type from registry
     * @param {object} componentProps - Component props
     * @param {object} options - Append options
     * @param {string} options.target - 'componentChildren' (as children) or 'props' (as props.children)
     * @param {string} options.position - 'append' (default), 'prepend', 'insertAt'
     * @param {number} options.index - Index for insertAt
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

    // Convenience methods for common patterns

    /**
     * Append a component as a child of the portal (in-place appending)
     */
    appendComponentAsChild(portalId, componentType, componentProps = {}) {
        return this.appendComponentToStreamingPortal(portalId, componentType, componentProps, {
            target: 'componentChildren',
            position: 'append'
        });
    }

    /**
     * Prepend a component as a child of the portal
     */
    prependComponentAsChild(portalId, componentType, componentProps = {}) {
        return this.appendComponentToStreamingPortal(portalId, componentType, componentProps, {
            target: 'componentChildren',
            position: 'prepend'
        });
    }

    /**
     * Insert a component at a specific position
     */
    insertComponentAt(portalId, componentType, componentProps = {}, index = 0) {
        return this.appendComponentToStreamingPortal(portalId, componentType, componentProps, {
            target: 'componentChildren',
            position: 'insertAt',
            index
        });
    }

    /**
     * Append a component as props.children (alternative approach)
     */
    appendComponentToProps(portalId, componentType, componentProps = {}) {
        return this.appendComponentToStreamingPortal(portalId, componentType, componentProps, {
            target: 'props',
            position: 'append'
        });
    }

    updateProps(portalId, props) {
        this.appendToStreamingPortal(portalId, props, {
            mergeStrategy: 'update',
            target: 'props'
        });
    }

    appendStreamData(portalId, data) {
        this.appendToStreamingPortal(portalId, data, {
            mergeStrategy: 'append',
            target: 'streamData'
        });
    }

    replaceProps(portalId, props) {
        this.appendToStreamingPortal(portalId, props, {
            mergeStrategy: 'replace',
            target: 'props'
        });
    }

    closeStreamingPortal(portalId, prefix = false) {
        const event = new CustomEvent('stream-data-portal-close', {
            detail: { portalId: portalId, prefix: prefix }
        });
        document.dispatchEvent(event);
    }

    batchUpdate(updates) {
        const event = new CustomEvent('batch-data-portal-update', {
            detail: { updates }
        });
        document.dispatchEvent(event);
    }
}


export function ClosePrefixed() {
    for (let pid of ['user_message', 'ai_message']) {
        //staticPortalBridge.closeComponent(pid, true)
        streamingPortalBridge.closeStreamingPortal(pid, true)
    }
}

export const staticPortalBridge = new StaticPortalBridge();

export const streamingPortalBridge = new StreamingPortalBridge();
