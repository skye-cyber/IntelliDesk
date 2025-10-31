// stateManager.js
export const StateManager = (() => {
    const state = {};
    const listeners = {};

    return {
        set(key, value) {
            state[key] = value;
            (listeners[key] || []).forEach(fn => fn(value));
        },
        get(key) {
            return state[key];
        },
        subscribe(key, callback) {
            if (!listeners[key]) listeners[key] = [];
            listeners[key].push(callback);
        }
    };
})();


// expose globally
window.StateManager = StateManager;
