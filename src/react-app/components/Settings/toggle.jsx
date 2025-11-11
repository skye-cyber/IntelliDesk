import React from 'react';

export const SettingToggle = ({ id, label, description, icon, checked, onChange }) => {

    const handleChange = (e) => {
        const newValue = e.target.checked; // Extract the boolean value
        //console.log(`Toggle ${id} changed to:`, newValue); // Debug log

        // Pass the boolean value, not the event
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/50 dark:hover:border-gray-600/50">
            <div className="flex items-center space-x-3">
                <span className="text-2xl">{icon}</span>
                <div>
                    <label htmlFor={id} className="font-medium text-gray-900 dark:text-white cursor-pointer">
                        {label}
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {description}
                    </p>
                </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    id={id}
                    type="checkbox"
                    className="sr-only peer"
                    checked={checked}
                    onChange={handleChange}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
        </div>
    );
}
