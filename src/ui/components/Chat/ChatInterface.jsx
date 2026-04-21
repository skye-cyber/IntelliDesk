import { useState, useEffect, useRef } from 'react';
import { UsageSuggestions } from '../Usage/Suggestions.js';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import { InputSection } from '../Input/InputSection.tsx';
import { globalEventBus } from '../../../core/Globals/eventBus.ts';
import TodoManager from '../Todo/TodoManager.tsx';
import { RenameDialog } from './ContextMenu.jsx';

export const ChatInterface = ({ isCanvasOpen, onToggleCanvas, onToggleRecording }) => {
    const chatAreaRef = useRef(null);
    const [panelOpen, setPanelOpen] = useState(false)

    useEffect(() => {
        const panelChangeListener = globalEventBus.on('panel:chats:change', (state) => setPanelOpen(state))
        return () => {
            panelChangeListener.unsubscribe()
        };
    }, [panelOpen]);


    const handleScrollButtonDisplay = () => {
        const isScrollable = chatArea.scrollHeight > chatArea.clientHeight;
        const isAtBottom = chatArea.scrollTop + chatArea.clientHeight >= chatArea.scrollHeight;
        globalEventBus.emit('scroll:set:open', (isScrollable && !isAtBottom))
    }

    useEffect(() => {
        // Attach scroll event listener to chatArea
        window.addEventListener("resize", handleScrollButtonDisplay);
        const onScrollEvent = globalEventBus.on('scroll:display:update', handleScrollButtonDisplay)

        return () => {
            window.removeEventListener('resize', handleScrollButtonDisplay)
            onScrollEvent.unsubscribe()
        }
    }, [])

    return (
        <>
            <section
                id='chat-container'
                data-portal-container='chatContainer'
                className='flex justify-center h-full w-full transition-transform ease-in-out pb-20'>
                <div id="chatArea-wrapper" className={`h-full ${isCanvasOpen ? '' : 'w-full md:w-[95%] sd:w-[72%] lg:w-[60%]'}`}>
                    <section
                        id="chatArea"
                        data-portal-container='chatArea'
                        ref={chatAreaRef}
                        onScroll={handleScrollButtonDisplay}
                        onInput={handleScrollButtonDisplay}
                        onDragOver={() => globalEventBus.emit('dropzone:open')}
                        className={`w-full h-full relative  p-2 md:px-4 pb-20 rounded-lg overflow-y-auto overflow-x-hidden scrollbar-custom space-y-4 transition-colors duration-700 ease-in-out border-1 border-blend-50 dark:border-blend-700 max-auto`}
                    >
                        <UsageSuggestions />
                    </section>
                    <ErrorBoundary>
                        <InputSection
                            chatAreaRef={chatAreaRef}
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
            <TodoManager />
            <RenameDialog />
        </>
    );
};

