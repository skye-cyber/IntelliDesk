import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatmanager } from '../../../renderer/js/managers/ConversationManager/ChatManager';

export const ConversationItem = ({ metadata }) => {

    const onContextMenu = useCallback((event, id) => {
        // Prevent the default context menu
        event.preventDefault();
        chatmanager.currentConversationId = id
        //conversationItem.dataset.id = conversationId
        chatmanager.showConversationOptions(event)
    });

    const handleItemClick = useCallback((item) => {
        // Remove animation from previous item as the active item is changing
        if (chatmanager.activeItem) {
            chatmanager.activeItem.classList.remove('animate-heartpulse');
            chatmanager.activeItem.querySelector('#active-dot').classList.add('hidden');
        }

        chatmanager.activeItem = item
        item.classList.add('animate-heartpulse-slow');
        item.querySelector('#active-dot')?.classList.remove('hidden');
        chatmanager.renderConversationFromFile(metadata.id)
    });


    return (
        <div
            id='chat-item'
            data-name={metadata?.name || metadata?.id}
            data-id={metadata?.id}
            data-highlight={metadata?.highlight}
            data-portal-id={metadata?.portal_id}
            className='conversation-item group mb-1.5'
            onContextMenu={(event) => onContextMenu(event, metadata?.id)}
            onClick={(event) => handleItemClick(event.currentTarget)}
        >
            <div className="flex items-center space-x-3 p-1 md:p-2 2xl:p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-700/50 cursor-pointer transition-all duration-200">
                <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-semibold text-sm">GN</span>
                    </div>
                    <div id="active-dot" className="hidden absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h3 id="chat-name" className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {metadata?.id}
                        </h3>
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{chatmanager.formatRelativeTime(metadata?.timestamp)}</span>
                    </div>
                    <p id="chat-highlight" className="text-xs text-gray-600 dark:text-gray-300 truncate mt-1">
                        {metadata?.highlight}
                    </p>
                </div>
            </div>
        </div>
    )
}
