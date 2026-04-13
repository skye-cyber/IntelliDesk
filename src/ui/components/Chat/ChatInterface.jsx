import { useState, useEffect, useRef } from 'react';
import { UsageSuggestions } from '../Usage/Suggestions.js';
import { chatutil } from '../../../core/managers/Conversation/util.ts';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import { InputSection } from '../Input/InputSection.tsx';
import { globalEventBus } from '../../../core/Globals/eventBus.ts';
import TodoManager from '../Todo/TodoManager.tsx';

export const ChatInterface = ({ isCanvasOpen, onToggleCanvas, onToggleRecording }) => {
    const chatAreaRef = useRef(null);
    const [panelOpen, setPanelOpen] = useState(false)

    useEffect(() => {
        const panelChangeListener = globalEventBus.on('panel:chats:change', (state) => setPanelOpen(state))
        return () => {
            panelChangeListener.unsubscribe()
        };
    }, [panelOpen]);


    useEffect(() => {
        // Attach scroll event listener to chatArea
        window.addEventListener("resize", chatutil.updateScrollButtonVisibility);

        return () => {
            window.removeEventListener('resize', chatutil.updateScrollButtonVisibility)
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
                        onScroll={chatutil.updateScrollButtonVisibility}
                        onInput={chatutil.updateScrollButtonVisibility}
                        onDragOver={() => globalEventBus.emit('dropzone:open')}
                        className={`w-full h-full relative  p-2 md:px-4 pb-20 rounded-lg overflow-y-auto overflow-x-hidden scrollbar-custom space-y-4 transition-colors duration-700 ease-in-out border-1 border-blend-50 dark:border-blend-700 max-auto`}
                    >
                        <UsageSuggestions />
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
            <TodoManager />
        </>
    );
};

