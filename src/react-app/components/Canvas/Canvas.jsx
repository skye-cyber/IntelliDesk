import React from 'react';

export const Canvas = ({ isOpen, onToggle }) => {
    if (!isOpen) return null;

    return (
        <div className="w-96 bg-white dark:bg-gray-800 border-l">
            <div className="p-4">
                <h2 className="text-lg font-bold">Canvas</h2>
                <p>Code editor will go here</p>
            </div>
        </div>
    );
};
