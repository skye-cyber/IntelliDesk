import React from 'react';

export class ErrorHandler {
    constructor() {
        this.currentError = null;
        this.retryCount = 0;
        this.maxRetries = 10;
        this.retryArgs = null;
        this.retryCallback = null;
        this.error_portal = null
    }

    showError({
        title = "Error",
        message,
        retryCallback = null,
        callbackArgs = {},
        onClose = null,
        autoCloseDelay = 8000,
        maxRetries = 10
    }) {

        // Set text to the input section
        const input = document.getElementById("userInput")
        if (input) input.innerHTML = StateManager.get('user-text')

        // Clean up any existing error
        this.hideError();

        // Store retry configuration - CRITICAL FIX
        this.maxRetries = maxRetries;
        this.retryArgs = callbackArgs;
        this.retryCallback = retryCallback; // Store separately from currentError

        this.currentError = {
            title,
            message,
            retryCallback, // This can be null for final errors
            onClose,
            autoCloseDelay,
            maxRetries,
            retryCount: this.retryCount
        };

        const error_portal = window.reactPortalBridge.showComponentInTarget("ErrorModal", "mainContainer", {
            error: this.currentError,
            onRetry: () => this.handleRetry(),
            onClose: () => {
                this.resetRetryCount();
                if (this.currentError?.onClose) {
                    this.currentError.onClose();
                }
                this.hideError();
            },
            autoCloseDelay: this.currentError.autoCloseDelay
        }, "error")

        this.error_portal = error_portal
    }

    async handleRetry() {
        // Use the stored retryCallback, not from currentError
        const retryCallback = this.retryCallback;

        // Hide the current modal immediately
        this.hideError();

        if (!retryCallback) return;

        try {
            // Execute the retry callback
            await retryCallback(this.retryArgs);

            // If we get here, the retry was successful
            //this.resetRetryCount();
            // No need to call hideError() again since we already hid it
        } catch (error) {
            // Retry failed - increment retry count
            this.retryCount++;

            if (this.retryCount >= this.maxRetries) {
                // Max retries exceeded - show final error with no retry option
                this.showError({
                    title: "Maximum Retries Exceeded",
                    message: `Failed after ${this.maxRetries} attempts. ${error.message || 'Please try again later.'}`,
                    retryCallback: null, // No more retries
                    onClose: this.currentError?.onClose,
                    autoCloseDelay: 10000
                });
            } else {
                // Show retry error with updated count, preserving the original callback
                this.showError({
                    title: `Retry Failed (${this.retryCount}/${this.maxRetries})`,
                    message: error.message || 'The operation failed. Would you like to try again?',
                    retryCallback: retryCallback, // Use the original stored callback
                    callbackArgs: this.retryArgs,
                    onClose: this.currentError?.onClose,
                    autoCloseDelay: this.currentError?.autoCloseDelay || 8000,
                    maxRetries: this.maxRetries
                });
            }
        }
    }

    resetRetryCount() {
        this.retryCount = 0;
        this.retryCallback = null;
        this.retryArgs = null;
    }

    hideError() {
        window.reactPortalBridge.closeComponent(this.error_portal)
        this.currentError = null;
    }

    // Force reset everything (useful for component unmounting)
    destroy() {
        this.hideError();
        this.resetRetryCount();
        this.maxRetries = 3;
    }
}


// Enhanced Error Modal Component
export const ErrorModal = ({ error, onRetry, onClose, autoCloseDelay = 8000 }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [countdown, setCountdown] = React.useState(autoCloseDelay / 1000);
    const timeoutRef = React.useRef(null);
    const countdownRef = React.useRef(null);

    React.useEffect(() => {
        if (error) {
            setIsVisible(true);
            setCountdown(autoCloseDelay / 1000);

            timeoutRef.current = setTimeout(() => {
                handleClose();
            }, autoCloseDelay);

            countdownRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            clearTimeout(timeoutRef.current);
            clearInterval(countdownRef.current);
        };
    }, [error, autoCloseDelay]);

    const handleClose = () => {
        setIsVisible(false);
        clearTimeout(timeoutRef.current);
        clearInterval(countdownRef.current);
        setTimeout(() => onClose?.(), 300);
    };

    const handleRetry = () => {
        clearTimeout(timeoutRef.current);
        clearInterval(countdownRef.current);
        setIsVisible(false);
        setTimeout(() => onRetry?.(), 300);
    };

    const handleMouseEnter = () => {
        clearTimeout(timeoutRef.current);
        clearInterval(countdownRef.current);
    };

    const handleMouseLeave = () => {
        setCountdown(autoCloseDelay / 1000);
        timeoutRef.current = setTimeout(handleClose, autoCloseDelay);
        countdownRef.current = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);
    };

    if (!error || !isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Enhanced Backdrop */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-purple-900/0 to-black/0 transition-opacity backdrop-brightness-50 duration-500" />

            {/* Main Modal */}
            <div
                className="relative w-full max-w-md max-h-lg transform transition-all duration-500 scale-100 opacity-100"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Glow Effects */}
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-purple-600/20 rounded-2xl blur-lg opacity-75" />
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400/10 to-purple-500/10 rounded-2xl blur-sm" />

                <div className="relative bg-white dark:bg-[#0f0f2d] rounded-2xl shadow-2xl border border-white/20 dark:border-purple-500/20 overflow-hidden">
                    {/* Header with Gradient */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-[#1a1a3a] dark:to-[#2d1a3a] border-b border-gray-200/50 dark:border-purple-500/30 p-6">
                        <div className="flex items-center gap-4">
                            {/* Animated Icon Container */}
                            <div className="relative flex-shrink-0">
                                <div className="absolute inset-0 bg-red-400/20 dark:bg-red-400/30 rounded-full animate-ping" />
                                <div className="relative w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 dark:from-red-400 dark:to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-purple-200 bg-clip-text text-transparent">
                                    {error.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                                    <p className="text-sm font-medium text-gray-600 dark:text-purple-300/80">
                                        Auto-closing in <span className="font-mono text-red-500 dark:text-red-400">{countdown}s</span>
                                    </p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="flex-shrink-0 w-10 h-10 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                            >
                                <svg className="w-5 h-5 text-gray-500 dark:text-purple-300 group-hover:text-gray-700 dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 bg-white/50 dark:bg-[#0f0f2d]/80 max-h-[30vh] overflow-y-auto scrollbar-custom scroll-smooth">
                        <p className="text-gray-700 dark:text-purple-100/90 leading-relaxed text-lg font-medium">
                            {error.message}
                        </p>

                        {error.details && (
                            <details className="mt-4 group">
                                <summary className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-purple-300/80 cursor-pointer hover:text-gray-700 dark:hover:text-purple-200 transition-colors list-none">
                                    <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    Technical details
                                </summary>
                                <div className="mt-3 p-4 bg-gray-50/80 dark:bg-[#1a1a3a] rounded-xl border border-gray-200/50 dark:border-purple-500/20 backdrop-blur-sm">
                                    <pre className="text-xs text-gray-600 dark:text-purple-200/80 overflow-auto max-h-32 font-mono leading-relaxed">
                                        {typeof error.details === 'string' ? error.details : JSON.stringify(error.details, null, 2)}
                                    </pre>
                                </div>
                            </details>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 p-6 bg-white/30 dark:bg-[#0f0f2d]/60 border-t border-gray-200/50 dark:border-purple-500/20">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-6 py-3 text-gray-700 dark:text-purple-200 bg-gray-100/80 dark:bg-[#1a1a3a] hover:bg-gray-200/80 dark:hover:bg-[#2a2a4a] rounded-xl font-semibold transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-gray-300/50 dark:border-purple-500/30"
                        >
                            Dismiss
                        </button>
                        {error.retryCallback && (
                            <button
                                onClick={handleRetry}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-red-500/25 flex items-center justify-center gap-3 group"
                            >
                                <svg className="w-5 h-5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Retry Action
                            </button>
                        )}
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="relative h-1 bg-gray-200/50 dark:bg-purple-500/20 overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${(countdown / (autoCloseDelay / 1000)) * 100}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Create singleton instance
const errorHandler = new ErrorHandler();

export default errorHandler;
