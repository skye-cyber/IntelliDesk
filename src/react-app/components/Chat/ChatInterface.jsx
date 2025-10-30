import React, { useState, useEffect, useRef } from 'react';
import { QuickActions } from '@components/QuickActions/QuickActions';
import { MessageList } from './MessageList';
import { useElectron } from '@hooks/useElectron';
import { showDropZoneModal } from '@components/DropZone/util.js'

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
    };

    const scrollToBottom = () => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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

                {/* Scroll to bottom button */}
                <ScrollToBottomButton onClick={scrollToBottom} />
            </section>
            {/* Loading Modal */}
            <LoadingModal />
        </section>
    );
};

const ScrollToBottomButton = ({ onClick }) => (
    <button
        id="scroll-bottom"
        className="absolute right-[150px] bottom-0 cursor-pointer rounded-full bg-blue-200 border border-blue-400 dark:border-gray-300 dark:bg-[#222] shadow w-8 h-8 flex items-center justify-center transition-colors duration-1000 z-[40] group"
        aria-label="scroll to bottom"
        onClick={onClick}
    >
        <div className='hidden group-hover:flex gap-2 absolute left-10 text-black dark:text-white tracking-wider font-extralight font-handwriting text-xs'><span>scroll</span></div>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-md text-token-text-primary dark:text-white">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 21C11.7348 21 11.4804 20.8946 11.2929 20.7071L4.29289 13.7071C3.90237 13.3166 3.90237 12.6834 4.29289 12.2929C4.68342 11.9024 5.31658 11.9024 5.70711 12.2929L11 17.5858V4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4V17.5858L18.2929 12.2929C18.6834 11.9024 19.3166 11.9024 19.7071 12.2929C20.0976 12.6834 20.0976 13.3166 19.7071 13.7071L12.7071 20.7071C12.5196 20.8946 12.2652 21 12 21Z" fill="currentColor"></path>
        </svg>
    </button>
);

const LoadingModal = ({ }) => (
    <div id="loadingModal" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden z-[61]">
        <div id="modalMainBox" className="bg-white p-6 rounded-lg shadow-lg flex gap-1 items-center animate-exit transition-all duration-1000">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p id="loadingMSG" className="mt-3 text-gray-700">Processing, please wait...</p>
        </div>
    </div>
);
