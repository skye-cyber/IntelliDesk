/**
 * Waits for a namespace variable to become available and executes a callback
 * @param {string|Array} namespacePath - Dot notation path or array of path segments
 * @param {Function} callback - Function to execute when variable is available
 * @param {Object} options - Configuration options
 * @param {number} options.delay - Check interval in milliseconds (default: 100)
 * @param {number} options.timeout - Maximum time to wait in milliseconds (default: 30000)
 * @param {any} options.defaultValue - Default value if variable never becomes available
 * @param {boolean} options.throwOnTimeout - Whether to throw error on timeout (default: false)
 * @returns {Object} Controller object with cancel method
 */
export class NamespaceWatcher {
    constructor(options = {}) {
        this.defaultOptions = {
            delay: 100,
            timeout: 30000,
            defaultValue: undefined,
            throwOnTimeout: true,
            pollStrategy: 'interval', // 'interval', 'raf', 'idle'
            validate: null // Custom validation function
        };
        this.setOptions(options);
        this.activeWatchers = new Map();
    }

    setOptions(options) {
        this.defaultOptions = { ...this.defaultOptions, ...options };
    }

    /**
     * Wait for a single namespace variable
     */
    waitFor(namespacePath, callback, options = {}) {
        const config = { ...this.defaultOptions, ...options };
        const pathArray = this.normalizePath(namespacePath);
        const watcherId = Symbol('namespace-watcher');

        const controller = this.createWatcher(pathArray, callback, config, watcherId);
        this.activeWatchers.set(watcherId, controller);

        return controller;
    }

    /**
     * Wait for multiple namespace variables (all must be available)
     */
    waitForAll(namespacePaths, callback, options = {}) {
        const config = { ...this.defaultOptions, ...options };
        const paths = namespacePaths.map(path => this.normalizePath(path));
        const watcherId = Symbol('namespace-watcher-all');

        let resolvedValues = new Array(paths.length).fill(undefined);
        let resolvedCount = 0;

        const checkAllResolved = () => {
            if (resolvedCount === paths.length) {
                callback(resolvedValues, false);
                return true;
            }
            return false;
        };

        const controllers = paths.map((path, index) => {
            return this.createWatcher(path, (value) => {
                resolvedValues[index] = value;
                resolvedCount++;
                if (checkAllResolved()) {
                    controllers.forEach(ctrl => ctrl.cancel());
                }
            }, config, Symbol(`namespace-watcher-${index}`));
        });

        const controller = {
            cancel: () => {
                controllers.forEach(ctrl => ctrl.cancel());
                this.activeWatchers.delete(watcherId);
            }
        };

        this.activeWatchers.set(watcherId, controller);

        // Handle timeout for the entire group
        if (config.timeout > 0) {
            setTimeout(() => {
                if (resolvedCount < paths.length) {
                    controller.cancel();
                    if (config.throwOnTimeout) {
                        throw new Error(`Timeout waiting for multiple namespaces`);
                    } else if (config.defaultValue !== undefined) {
                        callback(new Array(paths.length).fill(config.defaultValue), true);
                    }
                }
            }, config.timeout);
        }

        return controller;
    }

    /**
     * Wait for any of the namespace variables (first one available wins)
     */
    waitForAny(namespacePaths, callback, options = {}) {
        const config = { ...this.defaultOptions, ...options };
        const paths = namespacePaths.map(path => this.normalizePath(path));
        const watcherId = Symbol('namespace-watcher-any');

        let isResolved = false;

        const controllers = paths.map((path, index) => {
            return this.createWatcher(path, (value) => {
                if (!isResolved) {
                    isResolved = true;
                    controllers.forEach(ctrl => ctrl.cancel());
                    callback({ value, index, path: path.join('.') }, false);
                }
            }, config, Symbol(`namespace-watcher-any-${index}`));
        });

        const controller = {
            cancel: () => {
                controllers.forEach(ctrl => ctrl.cancel());
                this.activeWatchers.delete(watcherId);
            }
        };

        this.activeWatchers.set(watcherId, controller);

        // Handle timeout
        if (config.timeout > 0) {
            setTimeout(() => {
                if (!isResolved) {
                    controller.cancel();
                    if (config.throwOnTimeout) {
                        throw new Error(`Timeout waiting for any namespace`);
                    } else if (config.defaultValue !== undefined) {
                        callback({ value: config.defaultValue, index: -1, path: '' }, true);
                    }
                }
            }, config.timeout);
        }

        return controller;
    }

    /**
     * Create individual namespace watcher
     */
    createWatcher(pathArray, callback, config, watcherId) {
        let checkInterval;
        let timeoutId;
        let isCancelled = false;

        const checkFunction = () => {
            if (isCancelled) return false;

            const value = this.getNamespaceValue(pathArray);
            if (value !== undefined && (!config.validate || config.validate(value))) {
                controller.cancel();
                callback(value, false);
                return true;
            }
            return false;
        };

        const controller = {
            cancel: () => {
                isCancelled = true;
                clearInterval(checkInterval);
                clearTimeout(timeoutId);
                cancelAnimationFrame && cancelAnimationFrame(rafId);
                this.activeWatchers.delete(watcherId);
            },
            path: pathArray.join('.'),
            id: watcherId
        };

        let rafId;

        // Choose polling strategy
        switch (config.pollStrategy) {
            case 'raf':
                const rafCheck = () => {
                    if (!checkFunction() && !isCancelled) {
                        rafId = requestAnimationFrame(rafCheck);
                    }
                };
                rafId = requestAnimationFrame(rafCheck);
                break;

            case 'idle':
                if (typeof requestIdleCallback !== 'undefined') {
                    const idleCheck = () => {
                        if (!checkFunction() && !isCancelled) {
                            requestIdleCallback(idleCheck);
                        }
                    };
                    requestIdleCallback(idleCheck);
                } else {
                    // Fallback to interval
                    checkInterval = setInterval(checkFunction, config.delay);
                }
                break;

            default: // 'interval'
                checkInterval = setInterval(checkFunction, config.delay);
        }

        // Timeout handling
        if (config.timeout > 0) {
            timeoutId = setTimeout(() => {
                if (!isCancelled) {
                    controller.cancel();
                    if (config.throwOnTimeout) {
                        throw new Error(`Timeout waiting for namespace: ${pathArray.join('.')}`);
                    } else if (config.defaultValue !== undefined) {
                        callback(config.defaultValue, true);
                    }
                }
            }, config.timeout);
        }

        // Immediate check
        if (config.checkImmediately !== false) {
            setTimeout(() => checkFunction(), 0);
        }

        return controller;
    }

    /**
     * Normalize namespace path
     */
    normalizePath(namespacePath) {
        if (Array.isArray(namespacePath)) {
            return namespacePath;
        }

        if (typeof namespacePath === 'string') {
            return namespacePath.split('.');
        }

        throw new Error('Namespace path must be string or array');
    }

    /**
     * Get value from namespace path
     */
    getNamespaceValue(pathArray) {
        try {
            return pathArray.reduce((obj, key) => {
                const currentObj = obj === null ?
                    (typeof window !== 'undefined' ? window :
                        typeof globalThis !== 'undefined' ? globalThis :
                            typeof global !== 'undefined' ? global : {}) : obj;
                return currentObj && currentObj[key] !== undefined ? currentObj[key] : undefined;
            }, null);
        } catch (error) {
            return undefined;
        }
    }

    /**
     * Cancel all active watchers
     */
    cancelAll() {
        this.activeWatchers.forEach(controller => controller.cancel());
        this.activeWatchers.clear();
    }

    /**
     * Get count of active watchers
     */
    getActiveCount() {
        return this.activeWatchers.size;
    }
}

// Singleton instance for convenience
export const namespaceWatcher = new NamespaceWatcher();

// Simple function export (backward compatibility with waitForElement pattern)
export function waitForNamespace(namespacePath, callback, delay = 100) {
    return namespaceWatcher.waitFor(namespacePath, callback, { delay });
}

/**
 *USAGE
 * // Integration with existing apps
 *
 *Example 1: Wait for external libraries
 waitForNamespace('Stripe', (stripe) => {
     // Initialize Stripe payments
     const stripeInstance = stripe('pk_test_...');
 });

 // Example 2: Wait for app initialization
 waitForNamespace('myApp.initialized', (isInitialized) => {
     if (isInitialized) {
         startUserSession();
     }
 });

 // Example 3: Feature detection with fallback
 waitForNamespace('IntersectionObserver', (Observer) => {
     // Use native IntersectionObserver
     const observer = new Observer(callback, options);
 }, {
     timeout: 1000,
     defaultValue: null
 });

 // Example 4: Plugin system integration
 waitForNamespace('window.plugins.analytics', (analytics) => {
     analytics.track('app_loaded');
 });

 // Example 5: Framework compatibility
 waitForNamespace(['Vue', 'React', 'Preact'], (framework) => {
     // Work with whichever framework is available
     mountApp(framework);
 });
 */
