import React, { useState, useEffect, useRef } from 'react';
import { QuickActions } from '@components/QuickActions/QuickActions';
import { MessageList } from './MessageList';
import { useElectron } from '@hooks/useElectron';
import { showDropZoneModal } from '@components/DropZone/util.js'
import { ChatUtil } from '../../../renderer/js/managers/ConversationManager/util';

const chatutil = new ChatUtil()

export const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatAreaRef = useRef(null);
    const { onChatResponse, onError } = useElectron();

    useEffect(() => {
        // Listen for new messages from Electron
        const handleChatResponse = (response) => {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: response,
                sender: 'ai',
                timestamp: new Date()
            }]);
            setIsLoading(false);
        };

        const handleError = (error) => {
            // Handle error display
            setIsLoading(false);
        };

        // Subscribe to Electron events
        const unsubscribeResponse = onChatResponse(handleChatResponse);
        const unsubscribeError = onError(handleError);

        return () => {
            unsubscribeResponse();
            unsubscribeError();
        };
    }, [onChatResponse, onError]);

    useEffect(() => {
        document.getElementById('chatArea')?.addEventListener('dragover', showDropZoneModal)
    })

    const handleQuickAction = (action) => {
        // Handle quick action clicks
        const quickPrompts = {
            'create-image': 'Create an image of...',
            'get-advice': 'I need advice about...',
            'summarize': 'Please summarize the following text:',
            'suprise': 'Surprise me with something interesting!',
            'code': 'Help me write code for...',
            'analyze-images': 'Analyze this image...',
            'help-me-write': 'Help me write...'
        };

        const prompt = quickPrompts[action] || action;
        // TODO: auto-fill the input or send directly
        console.log('Quick action:', action, prompt);
    }

    useEffect(() => {
        const chatArea = document.getElementById('chatArea')

        // Attach scroll event listener to chatArea
        chatArea.addEventListener("scroll", chatutil.updateScrollButtonVisibility);
        chatArea.addEventListener("input", chatutil.updateScrollButtonVisibility);
        window.addEventListener("resize", chatutil.updateScrollButtonVisibility);

        const scrollButton = document.getElementById('scroll-bottom')
        // Scroll to the bottom when the button is clicked
        scrollButton?.addEventListener("click", () => {
            chatArea.scrollTo({
                top: chatArea.scrollHeight,
                behavior: "smooth",
            });
        });

        return () => {
            chatArea.removeEventListener('scroll', chatutil.updateScrollButtonVisibility)
            chatArea.removeEventListener('input', chatutil.updateScrollButtonVisibility)
            window.removeEventListener('resize', chatutil.updateScrollButtonVisibility)
            scrollButton.removeEventListener('click', chatutil.updateScrollButtonVisibility)
        }
    }, [])


    return (
        <section>
            <section
                id="chatArea"
                ref={chatAreaRef}
                className="relative bg-gray-50 dark:bg-[#0a0a1f] h-[75vh] p-2 shadow-inner shadow-gray-400 dark:shadow-none md:p-4 rounded-lg dark:shadow-gray-950 overflow-y-auto overflow-x-hidden space-y-4 transition-colors duration-1000 max-w-[98vw] mb-[15vh]"
            >
                {/* Show quick actions when no messages */}
                {messages.length === 0 && !isLoading && (
                    <QuickActions onActionClick={handleQuickAction} />
                )}

                {/* Messages list */}
                <MessageList messages={messages} isLoading={isLoading} />

            </section>
            {/* Loading Modal */}
            <LoadingModal />
            {/* Copy Feedback Modal */}
            <CopyFeedbackModal />
        </section>
    );
};

const LoadingModal = () => (
    <div id="loadingModal" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden z-[61]">
        <div id="modalMainBox" className="bg-white p-6 rounded-lg shadow-lg flex gap-1 items-center animate-exit transition-all duration-1000">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p id="loadingMSG" className="mt-3 text-gray-700">Processing, please wait...</p>
        </div>
    </div>
);


const CopyFeedbackModal = () => (
    <div id="copyModal" className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 opacity-0 pointer-events-none transition-all duration-1000 ease-in-out">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border border-gray-200/60 dark:border-slate-600/50 rounded-2xl shadow-2xl shadow-black/20 backdrop-blur-xl p-4 min-w-[280px]">
            {/* Animated Success Icon */}
            <div className="flex items-center justify-center space-x-3">
                <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    {/* Pulse Ring */}
                    <div className="absolute inset-0 border-2 border-emerald-400/30 rounded-full animate-ping-slow"></div>
                </div>

                <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">Copied to clipboard</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Ready to paste anywhere</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div id="copy-progress" className="mt-3 h-0.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 animate-progress"></div>
            </div>
        </div>
    </div>
);
