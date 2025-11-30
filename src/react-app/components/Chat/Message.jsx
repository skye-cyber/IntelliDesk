import React, { useState } from 'react';

export const Message = ({ message }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.text);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const formatMessage = (text) => {
        // TODO: Basic formatting for code blocks, links, etc. -Alternatively render it in the backend
        return text.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
        ));
    };

    return (
        <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[80%] rounded-lg p-4 ${
            message.sender === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
        }`}>
        <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
        {formatMessage(message.text)}
        </div>

        {message.sender === 'ai' && (
            <button
            onClick={handleCopy}
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            title="Copy message"
            >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            </button>
        )}
        </div>

        <div className={`text-xs mt-2 ${
            message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
        }`}>
        {message.created_at.toLocaleTimeString()}
        </div>
        </div>
        </div>
    );
};
