import React from 'react';
import { FiPenTool, FiCpu } from 'react-icons/fi';


export const BlinkingCursor: React.FC<{ isWriting: boolean }> = ({ isWriting }) => {
    if (!isWriting) return null;
    return (
        <div className="animate-blink inline-flex items-center gap-1">
            <span className="w-0.5 h-4 bg-emerald-500 dark:bg-emerald-400 animate-cursor-blink" />
            <span className="text-xs text-gray-400 animate-pulse">_</span>
        </div>
    );
};

export const ThinkingBrain: React.FC<{ isWriting: boolean }> = ({ isWriting=false }) => {
    if (!isWriting) return null;
    return (
        <div className="inline-flex items-center gap-2">
            <div className="relative">
                <FiCpu className="w-5 h-5 text-purple-500 dark:text-purple-400 animate-spin-slow" />
                <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-30" />
            </div>
            <div className="flex gap-0.5">
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        className="w-1 h-1 bg-purple-500 rounded-full animate-think-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                    />
                ))}
            </div>
        </div>
    );
};

export const ScribbleLine: React.FC<{ isWriting: boolean }> = ({ isWriting }) => {
    if (!isWriting) return null;
    return (
        <div className="inline-flex items-center gap-2">
            <svg width="40" height="16" viewBox="0 0 40 16" className="overflow-visible">
                <path
                    d="M2 8 Q8 2 14 8 Q20 14 26 8 Q32 2 38 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="text-blue-500 dark:text-blue-400 animate-scribble"
                    strokeDasharray="100"
                    strokeDashoffset="100"
                />
                <circle r="2" fill="currentColor" className="text-blue-500 animate-trail">
                    <animateMotion dur="1.5s" repeatCount="indefinite" path="M2 8 Q8 2 14 8 Q20 14 26 8 Q32 2 38 8" />
                </circle>
            </svg>
            <span className="text-xs text-gray-400">generating</span>
        </div>
    );
};

export const TypingQuill: React.FC<{ isWriting: boolean }> = ({ isWriting }) => {
    if (!isWriting) return null;
    return (
        <div className="inline-flex items-center gap-2">
            <div className="relative -rotate-[90deg]">
                <FiPenTool className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-quill-write" />
                <div className="absolute -bottom-1 left-1/2 w-1 h-1 bg-amber-500 rounded-full animate-ink-drop" />
                <div className="absolute -bottom-2 left-2 w-0.5 h-0.5 bg-amber-500 rounded-full animate-ink-drop-delayed" />
            </div>
        </div>
    );
};

export const VoiceWave: React.FC<{ isWriting: boolean }> = ({ isWriting }) => {
    if (!isWriting) return null;
    return (
        <div className="inline-flex items-center gap-1">
            {[4, 8, 12, 8, 4].map((height, i) => (
                <div
                    key={i}
                    className="w-0.5 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full animate-wave"
                    style={{
                        height: `${height}px`,
                        animationDelay: `${i * 0.1}s`,
                    }}
                />
            ))}
        </div>
    );
};

import { FiEdit2 } from 'react-icons/fi';

export const OrbitingPencil: React.FC<{ isWriting: boolean }> = ({ isWriting }) => {
    if (!isWriting) return null;
    return (
        <div className="inline-flex items-center gap-2">
            <div className="relative w-6 h-6">
                <FiEdit2 className="absolute inset-0 w-5 h-5 text-rose-500 dark:text-rose-400 animate-pulse" />
                <div className="absolute top-0 left-0 w-1 h-1 bg-rose-400 rounded-full animate-orbit-1" />
                <div className="absolute bottom-0 right-0 w-1 h-1 bg-rose-400 rounded-full animate-orbit-2" />
                <div className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-rose-300 rounded-full animate-orbit-3" />
            </div>
            <span className="text-xs text-gray-500 font-mono animate-typing-dots">...</span>
        </div>
    );
};
