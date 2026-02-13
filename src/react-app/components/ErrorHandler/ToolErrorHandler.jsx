import React from 'react';

/**
 * ToolErrorHandler Component for ErrorHandler Directory
 * Specialized error handling for tool-related errors
 * Integrates with the existing error handling system
 */
export class ToolErrorHandler {
    constructor() {
        this.toolErrors = [];
        this.maxRetries = 3;
    }

    /**
     * Handle tool-specific errors
     */
    handleToolError({
        error,
        toolName = 'unknown',
        params = null,
        retryCallback = null,
        onDismiss = null,
        maxRetries = 3
    }) {
        // Store error information
        const toolError = {
            error: error.message || error,
            toolName,
            params,
            retryCallback,
            onDismiss,
            timestamp: new Date().toISOString(),
            retryCount: 0,
            maxRetries
        };

        this.toolErrors.push(toolError);

        // Log the error
        console.error(`[ToolErrorHandler] Error in tool ${toolName}:`, error);

        // Return error information for display
        return this.formatToolError(toolError);
    }

    /**
     * Format tool error for display
     */
    formatToolError(errorInfo) {
        const errorType = this.getErrorType(errorInfo.error);

        return {
            title: `Tool Error: ${errorInfo.toolName}`,
            message: errorInfo.error,
            type: errorType,
            toolName: errorInfo.toolName,
            params: errorInfo.params,
            timestamp: errorInfo.timestamp,
            retryAvailable: !!errorInfo.retryCallback && errorInfo.retryCount < errorInfo.maxRetries,
            retryCallback: errorInfo.retryCallback,
            onDismiss: errorInfo.onDismiss
        };
    }

    /**
     * Get error type from error message
     */
    getErrorType(errorMessage) {
        const errorString = String(errorMessage).toLowerCase();

        if (errorString.includes('permission')) return 'permission';
        if (errorString.includes('not found') || errorString.includes('not available')) return 'not_found';
        if (errorString.includes('invalid') || errorString.includes('format')) return 'invalid_params';
        if (errorString.includes('timeout')) return 'timeout';
        if (errorString.includes('rate limit') || errorString.includes('quota')) return 'rate_limit';
        if (errorString.includes('network') || errorString.includes('connection')) return 'network';

        return 'execution';
    }

    /**
     * Get error suggestions based on error type
     */
    getErrorSuggestions(errorType) {
        const suggestions = {
            'permission': [
                'Check your application permissions',
                'Contact administrator for access',
                'Try a different tool'
            ],
            'not_found': [
                'Verify the tool name is correct',
                'Check if tool is enabled in configuration',
                'Restart the application'
            ],
            'invalid_params': [
                'Check parameter format and values',
                'Refer to tool documentation',
                'Use simpler parameters'
            ],
            'execution': [
                'Verify input values',
                'Check external service availability',
                'Retry the operation'
            ],
            'timeout': [
                'Use simpler parameters',
                'Check network connection',
                'Service might be overloaded'
            ],
            'rate_limit': [
                'Wait before retrying',
                'Reduce request frequency',
                'Check API quota'
            ],
            'network': [
                'Check internet connection',
                'Verify service availability',
                'Try again later'
            ]
        };

        return suggestions[errorType] || suggestions['execution'];
    }

    /**
     * Retry a failed tool operation
     */
    async retryToolOperation(errorInfo) {
        if (!errorInfo.retryCallback) {
            throw new Error('No retry callback available');
        }

        if (errorInfo.retryCount >= errorInfo.maxRetries) {
            throw new Error(`Maximum retries (${errorInfo.maxRetries}) exceeded`);
        }

        // Increment retry count
        errorInfo.retryCount++;

        try {
            // Execute the retry callback
            const result = await errorInfo.retryCallback();

            // If successful, remove from error list
            this.toolErrors = this.toolErrors.filter(
                err => err !== errorInfo
            );

            return result;
        } catch (retryError) {
            // Update error information
            errorInfo.error = retryError.message || retryError;
            errorInfo.timestamp = new Date().toISOString();

            throw retryError;
        }
    }

    /**
     * Clear all tool errors
     */
    clearErrors() {
        this.toolErrors = [];
    }

    /**
     * Get all tool errors
     */
    getAllErrors() {
        return this.toolErrors;
    }

    /**
     * Get error statistics
     */
    getStats() {
        const errorTypes = {};
        this.toolErrors.forEach(error => {
            const type = this.getErrorType(error.error);
            errorTypes[type] = (errorTypes[type] || 0) + 1;
        });

        return {
            totalErrors: this.toolErrors.length,
            errorTypes,
            toolsWithErrors: [...new Set(this.toolErrors.map(err => err.toolName))]
        };
    }

    /**
     * React component for displaying tool errors
     * This can be used as a standalone component or integrated with existing error handling
     */
    static ToolErrorDisplay = ({
        error,
        toolName,
        params,
        onRetry,
        onDismiss,
        showDetails = false
    }) => {
        if (!error) return null;

        const errorHandler = new ToolErrorHandler();
        const errorType = errorHandler.getErrorType(error);
        const suggestions = errorHandler.getErrorSuggestions(errorType);

        return (
            <div className="tool-error-display w-full max-w-md mx-auto my-4">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border border-red-200/50 dark:border-red-700/50 rounded-xl p-4 shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Tool Error: {toolName}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {errorType.replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-all duration-200"
                                title="Dismiss"
                            >
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Error Message */}
                    <div className="mb-4">
                        <div className="bg-white/80 dark:bg-red-900/10 rounded border border-red-200/50 dark:border-red-700/30 p-3">
                            <p className="text-sm text-red-600 dark:text-red-400 font-mono">
                                {typeof error === 'string' ? error : error.message || 'Unknown error'}
                            </p>
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Suggested Solutions
                        </h4>
                        <ul className="space-y-1 text-sm">
                            {suggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start space-x-2 text-gray-700 dark:text-gray-300">
                                    <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                                    <span>{suggestion}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg font-medium text-sm transition-all duration-200"
                            >
                                Retry
                            </button>
                        )}
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="flex-1 px-4 py-2 bg-white/80 dark:bg-red-800/50 hover:bg-gray-100 dark:hover:bg-red-700/50 text-gray-700 dark:text-red-200 rounded-lg font-medium text-sm transition-all duration-200 border border-gray-200/50 dark:border-red-600/50"
                            >
                                Dismiss
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };
};

// Create singleton instance
export const toolErrorHandler = new ToolErrorHandler();

// Default export for compatibility
export default toolErrorHandler;
