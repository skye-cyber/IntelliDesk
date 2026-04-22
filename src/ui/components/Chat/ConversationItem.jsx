import { useEffect, useState, useRef } from 'react';
import { chatmanager } from '../../../core/managers/Conversation/ChatManager';
import { DateSeperator } from './Seperator';
import { globalEventBus } from '../../../core/Globals/eventBus';
import { ChatContextMenu } from './ContextMenu';

export const ConversationItem = ({ metadata, datestr }) => {
    const [isActive, setIsActive] = useState(false)
    const [contextMenuOpen, setContextMenuOpen] = useState(false)
    const chatItemRef = useRef(null);

    useEffect(() => {
        setIsActive(window.desk.api.getmetadata().id === metadata.id)
    }, [])

    useEffect(() => {
        if (!isActive) return
        const activationEvent = globalEventBus.on('chatitem:activate', (state) => setIsActive(state))


        return () => activationEvent.unsubscribe()
    })

    useEffect(() => {
        // This event shall be recieved by all chat items so owner of lock will act
        const chatItemLock = globalEventBus.on('chatItemLock:unlock', (id) => {
            // If this item is not the target, hide its menu
            if (metadata.id !== id) {
                // Hide self context menu
                setContextMenuOpen(false)
            }
        })

        // Update name on rename
        const nameUpdate = globalEventBus.on('chatitem:name:update', ({ id, name }) => {
            if (id === metadata.id) {
                metadata.name = name
            }
        })
        return () => {
            chatItemLock.unsubscribe()
            nameUpdate.unsubscribe()
        }
    })

    return (
        <section
            ref={chatItemRef}
            data-name={metadata?.name || metadata?.id}
            data-id={metadata?.id}
            data-highlight={metadata?.highlight}
            data-portal-id={metadata?.portal_id}
            className='relative'
            id='chat-item'>
            {datestr ?
                <DateSeperator displaystr={datestr} />
                : ''
            }
            <div
                className={`conversation-item group mb-1.5 ${isActive ? 'animate-heartpulse-slow' : ''}`}
                onContextMenu={() => {
                    globalEventBus.emit('chatItemLock:unlock', (metadata.id))
                    setContextMenuOpen(true)
                }}
                onClick={() => {
                    setIsActive(true)
                    // Deactivate previous active item
                    globalEventBus.emit('chatitem:activate', false)
                    // Load conversation
                    chatmanager.renderConversationFromFile(metadata.id)
                }
                }
            >
                <div className="flex items-center space-x-0.5 p-1 md:p-2 2xl:p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-700/50 cursor-pointer transition-all duration-200">
                    <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white font-semibold text-sm">GN</span>
                        </div>
                        <div id="active-dot" className={`absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full ${isActive ? '' : 'hidden'}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h3 id="chat-name" className="text-sm font-semibold text-gray-900 dark:text-white truncate my-0">
                                {metadata?.name || metadata?.id}
                            </h3>
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{chatmanager.formatRelativeTime(metadata?.updated_at)}</span>
                        </div>
                        <p id="chat-highlight" className="text-xs text-gray-600 dark:text-gray-300 truncate mt-1">
                            {metadata?.highlight}
                        </p>
                    </div>
                </div>
            </div>
            <ChatContextMenu isOpen={contextMenuOpen} onClose={() => setContextMenuOpen(false)} id={metadata.id} />
        </section >
    )
}
