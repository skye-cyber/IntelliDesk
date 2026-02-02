import React, { useState } from 'react';

/**
 * ToolCallDisplay Component
 * Displays individual tool calls with collapsible details for tool responses and errors
 */
export const ToolCallDisplay = ({ toolCall, isExpanded = false, onToggle, showDetails = false }) => {
    const [showFullContent, setShowFullContent] = useState(false);

    if (!toolCall) {
        return null;
    }

    // Format tool parameters for display
    const formatParams = (params) => {
        try {
            if (typeof params === 'string') {
                const parsed = JSON.parse(params);
                return JSON.stringify(parsed, null, 2);
            }
            return JSON.stringify(params, null, 2);
        } catch (error) {
            console.log(error)
            return params;
        }
    };

    // Format tool result for display
    const formatResult = (result) => {
        if (!result) return 'No result available';

        if (typeof result === 'object') {
            return JSON.stringify(result, null, 2);
        }

        if (typeof result === 'string') {
            // Truncate long results for preview
            if (result.length > 200 && !showFullContent) {
                return result.substring(0, 200) + '...';
            }
            return result;
        }

        return String(result);
    };

    // Get tool icon based on tool name
    const getToolIcon = (toolName) => {
        const icons = {
            'read_file': '📄',
            'write_file': '💾',
            'bash': '🐚',
            'search': '🔍',
            'calculate': '🧮',
            'database': '🗃️',
            'weather': '🌤️',
            'grep': '🔎',
            'send_message': '📧',
            'todo': '📝'
        };

        // Try to match tool name
        const normalizedName = toolName.toLowerCase();
        for (const [key, icon] of Object.entries(icons)) {
            if (normalizedName.includes(key)) {
                return icon;
            }
        }

        return '⚙️'; // Default gear icon
    };

    // Get tool color based on tool name
    const getToolColor = (toolName) => {
        const colors = {
            'read': 'from-blue-500 to-cyan-600',
            'write': 'from-green-500 to-emerald-600',
            'bash': 'from-gray-600 to-gray-800',
            'search': 'from-purple-500 to-indigo-600',
            'calculate': 'from-yellow-500 to-orange-600',
            'database': 'from-indigo-500 to-purple-600',
            'weather': 'from-sky-500 to-blue-600',
            'grep': 'from-teal-500 to-cyan-600',
            'send': 'from-pink-500 to-rose-600',
            'todo': 'from-amber-500 to-yellow-600'
        };

        const normalizedName = toolName.toLowerCase();
        for (const [key, color] of Object.entries(colors)) {
            if (normalizedName.includes(key)) {
                return color;
            }
        }

        return 'from-gray-500 to-gray-700'; // Default color
    };

    const toolIcon = getToolIcon(toolCall.toolName);
    const toolColor = getToolColor(toolCall.toolName);
    const hasError = !!toolCall.error;
    const hasResult = !!toolCall.result;

    return (
        <div className={`tool-call-item border border-blue-200/30 dark:border-blue-700/30 rounded-lg overflow-hidden transition-all duration-200 ${hasError ? 'bg-red-50/50 dark:bg-red-900/20' : 'bg-white/50 dark:bg-blue-900/10'}`}>
            {/* Tool Call Header */}
            <div className="flex items-center justify-between p-3 cursor-pointer" onClick={onToggle}>
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`w-6 h-6 bg-gradient-to-br ${toolColor} rounded flex items-center justify-center shadow-sm`}>
                        <span className="text-white text-sm">{toolIcon}</span>
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                            {toolCall.toolName}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {toolCall.toolCallId ? `Call ID: ${toolCall.toolCallId.substring(0, 8)}...` : 'Tool Execution'}
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center space-x-2">
                    {hasError ? (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-300 text-xs font-medium rounded-full">
                            Error
                        </span>
                    ) : hasResult ? (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-300 text-xs font-medium rounded-full">
                            Success
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-800/50 text-yellow-600 dark:text-yellow-300 text-xs font-medium rounded-full">
                            Pending
                        </span>
                    )}

                    <button className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <svg className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Expanded Content */}
            {(isExpanded || showDetails) && (
                <div className="px-3 pb-3">
                    {/* Parameters */}
                    {toolCall.params && (
                        <div className="mb-3">
                            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Parameters
                            </h5>
                            <div className="bg-gray-50/80 dark:bg-blue-900/20 rounded border border-gray-200/50 dark:border-blue-700/30 p-2">
                                <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto max-h-20 font-mono">
                                    {formatParams(toolCall.params.query)}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Result or Error */}
                    {hasError ? (
                        <div className="mb-3">
                            <h5 className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide mb-1 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Error
                            </h5>
                            <div className="bg-red-50/80 dark:bg-red-900/30 rounded border border-red-200/50 dark:border-red-700/30 p-2">
                                <pre className="text-xs text-red-700 dark:text-red-300 overflow-x-auto max-h-20 font-mono">
                                    {JSON.stringify(toolCall.error)}
                                </pre>
                            </div>
                        </div>
                    ) : hasResult ? (
                        <div className="mb-3">
                            <h5 className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide mb-1 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Result
                            </h5>
                            <div className="bg-green-50/80 dark:bg-green-900/30 rounded border border-green-200/50 dark:border-green-700/30 p-2">
                                <pre className="text-xs text-green-700 dark:text-green-300 overflow-x-auto max-h-32 font-mono whitespace-pre-wrap">
                                    {formatResult(toolCall.result.content || toolCall.result.output)}
                                </pre>
                                {typeof toolCall.result === 'string' && toolCall.result.length > 200 && (
                                    <button
                                        onClick={() => setShowFullContent(!showFullContent)}
                                        className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {showFullContent ? 'Show less' : 'Show more'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                            No result available
                        </div>
                    )}

                    {/* Timestamp */}
                    {toolCall.timestamp && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            Executed: {new Date(toolCall.timestamp).toLocaleString()}
                        </div>
                    )}
                </div>
            )
            }
        </div >
    );
};

// Default export for compatibility
export default ToolCallDisplay;
