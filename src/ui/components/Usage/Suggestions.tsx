import { JSX, useCallback, useEffect, useRef, useState } from 'react';
import { globalEventBus } from '../../../core/Globals/eventBus.ts';
import { motion } from 'framer-motion';
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
    { id: 'draw', label: 'Draw', icon: <AdviceIcon />, query: 'Create a flowchart showing how a neural network works...' },
    { id: 'summarize', label: 'Summarize', icon: <SummarizeIcon />, query: 'Summarize the key concepts of quantum computing...' },
    { id: 'surprise', label: 'Surprise me', icon: <SupriseIcon />, query: 'Tell me something fascinating about AI...' },
    { id: 'code', label: 'Write code', icon: <CodeIcon />, query: 'Write a Python function that sorts a list...' },
    { id: 'analyze-images', label: 'Analyze images', icon: <AnalyzeImagesIcon />, query: 'Analyze these images and describe what you see...' },
    { id: 'help-me-write', label: 'Help me write', icon: <HelpWriteIcon />, query: 'Help me write a professional email...' },
]

export const UsageSuggestions = () => {
    const [showMore, setShowMore] = useState(false);
    const suggestionRef = useRef(null);

    const triggerInput = useCallback((query: string) => {
        const input = document.getElementById('userInput');
        if (!input) return;

        const textarea = input as HTMLDivElement;
        textarea.textContent = query;

        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
        textarea.focus();

        // globalEventBus.emit('suggestions:hide');
    }, []);

    useEffect(() => {
        const hide = globalEventBus.on('suggestions:hide', () => {
            if (!suggestionRef.current) return;
            (suggestionRef.current as Element).classList.add('hidden');
        });
        const show = globalEventBus.on('suggestions:show', () => {
            if (!suggestionRef.current) return;
            (suggestionRef.current as Element).classList.remove('hidden');
        });
        return () => {
            hide.unsubscribe();
            show.unsubscribe();
        };
    }, []);

    const visibleActions = showMore ? ACTIONS : ACTIONS.slice(0, 4);

    return (
        <motion.section
            ref={suggestionRef}
            id='suggestions'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-4xl mx-auto px-4 py-12"
        >
            {/* Simple header */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-light text-gray-700 dark:text-gray-200 mb-2">
                    What can I help with?
                </h1>
                <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-600 mx-auto"></div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap justify-center gap-3">
                {visibleActions.map((action, index) => (
                    <motion.button
                        key={action.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => triggerInput(action.query)}
                        className="group px-5 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-primary-800/50 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-primary-800 transition-all duration-200 flex items-center gap-2"
                    >
                        <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                            {action.icon}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100">
                            {action.label}
                        </span>
                    </motion.button>
                ))}

                {/* More/Less toggle */}
                {ACTIONS.length > 4 && (
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className="px-5 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-primary-800/50 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-primary-800 transition-all duration-200 text-sm text-gray-500 dark:text-gray-400"
                    >
                        {showMore ? 'Show less' : `${ACTIONS.length - 4} more`}
                    </button>
                )}
            </div>

            {/* Subtle footer */}
            <div className="text-center mt-6">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    or type anything you'd like help with
                </p>
            </div>
        </motion.section>
    );
};
