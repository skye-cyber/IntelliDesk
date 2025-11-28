import React, { useCallback, useEffect, useState, useRef } from 'react';
import { opendiagViewModal, closediagViewModal } from '@js/diagraming/Utils.js';
import { showDropZoneModal } from '@components/DropZone/util.js'
import { namespaceWatcher } from '../../../renderer/js/Utils/namespace_utils';
import { ChatUtil } from '../../../renderer/js/managers/ConversationManager/util';
import { StateManager } from '../../../renderer/js/managers/StatesManager';
import { AutoCodeDetector } from '../code/autoCodeDetector';

const chatutil = new ChatUtil()

let router
//Import Dynamically
import('@js/managers/router.js').then(({ Router }) => {
    router = new Router()
    // Set a namespaced variable for the watcher
    window.app = window.app || {};
    window.app.router = router;
})

// Common code patterns for detection
const CODE_PATTERNS = {
    python: /^(def |class |import |from |print\(|if __name__|#|__init__\(|os|sys|subprocess|__new__\(|\)\s?->\s?[a-zA-Z]:|\(self\)|None|#![/a-zA-Z]+python[1-9]*?|@classmethod|@staticmethod|\([a-zA-Z]_?:\s?[a-zA-Z]\))/m,
    javascript: /^(function|const |let |var |import |export |console\.|window\.)/m,
    java: /^(public|private|class |import |System\.out)/m,
    html: /<(div|span|p|html|body|head)|<!DOCTYPE/,
    css: /(\.[a-zA-Z]|#[a-zA-Z]|@media|margin|padding)/,
    sql: /(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)/i,
    generic: /(\{|\}|\(|\)|;|=>|->|\/\/|\/\*|\*\/)/,
    react: /^(import\s {[a-zA-Z1-9]} |return \(<[a-zA-Z]\)|import)/,
    bash: /(echo\s?(-e)?)\s?[\'\"[a-zA-Z1-9]?]?[a-zA-Z1-9]|\s*?\|\s*?|\>\>?[1-9]|[a-zA-Z1-9]\(\)\s\{|fi|exit\s?[1-9]*?|\[\[|-ne|-qe|&&|;;|esac/
};

const LANGUAGE_EXTENSIONS = {
    js: 'javascript',
    py: 'python',
    java: 'java',
    html: 'html',
    css: 'css',
    sql: 'sql',
    ts: 'typescript',
    php: 'php',
    rb: 'ruby',
    jsx: 'react'
};

export const InputSection = ({ isCanvasOpen, onToggleCanvas, onToggleRecording }) => {
    // State management for the toggle
    const [isAIActive, setIsAIActive] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isCodeMode, setIsCodeMode] = useState(false);
    const [detectedLanguage, setDetectedLanguage] = useState('');
    const textareaRef = useRef(null);

    const showApiNotSetWarning = useCallback(() => {
        const ApiwarnModal = document.getElementById('ApiNotSetModal');
        const ApiWarnContent = document.getElementById('ApiNotSetContent');
        ApiwarnModal.classList.remove('hidden');
        ApiWarnContent.classList.remove('animate-exit');
        ApiWarnContent.classList.add('animate-enter')
    })

    const handleSend = useCallback(() => {
        if (!StateManager.get('api_key_ok')) {
            showApiNotSetWarning()
        } else {
            const userInput = document.getElementById('userInput');
            if (inputValue.trim() && !StateManager.get('processing')) {
                // Reset the input field
                // Auto-format the text with code blocks before sending
                const formattedMessage = AutoCodeDetector.autoFormatCodeBlocks(inputValue)
                .replaceAll('&gt;', '>')
                .replaceAll('&lt;', '<')
                .replaceAll('&amp;', '&')
                .replaceAll('&nbsp;', ' ')
                .replaceAll('<br>', '\n')

                userInput.innerHTML = "";
                userInput.style.height = Math.min(userInput.scrollHeight, 0.28 * window.innerHeight) + 'px';

                const suggestionsEl = document.getElementById('suggestions');
                if (suggestionsEl) suggestionsEl.classList.add('hidden');

                // Adjust input field height
                userInput.style.height = 'auto';
                setDetectedLanguage('');

                router.requestRouter(formattedMessage, document.getElementById('chatArea'));
                chatutil.hide_suggestions()
                adjustHeight(userInput)
            }
        }
    })


    useEffect(() => {
        const routerWatcher = namespaceWatcher.waitFor('app.router', (routerInstance, timedOut) => {
            const userInput = document.getElementById('userInput');

            //prep user input
            userInput.focus()

            if (timedOut) {
                //console.error('Router initialization timeout');
                return;
            }

            // Enter key handler for send button
            const handleEnterKey = (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    console.log(e)
                    e.preventDefault();
                    handleSend();
                }
            };

            // Image loaded event handler
            const handleImageLoaded = async (event) => {
                try {
                    await routerInstance.chooseRoute(event, document.getElementById('chatArea'));
                } catch (error) {
                    console.error('Error in chooseRoute:', error);
                }
            };

            document.addEventListener('imageLoaded', handleImageLoaded);

            // Store references for cleanup
            routerWatcher._handlers = {
                handleEnterKey,
                handleImageLoaded,
                userInput
            };
        }, {
            timeout: 10000, // 10 second timeout
            delay: 50, // Check every 50ms
            throwOnTimeout: false
        });

        return () => {
            // Cleanup event listeners
            if (routerWatcher._handlers) {
                const { handleEnterKey, handleImageLoaded, userInput } = routerWatcher._handlers;
                userInput.removeEventListener('keydown', handleEnterKey);
                document.removeEventListener('imageLoaded', handleImageLoaded);
            }

            // Cancel the watcher
            routerWatcher.cancel();
        };
    }, [handleSend]);

    const adjustHeight = (element) => {
        if (!element) return;

        // Save current selection and cursor position
        const selection = window.getSelection();
        let range = null;
        let startContainer = null;
        let startOffset = 0;

        if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
            startContainer = range.startContainer;
            startOffset = range.startOffset;
        }

        const currentScrollTop = window.pageYOffset;

        // Calculate and apply new height
        element.style.height = 'auto';
        const contentHeight = element.scrollHeight;
        const maxHeight = window.innerHeight * 0.28;
        const newHeight = Math.max(48, Math.min(contentHeight, maxHeight));
        element.style.height = newHeight + 'px';
        element.style.overflowY = contentHeight > maxHeight ? 'auto' : 'hidden';

        // Restore scroll position
        window.scrollTo(0, currentScrollTop);

        // Restore cursor position more reliably
        if (range && startContainer) {
            try {
                const newRange = document.createRange();
                newRange.setStart(startContainer, startOffset);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            } catch (e) {
                // If restoration fails, place cursor at end as fallback
                const newRange = document.createRange();
                newRange.selectNodeContents(element);
                newRange.collapse(false);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        }
    };

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            setInputValue(textareaRef.current?.innerHTML || '');
        });

        if (textareaRef.current) {
            observer.observe(textareaRef.current, {
                childList: true, // Track node additions/removals
                subtree: true, // Track all descendants
                characterData: true // Track text changes
            });
        }
        adjustHeight(textareaRef.current)

        return () => observer.disconnect();
    }, []);

    const shouldToggleCanvas = useCallback((event) => {
        //if (!event) return;

        //event.stopPropagation();

        // Check if the click was on the AI toggle checkbox or its label
        const aiToggleElement = document.getElementById('aiCanvasToggle');
        const clickedElement = event.target;

        // Check if the click was directly on the checkbox or within its label
        const isAIToggleClick = aiToggleElement?.contains(clickedElement) ||
            clickedElement === aiToggleElement ||
            clickedElement.htmlFor === 'aiCanvasToggle';

        if (isAIToggleClick) {
            // Let the checkbox handle its own change event
            // console.log('AI toggle clicked - letting checkbox handle');
            return; // Don't toggle canvas when AI checkbox is clicked
        } else {
            // Toggle the canvas for any other part of the button
            //console.log('Canvas area clicked - toggling canvas');
            onToggleCanvas(); // canvas toggle function
            StateManager.set('i-isCanvasOpen', isCanvasOpen)
        }
    }, [onToggleCanvas]); // Add dependencies

    const onAICanvasToggle = (event) => {
        const isChecked = event.target.checked;
        setIsAIActive(isChecked);

        const aiStatusDot = document.getElementById('aiStatusDot');
        const aiStatusText = document.getElementById('aiStatusText');
        const aiToggleRing = document.getElementById('aiToggleRing');
        const aiActivePulse = document.getElementById('aiActivePulse');
        const checkmark = document.querySelector('#aiCanvascheckmark');
        const glow = document.getElementById('aiCanvasToggleGlow');

        if (isChecked) {
            // AI Active state
            aiStatusDot.classList.remove('bg-gray-400');
            aiStatusDot.classList.add('bg-green-500', 'animate-pulse');
            aiStatusText.textContent = 'AI active';
            aiStatusText.classList.add('text-green-600', 'dark:text-green-400');
            aiToggleRing.classList.add('opacity-100', 'animate-ping');
            aiActivePulse.classList.add('opacity-20');
            checkmark.classList.remove('opacity-0', 'scale-50');
            glow.classList.add('opacity-30');
        } else {
            // AI Inactive state
            aiStatusDot.classList.add('bg-gray-400');
            aiStatusDot.classList.remove('bg-green-500', 'animate-pulse');
            aiStatusText.textContent = 'AI ready';
            aiStatusText.classList.remove('text-green-600', 'dark:text-green-400');
            aiToggleRing.classList.remove('opacity-100', 'animate-ping');
            aiActivePulse.classList.remove('opacity-20');
            checkmark.classList.add('opacity-0', 'scale-50');
            glow.classList.remove('opacity-30');
        }
    };


    const openTool = useCallback(() => {
        const tool = document.getElementById("tool-modal")
        tool?.classList.remove("animate-exit", "hidden")
        tool?.classList.add("animate-enter")
    })

    const closeTools = useCallback(() => {
        const tool = document.getElementById("tool-modal")
        tool?.classList.remove("animate-enter")
        tool?.classList.add("animate-exit")
        setTimeout(() => {
            tool?.classList.add("hidden")
        }, 600)
    })

    const toggleTool = useCallback(() => {
        (document.getElementById("tool-modal")?.classList.contains("animate-exit"))
            ? openTool()
            : closeTools()
    })


    const handlePaste = (e) => {
        e.preventDefault();

        // Get plain text from clipboard
        const text = e.clipboardData.getData('text/plain');

        // Get current selection
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);

        // Delete any selected content (like normal paste behavior)
        range.deleteContents();

        // Insert the plain text
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);

        // Move cursor to after the inserted text (maintains original behavior)
        range.setStartAfter(textNode);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);

        // Trigger change for your MutationObserver
        if (textareaRef.current) {
            const event = new Event('input', { bubbles: true });
            textareaRef.current.dispatchEvent(event);
        }
        adjustHeight(textareaRef.current)
    };

    const detectCodeLanguage = (text) => {
        // Check for existing code blocks first
        const codeBlockMatch = text.match(/```(\w+)?/);
        if (codeBlockMatch && codeBlockMatch[1]) {
            return codeBlockMatch[1];
        }

        // Analyze the text for language patterns
        for (const [lang, pattern] of Object.entries(CODE_PATTERNS)) {
            if (pattern.test(text)) {
                return lang;
            }
        }

        return 'text';
    };

    const insertText = (textToInsert, wrapBefore = '', wrapAfter = '') => {
        const textarea = textareaRef.current;
        let { selectionStart, selectionEnd } = getSelection()

        if (selectionStart === 0 && selectionEnd === 0) return

        console.log(selectionEnd)
        // Full selection if no selection
        if (!selectionStart || selectionStart === selectionEnd) selectionStart = 0

        const before = input.substring(0, selectionStart);
        const after = input.substring(selectionEnd);

        const newText = before + wrapBefore + textToInsert + wrapAfter + after;
        setInput(newText);

        //console.log(newText)
        // Set cursor position after inserted text
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = selectionStart + wrapBefore.length + textToInsert.length + wrapAfter.length;
            const selection = document.getSelection()
            selection.addRange(new Range(newCursorPos, newCursorPos))
            //selection.setPosition(newCursorPos)
            //textarea?.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleCodeBlock = () => {
        let { selectionStart, selectionEnd } = getSelection

        if (!selectionStart || selectionStart === selectionEnd) selectionStart = 0

        const selectedText = input.substring(
            selectionStart,
            selectionEnd
        );

        if (selectedText) {
            // Wrap selected text in code blocks
            const lang = detectedLanguage || 'text';
            if (lang === 'text') return;
            insertText(selectedText, `\`\`\`${lang}\n`, `\n\`\`\``);
        } else {
            // Insert empty code block at cursor
            const lang = detectedLanguage || 'text';
            if (lang === 'text') return;
            insertText('', `\`\`\`${lang}\n`, `\n\`\`\``);
        }
    };

    const handleInlineCode = () => {
        let { selectionStart, selectionEnd } = getSelection()

        if (!selectionStart || selectionStart === selectionEnd) selectionStart = 0

        const selectedText = input.substring(
            selectionStart,
            selectionEnd
        );

        if (selectedText) {
            insertText(selectedText, '`', '`');
        } else {
            return //insertText('', '`', '`');
        }
    };

    const handleKeyDown = (e) => {
        // Handle Tab key for indentation in code mode
        if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            insertText('    ');
            return;
        }

        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();

            // Insert line break at cursor
            document.execCommand('insertHTML', false, '<br><br>');
        }

        // Enter to send
        const sendBtn = document.getElementById("sendBtn")

        if (e.key === 'Enter' && !sendBtn.classList.contains('hidden') && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault()
            handleSend();
            return;
        }

        // Auto-close backticks for inline code
        if (e.key === '`' && !isCodeMode) {
            const textarea = textareaRef.current;
            const start = textarea.selectionStart;
            const before = input.substring(0, start);
            const after = input.substring(start);

            // Check if we're inside an inline code block
            const backticksBefore = (before.match(/`/g) || []).length;
            const backticksAfter = (after.match(/`/g) || []).length;

            if (backticksBefore % 2 !== 0 && backticksAfter % 2 !== 0) {
                // We're inside an inline code block, insert paired backtick
                e.preventDefault();
                insertText('`', '', '`');
            }
        }
    };

    const getSelection = () => {
        const selection = document.getSelection()
        const range = selection?.getRangeAt(0)

        return { selection: selection, selectionStart: range?.startOffset, selectionEnd: range.endOffset }
    }

    useEffect(() => {
        chatutil.scrollToBottom(document.getElementById('chatArea'), false);
        const handleResize = () => {
            adjustHeight(textareaRef.current);
        };
        const inputEl = document.getElementById('userInput')

        //window.addEventListener('resize', handleResize);
        document.addEventListener('input', () => { handleResize(inputEl) })
        document.addEventListener("open-tool", openTool)
        document.addEventListener("hide-tool", closeTools)
        document.addEventListener("toggle-tool", toggleTool)
        return () => {
            //window.removeEventListener('resize', handleResize);
            document.removeEventListener('input', () => { handleResize(inputEl) })
            document.removeEventListener("open-tool", openTool)
            document.removeEventListener("hide-tool", closeTools)
            document.removeEventListener("toggle-tool", toggleTool)
        }
    }, []);

    return (
        <div
            id="userInput-wrapper"
            className="sticky flex justify-center w-full lg:items-center lg:justify-center z-30 bottom-[0.5%] transition-all duration-1000">
            <section
                id="userInputContainer"
                data-portal-container="userInputContainer"
                className="relative w-full sm:w-[70vw] xl:w-[50vw] space-x-4 transition-all duration-500">

                {/* Custom input field */}
                <div
                    id="userInput"
                    ref={textareaRef}
                    contentEditable="true"
                    role="textbox"
                    aria-label="Message input"
                    autoFocus={true}
                    data-placeholder="Type your message... (Enter to send)"
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    className="h-fit min-h-[48px] h-auto max-h-[28vh] w-full overflow-y-auto scrollbar-custom scroll-smooth py-1 px-[4%] md:py-3 md:pl-[2%] md:pr-[7%] border border-teal-400 dark:border-teal-600 rounded-lg focus:outline-none dark:outline-teal-600 focus:border-2 bg-gray-50 dark:bg-gradient-to-br dark:from-[#0a0a1f] dark:to-[#0a0a1f] dark:text-white pb-2 transition-all duration-1000 active:outline-none resize-none"
                ></div>

                <section id="userInputSection" className="p-0 absolute right-[0.5px] -bottom-2 p-0 flex w-full rounded-b-md dark:border-teal-600 shadow-xl justify-between w-full">
                    <button onClick={toggleTool} title="open tools" className='ml-1 text-gray-600 dark:text-gray-200 cursor-pointer focus:outline-none active:ring-none'>
                        <svg className='bg-gray-100 dark:bg-[#0a0a1f]/0 rounded-full h-5 w-5 md:h-6 md:w-6 p-0 fill-gray-800 dark:fill-gray-200 hover:scale-[1.2] transition duration-500 ease-in-out focus:outline-none' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z" /></svg>
                    </button>

                    <section className=''>
                        {/* Send Button - Always prominent */}
                        <button id="sendBtn" onClick={handleSend} className="flex relative items-center justify-center h-10 w-10 rounded-full transition-all ease-in-out duration-300 z-50 bg-white border border-gray-200 bg-gradient-to-br from-[#00246c] dark:from-[#a800fc] to-[#008dd3] dark:to-indigo-900 overflow-hidden shadow-lg hover:scale-110 hover:shadow-xl ml-2 mb-2" aria-label="Send message" title="Send message">
                            <div id="normalSend" className="flex items-center justify-center h-full w-full">
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
                            <div id="spinningSquares" className="hidden absolute inset-0 flex items-center justify-center">
                                <span className="ripple-single-1"></span>
                                <span className="ripple-single-2"></span>
                                <span className="ripple-single-3"></span>
                            </div>
                        </button>
                    </section>
                </section>
            </section>

            <Tools shouldToggleCanvas={shouldToggleCanvas} onAICanvasToggle={onAICanvasToggle} onToggleRecording={onToggleRecording} closeTools={closeTools} handleCodeBlock={handleCodeBlock} handleInlineCode={handleInlineCode} detectedLanguage={detectedLanguage} />

            {/* Scroll to bottom button */}
            <ScrollToBottomButton onClick={() => chatutil.scrollToBottom(document.getElementById('chatArea'), false)} />
        </div>
    );
};

const Tools = ({ onToggleRecording, shouldToggleCanvas, onAICanvasToggle, closeTools, handleInlineCode, handleCodeBlock, detectedLanguage }) => {
    return (
        <section
            id="tool-modal"
            onMouseLeave={closeTools}
            className='block absolute -left-12 bottom-12 z-[51] bg-gray-200 dark:bg-blend-700 rounded-md p-3 space-y-2 hidden animate-exit'>

            <div id="code-toolbar" className="flex gap-1 border-none rounded-md transition-transform transition-all duration-500">
                <button
                    type="button"
                    onClick={handleInlineCode}
                    className="size-full bg-white border border-[#ddd] dark:border-blend-400 rounded-md p-1 cursor-pointer m-auto text-lg hover:bg-[#e9ecef] dark:bg-blend-600 dark:hover:bg-primary-600 hover:border-[#adb5bd] dark:shadow-xl"
                    title="Inline Code"
                >
                    <span className='text-green-500 dark:text-green-300'>{'<'}</span><span className='text-orange-500 dark:text-yellow-300'>{'<'}</span><span className='text-green-500 dark:text-green-300'>{'<'}</span>
                </button>
                <button
                    type="button"
                    onClick={handleCodeBlock}
                    className="size-full flex justify-center gap-0 bg-white dark:bg-blend-600 dark:shadow-xl border border-[#ddd] dark:border-blend-400 rounded-md p-1 cursor-pointer m-auto font-mono text-lg hover:bg-[#e9ecef] hover:border-[#adb5bd] dark:hover:border-blend-500 dark:hover:bg-secondary-600"
                    title="Code Block"
                >
                    <span className='text-green-500 dark:text-green-400'>{'<'}</span><span className='text-red-500 dark:text-red-500'>{`/`}</span><span className='text-blue-600 dark:text-sky-400'>{`>`}</span>
                </button>
                {detectedLanguage && detectedLanguage !== 'text' && (
                    <span className="language-badge bg-[#6c757d] text-white p-2 rounded-md text-lg ml-auto">{detectedLanguage}</span>
                )}
            </div>

            {/* Voice Recording */}
            <div onClick={onToggleRecording} className='flex gap-1 text-gray-800 dark:text-gray-200 items-center cursor-pointer hover:bg-black/20 dark:hover:bg-black/50 p-1 rounded-sm'>
                <button id="microphone" className="flex items-center justify-center rounded-lg  transition-colors duration-300" title="Voice recording">
                    <svg id="microphoneSVG" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" className="stroke-blue-600 dark:stroke-cyan-400 w-5 h-5 transition-colors duration-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                </button>Record
            </div>


            {/* Image Generation */}
            <div className='hidden flex items-center gap-1 text-gray-800 dark:text-gray-200 hover:bg-black/20 dark:hover:bg-black/50 p-1 cursor-pointer select-none'>
                <button id="image-gen" className="" type="button" aria-pressed="false" aria-label="Generate image" title="Generate image">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                        <path d="M2.5 1H12.5C13.3284 1 14 1.67157 14 2.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V2.5C1 1.67157 1.67157 1 2.5 1ZM2.5 2C2.22386 2 2 2.22386 2 2.5V8.3636L3.6818 6.6818C3.76809 6.59551 3.88572 6.54797 4.00774 6.55007C4.12975 6.55216 4.24568 6.60372 4.32895 6.69293L7.87355 10.4901L10.6818 7.6818C10.8575 7.50607 11.1425 7.50607 11.3182 7.6818L13 9.3636V2.5C13 2.22386 12.7761 2 12.5 2H2.5ZM2 12.5V9.6364L3.98887 7.64753L7.5311 11.4421L8.94113 13H2.5C2.22386 13 2 12.7761 2 12.5ZM12.5 13H10.155L8.48336 11.153L11 8.6364L13 10.6364V12.5C13 12.7761 12.7761 13 12.5 13ZM6.64922 5.5C6.64922 5.03013 7.03013 4.64922 7.5 4.64922C7.96987 4.64922 8.35078 5.03013 8.35078 5.5C8.35078 5.96987 7.96987 6.35078 7.5 6.35078C7.03013 6.35078 6.64922 5.96987 6.64922 5.5ZM7.5 3.74922C6.53307 3.74922 5.74922 4.53307 5.74922 5.5C5.74922 6.46693 6.53307 7.25078 7.5 7.25078C8.46693 7.25078 9.25078 6.46693 9.25078 5.5C9.25078 4.53307 8.46693 3.74922 7.5 3.74922Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                </button> Image Gen
            </div>

            {/* Diagram/Flow Tool */}
            <div onClick={opendiagViewModal} className='flex items-center gap-1 text-gray-800 dark:text-gray-200 hover:bg-black/20 dark:hover:bg-black/50 p-1 rounded-sm cursor-pointer select-none'>
                <button
                    id='diagToggle'

                    className="flex items-center justify-center rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-300"
                    aria-label="Create diagram"
                    title="Create diagram">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 dark:text-gray-100 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="5" cy="12" r="2" strokeWidth="2" />
                        <circle cx="12" cy="5" r="2" strokeWidth="2" />
                        <circle cx="12" cy="19" r="2" strokeWidth="2" />
                        <circle cx="19" cy="12" r="2" strokeWidth="2" />
                        <path d="M7 12h4M13 5v2M13 19v-2M17 12h-4" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button> View diagram
            </div>

            {/* Preview Button */}
            <button id="previewBtn"
                className="hidden h-8 min-w-8 items-center justify-center rounded-full border p-2 text-[13px] font-medium
    border-sky-900 bg-blue-100 hover:bg-sky-300 dark:border-[#aa55ff] dark:bg-[#171717] dark:hover:bg-[#225]
    text-gray-900 dark:text-white transition-colors duration-300"
                aria-pressed="false"
                aria-label="Preview content"
                title="Preview content">
                <div className="h-[18px] w-[18px]">
                    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path className="fill-current"
                            d="M12 3c-3.585 0-6.5 2.9225-6.5 6.5385 0 2.2826 1.162 4.2913 2.9248 5.4615h7.1504c1.7628-1.1702 2.9248-3.1789 2.9248-5.4615 0-3.6159-2.915-6.5385-6.5-6.5385zm2.8653 14h-5.7306v1h5.7306v-1zm-1.1329 3h-3.4648c0.3458 0.5978 0.9921 1 1.7324 1s1.3866-0.4022 1.7324-1zm-5.6064 0c0.44403 1.7252 2.0101 3 3.874 3s3.43-1.2748 3.874-3c0.5483-0.0047 0.9913-0.4506 0.9913-1v-2.4593c2.1969-1.5431 3.6347-4.1045 3.6347-7.0022 0-4.7108-3.8008-8.5385-8.5-8.5385-4.6992 0-8.5 3.8276-8.5 8.5385 0 2.8977 1.4378 5.4591 3.6347 7.0022v2.4593c0 0.5494 0.44301 0.9953 0.99128 1z"
                            clipRule="evenodd" fillRule="evenodd"></path>
                    </svg>
                </div>
                <div className="whitespace-nowrap pl-1 pr-1 hidden md:inline">Preview</div>
            </button>

            {/* Right side: AI & Canvas Tools */}
            <div className="hidden xs:flex items-center space-x-1 bg-white/0 dark:bg-gray-800/0 rounded-lg select-none">
                {/* Multi-Purpose Canvas Toggle */}
                <button
                    id="ToggleCanvasBt"
                    onClick={shouldToggleCanvas}
                    className="group flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-950 text-blue-700 dark:text-teal-200 border-2 border-blue-500 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
                    aria-pressed="false"
                    title="Toggle AI Canvas"
                >
                    {/* Animated background pulse when AI is active */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-emerald-300 dark:from-green-800 dark:to-emerald-700 opacity-0 transition-opacity duration-300"
                        id="aiActivePulse"></div>

                    {/* AI Toggle Indicator */}
                    <div className="relative flex items-center justify-center">
                        <div id="aiToggleRing" className="absolute w-5 h-5 border-2 border-blue-300 dark:border-teal-400 rounded-full transition-all duration-300 opacity-0 scale-125"></div>
                        <div id="iconContainer" className="relative transition-transform duration-300 group-hover:scale-110">
                            {/* Plus Icon */}
                            <svg id="plusIcon" className="w-4 h-4 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            {/* Close Icon */}
                            <svg id="closeIcon" className="w-4 h-4 hidden transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18-6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>
                    {/* Text and AI Status */}
                    <div className="flex flex-col items-start min-w-fit">
                        <div className='flex gap-2'>
                            <span className="text-[12px] font-bold tracking-wide select-none whitespace-nowrap inline">&lt;/&gt; <span className='hidden xs:inline'>Canvas</span></span>
                        </div>
                        {/* AI Toggle Status */}
                        <div className='flex justify-between'>
                            <div className="hidden xs:flex items-center gap-1 transition-all duration-300 opacity-60 group-hover:opacity-100">
                                <div id="aiStatusDot" className="w-1.5 h-1.5 bg-gray-400 rounded-full transition-all duration-300"></div>
                                <span id="aiStatusText" className="text-[9.5px] font-medium text-gray-600 dark:text-gray-300 transition-all duration-300">AI ready</span>
                            </div>

                            {/* Mini Checkbox Indicator */}
                            <div className="relative flex ml-0.5">
                                <input
                                    type="checkbox"
                                    id="aiCanvasToggle"
                                    className="absolute opacity-0 w-0 h-0"
                                    onChange={onAICanvasToggle}
                                />
                                <label
                                    htmlFor="aiCanvasToggle"
                                    className="relative flex items-center justify-center w-4 h-4 border-2 border-blue-400 dark:border-teal-500 rounded bg-white dark:bg-slate-700 transition-all duration-300 cursor-pointer group/checkbox hover:border-blue-600 dark:hover:border-teal-300"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Checkmark */}
                                    <svg id="aiCanvascheckmark"
                                        className="w-2.5 h-2.5 text-green-600 dark:text-teal-400 opacity-0 transition-all duration-200 scale-50"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {/* Glow effect when checked */}
                                    <div id="aiCanvasToggleGlow" className="absolute inset-0 rounded bg-green-500 dark:bg-teal-500 opacity-0 scale-150 transition-all duration-300 blur-sm"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </button>
            </div>

            {/* File Attachment */}
            <div onClick={showDropZoneModal} id="AttachFiles" className="flex items-center rounded-sm text-gray-800 dark:text-gray-200 hover:bg-black/20 dark:hover:bg-black/50 p-1 cursor-pointer" title="Attach files select-none">
                <button aria-label="Attach files" className="flex items-center justify-center rounded-lg text-token-text-primary dark:text-white focus-visible:outline-black dark:focus-visible:outline-white transition-colors duration-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M9 7C9 4.23858 11.2386 2 14 2C16.7614 2 19 4.23858 19 7V15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15V9C5 8.44772 5.44772 8 6 8C6.55228 8 7 8.44772 7 9V15C7 17.7614 9.23858 20 12 20C14.7614 20 17 17.7614 17 15V7C17 5.34315 15.6569 4 14 4C12.3431 4 11 5.34315 11 7V15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15V9C13 8.44772 13.4477 8 14 8C14.5523 8 15 8.44772 15 9V15C15 16.6569 13.6569 18 12 18C10.3431 18 9 16.6569 9 15V7Z" fill="currentColor"></path>
                    </svg>
                </button> Upload files
            </div>
        </section>

    )
}

const ScrollToBottomButton = ({ onClick }) => (
    <button
        id="scroll-bottom"
        className="absolute fixed right-[150px] bottom-24 cursor-pointer rounded-full bg-blue-100 border border-blue-400 dark:border-gray-300 dark:bg-[#222] shadow w-8 h-8 flex items-center justify-center transition-colors duration-1000 z-[99] group"
        aria-label="scroll to bottom"
        onClick={onClick}
    >
        <div className='hidden group-hover:flex gap-2 absolute left-10 text-black dark:text-white tracking-wider font-extralight font-handwriting text-xs'><span>scroll</span></div>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-md text-token-text-primary dark:text-white">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 21C11.7348 21 11.4804 20.8946 11.2929 20.7071L4.29289 13.7071C3.90237 13.3166 3.90237 12.6834 4.29289 12.2929C4.68342 11.9024 5.31658 11.9024 5.70711 12.2929L11 17.5858V4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4V17.5858L18.2929 12.2929C18.6834 11.9024 19.3166 11.9024 19.7071 12.2929C20.0976 12.6834 20.0976 13.3166 19.7071 13.7071L12.7071 20.7071C12.5196 20.8946 12.2652 21 12 21Z" fill="currentColor"></path>
        </svg>
    </button>
);

const AutoResizeTextarea = () => {
    const [inputValue, setInputValue] = useState('');
    const textareaRef = useRef(null);

    const adjustHeight = () => {
        const element = textareaRef.current;
        if (!element) return;

        // Store current scroll position to prevent jumping
        const currentScrollTop = window.pageYOffset;

        // Reset to auto to get natural height
        element.style.height = 'auto';

        // Calculate content height
        const contentHeight = element.scrollHeight;
        const maxHeight = window.innerHeight * 0.28; // 28vh

        // Apply calculated height
        const newHeight = Math.max(48, Math.min(contentHeight, maxHeight)); // min 48px, max 28vh
        element.style.height = newHeight + 'px';

        // Manage overflow
        element.style.overflowY = contentHeight > maxHeight ? 'auto' : 'hidden';

        // Restore scroll position
        window.scrollTo(0, currentScrollTop);
    };

    // Adjust on value change
    useEffect(() => {
        adjustHeight(r);
    }, [inputValue]);

    // Adjust on mount and window resize
    useEffect(() => {
        adjustHeight();

        const handleResize = () => {
            adjustHeight();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    return (
        <div
            ref={textareaRef}
            id="userInput"
            contentEditable="true"
            role="textbox"
            aria-label="Message input"
            autoFocus={true}
            data-placeholder="Message IntelliDesk 💫"
            className="w-full overflow-auto scrollbar-hide py-1 px-[4%] md:py-3 md:pl-[2%] md:pr-[7%] border border-teal-400 dark:border-teal-600 rounded-lg focus:outline-none dark:outline-teal-600 focus:border-2 bg-gray-50 dark:bg-gradient-to-br dark:from-[#0a0a1f] dark:to-[#0a0a1f] dark:text-white max-h-[28vh] pb-2 transition-all duration-300 ease-in-out active:outline-none resize-none"
            style={{
                minHeight: '48px',
                height: 'auto'
            }}
        />
    );
};

export default AutoResizeTextarea;
