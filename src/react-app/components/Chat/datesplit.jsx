import React from 'react';

export const DateSplit = ({ displaystr="Date str" }) => {
    return (
        <div className='flex justify-center bg-gray-50 dark:bg-slate-950/0 border-b dark:border-gray-700 mb-1 pb-0.5 rounded-y-md rounded-b-none'>
           <p className='text-xs text-gray-600 dark:text-gray-100'>{displaystr}</p>
        </div>
    );
}
