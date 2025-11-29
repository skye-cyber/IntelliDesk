import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GenerateId } from '../ConversationRenderer/Renderer';

const typeConfig = {
    success: {
        gradient: 'from-green-500 to-emerald-500',
        glow: 'bg-green-500',
        iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
        textColor: 'text-gray-900 dark:text-white',
        progress: 'bg-gradient-to-r from-green-500 to-emerald-500',
    },
    error: {
        gradient: 'from-red-500 to-rose-500',
        glow: 'bg-red-500',
        iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
        textColor: 'text-gray-900 dark:text-white',
        progress: 'bg-gradient-to-r from-red-500 to-rose-500',
    },
    warning: {
        gradient: 'from-amber-500 to-orange-500',
        glow: 'bg-amber-500',
        iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
        textColor: 'text-gray-900 dark:text-white',
        progress: 'bg-gradient-to-r from-amber-500 to-orange-500',
    },
    info: {
        gradient: 'from-blue-500 to-cyan-500',
        glow: 'bg-blue-500',
        iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
        textColor: 'text-gray-900 dark:text-white',
        progress: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    }
};


export const Toast = ({ type, message, messageId, duration = null, autoDismiss = true, portal_id }) => {
    messageId = GenerateId(type)
    type === "warn" ? type = "warning" : ''
    const [shown, setShown] = useState(false)
    const [dismissTimer, setdismissTimer] = useState(null)
    const portalRef = useRef(null)

    const fadeIn = useCallback(() => {
        setTimeout(() => {
            portalRef.current?.classList?.remove("opacity-0", "translate-x-full");
            portalRef.current?.classList?.add("opacity-100", "translate-x-0");
            setShown(true)
        }, 10)
    }, [])

    useEffect(() => {
        if (!shown) {
            fadeIn()
        }
        if (autoDismiss && duration) {
            setdismissTimer(setTimeout(() => {
                if (!portal_id) return window.ModalManager.dismissMessage(messageId)
                closePortal()
            }, duration))
        }
        return () => {
            dismissTimer ? clearTimeout(dismissTimer) : '';
        }
    }, [setdismissTimer])

    const closePortal = useCallback(() => {
        if (portal_id) {
            if (portalRef.current) {
                portalRef.current?.classList?.remove("opacity-100", "translate-x-0");
                portalRef.current?.classList?.add("opacity-0", "translate-x-full", "scale-95");

                setTimeout(() => {
                    window.reactPortalBridge.closeComponent(portal_id)
                }, 510);
            }
        } else {
            window.ModalManager.dismissMessage(messageId)
        }
    })

    return (
        <div id={messageId}
            ref={portalRef}
            data-pid={portal_id}
            dismisstimer={dismissTimer}
            className="message-toast transform transition-all duration-500 ease-in-out opacity-0 translate-x-full backdrop-blur-lg"
            data-message-id={messageId}
            data-auto-dismiss={autoDismiss}>
            <div className="relative bg-white/95 dark:bg-primary-800/95 border border-secondary-400/50 dark:border-accent-200/50 rounded-2xl shadow-2xl p-5 overflow-hidden backdrop-blur-lg">
                {/* Animated gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${typeConfig[type].gradient} opacity-5`}></div>

                {/* Glow effect */}
                <div className={`absolute inset-0 ${typeConfig[type].glow} opacity-10 rounded-2xl`}></div>

                {/* Message Content */}
                <div className="flex items-start relative z-10">
                    {/* Animated Icon Container */}
                    <div className="flex-shrink-0 mr-4">
                        <div className={`w-12 h-12 ${typeConfig[type].iconBg} rounded-2xl flex items-center justify-center shadow-lg icon-pulse`}>
                            <div className="w-6 h-6 text-white">
                                <StatusSVG status={type} />
                            </div>
                        </div>
                    </div>

                    {/* Message Text */}
                    <div className="flex-1 min-w-0">
                        <p className={`text-base font-semibold ${typeConfig[type].textColor} leading-relaxed tracking-tight`}>
                            {message}
                        </p>
                    </div>

                    {/* Close Button */}
                    <button type="button"
                        className="ml-4 flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-primary-800 hover:bg-gray-200 dark:hover:bg-primary-700 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:rotate-90 group"
                        onClick={closePortal}>
                        <svg className="w-4 h-4 text-gray-700 dark:text-gray-200 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors stroke-current dark:stroke-primary-200" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Progress Bar */}
                {autoDismiss
                    ?
                    <div className="absolute bottom-0 left-4 right-4 h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden mt-4">
                        <div className={`h-full ${typeConfig[type].progress} progress-bar-smooth rounded-full`}
                            style={{ animationDuration: `${duration}ms` }}></div>
                    </div>
                    : ""
                }
            </div>
        </div>
    )
}

export const StatusSVG = ({ status }) => {
    if (status === "success") {
        return (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
        )
    } else if (status === "error") {
        return (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        )
    } else if (status === "warning") {
        return (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
        )
    } else if (status === "info") {
        return (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    }
}

