import { useRef, useState, useEffect } from 'react';
import { CodeBlockRenderer } from '../Code/CodeBlockRenderer';
import ToolCallDisplay from '../Tools/ToolCallDisplay';

export const TerminalThinkingSection = ({ htmlThinkContent, isThinking }) => {
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = useRef(null);

    return (
        <div className="mb-4 font-mono">
            <div className="bg-gray-900 dark:bg-[#0a0a0f] border border-gray-700 rounded-lg shadow-xl overflow-hidden">

                {/* Terminal header */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-[#1a1a1f] border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <span className="text-xs text-gray-400">~/reasoning</span>
                    </div>

                    {isThinking && (
                        <div className="flex items-center gap-1">
                            <span className="text-green-400 text-xs">$</span>
                            <span className="animate-pulse text-green-400 text-xs">thinking_</span>
                        </div>
                    )}
                </div>

                {/* Content with typing animation */}
                <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="text-green-500">$</span>
                            <span className="text-gray-300 text-sm">
                                {isThinking ? (
                                    <span className="inline-flex items-center gap-2">
                                        <span>Processing request</span>
                                        <span className="inline-flex gap-0.5">
                                            <span className="animate-pulse">.</span>
                                            <span className="animate-pulse [animation-delay:0.2s]">.</span>
                                            <span className="animate-pulse [animation-delay:0.4s]">.</span>
                                        </span>
                                    </span>
                                ) : (
                                    'cat reasoning.log'
                                )}
                            </span>
                        </div>

                        <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'} text-gray-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>

                {/* Animated terminal output */}
                <div
                    ref={contentRef}
                    className="transition-all duration-300 overflow-hidden"
                    style={{ maxHeight: isOpen ? '500px' : '0px' }}
                >
                    <div className="px-4 py-3 bg-gray-900/50 border-t border-gray-800">
                        <div className="text-green-400 text-xs whitespace-pre-wrap font-mono">
                            {htmlThinkContent && (
                                <CodeBlockRenderer htmlContent={htmlThinkContent} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const GlassThinkingSection = ({ htmlThinkContent, isThinking, thinkToolCalls = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = useRef(null);

    return (
        <div className="mb-4">
            <div className="relative backdrop-blur-sm bg-white/30 dark:bg-[#1c1c2a]/80 border border-blue-200/50 dark:border-[#393955] rounded-xl overflow-hidden shadow-lg">

                {/* Animated gradient border when thinking */}
                {isThinking && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-gradient-x opacity-20"></div>
                )}

                <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer relative z-10">
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-3">
                            {/* Pulsing ring animation */}
                            {isThinking && (
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></div>
                                    <div className="relative w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'} text-blue-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                    {isThinking ? (
                                        <span className="flex items-center gap-2">
                                            <span>Analyzing</span>
                                            <span className="flex gap-1">
                                                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></span>
                                                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                                                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                                            </span>
                                        </span>
                                    ) : 'Reasoning trace'}
                                </span>
                            </div>
                        </div>

                        {/* Status indicator */}
                        <div className="flex items-center gap-2">
                            {isThinking && (
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-gray-500">Processing</span>
                                </div>
                            )}
                            <span className="text-xs text-gray-400 font-mono">{isOpen ? 'Hide' : 'Show'}</span>
                        </div>
                    </div>
                </div>

                {/* Smooth expand/collapse with spring animation */}
                <div
                    ref={contentRef}
                    className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden overflow-y-auto scrollbar-custom ${isOpen ? 'h-fit' : 'h-0'}`}>
                    <div className="p-4 pt-2 border-t border-blue-100 dark:border-[#393955]">
                        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-500 dark:text-gray-300">
                            <CodeBlockRenderer htmlContent={htmlThinkContent} />
                            {thinkToolCalls.map((toolCall, index) => <ToolCallDisplay key={index} toolCall={toolCall} />)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ThinkingSection = ({ htmlThinkContent, isThinking }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const contentRef = useRef(null);
    const foldRef = useRef(null);

    const toggleThink = () => {
        if (isAnimating) return;

        setIsAnimating(true);
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (contentRef.current) {
            if (isOpen) {
                contentRef.current.style.maxHeight = contentRef.current.scrollHeight + 'px';
                contentRef.current.classList.remove('opacity-0');
                contentRef.current.classList.add('opacity-100');
            } else {
                contentRef.current.style.maxHeight = '0px';
                contentRef.current.classList.remove('opacity-100');
                contentRef.current.classList.add('opacity-0');
            }

            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <div className="mb-4">
            {/* Option 1: Minimal Elegant (Default) */}
            <div className="w-full border-[0.1rem] border-blue-200 bg-gradient-to-br from-gray-50 to-gray-100/30 dark:from-[#1c1c2a] dark:to-[#1c1c2a] dark:border-[#393955] rounded-lg shadow-none hover:shadow-md transition-all duration-300 overflow-hidden">

                {/* Header with thinking indicator */}
                <div
                    onClick={toggleThink}
                    className="cursor-pointer select-none"
                >
                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                            {/* Thinking Animation */}
                            {isThinking && (
                                <div className="flex items-center gap-1.5">
                                    {/* Animated dots */}
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                                        <div className="relative w-2 h-2 bg-blue-500 rounded-full"></div>
                                    </div>
                                    <strong className="text-blue-500 dark:text-blue-400 text-xs font-mono tracking-wide">
                                        <span className="inline-flex items-center gap-1">
                                            Thinking
                                            <span className="inline-flex gap-0.5">
                                                <span className="animate-bounce [animation-delay:-0.3s]">.</span>
                                                <span className="animate-bounce [animation-delay:-0.15s]">.</span>
                                                <span className="animate-bounce">.</span>
                                            </span>
                                        </span>
                                    </strong>
                                </div>
                            )}

                            {/* Collapse/Expand Icon with rotation */}
                            <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>

                            {/* Status text */}
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {isThinking ? 'Processing your request...' : 'Reasoning process'}
                            </span>
                        </div>

                        {/* Badge showing status */}
                        <div className="flex items-center gap-2">
                            {isThinking && (
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full heartpulse-slow"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full heartpulse-slow [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full heartpulse-slow [animation-delay:0.4s]"></div>
                                </div>
                            )}
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                                {isOpen ? '▼' : '▶'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Animated Content */}
                <div
                    ref={contentRef}
                    className="transition-all duration-300 ease-in-out overflow-hidden h-fit"
                    style={{ maxHeight: isOpen ? '800px' : '0px' }}
                >
                    <div ref={foldRef} className="p-3 pt-0 border-t border-blue-100 dark:border-[#393955] mt-2">
                        <div className="text-gray-500 dark:text-gray-300 text-sm opacity-90">
                            <CodeBlockRenderer htmlContent={htmlThinkContent} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
