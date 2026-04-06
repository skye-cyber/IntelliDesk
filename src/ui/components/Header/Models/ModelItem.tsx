import { chatutil } from '../../../../core/managers/Conversation/util';
import { MistralIcon, CodeIcon } from './icons';
import { Model } from './utils/models';
import { StateManager } from '../../../../core/managers/StatesManager.js';
import { emit } from '../../../../core/Globals/eventBus.ts';

export const ModelItem = (
    { model, isSelected, onSelect }:
        { model: Model, isSelected: boolean, onSelect: CallableFunction }
) => {

    const onModelSelect = () => {
        onSelect(model.value)
        StateManager.set('currentModel', model.value);
        emit('model:change', model.value)

        const seletced_model = chatutil.get_multimodal_models().includes(model.value)
            ? 'multimodal'
            : 'chat'

        const current_model = window.desk.api.getModel()

        if (seletced_model !== current_model) {
            emit('conversation:new', seletced_model)
        }
        emit('model:selector:hide')
    }
    return (
        <div
            role="menuitem"
            className={`flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-90 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-none border-x-[#00aeff] border-y-[0.05px] border-y-indigo-300/5 transition-colors duration-1000 ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
                }`}
            tabIndex={-1}
            data-value={model.value}
            onClick={() => onModelSelect()}
        >
            <div className="flex grow items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <span className="flex max-w-6 max-h-6">
                        {model.icon === 'mistral' ?
                            <MistralIcon /> :
                            <CodeIcon />}
                    </span>
                    <div>
                        <div className="flex items-center gap-1">
                            {model.name}
                            {model.recommended && (
                                <sup className="text-green-400 font-mono">Recommended</sup>
                            )}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                            {model.description}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


