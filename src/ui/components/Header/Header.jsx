import { useState, useCallback, useEffect, useRef } from 'react';
import { ModelList } from './Models/ModelList';
import { StateManager } from '../../../core/managers/StatesManager.ts';
import { globalEventBus } from '../../../core/Globals/eventBus.ts';

StateManager.set('currentModel', 'mistral-large-latest')

export const Header = ({ onToggleSidebar, selectedModel, onModelChange }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const openModelSelectorRef = useRef(null)
    const selectorRef = useRef(null)
    const [experemintalFeturesOn, setExperemintalFeturesOn] = useState(false)

    useEffect(() => {
        StateManager.subscribe('userSettings', (settings) => setExperemintalFeturesOn(settings.experimentalFeatures)
        )
    }, [StateManager])

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isDropdownOpen || document.getElementById('model-selector')?.classList.contains('translate-x-0')) globalEventBus.emit('model:selector:hide');
        };

        const handleClick = (e) => {
            if (!selectorRef.current?.contains(e.target) && !openModelSelectorRef.current?.parentElement.contains(e.target)) {
                globalEventBus.emit('model:selector:hide')
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('click', handleClick);
        }
    }, [isDropdownOpen]);

    const toggleModelSelector = useCallback(() => {
        if (isDropdownOpen || selectorRef.current?.classList.contains('translate-x-0')) {
            globalEventBus.emit('model:selector:hide')
            setIsDropdownOpen(false)
        } else {
            globalEventBus.emit('model:selector:show')
            setIsDropdownOpen(true)
        }
    })

    return (
        <section id="header" className="w-full">
            <header className="space-b-1 mt-0 z-[10] min-h-2 transform transition-transform transition-all duration-500">
                <div className="flex justify-between">
                    <section className="flex justify-start">
                        {/* Toggle Button */}
                        <section className="flex xs:hidden flex items-center relative mr-14">
                            <button
                                id="togglePane"
                                title="View Chats"
                                className="absolute z-5 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    globalEventBus.emit('panel:chats:expand')
                                }}
                            >
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                                </svg>
                            </button>
                        </section>

                        {/* Model Selector */}
                        <div className={`${experemintalFeturesOn ? '' : 'hidden pointer-events-none'} relative transition-opacity duration-500`}>
                            <button
                                ref={openModelSelectorRef}
                                id="modelButton"
                                className="rounded-lg ml-1 p-1 font-semibold bg-gray-200/0 hover:bg-blue-200/0 text-sky-900 dark:text-gray-100 rounded-md dark:bg-[#07090c]/0 dark:hover:bg-[#11161e] hover:scale-[0.9] outline-none cursor-pointer transition-all duration-700"
                                onClick={toggleModelSelector}
                            >
                                <div className="flex">
                                    <span id="selectedModelText" data-class="hf" className="text-md max-w-36 truncate">
                                        {getModelDisplayName(selectedModel)}
                                    </span>
                                    <select id="selected-model-value" className='hidden' data-value={selectedModel}></select>
                                    <svg className="mt-1" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </section>

                    {/* Settings Button */}
                    <section onClick={() => globalEventBus.emit('setting:open')} className="absolute right-0 z-5 hover:scale-[0.85] transition-transform duration-700">
                        <button id="settings" title="Settings" className="mr-[3vw]">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8 fill-current text-gray-800 dark:text-gray-200 transition-colors duration-200">
                                <path d="M19.14 12.936c.06-.437.06-.874 0-1.31l2.007-1.55c.21-.16.27-.44.14-.67l-2.4-4.155c-.12-.21-.36-.29-.57-.21l-2.337 1.017c-.56-.43-1.17-.79-1.83-1.07l-.354-2.6c-.04-.26-.27-.46-.54-.46h-5c-.27 0-.51.2-.54.46l-.354 2.6c-.66.28-1.28.64-1.83 1.07L5.22 5.89c-.21-.08-.45 0-.57.21l-2.4 4.155c-.12.21-.07.51.14.67l2.007 1.55c-.06.437-.06.874 0 1.31l-2.007 1.55c-.21.16-.27.44-.14.67l2.4 4.155c.12.21.36.29.57.21l2.337-1.017c.56.43 1.17.79 1.83 1.07l.354 2.6c.04.26.27.46.54.46h5c.27 0 .51-.2.54-.46l.354-2.6c.66-.28 1.28-.64 1.83-1.07l2.337-1.017c.21-.08.45 0 .57.21l2.4 4.155c.12.21.07.51-.14.67l-2.007 1.55c.06.437.06.874 0 1.31zM12 16a4 4 0 110-8 4 4 0 010 8z" />
                            </svg>
                        </button>
                    </section>
                </div>
            </header>

            <ModelList
                selectorRef={selectorRef}
                selectedModel={selectedModel}
                onModelSelect={(model) => {
                    onModelChange(model);
                    setIsDropdownOpen(false);
                }}
                onClose={() => setIsDropdownOpen(false)}
            />
        </section>
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
