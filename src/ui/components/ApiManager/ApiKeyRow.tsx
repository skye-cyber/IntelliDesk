interface ApiKeyRowProps {
    apikey: {
        value: string;
        status: string;
    };
    maskFn: (key: string, options?: any) => string;
    onDelete: (key: { value: string; status: string }) => void;
    onDisable: (key: { value: string; status: string }) => void;
}

export const ApiKeyRow = ({ apikey, maskFn, onDelete, onDisable }: ApiKeyRowProps) => {
    const dotColors = {
        enabled: {
            bg: 'bg-orange-500',
            text: 'text-orange-500',
            animation: ''
        },
        active: {
            bg: 'bg-green-500',
            text: 'text-green-500',
            animation: 'animate-heartpulse-super ease-in-out'
        },
        disabled: {
            bg: 'bg-[#ff0000]',
            text: 'text-red-500',
            animation: ''
        }
    };

    const statusStyle = dotColors[apikey.status as keyof typeof dotColors] || dotColors.disabled;

    return (
        <tr className='hover:bg-gray-50/50 dark:hover:bg-[#aa55ff]/10 transition-colors'>
            <td className="flex items-center space-x-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className={`ml-2 w-2 h-2 ${statusStyle.bg} ${statusStyle.animation} rounded-full`}></div>
                <span className='truncate font-mono'>{maskFn(apikey.value)}</span>
            </td>
            {/* Status */}
            <td>
                <span className={`${statusStyle.text} text-xs font-handwriting`}>{apikey.status}</span>
            </td>
            {/* Actions */}
            <td className='flex space-x-3'>
                {/* Delete */}
                <button onClick={() => onDelete(apikey)} className='flex space-x-1 text-red-500 dark:text-red-400 text-[15px]'>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.981-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                </button>
                {/* Disable/Enable */}
                <button onClick={() => onDisable(apikey)} className={`flex text-[15px] space-x-2 ${apikey.status !== 'disabled' ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                    {apikey.status !== 'disabled' ? 'Disable' : 'Enable'}
                </button>
            </td>
        </tr>
    );
};
