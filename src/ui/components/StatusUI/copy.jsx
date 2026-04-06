import { useState, useRef, useCallback, useEffect } from "react";
import { globalEventBus } from "../../../core/Globals/eventBus.ts";
export const CopyFeedback = ({ text = {
    head: 'Copied to clipboard',
    body: 'Ready to paste anywhere'
} }) => {

    const [info, setInfo] = useState(text)
    const modalRef = useRef(null)
    const titleRef = useRef(null)

    // Function to show the modal
    const showFeedback = useCallback((info) => {
        setInfo(info)
        // Slide modal to 20% height and make it visible after 1 second
        setTimeout(() => {
            modalRef.current.classList.add('top-1/5', 'opacity-100', 'pointer-events-auto');
        }, 500); // 1 second delay

        // Slide modal to the left and fade out after 4 seconds
        setTimeout(() => {
            modalRef.current.classList.remove('top-1/5', 'left-1/2', '-translate-x-1/2');
            modalRef.current.classList.add('left-0', '-translate-x-[100vw]', 'opacity-0', 'pointer-events-none');

        }, 4000);

        // Reset transform after fully fading out and moving off-screen
        setTimeout(() => {
            modalRef.current.classList.remove('left-0', '-translate-x-[100vw]', 'opacity-0', 'pointer-events-none');
            modalRef.current.classList.add('top-0', 'left-1/2', '-translate-x-1/2', 'pointer-events-none');
        }, 1000); // 1s for fade out
    })

    useEffect(() => {
        const copy = globalEventBus.on('copy:feedback', (detail) => showFeedback(detail))
        return () => {
            copy.unsubscribe()
        }
    })

    return (
        <div ref={modalRef} id="copyModal" className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 opacity-0 pointer-events-none transition-all duration-300 ease-in-out">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border border-gray-200/60 dark:border-slate-600/50 rounded-2xl shadow-2xl shadow-black/20 backdrop-blur-xl p-4 min-w-[280px]">
                {/* Animated Success Icon */}
                <div className="flex items-center justify-center space-x-3">
                    <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        {/* Pulse Ring */}
                        <div className="absolute inset-0 border-2 border-emerald-400/30 rounded-full animate-ping-slow"></div>
                    </div>

                    <div className="text-left">
                        <p ref={titleRef} id="copy-title" className="font-semibold text-gray-900 dark:text-white text-sm">{info.head}</p>
                        <p id="copy-body" className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{info.body}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div id="copy-progress" className="mt-3 h-0.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 animate-progress"></div>
                </div>
            </div>
        </div>
    )
};
