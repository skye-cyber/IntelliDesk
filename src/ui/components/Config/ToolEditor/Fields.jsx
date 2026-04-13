import { Plus, Trash2, Save, Edit2 } from "lucide-react";
import { useState } from "react";

export const FieldInput = ({ type, value, onChange, options = [] }) => {
    const renderInput = () => {
        switch (type) {
            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-blend-700 border border-gray-300 dark:border-blend-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 focus:outline-none"
                    >
                        {options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                );

            case 'checkbox':
                return (
                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => onChange(e.target.checked)}
                            className="w-5 h-5 text-indigo-600 dark:text-indigo-400 bg-gray-100 dark:bg-blend-700 border-gray-300 dark:border-blend-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:outline-none"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Enabled</span>
                    </div>
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white dark:bg-blend-800 border border-gray-300 dark:border-blend-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 focus:outline-none"
                    />
                );

            case 'array':
                return (
                    <div className="space-y-2">
                        {value.map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => {
                                        const newArray = [...value];
                                        newArray[idx] = e.target.value;
                                        onChange(newArray);
                                    }}
                                    className="flex-1 px-3 py-2 bg-white dark:bg-blend-800 border border-gray-300 dark:border-blend-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 focus:outline-none"
                                />
                                <button
                                    onClick={() => {
                                        const newArray = value.filter((_, i) => i !== idx);
                                        onChange(newArray);
                                    }}
                                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-indigo-600/30 rounded-lg transition-colors focus:ring-none focus:outline-none"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => onChange([...value, ''])}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors focus:ring-none focus:outline-none"
                        >
                            <Plus size={16} />
                            Add Item
                        </button>
                    </div>
                );

            default:
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-blend-800 border border-gray-300 dark:border-blend-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 focus:outline-none"
                    />
                );
        }
    };

    return renderInput();
};

export const FieldGroup = ({ field, value, onUpdate, onRename, onDelete }) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [fieldName, setFieldName] = useState(field);

    const getFieldType = (val) => {
        if (Array.isArray(val)) return 'array';
        if (typeof val === 'boolean') return 'checkbox';
        if (typeof val === 'number') return 'number';
        if (field === 'permission') return 'select';
        return 'text';
    };

    const fieldType = getFieldType(value);
    const options = field === 'permission' ? [
        { value: 'always', label: 'Always' },
        { value: 'ask', label: 'Ask' },
        { value: 'never', label: 'Never' }
    ] : [];

    const formatFieldName = (name) => {
        return name.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const handleRename = () => {
        if (fieldName !== field && fieldName.trim()) {
            onRename(field, fieldName);
        }
        setIsEditingName(false);
    };

    return (
        <div className="bg-gray-50 dark:bg-blend-900 rounded-xl p-4 hover:ring-1 hover:ring-indigo-200 dark:hover:ring-indigo-800 transition-all">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                    {isEditingName ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={fieldName}
                                onChange={(e) => setFieldName(e.target.value)}
                                onBlur={handleRename}
                                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                className="px-2 py-1 bg-white dark:bg-blend-700 border border-indigo-300 dark:border-indigo-600 rounded text-gray-900 dark:text-gray-100"
                                autoFocus
                            />
                            <button
                                onClick={handleRename}
                                className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded"
                            >
                                <Save size={16} />
                            </button>
                        </div>
                    ) : (
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                            {formatFieldName(field)}
                        </h4>
                    )}
                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-blend-700 text-gray-600 dark:text-gray-300 rounded">
                        {fieldType}
                    </span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIsEditingName(true)}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-700/20 rounded-lg transition-colors"
                        title="Rename field"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(field)}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-indigo-600/30 rounded-lg transition-colors"
                        title="Delete field"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <FieldInput
                type={fieldType}
                value={value}
                onChange={onUpdate}
                options={options}
            />
        </div>
    );
};
