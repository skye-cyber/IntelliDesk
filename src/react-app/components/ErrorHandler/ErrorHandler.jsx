import React from 'react';
import ReactDOM from 'react-dom/client';

export class ErrorHandler {
    constructor() {
        this.container = null;
        this.root = null;
        this.currentError = null;
    }

    showError({ title = "Error", message, retryCallback = null, onClose = null, autoCloseDelay = 8000 }) {
        // Clean up any existing error
        this.hideError();

        // Create container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'error-modal-container';
            document.body.appendChild(this.container);
            this.root = ReactDOM.createRoot(this.container);
        }

        this.currentError = {
            title,
            message,
            retryCallback,
            onClose,
            autoCloseDelay
        };

        // Render the modal
        this.root.render(
            React.createElement(ErrorModal, {
                error: this.currentError,
                onRetry: () => {
                    if (this.currentError?.retryCallback) {
                        this.currentError.retryCallback();
                    }
                    this.hideError();
                },
                onClose: () => {
                    if (this.currentError?.onClose) {
                        this.currentError.onClose();
                    }
                    this.hideError();
                },
                autoCloseDelay: this.currentError.autoCloseDelay
            })
        );
    }

    hideError() {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
        this.currentError = null;
    }
}

// Error Modal Component (same as yours)
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
        setCountdown(5);
        timeoutRef.current = setTimeout(handleClose, 5000);
        countdownRef.current = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);
    };

    if (!error || !isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300">
            <div
                className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-red-200 dark:border-red-800/50 transform transition-all duration-300 scale-100 opacity-100"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Header */}
                <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {error.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Auto-closing in {countdown}s
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                    >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {error.message}
                    </p>

                    {error.details && (
                        <details className="mt-3">
                            <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                                Technical details
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-32">
                                {typeof error.details === 'string' ? error.details : JSON.stringify(error.details, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                    {error.retryCallback && (
                        <button
                            onClick={handleRetry}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Retry
                        </button>
                    )}
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 origin-left transition-transform duration-1000 ease-linear"
                     style={{ transform: `scaleX(${countdown / (autoCloseDelay / 1000)})` }}
                />
            </div>
        </div>
    );
};

// Create singleton instance
const errorHandler = new ErrorHandler();

export default errorHandler;
