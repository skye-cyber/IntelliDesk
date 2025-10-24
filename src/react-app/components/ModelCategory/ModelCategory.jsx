import React from 'react';
import { ModelItem } from '@components/ModelItem/ModelItem';

export const ModelCategory = ({ category, selectedModel, onModelSelect }) => {
    const getSeparator = (type) => {
        switch(type) {
            case 'math':
                return (
                    <div role="separator" className="mx-5 my-1 flex items-center justify-center">
                        <div className="flex-1 h-px bg-gradient-to-r from-[#ffaa00] to-[#00ff00]"></div>
                        <div className="px-8">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-purple-500 stroke-[#00aaff]" fill="b" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm12-8v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" />
                            </svg>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-[#55ff7f] to-[#0055ff]"></div>
                    </div>
                );
            case 'vision':
                return (
                    <div role="separator" className="mx-5 my-1 flex items-center justify-center">
                        <div className="flex-1 h-px bg-gradient-to-r from-purple-500 to-[#ffaa00]"></div>
                        <div className="px-8">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-purple-500 stroke-[#00aaff]" fill="b" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm12-8v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" />
                            </svg>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-[#55ff7f] to-pink-500"></div>
                    </div>
                );
            default:
                return <div role="separator" className="mx-5 my-1 h-px bg-gray-700 dark:bg-sky-400"></div>;
        }
    };

    return (
        <>
            {category.title && (
                <>
                    {getSeparator(category.type)}
                    <div className={`mx-5 my-2 text-sm text-center font-mono ${
                        category.type === 'math' ? 'text-[#55aaff]' :
                        category.type === 'vision' ? 'text-[#55aaff]' :
                        category.type === 'pro' ? 'text-purple-500' :
                        category.type === 'code' ? 'text-green-500' :
                        'text-[#0094d9]'
                    } font-semibold`}>
                        <p>{category.title}</p>
                    </div>
                </>
            )}

            {category.models.map((model, index) => (
                <ModelItem
                    key={model.value}
                    model={model}
                    isSelected={selectedModel === model.value}
                    onSelect={onModelSelect}
                />
            ))}
        </>
    );
};
