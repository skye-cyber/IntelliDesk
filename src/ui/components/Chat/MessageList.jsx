import { useEffect, useState, useCallback } from 'react';
import { LoadingSpinner } from './LoadingIndicator';
import indellidesk from '@assets/intellidesk.png';
import { globalEventBus } from '../../../core/Globals/eventBus';

export const MessageList = ({ }) => {
    const [isLoading, setLoading] = useState(true)
    const [hasStore, setStore] = useState(false)

    const loader = async () => {
        const hasFiles = await window.desk.api.validateStore()
        return hasFiles
    }
    useEffect(() => {
        if (hasStore) return
        setStore(loader())
    }, [hasStore])

    const hideLoading = useCallback(() => {
        setLoading(false)
    })

    useEffect(() => {
        const hideloader = globalEventBus.on('panel:loader:hide', hideLoading)

        return () => hideloader.unsubscribe();

    })
    return (
        <div
            id="conversations"
            data-portal-container="conversations"
            className="verbose-hide hidden h-[64vh] overflow-x-hidden overflow-y-auto py-2 px-3 space-y-1 transform transition-all duration-700 ease-in-out scrollbar-custom scroll-smooth">
            {/* Empty State */}
            <div id="chatsempty" className={`${hasStore
                ? 'hidden' : 'flex-col'} items-center justify-center py-12 px-4 text-center`}>
                <div className='flex w-full flex items-center justify-center'>
                    <img src={indellidesk} className="w-8 h-8 text-gray-400 dark:text-gray-500"></img>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nothing yet</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Start a new conversation to get started
                </p>
                <button onClick={() => document.getElementById('new-chat')?.click()} className="px-4 py-2 bg-blend-500 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium text-sm whitespace-pre transition-all duration-300 transform hover:scale-105">
                    New Conversation
                </button>
            </div>
            {isLoading && <LoadingSpinner text='Loading' />}
        </div>
    );
};
