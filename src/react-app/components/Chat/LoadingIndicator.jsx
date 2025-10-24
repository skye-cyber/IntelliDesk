import React from 'react';

export const LoadingIndicator = () => {
    return (
        <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 max-w-[80%]">
                <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Thinking...</span>
                </div>
            </div>
        </div>
    );
};
