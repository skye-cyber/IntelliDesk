import { Timer } from '../Timer/timer.js';
import { waitForNamespace } from '../Utils/namespace_utils.js';
import { StateManager } from '../managers/StatesManager.js';
import { HandleProcessingEventChanges } from '../Utils/chatUtils.js';

let router
import('@js/managers/router.js').then(({ Router }) => {
    router = new Router()
})

export class RequestErrorHandler {
    constructor(options = {}) {
        this.defaultOptions = {
            maxRetries: 3,
            retryDelay: 1000,
            autoRetry: false,
            showModal: true,
            errorLevel: "verbose",
            ...options
        };

        this.retryCount = 0;
        this.currentError = null;
        this.retryCallbacks = new Map();
        this.currentSessionId = null;
        this.init();
    }

    init() {
        // Create modal if it doesn't exist
        if (!document.getElementById('errorModal')) {
            this.createErrorModal();
        }

        // Set up global error event listener
        this.setupGlobalErrorHandling();
    }

    setupGlobalErrorHandling() {
        // Listen for custom error events from anywhere in the app
        document.addEventListener('request-error', (event) => {
            this.handleError(event.detail.error, event.detail.context);
        });

        // Global fetch error handler
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason && this.isNetworkError(event.reason)) {
                event.preventDefault();
                this.handleError(event.reason, { type: 'unhandled-promise' });
            }
        });
    }

    createErrorModal() {
        const modalHTML = `
        <div id="errorModal" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div class="error-modal-overlay absolute inset-0 bg-gradient-to-br from-slate-900/20 via-purple-900/10 to-gray-900/70 backdrop-brightness-50 transition-opacity duration-500 opacity-0"></div>
            <div class="error-modal-container relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md transform scale-95 -translate-y-4 opacity-0 transition-all duration-500 border border-white/20 dark:border-gray-700/50">
                <!-- Header with elegant gradient border -->
                <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-gray-700/50">
                    <h3 class="flex items-center gap-3 text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                        <div class="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg shadow-lg">
                            <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                            </svg>
                        </div>
                        Connection Interrupted
                    </h3>
                    <button id="closeErrorModal" class="group p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700/80 border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:scale-110 hover:shadow-lg">
                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <!-- Body with sophisticated typography -->
                <div class="p-6">
                    <div id="errorMessage" class="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 font-medium"></div>
                    <div class="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <div class="flex items-center gap-2 text-sm">
                            <div class="w-2 h-2 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full animate-pulse"></div>
                            <span class="text-gray-500 dark:text-gray-400 font-medium">
                                Attempt <span id="retryCount" class="text-amber-600 dark:text-amber-400 font-bold">0</span> of <span id="maxRetries" class="text-gray-600 dark:text-gray-300 font-bold">3</span>
                            </span>
                        </div>
                        <div id="errorDetails" class="hidden bg-gray-50 dark:bg-[#001d2a] border border-gray-200 dark:border-gray-600 rounded-xl p-4 font-mono text-xs text-semibold text-gray-600 dark:text-gray-400 whitespace-pre-wrap max-h-48 overflow-y-auto shadow-inner"></div>
                    </div>
                </div>

                <!-- Footer with elegant buttons -->
                <div class="flex gap-3 p-6 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                    <button id="retryButton" class="group flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold flex-1 justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95">
                        <svg class="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                        Retry
                    </button>
                    <button id="cancelButton" class="px-5 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-semibold flex-1 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95">
                        Dismiss
                    </button>
                    <button id="detailsButton" class="group px-4 py-3 bg-transparent hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl font-medium border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 transform hover:scale-105 active:scale-95">
                        <span class="group-hover:hidden">⋯</span>
                        <span class="hidden group-hover:block">Details</span>
                    </button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.attachModalEvents();
    }

    attachModalEvents() {
        const modal = document.getElementById('errorModal');
        const closeBtn = document.getElementById('closeErrorModal');
        const retryBtn = document.getElementById('retryButton');
        const cancelBtn = document.getElementById('cancelButton');
        const detailsBtn = document.getElementById('detailsButton');
        const overlay = modal.querySelector('.error-modal__overlay');

        const closeModal = () => this.hideModal();

        [closeBtn, cancelBtn, overlay].forEach(element => {
            element?.addEventListener('click', closeModal);
        });

        retryBtn?.addEventListener('click', () => this.retryRequest());
        detailsBtn?.addEventListener('click', () => this.toggleDetails());

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }

    handleError(error, context = {}) {
        // Start new session
        this.currentSessionId = Symbol('error-session');
        this.currentError = error;
        this.errorContext = context;

        StateManager.set('processing', false);

        // Track interruption time
        const timer = new Timer();
        timer.trackTime("interrupt");

        // Update UI state

        HandleProcessingEventChanges('hide');

        if (this.shouldShowError(error)) {
            this.displayErrorModal(error, context);
        } else {
            this.handleSilentRetry(error, context);
        }
    }

    shouldShowError(error) {
        const isNetworkError = this.isNetworkError(error);
        const isServerError = this.isServerError(error);

        return isNetworkError || isServerError || this.defaultOptions.errorLevel === "verbose" || this.retryCount >= this.defaultOptions.maxRetries;
    }

    isNetworkError(error) {
        return error?.message === "Failed to fetch" ||
            error?.message === "network error" ||
            error?.name === "TypeError";
    }

    isServerError(error) {
        return error?.status >= 500 || error?.code === "SERVER_ERROR";
    }

    displayErrorModal(error, context) {
        const errorMessage = document.getElementById('errorMessage');
        const retryCountEl = document.getElementById('retryCount');
        const maxRetriesEl = document.getElementById('maxRetries');
        const errorDetails = document.getElementById('errorDetails');

        // Set error message
        const userFriendlyMessage = this.getUserFriendlyMessage(error);
        errorMessage.textContent = userFriendlyMessage;

        // Update retry count
        retryCountEl.textContent = this.retryCount;
        maxRetriesEl.textContent = this.defaultOptions.maxRetries;

        // Set technical details
        errorDetails.innerHTML = this.getTechnicalDetails(error);
        errorDetails.classList.add('hidden');

        // Show modal with animation
        this.showModal();

        // Clean up UI
        this.cleanupMessages(context);
    }

    getUserFriendlyMessage(error) {
        const messageMap = {
            "Failed to fetch": "Connection lost. Please check your internet connection and try again.",
            "network error": "Network issue detected. Please check your connection.",
            "[object Object]": "Service temporarily unavailable. The server might be overloaded.",
            "Timeout": "Request timed out. Please try again.",
            "Abort": "Request was cancelled."
        };

        return messageMap[error.message] ||
            error.userMessage ||
            "An unexpected error occurred. Please try again.";
    }

    getTechnicalDetails(error) {
        const errorData = {
            name: error.name,
            type: error.type,
            message: error.message,
            code: error.code,
            status: error.status,
            timestamp: new Date().toISOString(),
            origin: this.getErrorOrigin(error),
        };

        return this.styleErrorDetails(errorData);
    }

    styleErrorDetails(errorData) {
        const styles = {
            key: 'color: #8b5cf6;', // Purple
            string: 'color: #10b981;', // Green
            number: 'color: #3b82f6;', // Blue
            boolean: 'color: #f59e0b;', // Amber
            null: 'color: #ef4444;', // Red
            bracket: 'color: #6b7280;', // Gray
            message: 'color: #dc2626;', // Red-600
            timestamp: 'color: #7c3aed;', // Violet
            errorType: 'color: #ea580c;', // Orange
        };

        const jsonString = JSON.stringify(errorData, null, 2);

        return jsonString
        .replace(/"([^"]+)":/g, (match, key) => {
            // Special styling for important keys
            if (key === 'message') {
                return `<span class='font-semibold' style="${styles.message}">"${key}"</span>:`;
            } else if (key === 'timestamp') {
                return `<span class='font-semibold' style="${styles.timestamp}">"${key}"</span>:`;
            } else if (key === 'name' || key === 'type') {
                return `<span class='font-semibold' style="${styles.errorType}">"${key}"</span>:`;
            }
            return `<span class='font-semibold' style="${styles.key}">"${key}"</span>:`;
        })
        .replace(/: "([^"]*)"/g, (match, value) => {
            return `: <span style="${styles.string}">"${value}"</span>`;
        })
        .replace(/: (\d+)/g, (match, number) => {
            return `: <span style="${styles.number}">${number}</span>`;
        })
        .replace(/: (true|false)/g, (match, bool) => {
            return `: <span style="${styles.boolean}">${bool}</span>`;
        })
        .replace(/: null/g, (match) => {
            return `: <span style="${styles.null}">null</span>`;
        })
        .replace(/(\{|\}|\[|\])/g, (match, bracket) => {
            return `<span style="${styles.bracket}">${bracket}</span>`;
        });
    }

    getErrorOrigin(error) {
        if (!error.stack) return null;
        const lines = error.stack.split('\n');
        const originLine = lines.find(line => line.trim().startsWith('at '));
        return originLine ? originLine.trim() : null;
    }

    cleanupMessages(context) {
        const { userMessage, aiMessage, removeAll = false } = context;

        if (aiMessage?.firstElementChild?.id === "loader-parent") {
            if (removeAll && userMessage) {
                userMessage.remove();
            }
            aiMessage.remove();
        }
    }

    showModal() {
        const modal = document.getElementById('errorModal');
        modal.classList.remove('hidden');

        // Trigger animation
        setTimeout(() => {
            modal.classList.add('error-modal-visible');
        }, 10);
    }

    hideModal() {
        const modal = document.getElementById('errorModal');
        modal.classList.remove('error-modal-visible');

        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    toggleDetails() {
        const details = document.getElementById('errorDetails');
        const button = document.getElementById('detailsButton');

        details.classList.toggle('hidden');
        button.textContent = details.classList.contains('hidden') ? 'Details' : 'Hide Details';
    }

    async retryRequest() {
        this.hideModal();
        this.retryCount++;

        if (this.retryCount <= this.defaultOptions.maxRetries) {
            await this.delay(this.defaultOptions.retryDelay * this.retryCount);
            this.executeRetry();
        } else {
            this.handleMaxRetriesExceeded();
        }
    }

    executeRetry() {
        // Clone the callbacks to avoid modification during iteration
        const callbacksToExecute = Array.from(this.retryCallbacks);

        // Clear callbacks BEFORE execution to prevent infinite loops
        this.retryCallbacks.clear();

        callbacksToExecute.forEach(callbackData => {
            try {
                callbackData[1].fn(this.currentError, this.errorContext);
            } catch (error) {
                console.error('Error in retry callback:', error);
            }
        });

        // Also trigger custom event for global listeners
        const retryEvent = new CustomEvent('request-retry', {
            detail: {
                error: this.currentError,
                context: this.errorContext,
                retryCount: this.retryCount
            }
        });
        document.dispatchEvent(retryEvent);
        //console.log('Retry event dispatched');
    }

    handleSilentRetry(error, context) {
        if (this.retryCount < this.defaultOptions.maxRetries) {
            setTimeout(() => {
                this.retryCount++;
                this.executeRetry();
            }, this.defaultOptions.retryDelay);
        }
    }

    handleMaxRetriesExceeded() {
        // Notify user that max retries have been reached
        const event = new CustomEvent('max-retries-exceeded', {
            detail: {
                error: this.currentError,
                context: this.errorContext,
                finalRetryCount: this.retryCount
            }
        });
        document.dispatchEvent(event);
    }

    resetState() {
        // Clean up session-scoped callbacks
        const callbacksToRemove = [];

        this.retryCallbacks.forEach((callbackInfo, id) => {
            if (callbackInfo.cleanup) {
                // Execute cleanup
                callbackInfo.cleanup();
                callbacksToRemove.push(id);
            } else if (callbackInfo.sessionScoped && !callbackInfo.persistent) {
                callbacksToRemove.push(id);
            }
        });

        callbacksToRemove.forEach(id => {
            this.retryCallbacks.delete(id);
        });

        this.retryCount = 0;
        this.currentError = null;
        this.errorContext = null;
        this.currentSessionId = null;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API for external components
    onRetry(callback, options = {}) {
        const {
            sessionScoped = true, // Auto-cleanup when error session ends
            persistent = false    // Keep across multiple errors
        } = options;
        const callbackId = Symbol('retry-callback');
        const callbackInfo = {
            id: callbackId,
            fn: callback,
            sessionScoped,
            persistent
        };

        this.retryCallbacks.set(callbackId, callbackInfo);

        const unsubscribe = () => {
            this.retryCallbacks.delete(callbackId);
        };
        // unsubscribe()

        // Auto-cleanup for session-scoped callbacks

        if (sessionScoped && !persistent) {
            const autoCleanup = () => {
                if (!persistent) {
                    unsubscribe();
                }
            };
            // Will be called when session ends
            //this.retryCallbacks.set(Symbol(`cleanup-${callbackId}`), { cleanup: autoCleanup });
        }

        return unsubscribe;
    }

    setOptions(newOptions) {
        this.defaultOptions = { ...this.defaultOptions, ...newOptions };
    }

    destroy() {
        this.retryCallbacks.clear();
        const modal = document.getElementById('errorModal');
        if (modal) {
            modal.remove();
        }
    }
}

// Singleton instance for global use
export const requestErrorHandler = new RequestErrorHandler();

export function handleRequestError(error, chatArea, userMessage, aiMessage, VS_url = null) {
    // Extract the message content before creating context
    let lastMessage, text;

    try {
        const conversationHistory = window.desk.api.getHistory();
        const lastEntry = conversationHistory[0].chats.slice(-1)[0];
        if (lastEntry && (lastEntry.role !== 'system')) {
            lastMessage = lastEntry.content;
            text = typeof lastMessage === 'string' ? lastMessage : lastMessage.text ||
            lastMessage.content;

            text = text.replace(/\s*\[[^\]]*\]\s*/g, '').trim();

            // Strip date/time if present (from your original code)
            text = text.slice(-1) === ']' ? text.slice(0, text.length - 22) : text;
            lastMessage = text
        }
    } catch (err) {
        console.warn('Could not extract last message:', err);
    }

    const context = {
        chatArea,
        userMessage,
        aiMessage,
        VS_url,
        text,           // Add extracted text
        lastMessage,    // Add last message
        timestamp: Date.now()
    };

    StateManager.set('retry-context', context)

    // Remove loader
    document.getElementById('loader-parent')?.parentElement?.remove();

    const unsubscribe = requestErrorHandler.onRetry((error, context) => {
        context = StateManager.get('retry-context')
        //console.log("Retry callback executed with context:", context);

        userMessage?.remove();
        if (aiMessage) aiMessage.remove();

        if (context.VS_url) {
            router.routeToMistral(context.text, context.chatArea, window.currentModel, context.VS_url[1], context.fileDataUrl);
        } else {
            // Use the extracted lastMessage
            router.requestRouter(context.lastMessage?.trim(), context.chatArea);
        }
    });

    requestErrorHandler.handleError(error, context);
    return unsubscribe;
}
