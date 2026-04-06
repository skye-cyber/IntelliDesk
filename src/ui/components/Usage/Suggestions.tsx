import { JSX, useCallback, useEffect, useRef, useState } from 'react';
import { globalEventBus } from '../../../core/Globals/eventBus.ts';
import {
    SupriseIcon,
    AnalyzeImagesIcon,
    AdviceIcon,
    HelpWriteIcon,
    SummarizeIcon,
    CodeIcon
} from './icons.tsx';

interface ActionType {
    id: string
    label: string
    icon: JSX.Element
    query: string
}

const ACTIONS: Array<ActionType> = [
    { id: 'draw', label: 'Draw', icon: <AdviceIcon />, query: 'Create a <flowchart/bar-graph/network> ...' },
    { id: 'summarize', label: 'Summarize text', icon: <SummarizeIcon />, query: 'Summarize the book Rich Dad Poor Dad in one page' },
    { id: 'suprise', label: 'Surprise me', icon: <SupriseIcon />, query: 'Surprise me with a story about yourself' },
    // split
    { id: 'code', label: 'Code', icon: <CodeIcon />, query: 'Help me learn Python' },
    { id: 'analyze-images', label: 'Analyze images', icon: <AnalyzeImagesIcon />, query: 'Analyze the following images and translate the text in these images' },
    { id: 'help-me-write', label: 'Help me write', icon: <HelpWriteIcon />, query: 'Help me write a cover letter ..' },
]

export const UsageSuggestions = () => {
    const [showMore, setShowMore] = useState(false);
    const suggestionRef = useRef(null)

    const triggerInput = useCallback((e) => {
        const input = document.getElementById('userInput');
        const query = ACTIONS.find(item => item.id === e.target?.closest('.SG')?.id)?.query
        if (!input) return
        input.textContent = query as string
    }, [])
    useEffect(() => {
        const hide = globalEventBus.on('suggestions:hide', () => {
            if (!suggestionRef.current) return
            (suggestionRef.current as Element).classList.add('hidden')
        })
        const show = globalEventBus.on('suggestions:show', () => {
            if (!suggestionRef.current) return
            (suggestionRef.current as Element).classList.remove('hidden')
        })
        return () => {
            hide.unsubscribe()
            show.unsubscribe()
        }
    })
    return (
        <section ref={suggestionRef} id='suggestions' className=" mx-auto" style={{ zIndex: 0 }}>
            <div className="flex justify-center items-center text-center perspective-1000">
                <div className="p-2 rounded-lg">
                    <h1 className="text-3xl font-bold text-cyan-300 holographic-text">
                        What can I help you with?
                    </h1>
                </div>
            </div>
            <div className="hidden justify-center items-center text-center">
                <div className="cyber-terminal p-4 border-2 border-green-400 rounded">
                    <h1 className="text-2xl font-mono font-bold text-green-400 terminal-text">
                        &gt; What can I help you with? _
                    </h1>
                </div>
            </div>

            <div className="hidden justify-center items-center text-center">
                <div className="relative">
                    <h1 className="text-4xl text-black font-light modern-glow">
                        What can I help you with?
                    </h1>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
                </div>
            </div>

            <div className="h-fit">
                <div className="mt-5 flex items-center justify-center gap-x-2 transition-opacity duration-700 xl:gap-x-2.5 opacity-100 flex-wrap">
                    <ul id="SQ-UL" className="flex items-stretch gap-x-2 gap-y-4 overflow-hidden py-2 sm:gap-y-2 xl:gap-x-2.5 xl:gap-y-2.5 flex-wrap justify-center">
                        {ACTIONS.slice(0, 4).map((action, index) => (
                                <li key={index} id={action.id} onClick={triggerInput} className="SG">
                                    <button className="flex h-[42px] items-center gap-1.5 rounded-full border border-token-border-light px-3 py-2 text-start text-[13px] shadow-md transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]">
                                        {action.icon}
                                        <span className="max-w-full select-none whitespace-nowrap text-gray-600 transition group-hover:text-token-text-primary dark:text-gray-500">
                                            {action.label}
                                        </span>
                                    </button>
                                </li>
                            ))}

                        <div className={`${showMore ? 'hidden' : 'inline-block'}`}>
                            <button
                                onClick={() => setShowMore(!showMore)}
                                className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-token-border-light px-3 py-2 text-start text-[13px] shadow-md transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
                            >
                                <span className="max-w-full select-none whitespace-nowrap text-gray-600 transition group-hover:text-token-text-primary dark:text-gray-500">
                                    More
                                </span>
                            </button>
                        </div>

                        {showMore && ACTIONS.slice(4, 6).map((action, index) => (
                            <li key={index} id={action.id} onClick={triggerInput} className="SG">
                                <button className="flex h-[42px] items-center gap-1.5 rounded-full border border-token-border-light px-3 py-2 text-start text-[13px] shadow-md transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]">
                                    {action.icon}
                                    <span className="max-w-full select-none whitespace-nowrap text-gray-600 transition group-hover:text-token-text-primary dark:text-gray-500">
                                        {action.label}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};

