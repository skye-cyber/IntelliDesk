import { useCallback, useEffect, useRef, useState } from "react"
import { StateManager } from "../../../core/managers/StatesManager"
import { globalEventBus } from "../../../core/Globals/eventBus"

export const MenuTools = ({ onToggleRecording }) => {
    const [isOpen, setIsOpen] = useState(false)
    const toolWrapperRef = useRef<HTMLDivElement>(null)

    const openToolMenu = useCallback(() => {
        setIsOpen(true)
    }, [])

    const closeToolsMenu = useCallback(() => {
        setIsOpen(false)
    }, [])

    const toggleToolMenu = useCallback(() => {
        setIsOpen(prev => !prev)
    }, [])

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (toolWrapperRef.current && !toolWrapperRef.current.contains(event.target as Node)) {
                closeToolsMenu()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, closeToolsMenu])

    useEffect(() => {
        const close = globalEventBus.on('userinput:menu:close', closeToolsMenu)
        const open = globalEventBus.on('userinput:menu:open', openToolMenu)
        const toggle = globalEventBus.on('userinput:menu:toggle', toggleToolMenu)
        return () => {
            close.unsubscribe()
            open.unsubscribe()
            toggle.unsubscribe()
        }
    }, [openToolMenu, closeToolsMenu, toggleToolMenu])

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={toggleToolMenu}
                className="absolute -left-12 bottom-12 z-50 p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
                aria-label="Tools menu"
                title="Tools"
            >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>

            {/* Menu Panel */}
            <div
                ref={toolWrapperRef}
                className={`absolute -left-12 bottom-24 z-50 w-64 transition-all duration-300 transform origin-bottom-left ${isOpen
                    ? 'opacity-100 scale-100 pointer-events-auto'
                    : 'opacity-0 scale-95 pointer-events-none'
                    }`}
            >
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tools & Features</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Enhance your experience</p>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 space-y-1">
                        {/* Voice Recording */}
                        <ToolMenuItem
                            onClick={onToggleRecording}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" className="w-4 h-4" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                                </svg>
                            }
                            title="Voice Recording"
                            description="Record audio input"
                            gradient="from-pink-500 to-rose-500"
                        />

                        {/* Diagram Tool */}
                        <ToolMenuItem
                            onClick={() => StateManager.get('openDiagramView')()}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <circle cx="5" cy="12" r="2" strokeWidth="2" />
                                    <circle cx="12" cy="5" r="2" strokeWidth="2" />
                                    <circle cx="12" cy="19" r="2" strokeWidth="2" />
                                    <circle cx="19" cy="12" r="2" strokeWidth="2" />
                                    <path d="M7 12h4M13 5v2M13 19v-2M17 12h-4" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            }
                            title="Diagram Viewer"
                            description="Create and view diagrams"
                            gradient="from-blue-500 to-cyan-500"
                        />

                        {/* Canvas Menu */}
                        <CanvasMenu />

                        {/* File Attachment */}
                        <ToolMenuItem
                            onClick={() => globalEventBus.emit('dropzone:open')}
                            icon={
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M9 7C9 4.23858 11.2386 2 14 2C16.7614 2 19 4.23858 19 7V15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15V9C5 8.44772 5.44772 8 6 8C6.55228 8 7 8.44772 7 9V15C7 17.7614 9.23858 20 12 20C14.7614 20 17 17.7614 17 15V7C17 5.34315 15.6569 4 14 4C12.3431 4 11 5.34315 11 7V15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15V9C13 8.44772 13.4477 8 14 8C14.5523 8 15 8.44772 15 9V15C15 16.6569 13.6569 18 12 18C10.3431 18 9 16.6569 9 15V7Z" fill="currentColor"></path>
                                </svg>
                            }
                            title="Attach Files"
                            description="Upload documents and images"
                            gradient="from-green-500 to-emerald-500"
                        />
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200/50 dark:border-gray-700/50">
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                            Powered by AI
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

// Tool Menu Item Component
const ToolMenuItem = ({ onClick, icon, title, description, gradient = "from-gray-500 to-gray-600" }) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-full group relative overflow-hidden rounded-xl transition-all duration-300"
        >
            <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

            <div className="relative flex items-center gap-3 px-3 py-2.5">
                {/* Icon Container */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                    <div className="text-white w-4 h-4">
                        {icon}
                    </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {description}
                    </div>
                </div>

                {/* Arrow Indicator */}
                <svg
                    className={`w-4 h-4 text-gray-400 transition-all duration-300 transform group-hover:translate-x-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 ${isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </button>
    )
}

// Enhanced Canvas Menu Component
const CanvasMenu = () => {
    const canvasCheckBoxRef = useRef<HTMLInputElement>(null)
    const switchRef = useRef<HTMLDivElement>(null)
    const [canvasOn, setCanvasOn] = useState(false)

    const toggleCanvas = useCallback(() => {
        //         globalEventBus.emit('canvas:toggle')
        // setCanvasOn(prev => !prev)
    }, [])

    return (
        <div className="relative">
            <button
                onClick={(e) => {
                    console.log(e.target)
                    if (!switchRef.current?.contains(e.target as Node)) {
                        globalEventBus.emit('canvas:toggle')
                    }
                }}
                className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${canvasOn ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                    }`}
            >
                {/* Animated Background */}
                <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 transition-opacity duration-300 ${canvasOn ? 'opacity-10' : 'opacity-0 group-hover:opacity-5'
                    }`} />

                <div className="relative flex items-center gap-3 px-3 py-2.5">
                    {/* Icon Container */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${canvasOn ? 'ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-gray-900' : ''
                        }`}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 text-left">
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            AI Canvas
                            {canvasOn && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-medium">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    Active
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {canvasOn ? 'Canvas mode enabled' : 'Toggle canvas workspace'}
                        </div>
                    </div>

                    {/* Toggle Switch */}
                    <div ref={switchRef} onClick={(e) => {
                        if (e.currentTarget.contains(e.target as Node)) {
                            setCanvasOn(!canvasOn)
                        }
                    }} className="relative">                        <input
                            ref={canvasCheckBoxRef}
                            type="checkbox"
                            defaultChecked={canvasOn}
                            onChange={(e) => setCanvasOn(e.target.checked)}
                            className="sr-only"
                            id="canvas-toggle"
                        />
                        <label
                            htmlFor="canvas-toggle"
                            className={`relative block w-10 h-5 rounded-full transition-all duration-300 cursor-pointer ${canvasOn ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md ${canvasOn ? 'translate-x-5' : ''
                                    }`}
                            />
                        </label>
                    </div>
                </div>
            </button>
        </div>
    )
}
