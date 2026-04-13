import { ModelItem } from './ModelItem';
import {
    Separator as CategorySeparator
} from './icons';
import { ModelCategoryType } from './utils/models';


export const Category = ({ category, selectedModel, onModelSelect }: { category: ModelCategoryType, selectedModel: string, onModelSelect: CallableFunction }) => (
    <>
        {category.title && (
            <>
                <div className="mx-5 my-2 text-sm text-center font-mono text-indigo-600/70 dark:text-indigo-600/90 font-normal">
                    <CategorySeparator title={category.title} />
                </div>
            </>
        )}

        {category.models.map(model => (
            <ModelItem
                key={model.value}
                model={model}
                isSelected={selectedModel === model.value}
                onSelect={onModelSelect}
            />
        ))}
    </>
);
