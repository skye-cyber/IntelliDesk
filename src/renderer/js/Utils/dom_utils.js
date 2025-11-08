/**
 * Wait for an element to appear in the DOM
 * @param {string} selector - CSS selector for the target element
 * @param {Function} callback - Called when element is found, receives element as argument
 * @param {Object} options - Configuration options
 * @param {number} options.delay - Check interval in ms (default: 100)
 * @param {number} options.timeout - Maximum wait time in ms (default: 10000)
 * @param {boolean} options.multiple - Wait for multiple elements (default: false)
 * @param {string} options.context - Context selector to search within
 * @returns {Function} Cancel function to stop waiting
 */
export function waitForElement(selector, callback, options = {}) {
    const {
        delay = 100,
        timeout = 10000,
        multiple = false,
        context = document
    } = typeof options === 'number' ? { timeout: options } : options; // Backward compatibility

    let elapsed = 0;
    let timeoutId = null;
    let hasResolved = false;

    const searchContext = typeof context === 'string' ? document.querySelector(context) : context;

    const checkExist = () => {
        if (hasResolved) return;

        const elements = multiple ?
        searchContext.querySelectorAll(selector) :
        searchContext.querySelector(selector);

        if (elements && (multiple ? elements.length > 0 : elements)) {
            hasResolved = true;
            callback(elements);
            return;
        }

        elapsed += delay;

        if (timeout && elapsed >= timeout) {
            hasResolved = true;
            console.warn(`waitForElement: Timeout after ${timeout}ms for selector "${selector}"`);
            return;
        }

        timeoutId = setTimeout(checkExist, delay);
    };

    // Start checking
    timeoutId = setTimeout(checkExist, 0);

    // Return cancel function
    return () => {
        hasResolved = true;
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };
}

/**
 * Wait for an element to appear in the DOM (Promise-based)
 * @param {string} selector - CSS selector for the target element
 * @param {Object} options - Configuration options
 * @returns {Promise<Element|Element[]>} Resolves with element(s) when found
 */
export function waitForElementSync(selector, options = {}) {
    return new Promise((resolve, reject) => {
        const {
            delay = 100,
            timeout = 10000,
            multiple = false,
            context = document,
            rejectOnTimeout = true
        } = options;

        let elapsed = 0;
        let timeoutId = null;
        let hasResolved = false;

        const searchContext = typeof context === 'string' ?
        document.querySelector(context) : context;

        if (!searchContext) {
            reject(new Error(`Context element not found for selector: ${context}`));
            return;
        }

        const checkExist = () => {
            if (hasResolved) return;

            const elements = multiple ?
            searchContext.querySelectorAll(selector) :
            searchContext.querySelector(selector);

            if (elements && (multiple ? elements.length > 0 : elements)) {
                hasResolved = true;
                resolve(elements);
                return;
            }

            elapsed += delay;

            if (elapsed >= timeout) {
                hasResolved = true;
                const error = new Error(`Element not found: ${selector} (timeout: ${timeout}ms)`);
                if (rejectOnTimeout) {
                    reject(error);
                } else {
                    console.warn(error.message);
                    resolve(null);
                }
                return;
            }

            timeoutId = setTimeout(checkExist, delay);
        };

        timeoutId = setTimeout(checkExist, 0);
    });
}

// Legacy callback support
waitForElement.withCallback = (selector, callback, options = {}) => {
    const cancel = waitForElement(selector, options)
    .then(callback)
    .catch(error => {
        console.error('waitForElement error:', error);
        if (options.onTimeout) options.onTimeout(error);
    });

        return () => cancel; // Return cancel function
};

export function waitForElementSimple(selector, callback, delay = 100, timeout = null) {
    let elapsed = 0
    const checkExist = setInterval(() => {
        const el = document.querySelector(selector);
        elapsed += delay
        if (el) {
            clearInterval(checkExist);
            callback(el);
        }
        if (elapsed >= timeout) {
            return
        }
    }, delay);  // check every xms
}
