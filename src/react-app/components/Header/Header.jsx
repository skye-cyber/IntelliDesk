import React, { useState } from 'react';
import { ModelSelector } from '../ModelSelector/ModelSelector';

export const Header = ({ onToggleSidebar, selectedModel, onModelChange }) => {
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

    return (
        <header className="space-b-2 my-2 z-[60] transform transition-transform transition-all duration-500">
            <div className="flex justify-between">
                <section className="flex justify-start">
                    {/* Toggle Button */}
                    <section className="flex items-center relative mr-14">
                        <button
                            id="togglePane"
                            title="View Chats"
                            className="absolute z-5 p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-700"
                            onClick={onToggleSidebar}
                        >
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                            </svg>
                        </button>
                    </section>

                    {/* Model Selector */}
                    <div className="relative">
                        <button
                            id="modelButton"
                            className="rounded-lg ml-1 p-2 font-semibold bg-gray-200 hover:bg-blue-200 text-sky-900 dark:text-gray-100 rounded-md dark:bg-zinc-950 dark:hover:bg-stone-600 outline-none cursor-pointer transition-colors duration-1000"
                            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                        >
                            <div className="flex">
                                <span id="selectedModelText" data-class="hf" className="text-md max-w-36 truncate">
                                    {getModelDisplayName(selectedModel)}
                                </span>
                                <svg className="mt-1" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </button>

                        {isModelDropdownOpen && (
                            <ModelSelector
                                selectedModel={selectedModel}
                                onModelSelect={(model) => {
                                    onModelChange(model);
                                    setIsModelDropdownOpen(false);
                                }}
                                onClose={() => setIsModelDropdownOpen(false)}
                            />
                        )}
                    </div>
                </section>

                {/* Settings Button */}
                <section className="absolute right-0 z-5">
                    <button id="settings" title="Settings" className="mr-[3vw]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8 fill-current text-gray-800 dark:text-gray-200 transition-colors duration-200">
                            <path d="M19.14 12.936c.06-.437.06-.874 0-1.31l2.007-1.55c.21-.16.27-.44.14-.67l-2.4-4.155c-.12-.21-.36-.29-.57-.21l-2.337 1.017c-.56-.43-1.17-.79-1.83-1.07l-.354-2.6c-.04-.26-.27-.46-.54-.46h-5c-.27 0-.51.2-.54.46l-.354 2.6c-.66.28-1.28.64-1.83 1.07L5.22 5.89c-.21-.08-.45 0-.57.21l-2.4 4.155c-.12.21-.07.51.14.67l2.007 1.55c-.06.437-.06.874 0 1.31l-2.007 1.55c-.21.16-.27.44-.14.67l2.4 4.155c.12.21.36.29.57.21l2.337-1.017c.56.43 1.17.79 1.83 1.07l.354 2.6c.04.26.27.46.54.46h5c.27 0 .51-.2.54-.46l.354-2.6c.66-.28 1.28-.64 1.83-1.07l2.337-1.017c.21-.08.45 0 .57.21l2.4 4.155c.12.21.07.51-.14.67l-2.007 1.55c.06.437.06.874 0 1.31zM12 16a4 4 0 110-8 4 4 0 010 8z"/>
                        </svg>
                    </button>
                </section>
            </div>
        </header>
    );
};

// Helper function to get display name for models
const getModelDisplayName = (modelValue) => {
    const modelMap = {
        'Qwen/Qwen2.5-72B-Instruct': 'Basic mode',
        'Qwen/Qwen2.5-Coder-32B-Instruct': 'Coding mode',
        'deepseek-ai/DeepSeek-R1': 'DeepSeek-R1',
    };
    return modelMap[modelValue] || modelValue.split('/')[1] || modelValue;
};
