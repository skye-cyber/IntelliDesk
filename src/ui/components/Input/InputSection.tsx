import { useCallback, useEffect, useState, useRef } from 'react';
import { chatutil } from '../../../core/managers/Conversation/util.ts';
import { StateManager } from '../../../core/managers/StatesManager';
import { CodeDetector } from '../Code/CodeDetector';
import { globalEventBus, sigint } from '../../../core/Globals/eventBus.ts';
import { modalmanager } from '../../../core/StatusUIManager/Manager.js';
import '../../../core/managers/Conversation/Mistral/Completion.ts';
import { adjustElementHeight } from './utils/ElementHeight.ts';
import { cleanInput } from './utils/cleanInput.ts';
import { MenuTools } from './MenuTools.tsx';



export const InputSection = ({ onToggleRecording }) => {
    // State management for the toggle
    const [inputValue, setInputValue] = useState('');
    const textareaRef = useRef(null);
    const [incycle, setIncycle] = useState(false)
    const sendButtonRef = useRef(null);
    const [inputFocus, setInputFocused] = useState(false)

    useEffect(() => {
        // Signal handlers
        const startCycle = globalEventBus.on('executioncycle:start', () => {
            setIncycle(true)
            // StateManager.set('processing', true);
        })
        const endCycle = globalEventBus.on('executioncycle:end', () => {
            setIncycle(false)
            // StateManager.set('processing', false);
        })
        const onSigint = globalEventBus.on('sigint', () => {
            setIncycle(false)
            // StateManager.set('processing', false);
        })
        const userSubmit = globalEventBus.on('useraction:submit:incycle', (text) => {
            setIncycle(false)
            // StateManager.set('processing', false);
            handleSend(text)
        })
        return () => {
            startCycle.unsubscribe()
            endCycle.unsubscribe()
            onSigint.unsubscribe()
            userSubmit.unsubscribe()
        }
    })


    const validateInput = useCallback(() => {
        if (!StateManager.get('keychainValid')) {
            globalEventBus.emit('apikey:missing:warning:show')
            return false
        }

        if (!textareaRef || !textareaRef.current) return false

        const input = (textareaRef.current as HTMLBaseElement).innerHTML

        if (!input) return false

        setInputValue(input)

        const shouldProcess = (
            input &&
            input !== "" // prevent ""
            && input?.replace(/&nbsp;/, '').trim() // prevent &nbsp;
            && input?.trim() // prevent " "

        )

        if (!shouldProcess) return false

        // Avail orginal text for retries incase of errors
        StateManager.set('userInputText', input.trim())
        return input
    }, [inputValue])

    const handleSend = useCallback(() => {
        const userInputValue = validateInput()

        if (incycle || !userInputValue) return  //sigint.raise() // sigint is handled on submit bt click elsewhere

        if (!textareaRef || !textareaRef.current) return false

        const userInput = (textareaRef.current as HTMLBaseElement)

        // Auto-format the text with code blocks before sending
        const formattedMessage = cleanInput(CodeDetector.autoFormatCodeBlocks(userInputValue))

        if (!formattedMessage.trim()) return

        userInput.innerHTML = "";
        // userInput.style.height = Math.min(userInput.scrollHeight, 0.28 * window.innerHeight) + 'px';
        globalEventBus.emit('suggestions:hide');

        // Adjust input field height
        userInput.style.height = 'auto';
        if (!formattedMessage) return modalmanager.showMessage("No text provided", "error")
        globalEventBus.emit('useraction:request:execution', formattedMessage)
        // router.requestRouter(formattedMessage, document.getElementById('chatArea'));
        adjustElementHeight(userInput)

    }, [])


    useEffect(() => {
        if (!textareaRef || !textareaRef.current) return
        //prep user input
        (textareaRef.current as HTMLBaseElement).focus()

    }, [handleSend]);

    useEffect(() => {
        if (!textareaRef.current) return
        const textArea = textareaRef.current as HTMLBaseElement

        const observer = new MutationObserver(() => {
            setInputValue(textArea.innerHTML)
            if (!textArea.innerHTML?.trim() || textArea.innerHTML === '<br>') textArea.innerHTML = ""
        });

        if (textareaRef.current) {
            observer.observe(textareaRef.current, {
                childList: true, // Track node additions/removals
                subtree: true, // Track all descendants
                characterData: true // Track text changes
            });
        }
        adjustElementHeight(textArea)

        return () => observer.disconnect();
    }, []);

    const handlePaste = (e: ClipboardEvent) => {
        e.preventDefault();

        if (!e.clipboardData) return

        // Get plain text from clipboard
        let text = e.clipboardData.getData('text/plain');

        // Get current selection
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;

        const range = selection.getRangeAt(0);

        // Delete any selected content (like normal paste behavior)
        range.deleteContents();

        // Insert the plain text
        const textNode = document.createTextNode(text)
        range.insertNode(textNode);

        // Move cursor to after the inserted text (maintains original behavior)
        range.setStartAfter(textNode);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);

        // Trigger change for your MutationObserver
        if (textareaRef.current) {
            const event = new Event('input', { bubbles: true });
            (textareaRef.current as HTMLBaseElement).dispatchEvent(event);
            adjustElementHeight(textareaRef.current)
        }
    };


    const handleKeyDown = (e: KeyboardEvent) => {
        // Handle Tab key for indentation in code mode
        if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            // insertText('    ');
            return;
        }

        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            // Insert line break at cursor
            document.execCommand('insertHTML', false, '<br><br>');
        }

        // Enter to send !sendButtonRef.current.classList.contains('hidden')
        if (e.key === 'Enter' && !incycle && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault()
            handleSend();
            return;
        }

    };

    const onSendClick = () => {
        if (incycle) return sigint.raise()
        handleSend()
    }

    useEffect(() => {
        chatutil.scrollToBottom(document.getElementById('chatArea'), false);
    }, []);

    return (
        <div
            id="userInput-wrapper"
            className="sticky flex justify-center w-full lg:items-center lg:justify-center z-30 bottom-[0.5%] transition-all duration-1000">
            <section
                id="userInputContainer"
                data-portal-container="userInputContainer"
                className={`relative w-full sm:w-[50vw] xl:w-auto xl:min-w-[34vw] xl:max-w-[48vw] transition-all duration-500 rounded-2xl border ${inputFocus
                        ? 'border-indigo-400 ring-2 ring-indigo-300/50 shadow-lg'
                        : 'border-indigo-300 dark:border-indigo-700'
                    } bg-gray-50 dark:bg-gray-900`}
            >
                {/* Input Area */}
                <div className="flex items-end gap-2 p-2">
                    {/* Tools Menu Button */}
                    <button
                        onClick={() => globalEventBus.emit('userinput:menu:toggle')}
                        title="Open tools menu"
                        className="flex-shrink-0 text-gray-600 dark:text-gray-200 cursor-pointer hover:scale-110 transition-transform duration-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        <svg className="h-5 w-5 md:h-6 md:w-6 fill-gray-800 dark:fill-gray-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                            <path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z" />
                        </svg>
                    </button>

                    {/* Input Field */}
                    <div
                        id="userInput"
                        ref={textareaRef}
                        contentEditable="true"
                        role="textbox"
                        aria-label="Message input"
                        autoFocus={true}
                        onKeyDown={(e) => handleKeyDown(e as any as KeyboardEvent)}
                        onPaste={(e) => handlePaste(e as any)}
                        onFocus={() => setInputFocused(true)}
                        onBlur={() => setInputFocused(false)}
                        onInput={(e) => {
                            const target = e.target as HTMLBaseElement;
                            adjustElementHeight(target);

                            // Fix: Reset scroll position to prevent content clipping
                            target.scrollTop = 0;
                        }}
                        data-placeholder="Message IntelliDesk..."
                        className="flex-1 h-auto max-h-[22vh] overflow-y-auto outline-none bg-transparent dark:text-white rounded-2xl py-3 px-2 scrollbar-custom scroll-smooth text-base leading-relaxed"
                        style={{
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            lineHeight: '1.5'
                        }}
                    ></div>

                    {/* Action Buttons */}
                    <div className="flex-shrink-0 flex items-center gap-1">
                        {/* DeepThink Button */}
                        <button
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 group"
                            title="DeepThink Mode"
                        >
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </button>

                        {/* Search Button */}
                        <button
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 group"
                            title="Search Web"
                        >
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* Send Button */}
                        <button
                            id="sendBtn"
                            ref={sendButtonRef}
                            onClick={onSendClick}
                            className="flex items-center justify-center h-9 w-9 rounded-full transition-all duration-300 bg-gradient-to-br from-[#00246c] dark:from-[#a800fc] to-[#008dd3] dark:to-indigo-900 shadow-md hover:scale-110 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            aria-label="Send message"
                            title="Send message"
                        >
                            {incycle ? (
                                <div className="flex items-center justify-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-150"></span>
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-300"></span>
                                </div>
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="#ff8a65" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </section>
            <MenuTools onToggleRecording={onToggleRecording} />

            {/* Scroll to bottom button */}
            <ScrollToBottomButton />
        </div >
    );
};


const ScrollToBottomButton = ({ }) => {
    const scrollRef = useRef(null)

    const onClickScroll = (check = false) => {
        chatutil.scrollToBottom(document.getElementById('chatArea'), check)
    }

    useEffect(() => {
        const scroller = globalEventBus.on('scroll:bottom', (check = false) => {
            onClickScroll(check)
            return () => scroller.unsubscribe()
        })
    })
    return (
        <button
            ref={scrollRef}
            id="scroll-bottom"
            className="absolute fixed right-[150px] bottom-24 cursor-pointer rounded-full bg-blue-100 border border-blue-400 dark:border-gray-300 dark:bg-[#222] shadow w-8 h-8 flex items-center justify-center transition-colors duration-1000 z-[99] group"
            aria-label="scroll to bottom"
            onClick={() => globalEventBus.emit('scroll:bottom', false)}
        >
            <div className='hidden group-hover:flex gap-2 absolute left-10 text-black dark:text-white tracking-wider font-extralight font-handwriting text-xs'><span>scroll</span></div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-md text-token-text-primary dark:text-white">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 21C11.7348 21 11.4804 20.8946 11.2929 20.7071L4.29289 13.7071C3.90237 13.3166 3.90237 12.6834 4.29289 12.2929C4.68342 11.9024 5.31658 11.9024 5.70711 12.2929L11 17.5858V4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4V17.5858L18.2929 12.2929C18.6834 11.9024 19.3166 11.9024 19.7071 12.2929C20.0976 12.6834 20.0976 13.3166 19.7071 13.7071L12.7071 20.7071C12.5196 20.8946 12.2652 21 12 21Z" fill="currentColor"></path>
            </svg>
        </button>
    )
};
