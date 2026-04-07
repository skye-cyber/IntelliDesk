import { useCallback, useEffect, useState, useRef } from 'react';
import { chatutil } from '../../../core/managers/Conversation/util';
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
        console.log(userInput.style.height)

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
                className={`relative w-full sm:w-[70vw] xl:w-auto xl:min-w-[34vw] xl:max-w-[48vw] space-x-4 transition-all duration-500 flex items-center justify-center rounded-full border border-indigo-300 px-2 sm:px-[3%] group ${inputFocus ? 'border-1.5' : ''} focus:border-2 bg-gray-50 dark:bg-blend-900`}>

                {/* Custom input field */}
                <div
                    id="userInput"
                    ref={textareaRef}
                    contentEditable="true"
                    onInput={(e) => adjustElementHeight(e.target as HTMLBaseElement)}
                    role="textbox"
                    aria-label="Message input"
                    autoFocus={true}
                    data-placeholder="Type your message..."
                    onKeyDown={(e) => handleKeyDown((e as any) as KeyboardEvent)}
                    onPaste={(e) => handlePaste(e as any)}
                    onFocus={() => setInputFocused(true)}
                    className="h-auto max-h-[12vh] sm:max-h-[22vh] w-full my-1 ml-4 overflow-y-auto scrollbar-custom scroll-smooth py-2 px-1 md:px-[2%] rounded-2xl sm:rounded-3xl outline-none ring-none focus:outline-none bg-gray-50 dark:bg-blend-900 dark:text-white active:outline-none resize-none text-normal placeholder-sm flex items-center placeholder-gray-50 transition-colors duration-500"
                ></div>

                <div className='absolute -left-4 z-10'>
                    <button onClick={() => globalEventBus.emit('userinput:menu:toggle')} title="open tools" className='text-gray-600 dark:text-gray-200 cursor-pointer focus:outline-none active:ring-none'>
                        <svg className='bg-gray-100 dark:bg-[#0a0a1f]/0 rounded-full h-5 w-5 md:h-6 md:w-6 p-0 fill-gray-800 dark:fill-gray-200 hover:scale-[1.2] transition duration-500 ease-in-out focus:outline-none' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z" /></svg>
                    </button>
                </div>

                <div className='absolute right-0 z-10'>
                    {/* Send Button - Always prominent */}
                    <button
                        id="sendBtn"
                        ref={sendButtonRef}
                        onClick={onSendClick}
                        className="flex relative items-center justify-center h-10 w-10 rounded-full transition-all ease-in-out duration-300 z-50 bg-white border border-gray-200 bg-gradient-to-br from-[#00246c] dark:from-[#a800fc] to-[#008dd3] dark:to-indigo-900 overflow-hidden shadow-lg hover:scale-110 hover:shadow-xl" aria-label="Send message" title="Send message">
                        <div id="normalSend" className={`${incycle ? 'hidden' : 'flex'} items-center justify-center h-full w-full`}>
                            <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="planeGradient2" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#ff8a65" />
                                        <stop offset="100%" stopColor="#ff7043" />
                                    </linearGradient>
                                </defs>
                                <path fill="url(#planeGradient2)" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </div>
                        <div id="spinningSquares" className={`${incycle ? 'absolute' : 'hidden'} inset-0 flex items-center justify-center`}>
                            <span className="ripple-single-1"></span>
                            <span className="ripple-single-2"></span>
                            <span className="ripple-single-3"></span>
                        </div>
                    </button>
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
