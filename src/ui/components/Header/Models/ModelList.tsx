import { useEffect, useCallback } from 'react';
import { Category } from './Category';
import { ModelCategory } from './utils/models';
import { globalEventBus } from '../../../../core/Globals/eventBus.ts';

export const ModelList = (
    {
        selectorRef,
        selectedModel = 'mistral-small-latest',
        onModelSelect,
        onClose

    }: {
        selectorRef: any,
        selectedModel: string,
        onModelSelect: CallableFunction,
        onClose: CallableFunction
    }

) => {

    const hideSelector = useCallback(() => {
        selectorRef.current.classList.add('translate-x-[100vw]', 'opacity-0')
        selectorRef.current.classList.remove('translate-x-0', 'opacity-100')
    }, [])

    const showSelector = useCallback(() => {
        selectorRef.current.classList.remove('translate-x-[100vw]', 'opacity-0')
        selectorRef.current.classList.add('translate-x-0', 'opacity-100')
    }, [])

    useEffect(() => {
        const showselector = globalEventBus.on('model:selector:show', showSelector)
        const hideselector = globalEventBus.on('model:selector:hide', hideSelector)
        return () => {
            showselector.unsubscribe()
            hideselector.unsubscribe()
        }
    }, [showSelector, hideSelector])

    return (
        <div
            ref={selectorRef}
            id="model-selector"
            className="fixed z-[55] mt-1 -ml-2 w-fit max-h-[88vh] overflow-y-auto py-1 max-w-md bg-white border border-blue-300 dark:border-[#242470] dark:bg-[#07090c] text-gray-800 dark:text-gray-300 rounded-lg shadow-lg overflow-x-hidden whitespace-wrap text-truncate animation transition-colors duration-1000 transform-gpu scrollbar-custom scroll-smooth -translate-x-[100vw] opacity-0 transition-translate transition-all duration-500" defaultValue={selectedModel}>
            <div role="menu" aria-orientation="vertical">
                {ModelCategory.map((category, index) => (
                    <Category
                        key={index}
                        category={category}
                        selectedModel={selectedModel}
                        onModelSelect={onModelSelect}
                    />
                ))}
            </div>
        </div>
    );
};
