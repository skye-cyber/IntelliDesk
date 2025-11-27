import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatmanager } from '../../../renderer/js/managers/ConversationManager/ChatManager';

export const ConversationItem = ({ metadata, portal_id }) => {

    const onContextMenu = useCallback((event, id) => {
        // Prevent the default context menu
        event.preventDefault();
        chatmanager.currentConversationId = id;
        chatmanager.currentPosition = { x: event.clientX, y: event.clientY };

        // First render the tooltip
        const chatOptionsOverlay = document.getElementById('chatOptions-overlay');
        const chatOptions = document.getElementById('chatOptions');

        chatOptionsOverlay.dataset.id = id
        chatOptionsOverlay.dataset.portalid = portal_id

        // Show tooltip with animation
        chatOptionsOverlay.classList.remove('hidden');
        chatOptions.classList.remove('animate-exit');
        chatOptions.classList.add('animate-enter');

        // Use requestAnimationFrame to ensure DOM is updated before measuring
        requestAnimationFrame(() => {
            // Now the element should have its final dimensions
            const rect = chatOptions.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Calculate position with offset from cursor
            const offset = 10;
            let posX = event.clientX + offset;
            let posY = event.clientY + offset;

            // Adjust horizontally
            if (posX + rect.width > viewportWidth) {
                posX = event.clientX - rect.width - offset;
            }

            // Adjust vertically
            if (posY + rect.height > viewportHeight) {
                posY = event.clientY - rect.height - offset;
            }

            // Ensure we don't go off-screen
            posX = Math.max(5, Math.min(posX, viewportWidth - rect.width - 5));
            posY = Math.max(5, Math.min(posY, viewportHeight - rect.height - 5));

            const optionsHeight = chatOptions.offsetHeight; // better performance than getComputedStyle for height
            if (posY + optionsHeight > viewportHeight) {
                posY = posY - optionsHeight;
            }

            chatOptions.style.left = `${posX}px`;
            chatOptions.style.top = `${posY}px`;
        });
    });

    const handleItemClick = useCallback((item) => {
        // Remove animation from previous item as the active item is changing
        if (chatmanager.activeItem) {
            chatmanager.activeItem.classList.remove('animate-heartpulse-slow');
            chatmanager.activeItem.querySelector('#active-dot').classList.add('hidden');
        }

        chatmanager.renderConversationFromFile(metadata.id)
        chatmanager.activeItem = item
        activate_item(item?.dataset?.id)
    });

    const deactivate_item = (data_id=window.activeConversationId) => {
        const item = document.querySelector(`[data-id^='${data_id}']`)

        item.classList.remove('animate-heartpulse-slow');
        item.querySelector('#active-dot')?.classList.add('hidden');
    }

    const activate_item = (data_id) => {
        const item = document.querySelector(`[data-id^='${data_id}']`)

        item?.classList?.add('animate-heartpulse-slow');
        item?.querySelector('#active-dot')?.classList?.remove('hidden');
        window.activeConversationId = item?.dataset?.id
    }
    window.activate_item = activate_item

    useEffect(() => {
        if (window.activeConversationId) {
            activate_item(window.activeConversationId)
        }

        document.addEventListener('NewConversationOpened', deactivate_item)
        return () => document.removeEventListener('NewConversationOpened', deactivate_item);
    })



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
                            {metadata?.name || metadata?.id}
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
