import { useState, useEffect, useRef } from 'react';
import { QuickActions } from '../../components/QuickActions/QuickActions';
import { MessageList } from './MessageList';
import { useElectron } from '../../hooks/useElectron';
import { showDropZoneModal } from '../../components/DropZone/util.js'
import { ChatUtil } from '../../../core/managers/Conversation/util';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import { InputSection } from '../../components/Input/InputSection';
import { staticPortalBridge } from '../../../core/PortalBridge.ts';
import { useEventBus } from '../../hooks/useBusEvent.js';

const chatutil = new ChatUtil()

export const ChatInterface = ({ isCanvasOpen, onToggleCanvas, onToggleRecording }) => {
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
        <>
            <section
                id='chat-container'
                data-portal-container='chatContainer'
                className='flex justify-center h-full w-full transition-transform ease-in-out'>
                <div id="chatArea-wrapper" className='h-full w-[100%] md:w-[80%] lg:w-[70%] xl:w-[60%]'>
                    <section
                        id="chatArea"
                        data-portal-container='chatArea'
                        ref={chatAreaRef}
                        className="relative h-full p-2 md:px-4 pb-20 rounded-lg overflow-y-auto overflow-x-hidden scrollbar-custom space-y-4 transition-colors duration-700 ease-in-out w-full border-1 border-blend-50 dark:border-blend-700"
                    >
                        {/*<ToolDemo />*/}
                        {/* Show quick actions when no messages */}
                        {messages.length === 0 && !isLoading && (
                            <QuickActions />
                        )}

                        {/* Messages list */}
                        <MessageList messages={messages} isLoading={isLoading} />

                    </section>
                    <ErrorBoundary>
                        <InputSection
                            isCanvasOpen={isCanvasOpen}
                            onToggleCanvas={onToggleCanvas}
                            onToggleRecording={onToggleRecording}
                        />
                    </ErrorBoundary>

                    {/* status display modals */}
                    <div data-portal-container='messageContainer'
                        id='message-container'
                        className='fixed top-2 right-2 z-[99] space-y-3 max-w-sm w-full'>
                    </div>

                </div>
                {/* confirm dialog */}
                <div data-portal-container='ConfirmdialogContainer' id='confirm-dialog-container'></div>
            </section>
        </>
    );
};


export const ToolPermissionDemo = () => {
    const [showDialog, setShowDialog] = useState(false);
    const [lastDecision, setLastDecision] = useState(null);

    const handleDecision = (decision) => {
        setLastDecision(decision);
        setShowDialog(false);
        console.log('User decision:', decision);

        // Handle different decision types
        switch (decision) {
            case 'allow_once':
                // Execute tool once
                break;
            case 'allow_session':
                // Store in sessionStorage
                sessionStorage.setItem('tool_permission', 'allowed');
                break;
            case 'allow_always':
                // Store in localStorage
                localStorage.setItem('tool_permission', 'allowed');
                break;
            case 'deny_once':
                // Deny this execution
                break;
            case 'deny_always':
                // Store denial in localStorage
                localStorage.setItem('tool_permission', 'denied');
                break;
        }
        staticPortalBridge.closeComponent('tool_perm_request', true)
    };
    const showPerUi = () => {
        const args = {
            command: "rm -rf /tmp/important_fitool_perm_requesttool_perm_requesttool_perm_requesttool_perm_requesttool_perm_requesttool_perm_requesttool_perm_requestles && echo 'Clean up temporary files'",
            working_directory: "/home/user/projects",
            timeout: 30
        }
        staticPortalBridge.showComponent('ToolPermissionRequest',
            {
                toolName: 'bash',
                toolArgs: args,
                onDecision: handleDecision
            },
            'tool_perm_request'
        )
        setShowDialog(true)
    }

    return (
        <div className="min-h-[50%] bg-gray-100 dark:bg-gray-950 p-8">
            {lastDecision && (
                <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                    <p className="text-sm">Last decision: {lastDecision}</p>
                </div>
            )}

            {!showDialog && (
                <button
                    onClick={showPerUi}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Show Demo Again
                </button>
            )}
            <PermissionHistory />
        </div>
    );
};

