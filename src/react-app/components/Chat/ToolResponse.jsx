import React, { useState } from 'react';
import { ToolCallDisplay } from './ToolCallDisplay';

/**
 * ToolResponse Component
 * Displays tool calls and their results in an elegant, user-friendly UI
 * Supports collapsible content for detailed tool responses and errors
 */
export const ToolResponse = ({ toolCalls = [], finalResponse = '', showDetails = false }) => {
    const [expandedCalls, setExpandedCalls] = useState({});
    const [showAllDetails, setShowAllDetails] = useState(showDetails);

    // Toggle expansion for a specific tool call
    const toggleToolCall = (toolCallId) => {
        setExpandedCalls(prev => ({
            ...prev,
            [toolCallId]: !prev[toolCallId]
        }));
    };

    // Toggle all details visibility
    const toggleAllDetails = () => {
        setShowAllDetails(!showAllDetails);
        if (!showAllDetails) {
            // Expand all tool calls
            const newExpanded = {};
            toolCalls.forEach(call => {
                newExpanded[call.toolCallId] = true;
            });
            setExpandedCalls(newExpanded);
        } else {
            // Collapse all tool calls
            setExpandedCalls({});
        }
    };

    // Check if there are any errors in tool calls
    const hasErrors = toolCalls.some(call => call.error);

    if (toolCalls.length === 0) {
        return null;
    }

    return (
        <div className="tool-response-container w-full max-w-2xl mx-auto my-4">
            {/* Tool Response Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-700/50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {hasErrors ? 'Tool Execution Results (with errors)' : 'Tool Execution Results'}
                        </h3>
                    </div>
                    <button
                        onClick={toggleAllDetails}
                        className="flex items-center space-x-2 px-3 py-1 bg-white/80 dark:bg-blue-800/50 hover:bg-white dark:hover:bg-blue-700/50 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-300 transition-all duration-200"
                    >
                        <svg className={`w-4 h-4 transition-transform ${showAllDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span>{showAllDetails ? 'Hide Details' : 'Show Details'}</span>
                    </button>
                </div>

                {/* Summary */}
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <p>
                        {toolCalls.length} tool{toolCalls.length > 1 ? 's' : ''} {hasErrors ? 'executed with some errors' : 'executed successfully'}
                        {finalResponse && ' to complete your request'}
                    </p>
                </div>

                {/* Tool Calls List */}
                <div className="space-y-3">
                    {toolCalls.map((toolCall, index) => (
                        <ToolCallDisplay
                            key={toolCall.toolCallId || index}
                            toolCall={toolCall}
                            isExpanded={expandedCalls[toolCall.toolCallId] || showAllDetails}
                            onToggle={() => toggleToolCall(toolCall.toolCallId)}
                            showDetails={showAllDetails}
                        />
                    ))}
                </div>

                {/* Final Response if available */}
                {finalResponse && (
                    <div className="mt-4 p-3 bg-blue-50/80 dark:bg-blue-900/20 rounded-lg border border-blue-200/30 dark:border-blue-700/30">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Final Response
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-200">
                            {finalResponse}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Default export for compatibility
export default ToolResponse;
