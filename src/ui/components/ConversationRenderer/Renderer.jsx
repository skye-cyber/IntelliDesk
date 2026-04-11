import { useCallback, useEffect, useRef, useState } from 'react';
import { CopyMessage } from './utils';
import { HTML2Jpg, HTML2Word, HTML2Pdf } from '../../../core/ChatExport/export';
import { markitdown } from '../Code/CodeHighlighter';
import { CodeBlockRenderer, SimpleUserCodeRenderer } from '../Code/CodeBlockRenderer';
import { chatutil } from '../../../core/managers/Conversation/util.ts';
import { GenerateId } from './utils';
import { mathStandardize } from '../../../core/MathBase/mathRenderer';
import { normalizeCodeBlocks } from '../../../core/Code/codeNormalize';
import { StateManager } from '../../../core/managers/StatesManager.ts';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import { GlassThinkingSection } from './Reasoning';
import { FileContainer } from './Files';


export const UserMessage = ({ message, files = [] }) => {
    const messageRef = useRef(null)
    const userContent = markitdown(message);
    const selector_class = GenerateId('user-ms')
    const [optionsOpen, setOptionsOpen] = useState(false)
    const [expanded, setEpanded] = useState(false)
    const [expandable, setExpandable] = useState(false)
    const [dimensions, setDimensions] = useState([])

    useEffect(() => {
        if (!messageRef.current) return

        const computedStyle = getComputedStyle(messageRef.current)
        setExpandable(!expanded && parseInt(computedStyle.height) >= parseInt(computedStyle.maxHeight))
        setDimensions([parseInt(computedStyle.width)], parseInt(computedStyle.height))

    }, [messageRef.current, expanded])

    chatutil.renderMath(`.${selector_class}`, 0)

    return (
        <>
            <section className="block font-handwriting  text-[16px] w-full">
                <div className="relative w-full flex gap-x-2 justify-end">
                    <div
                        ref={messageRef}
                        onMouseEnter={() => setOptionsOpen(true)}
                        onMouseLeave={() => setOptionsOpen(false)}
                        className={`${selector_class} relative bg-blue-100/70 dark:bg-primary-700 text-black dark:text-white rounded-lg rounded-br-none h-fit ${expanded ? 'max-h-fit' : 'max-h-64'} overflow-y-auto scrollbar-code p-2 md:p-3 shadow-none w-fit max-w-full sm:max-w-[60%] xl:max-w-[60%]`}>
                        <SimpleUserCodeRenderer htmlContent={userContent} />
                    </div>
                    {expandable && (
                        <div onClick={() => setEpanded(!expanded)} className={`absolute bottom-[0.5px] right-0 h-36 bg-gradient-to-t from-gray-100/80 dark:from-[#14143e] to-transparent pointer-events-click ${expanded ? '' : 'cursor-row-resize'} max-w-full sm:max-w-[60%] xl:max-w-[60%] rounded-bl-lg`} style={{ width: dimensions[0] }} />
                    )}
                </div>

                <div className='flex justify-end'>
                    <FileContainer setOpen={setOptionsOpen} files={files} />
                </div>
                <UserMessageOptions messageref={messageRef} isOpen={optionsOpen} setOpen={setOptionsOpen} />
            </section >
        </>
    )
}

export const AiMessage = ({
    actualContent,
    isThinking = false,
    thinkContent = null,
    children}) => {
    const [optionsOpen, setOptionsOpen] = useState(false)
    const messageRef = useRef(null)
    return (
        <ErrorBoundary>
            <div id="ai_response_container" className='flex justify-start mb-2 overflow-wrap w-full'>
                <section
                    id="ai_response"
                    onMouseEnter={() => setOptionsOpen(true)}
                    onMouseLeave={() => setOptionsOpen(false)}
                    className="w-full lg:max-w-2xl xl:max-w-3xl relative mb-[2vh] py-2 px-4">
                    {/* This is where child components will appear eg too- responses */}
                    {children &&
                        <div ref={messageRef} className="child-components">{children}</div>
                    }
                    {(actualContent || thinkContent) && (
                        <ResponseWrapper actualContent={actualContent} isThinking={isThinking} thinkContent={thinkContent} />
                    )}
                    {/*Other componets*/}
                    <div className='mt-10'>
                        <AiMessageOptions messageref={messageRef} isOpen={optionsOpen} setOpen={setOptionsOpen} />
                    </div>
                </section>
            </div>
        </ErrorBoundary>
    )
}

export const StreamingAiMessage = ({
    actualContent,
    isThinking = false,
    thinkContent = null,
}) => {
    const exportMenu = useRef(null)
    const messageRef = useRef(null)
    const [optionsOpen, setOptionsOpen] = useState(false)

    const onExportMenuToggle = useCallback(() => {
        exportMenu.current.classList.toggle('hidden');
    })
    return (
        <ErrorBoundary>
            <div id="ai_response_container" className='flex justify-start mb-2 overflow-wrap w-full max-auto'>
                <section
                    id="ai_response"
                    onMouseEnter={() => setOptionsOpen(true)}
                    onMouseLeave={() => setOptionsOpen(false)}
                    className="w-full lg:max-w-2xl xl:max-w-3xl relative mb-[2vh] py-2 px-4">
                    {/* Streaming response wrapper */}
                    <div ref={messageRef} className=''>
                        <ResponseWrapper actualContent={actualContent} thinkContent={thinkContent} isThinking={isThinking} />
                    </div>

                    {/*Other componets*/}
                    <div className='mt-10'>
                        <AiMessageOptions onMenuToggle={onExportMenuToggle} isOpen={optionsOpen} setOpen={setOptionsOpen} messageref={messageRef} />
                        <ExportMenu menuref={exportMenu} messageref={messageRef} />
                    </div>
                </section>
            </div>
        </ErrorBoundary>
    )
}

export const ResponseWrapper = ({
    actualContent,
    isThinking = false,
    thinkContent = null,
    message_id = GenerateId('ai-msg'),
    thinkToolCalls = []
}) => {

    let processedHtmlContent

    try {
        // Normalize code
        const NormalizedMessage = normalizeCodeBlocks(actualContent)
        processedHtmlContent = markitdown(mathStandardize(NormalizedMessage))
    } catch (err) {
        //console.log(err)
    }

    StateManager.set("current_message_id", message_id)

    // const htmlThinkContent = thinkContent ? markitdown(normalizeMathDelimiters(thinkContent)) : null;

    chatutil.renderMath(message_id)

    return (
        <div id={message_id} className='font-blink leading-loose tracking-wide text-gray-900 dark:text-white transition-colors duration-300 w-full text-[15px]'>
            <div id="ai_response_think" className="w-full bg-none rounded-lg rounded-bl-none transition-colors duration-700">
                {thinkContent &&
                    <GlassThinkingSection htmlThinkContent={thinkContent} isThinking={isThinking} thinkToolCalls={thinkToolCalls} />
                }

            </div>
            <CodeBlockRenderer htmlContent={processedHtmlContent} />
        </div>
    )
}


export const ExportMenu = ({ menuref, messageref }) => {
    return (
        <div
            ref={menuref}
            onMouseLeave={() => menuref.current.classList.add('hidden')}
            data-action="export-menu"
            className="hidden absolute z-[10] bottom-12 left-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 z-50 overflow-hidden transition-all duration-300 transform origin-bottom-left">
            <div className="p-1">
                <div className="relative">
                    {/* Header */}
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight">Export Options</p>
                    </div>

                    {/* Export Items */}
                    <div className="py-1">
                        <button onClick={(event) => {
                            menuref.current.classList.add('hidden')
                            HTML2Pdf(event, messageref.current)
                        }}
                            className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 group">
                            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <div className="font-medium">PDF Document</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">High quality</div>
                            </div>
                        </button>

                        <button onClick={(event) => {
                            menuref.current.classList.add('hidden')
                            HTML2Jpg(event, messageref.current)
                        }}
                            className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 group">
                            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <div className="font-medium">JPEG Image</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">High resolution</div>
                            </div>
                        </button>

                        <button onClick={(event) => {
                            menuref.current.classList.add('hidden')
                            HTML2Word(event, messageref.current)
                        }}
                            className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 group">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <div className="font-medium">Word Document</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Editable format</div>
                            </div>
                        </button>
                    </div>

                    {/* Coming Soon Section */}
                    <div className="hidden px-3 py-2 border-t border-gray-100 dark:border-gray-700">
                        <button className="w-full flex items-center px-3 py-2.5 text-sm text-gray-400 dark:text-gray-500 rounded-lg transition-all duration-200 cursor-not-allowed group">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <div className="font-medium text-gray-400">Advanced Export</div>
                                <div className="text-xs text-gray-400">Coming soon</div>
                            </div>
                            <span className="ml-auto px-1.5 py-0.5 text-xs bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full">Soon</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Arrow indicator */}
            <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45"></div>
        </div>
    )
}

export const AiMessageOptions = ({ messageref, isOpen, setOpen }) => {
    const [copied, setCopied] = useState(false);
    const [pinned, setPinned] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const exportMenuRef = useRef(null);
    const shareMenuRef = useRef(null);

    const handleCopy = useCallback(() => {
        CopyMessage(messageref.current);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [messageref]);

    const handlePin = useCallback(() => {
        setPinned(!pinned);
        globalEventBus.emit('message:pinned', { ref: messageref, pinned: !pinned });
    }, [pinned, messageref]);

    const handleCloneMarkdown = useCallback(() => {
        CopyMessage(messageref.current, true);
        setShowExportMenu(false);
    }, [messageref]);

    const handleExportHTML = useCallback(() => {
        const content = messageref.current?.innerHTML || '';
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `message-${Date.now()}.html`;
        a.click();
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    }, [messageref]);

    const handleExportTXT = useCallback(() => {
        const content = messageref.current?.textContent || '';
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `message-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    }, [messageref]);

    const handleShare = useCallback(async () => {
        const content = messageref.current?.textContent || '';
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Shared Message',
                    text: content,
                });
            } catch (error) {
                console.log('Share cancelled or failed:', error);
            }
        } else {
            // Fallback to clipboard
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        setShowShareMenu(false);
    }, [messageref]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setShowExportMenu(false);
            }
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
                setShowShareMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const IconButton = ({ onClick, icon, label, active = false, hasDropdown = false }) => (
        <button
            onClick={onClick}
            className={`p-2 rounded-xl transition-all duration-200 ${active
                ? 'bg-primary-50/70 dark:bg-primary-700 text-primary-600 dark:text-primary-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-primary-800/50'
                } ${hasDropdown ? 'relative' : ''}`}
            title={label}
        >
            {icon}
        </button>
    );

    return (
        <div
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className="absolute bottom-2 left-0"
        >
            <div className={`flex items-center gap-0.5 bg-white dark:bg-primary-800/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-primary-700/50 dark:shadow-lg p-1 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                {/* Copy Button */}
                <IconButton
                    onClick={handleCopy}
                    active={copied}
                    label="Copy"
                    icon={
                        copied ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                        )
                    }
                />

                {/* Pin Button */}
                <IconButton
                    onClick={handlePin}
                    active={pinned}
                    label={pinned ? "Unpin message" : "Pin message"}
                    icon={
                        <svg className={`w-4 h-4 ${pinned ? 'fill-current stroke-current' : 'fill-white dark:fill-primary-700'}`} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    }
                />

                {/* Share Button with Dropdown */}
                <div className="relative" ref={shareMenuRef}>
                    <button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="p-2 rounded-xl transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-primary-800/50"
                        title="Share"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>

                    {/* Share Dropdown Menu */}
                    {showShareMenu && (
                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-primary-800 rounded-xl shadow-lg border border-gray-200 dark:border-primary-700 overflow-hidden z-10">
                            <button
                                onClick={handleShare}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-primary-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                Share via Browser
                            </button>
                            <button
                                onClick={async () => {
                                    const content = messageref.current?.textContent || '';
                                    await navigator.clipboard.writeText(content);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                    setShowShareMenu(false);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-primary-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                Copy to Clipboard
                            </button>
                        </div>
                    )}
                </div>

                {/* Export Button with Dropdown */}
                <div className="relative" ref={exportMenuRef}>
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="p-2 rounded-xl transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-primary-800/50"
                        title="Export"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>

                    {/* Export Dropdown Menu */}
                    {showExportMenu && (
                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-primary-800 rounded-xl shadow-lg border border-gray-200 dark:border-primary-700 overflow-hidden z-10">
                            <button
                                onClick={handleCloneMarkdown}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-primary-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Copy as Markdown
                            </button>
                            <button
                                onClick={handleExportHTML}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-primary-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export as HTML
                            </button>
                            <button
                                onClick={handleExportTXT}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-primary-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download as TXT
                            </button>
                        </div>
                    )}
                </div>

                {/* Regenerate Button */}
                <IconButton
                    onClick={() => {
                        globalEventBus.emit('message:regenerate', { ref: messageref });
                    }}
                    label="Regenerate"
                    icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    }
                />
            </div>
        </div>
    );
};

export const UserMessageOptions = ({ messageref, isOpen, setOpen }) => {
    const clone_markdown_content = useCallback((selector, html = true) => {
        CopyMessage(selector, html)
    });

    return (
        <div className='w-full' onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <div className={`${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700 motion-safe:transition-opacity text-secondary-500 dark:text-gray-100 flex items-center justify-end space-x-1`}>
                <button
                    onClick={() => CopyMessage(messageref.current)}
                    className="relative group rounded-lg cursor-pointer"
                    aria-label="Copy">
                    <span className="flex items-center justify-center w-[18px] h-6">
                        <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                            <path d="M480 400L288 400C279.2 400 272 392.8 272 384L272 128C272 119.2 279.2 112 288 112L421.5 112C425.7 112 429.8 113.7 432.8 116.7L491.3 175.2C494.3 178.2 496 182.3 496 186.5L496 384C496 392.8 488.8 400 480 400zM288 448L480 448C515.3 448 544 419.3 544 384L544 186.5C544 169.5 537.3 153.2 525.3 141.2L466.7 82.7C454.7 70.7 438.5 64 421.5 64L288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L368 496L368 512C368 520.8 360.8 528 352 528L160 528C151.2 528 144 520.8 144 512L144 256C144 247.2 151.2 240 160 240L176 240L176 192L160 192z" />
                        </svg>
                    </span>
                    <span className="gradient-neon dark:gradient-neon-dark hidden group-hover:flex absolute z-[30] -left-3 -bottom-4 text-xs font-brand rounded-lg text-primary-700 dark:text-gray-50 py-0 px-1 shadow-balanced-lg shadow-primray-400 active:outline-none" >copy</span>
                </button>
                <button
                    onClick={() => clone_markdown_content(messageref.current)}
                    className="relative group rounded-lg cursor-pointer"
                    aria-label="Clone">
                    <span className="flex items-center justify-center w-[18px] h-6">
                        <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                            <path d="M352 528L128 528C119.2 528 112 520.8 112 512L112 288C112 279.2 119.2 272 128 272L176 272L176 224L128 224C92.7 224 64 252.7 64 288L64 512C64 547.3 92.7 576 128 576L352 576C387.3 576 416 547.3 416 512L416 464L368 464L368 512C368 520.8 360.8 528 352 528zM288 368C279.2 368 272 360.8 272 352L272 128C272 119.2 279.2 112 288 112L512 112C520.8 112 528 119.2 528 128L528 352C528 360.8 520.8 368 512 368L288 368zM224 352C224 387.3 252.7 416 288 416L512 416C547.3 416 576 387.3 576 352L576 128C576 92.7 547.3 64 512 64L288 64C252.7 64 224 92.7 224 128L224 352z" />
                        </svg>
                    </span>
                    <span className="gradient-neon dark:gradient-neon-dark hidden group-hover:flex absolute z-[30] -left-3 -bottom-4 text-xs font-brand rounded-lg text-primary-700 dark:text-gray-50 py-0 px-1 shadow-balanced-lg shadow-primray-400 active:outline-none" >clone</span>
                </button>
                <button className="hidden relative group hover:bg-sky-100 rounded-lg cursor-pointer" aria-label="Report message">
                    <span className="flex items-center justify-center w-[18px] h-6">
                        <svg viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon">
                            <path d="M3.50171 17.5003V3.84799C3.50185 3.29 3.81729 2.74214 4.37476 2.50522L4.80737 2.3353C6.9356 1.5739 8.52703 2.07695 9.948 2.60385C11.4516 3.16139 12.6757 3.68996 14.3953 3.19272L14.572 3.15268C15.4652 3.00232 16.4988 3.59969 16.4988 4.68198V11.8998C16.4986 12.4958 16.1364 13.0672 15.5427 13.2777L15.4216 13.3148C12.9279 13.9583 11.1667 13.2387 9.60815 12.7621C8.82352 12.5221 8.0928 12.3401 7.28784 12.3441C6.5809 12.3477 5.78505 12.4961 4.83179 12.9212V17.5003C4.83161 17.8675 4.53391 18.1654 4.16675 18.1654C3.79959 18.1654 3.50189 17.8675 3.50171 17.5003ZM4.83179 11.4847C5.71955 11.1539 6.52428 11.0178 7.28101 11.014C8.2928 11.0089 9.17964 11.2406 9.99683 11.4906C11.642 11.9938 13.024 12.5603 15.0886 12.0277L15.115 12.016C15.1234 12.0102 15.1316 12.0021 15.1394 11.9915C15.1561 11.969 15.1686 11.9366 15.1687 11.8998V4.68198C15.1687 4.62687 15.1436 4.56746 15.0652 4.51596C15.0021 4.47458 14.9225 4.45221 14.8435 4.45639L14.7644 4.47006C12.5587 5.10779 10.9184 4.38242 9.48511 3.85092C8.15277 3.3569 6.92639 2.98314 5.23804 3.59311L4.89429 3.72885C4.8709 3.73888 4.83192 3.77525 4.83179 3.84799V11.4847Z"></path>
                        </svg>
                    </span>
                    <span className="gradient-neon dark:gradient-neon-dark hidden group-hover:flex absolute z-[30] -left-3 -bottom-4 text-xs font-brand rounded-lg text-primary-700 dark:text-gray-50 py-0 px-1 shadow-balanced-lg shadow-primray-400 active:outline-none" >Flag</span>
                </button>
                <button className="hidden relative group hover:bg-sky-100 rounded-lg cursor-pointer" aria-label="Edit message">
                    <span className="flex items-center justify-center w-[18px] h-6">
                        <svg viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon">
                            <path d="M11.3312 3.56837C12.7488 2.28756 14.9376 2.33009 16.3038 3.6963L16.4318 3.83106C17.6712 5.20294 17.6712 7.29708 16.4318 8.66895L16.3038 8.80372L10.0118 15.0947C9.68833 15.4182 9.45378 15.6553 9.22179 15.8457L8.98742 16.0225C8.78227 16.1626 8.56423 16.2832 8.33703 16.3828L8.10753 16.4756C7.92576 16.5422 7.73836 16.5902 7.5216 16.6348L6.75695 16.7705L4.36339 17.169C4.22053 17.1928 4.06908 17.2188 3.94054 17.2285C3.84177 17.236 3.70827 17.2386 3.56261 17.2031L3.41417 17.1543C3.19115 17.0586 3.00741 16.8908 2.89171 16.6797L2.84581 16.5859C2.75951 16.3846 2.76168 16.1912 2.7716 16.0596C2.7813 15.931 2.80736 15.7796 2.83117 15.6367L3.2296 13.2432L3.36437 12.4785C3.40893 12.2616 3.45789 12.0745 3.52453 11.8926L3.6173 11.6621C3.71685 11.4352 3.83766 11.2176 3.97765 11.0127L4.15343 10.7783C4.34386 10.5462 4.58164 10.312 4.90538 9.98829L11.1964 3.6963L11.3312 3.56837ZM5.84581 10.9287C5.49664 11.2779 5.31252 11.4634 5.18663 11.6162L5.07531 11.7627C4.98188 11.8995 4.90151 12.0448 4.83507 12.1963L4.77355 12.3506C4.73321 12.4607 4.70242 12.5761 4.66808 12.7451L4.54113 13.4619L4.14269 15.8555L4.14171 15.8574H4.14464L6.5382 15.458L7.25499 15.332C7.424 15.2977 7.5394 15.2669 7.64953 15.2266L7.80285 15.165C7.95455 15.0986 8.09947 15.0174 8.23644 14.9238L8.3839 14.8135C8.53668 14.6876 8.72225 14.5035 9.0714 14.1543L14.0587 9.16602L10.8331 5.94044L5.84581 10.9287ZM15.3634 4.63673C14.5281 3.80141 13.2057 3.74938 12.3097 4.48048L12.1368 4.63673L11.7735 5.00001L15.0001 8.22559L15.3634 7.86329L15.5196 7.68946C16.2015 6.85326 16.2015 5.64676 15.5196 4.81056L15.3634 4.63673Z"></path>
                        </svg>
                    </span>
                    <span className="gradient-neon dark:gradient-neon-dark hidden group-hover:flex absolute z-[30] -left-3 -bottom-4 text-xs font-brand rounded-lg text-primary-700 dark:text-gray-50 py-0 px-1 shadow-balanced-lg shadow-primray-400 active:outline-none" >Edit</span>
                </button>
            </div>
        </div>
    )
}
