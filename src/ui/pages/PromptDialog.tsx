import React, { useState, useEffect } from 'react';

interface PromptDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    defaultValue?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
    error?: string;
}

export const PromptDialog: React.FC<PromptDialogProps> = ({
    isOpen,
    title,
    message,
    defaultValue = '',
    onConfirm,
    onCancel,
    error
}) => {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        if (isOpen) {
            setValue(defaultValue);
        }
    }, [isOpen, defaultValue]);

    const handleConfirm = () => {
        if (value.trim()) {
            onConfirm(value);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleConfirm();
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl min-w-[320px] p-6 transition-colors">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {message}
                </p>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full px-3 py-2 mb-4 border border-gray-300 dark:border-accent-600 rounded-md
                     bg-white dark:bg-accent-900 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-accent-50 focus:border-transparent
                     transition-colors"
                    placeholder="Type here..."
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                       bg-gray-100 dark:bg-gray-700 rounded-md
                       hover:bg-gray-200 dark:hover:bg-gray-600
                       focus:outline-none focus:ring-2 focus:ring-gray-500
                       transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!value.trim()}
                        className="px-4 py-2 text-sm font-medium text-white
                       bg-blue-600 rounded-md
                       hover:bg-blue-700
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};
