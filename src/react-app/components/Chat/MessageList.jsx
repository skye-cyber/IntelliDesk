import React from 'react';
import { Message } from './Message';
import { LoadingIndicator } from './LoadingIndicator';

export const MessageList = ({ messages, isLoading }) => {
    return (
        <div className="space-y-4">
            {messages.map((message) => (
                <Message key={message.id} message={message} />
            ))}

            {isLoading && <LoadingIndicator />}
        </div>
    );
};
