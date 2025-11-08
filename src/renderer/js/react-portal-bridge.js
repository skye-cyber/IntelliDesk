class ReactPortalBridge {
    constructor() {
        this.portals = new Map();
        this.subscribers = new Map();
        this.portalContainers = new Map(); // For targeted containers
    }

    // Register a target container for specific components
    registerContainer(containerId, domElement) {
        this.portalContainers.set(containerId, domElement);

        // Create a portal root inside the target container if it doesn't exist
        if (!domElement.querySelector('.react-portal-root')) {
            const portalRoot = document.createElement('div');
            portalRoot.className = 'react-portal-root';
            domElement.appendChild(portalRoot);
        }
    }

    // Show component in a specific target container
    showComponentInTarget(componentType, containerId, props = {}) {
        const portalId = `portal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        if (!this.portalContainers.has(containerId)) {
            console.warn(`Container ${containerId} not registered. Falling back to global.`);
            return this.showComponent(componentType, props);
        }

        const event = new CustomEvent('react-portal-show-targeted', {
            detail: { portalId, componentType, containerId, props }
        });
        document.dispatchEvent(event);

        return portalId;
    }

    // Original global show method
    showComponent(componentType, props = {}) {
        const portalId = `portal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const event = new CustomEvent('react-portal-show', {
            detail: { portalId, componentType, props }
        });
        document.dispatchEvent(event);

        return portalId;
    }

    closeComponent(portalId) {
        const event = new CustomEvent('react-portal-close', {
            detail: { portalId }
        });
        document.dispatchEvent(event);
    }

    // Close all components in a specific container
    closeAllInContainer(containerId) {
        const event = new CustomEvent('react-portal-close-container', {
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

window.reactPortalBridge = new ReactPortalBridge();
