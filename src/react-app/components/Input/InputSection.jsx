import React from 'react';

export const InputSection = ({ onSendMessage, onToggleCanvas }) => {
    return (
        <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 p-2 border rounded"
                />
                <button
                    onClick={onToggleCanvas}
                    className="p-2 bg-blue-500 text-white rounded"
                >
                    Canvas
                </button>
                <button className="p-2 bg-green-500 text-white rounded">
                    Send
                </button>
            </div>
        </div>
    );
};
