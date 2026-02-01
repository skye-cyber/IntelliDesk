import React, { useState } from 'react';
import { ToolResponse } from './ToolResponse';
import { ToolErrorHandler } from './ToolErrorHandler';

/**
 * ToolDemo Component
 * Demonstrates how to use the tool response components
 * This is for testing and integration purposes
 */
export const ToolDemo = () => {
    // Sample tool calls data
    const [toolCalls, setToolCalls] = useState([
        {
            toolCallId: 'call_12345',
            toolName: 'read_file',
            params: {
                path: '/home/user/documents/example.txt',
                encoding: 'utf-8'
            },
            result: {
                success: true,
                content: 'This is the content of the file. It contains some sample text for demonstration purposes.',
                size: 1024,
                encoding: 'utf-8'
            },
            timestamp: '2024-01-31T14:30:00Z'
        },
        {
            toolCallId: 'call_67890',
            toolName: 'search_web',
            params: {
                query: 'latest AI research papers',
                limit: 5,
                sources: ['arxiv', 'google_scholar']
            },
            result: {
                success: true,
                results: [
                    {
                        title: 'Advances in Neural Networks',
                        url: 'https://arxiv.org/abs/2301.001',
                        summary: 'A comprehensive study on recent advances in neural network architectures.'
                    },
                    {
                        title: 'Transformers in NLP',
                        url: 'https://arxiv.org/abs/2301.002',
                        summary: 'Exploring the impact of transformer models on natural language processing.'
                    }
                ],
                count: 2
            },
            timestamp: '2024-01-31T14:31:00Z'
        },
        {
            toolCallId: 'call_54321',
            toolName: 'calculate',
            params: {
                expression: '(5 + 3) * 2',
                precision: 4
            },
            result: {
                success: true,
                result: 16,
                calculation: '(5 + 3) * 2 = 16'
            },
            timestamp: '2024-01-31T14:32:00Z'
        }
    ]);

    const [errorToolCall, setErrorToolCall] = useState({
        toolCallId: 'call_error',
        toolName: 'write_file',
        params: {
            path: '/restricted/documents/secure.txt',
            content: 'Sensitive content',
            overwrite: true
        },
        error: {
            message: 'Permission denied: cannot write to restricted directory',
            type: 'permission',
            stack: 'Error: Permission denied\n    at FileSystem.writeFile (/app/filesystem.js:45:15)\n    at WriteFileTool.execute (/app/tools.js:120:22)'
        },
        timestamp: '2024-01-31T14:35:00Z'
    });

    const [showDetails, setShowDetails] = useState(false);
    const [showErrorDetails, setShowErrorDetails] = useState(false);

    const handleRetry = () => {
        console.log('Retrying tool execution...');
        // In a real implementation, this would retry the failed tool call
    };

    const handleDismiss = () => {
        console.log('Dismissing error...');
        // In a real implementation, this would dismiss the error
    };

    return (
        <div className="tool-demo-container p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tool Response Components Demo</h2>

            {/* Controls */}
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    {showDetails ? 'Hide All Details' : 'Show All Details'}
                </button>
                <button
                    onClick={() => setShowErrorDetails(!showErrorDetails)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    {showErrorDetails ? 'Hide Error Details' : 'Show Error Details'}
                </button>
            </div>

            {/* Successful Tool Calls */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Successful Tool Execution</h3>
                <ToolResponse
                    toolCalls={toolCalls}
                    finalResponse="I've successfully executed the requested tools and gathered the information you needed."
                    showDetails={showDetails}
                />
            </div>

            {/* Error Handling */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tool Error Handling</h3>
                <ToolErrorHandler
                    error={errorToolCall.error}
                    toolName={errorToolCall.toolName}
                    params={errorToolCall.params}
                    onRetry={handleRetry}
                    onDismiss={handleDismiss}
                    showDetails={showErrorDetails}
                />
            </div>

            {/* Individual Tool Call Display */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Individual Tool Call</h3>
                <div className="space-y-3">
                    <ToolCallDisplay
                        toolCall={toolCalls[0]}
                        isExpanded={true}
                        showDetails={true}
                    />
                </div>
            </div>

            {/* Error Tool Call Display */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Error Tool Call</h3>
                <div className="space-y-3">
                    <ToolCallDisplay
                        toolCall={errorToolCall}
                        isExpanded={true}
                        showDetails={true}
                    />
                </div>
            </div>
        </div>
    );
};

// Default export for compatibility
export default ToolDemo;