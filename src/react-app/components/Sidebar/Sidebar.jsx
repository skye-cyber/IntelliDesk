import React, { useEffect, useCallback, useRef } from 'react';

export const Sidebar = ({ isOpen, onToggle }) => {

    const refs = useRef({
        isOpen: null
    })

    useEffect(() => {
        if (!isOpen && !refs.current) return;
        const panel = document.getElementById('conversationPane');
        setTimeout(() => {
            panel?.classList.remove('-translate-x-[100vw]')
            panel?.classList.add('translate-x-0')
        })
    })

    const showConversationOptions = useCallback(() => {
        const chatOptionsOverlay = document.getElementById('chatOptions-overlay');
        const chatOptions = document.getElementById('chatOptions');
        chatOptionsOverlay.classList.remove('hidden');
        chatOptions.classList.remove('animate-exit');
        chatOptions.classList.add('animate-enter')
    })

    if (!isOpen) return null;

    return (
        <div
            id="conversationPane"
            className="fixed top-0 left-0 h-screen w-80 max-w-[85vw] bg-gradient-to-b from-slate-50 to-blue-50/30 dark:from-gray-900 dark:to-slate-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-2xl transform transition-transform -translate-x-[100vw] transition-all duration-500 ease-out z-40 overflow-hidden"
        >
            {/* Header Section */}
            <section className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                Conversations
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Recent chats
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                        {/* Search Button */}
                        <button
                            id="search-chats"
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group"
                            title="Search conversations"
                            aria-label="Search conversations"
                        >
                            <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* New Chat Button */}
                        <button
                            id="new-chat"
                            className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                            title="Start new conversation"
                            aria-label="Start new conversation"
                        >
                            <svg className="w-5 h-5 text-white transform group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Search Bar (Hidden by default) */}
                <div id="search-container" className="hidden mt-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                        />
                        <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* Conversations List */}
            <div id="conversations" className="h-[calc(100vh-120px)] overflow-y-auto py-2 px-3 space-y-1">
                {/* Sample Conversation Items */}
                <div className="conversation-item group hidden">
                    <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-200/50 dark:hover:border-gray-700/50 cursor-pointer transition-all duration-200 active:scale-95">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white font-semibold text-sm">AI</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    Project Discussion
                                </h3>
                                <span className="text-xs text-gray-500 dark:text-gray-400">2h</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                Let's work on the new features...
                            </p>
                        </div>
                    </div>
                </div>

                {/* Active Conversation */}
                <div className="conversation-item group hidden">
                    <div className="flex items-center space-x-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-700/50 cursor-pointer transition-all duration-200">
                        <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-white font-semibold text-sm">UI</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    Design Review
                                </h3>
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Now</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 truncate mt-1">
                                Working on the new interface...
                            </p>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                <div id="empty-conversations" className=" flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No conversations yet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Start a new conversation to get started
                    </p>
                    <button onClick={() => document.getElementById('new-chat')?.click()} className="px-4 py-2 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105">
                        New Conversation
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white/80 to-transparent dark:from-gray-900/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                        Powered by IntelliDesk
                    </span>
                    <button
                        onClick={() => document.getElementById('settings').click()}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                        title="Settings"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                    <button onClick={() => document.getElementById('togglePane')?.click()} className='h-6 w-6 hover:rotate-180 transition-all duration-700'>
                        <svg xmlns="http://www.w3.org/2000/svg" className='fill-cyan-400' viewBox="0 0 640 640"><path d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
