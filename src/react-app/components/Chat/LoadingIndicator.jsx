import React from 'react';

export const LoadingIndicator = ({ text = "Thinking" }) => {
    return (
        <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 max-w-[80%]">
                <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{text}...</span>
                </div>
            </div>
        </div>
    );
};

export const LoadingSpinner = ({ text = "Thinking" }) => {
    return (
        <div className="flex justify-start">
            <div className="bg-gray-200/70 dark:bg-blend-700 rounded-lg p-4 max-w-[80%]">
                <div className="flex items-center space-x-2">
                    <div className='animate-spin border-2 border-t-0 border-b-0 border-l-gray-600 dark:border-l-orange-400 border-r-blue-500 dark:border-r-sky-400 rounded-full size-6'></div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{text}...</span>
                </div>
            </div>
        </div>
    );
};
