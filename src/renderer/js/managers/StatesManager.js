export const StateManager = (() => {
    let state = {};
    let listeners = {};

    return {
        set(key, value) {
            state[key] = value;
            (listeners[key] || []).forEach(fn => fn(value));
        },
        get(key) {
            return state[key];
        },
        has(key) {
            return key in state;
        },
        subscribe(key, callback) {
            if (!listeners[key]) listeners[key] = [];
            listeners[key].push(callback);

            // Return unsubscribe function
            return () => {
                if (listeners[key]) {
                    listeners[key] = listeners[key].filter(fn => fn !== callback);
                }
            };
        },
        unset(key) {
            if (key in state) {
                const value = state[key];
                delete state[key];
                (listeners[key] || []).forEach(fn => fn(undefined, value));
            }
        },
        reset() {
            // Clear all listeners with undefined values
            Object.keys(listeners).forEach(key => {
                listeners[key].forEach(fn => fn(undefined, state[key]));
            });

            // Reset state and listeners
            state = {};
            listeners = {};
        },
        // Additional helpful methods
        getAll() {
            return { ...state };
        },
        clear(key) {
            this.unset(key);
        },
        update(key, updater) {
            if (typeof updater === 'function') {
                const newValue = updater(state[key]);
                this.set(key, newValue);
            } else {
                this.set(key, updater);
            }
        }
    };
})();
