import React from 'react';

/**
 * ToolErrorHandler Component
 * Handles and displays tool-specific errors in a user-friendly way
 * Provides context and suggestions for resolving tool errors
 */
export const ToolErrorHandler = ({
    error = null,
    toolName = '',
    params = null,
    onRetry = null,
    onDismiss = null,
    showDetails = false
}) => {

    if (!error) {
        return null;
    }

    // Get error type and suggestions
    const getErrorInfo = (errorMessage) => {
        const errorTypes = {
            'permission': {
                title: 'Permission Denied',
                description: 'This tool requires additional permissions to execute.',
                suggestions: [
                    'Check your application settings',
                    'Contact your administrator for access',
                    'Try a different tool that doesn\'t require special permissions'
                ]
            },
            'not_found': {
                title: 'Tool Not Found',
                description: 'The requested tool is not available.',
                suggestions: [
                    'Check if the tool name is correct',
                    'The tool might be disabled in your configuration',
                    'Try restarting the application'
                ]
            },
            'invalid_params': {
                title: 'Invalid Parameters',
                description: 'The parameters provided to the tool are invalid.',
                suggestions: [
                    'Check the parameter format and values',
                    'Refer to the tool documentation',
                    'Try simpler parameters'
                ]
            },
            'execution': {
                title: 'Execution Failed',
                description: 'The tool failed to execute properly.',
                suggestions: [
                    'Check your input values',
                    'The external service might be unavailable',
                    'Try again later'
                ]
            },
            'timeout': {
                title: 'Timeout Error',
                description: 'The tool took too long to respond.',
                suggestions: [
                    'Try with simpler parameters',
                    'Check your network connection',
                    'The service might be overloaded'
                ]
            },
            'rate_limit': {
                title: 'Rate Limit Exceeded',
                description: 'You have made too many requests in a short time.',
                suggestions: [
                    'Wait a few minutes and try again',
                    'Reduce the frequency of your requests',
                    'Check your API quota'
                ]
            }
        };

        const normalizedError = errorMessage.toLowerCase();

        // Try to match error type
        for (const [key, info] of Object.entries(errorTypes)) {
            if (normalizedError.includes(key)) {
                return info;
            }
        }

        // Default error info
        return {
            title: 'Tool Error',
            description: 'An error occurred while executing the tool.',
            suggestions: [
                'Check your input and try again',
                'Restart the application',
                'Contact support if the problem persists'
            ]
        };
    };

    const errorInfo = getErrorInfo(error.message || error);
    const errorMessage = typeof error === 'string' ? error : error.message || 'Unknown error';
    const errorStack = error.stack || null;

    return (
        <div className="tool-error-handler w-full max-w-md mx-auto my-4">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border border-red-200/50 dark:border-red-700/50 rounded-xl p-4 shadow-lg">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {errorInfo.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {toolName && <span>Tool: <span className="font-medium">{toolName}</span></span>}
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

                {/* Error Description */}
                <div className="mb-4 p-3 bg-red-50/80 dark:bg-red-900/20 rounded-lg border border-red-200/30 dark:border-red-700/30">
                    <p className="text-sm text-red-700 dark:text-red-300">
                        {errorInfo.description}
                    </p>
                </div>

                {/* Error Message */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Error Details
                    </h4>
                    <div className="bg-white/80 dark:bg-red-900/10 rounded border border-red-200/50 dark:border-red-700/30 p-3">
                        <p className="text-sm text-red-600 dark:text-red-400 font-mono">
                            {errorMessage}
                        </p>
                    </div>
                </div>

                {/* Suggestions */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Suggested Solutions
                    </h4>
                    <ul className="space-y-2">
                        {errorInfo.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start space-x-2">
                                <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Parameters (if available and showDetails is true) */}
                {params && showDetails && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Parameters
                        </h4>
                        <div className="bg-gray-50/80 dark:bg-red-900/10 rounded border border-gray-200/50 dark:border-red-700/30 p-2">
                            <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto max-h-20 font-mono">
                                {JSON.stringify(params, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Stack trace (if available and showDetails is true) */}
                {errorStack && showDetails && (
                    <div className="mb-4">
                        <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    Technical Details
                                </span>
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </summary>
                            <div className="mt-2 bg-gray-50/80 dark:bg-red-900/10 rounded border border-gray-200/50 dark:border-red-700/30 p-2">
                                <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto max-h-32 font-mono">
                                    {errorStack}
                                </pre>
                            </div>
                        </details>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-4">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Retry
                        </button>
                    )}
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="flex-1 px-4 py-2 bg-white/80 dark:bg-red-800/50 hover:bg-gray-100 dark:hover:bg-red-700/50 text-gray-700 dark:text-red-200 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 border border-gray-200/50 dark:border-red-600/50"
                        >
                            Dismiss
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Default export for compatibility
export default ToolErrorHandler;
