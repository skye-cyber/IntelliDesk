import React from 'react';

export const Sidebar = ({ isOpen, onToggle }) => {
    if (!isOpen) return null;

    return (
        <div className="w-64 bg-gray-100 dark:bg-gray-900 border-r">
            <div className="p-4">
                <h2 className="text-lg font-bold">Conversations</h2>
                <p>Sidebar content</p>
            </div>
        </div>
    );
};
