import { useCallback, useEffect, useRef, useState } from "react"
import { StateManager } from "../../../core/managers/StatesManager"
import { globalEventBus } from "../../../core/Globals/eventBus"

export const MenuTools = ({ onToggleRecording }) => {

    const toolWrapper = useRef(null)

    const openToolMenu = useCallback(() => {
        if (!toolWrapper.current) return
        const toolContainer = toolWrapper?.current as HTMLBaseElement
        toolContainer?.classList.remove("animate-exit", "hidden")
        toolContainer?.classList.add("animate-enter")
    }, [])

    const closeToolsMenu = useCallback(() => {
        if (!toolWrapper.current) return
        const toolContainer = toolWrapper?.current as HTMLBaseElement
        toolContainer?.classList.remove("animate-enter")
        toolContainer?.classList.add("animate-exit")
        setTimeout(() => {
            toolContainer?.classList.add("hidden")
        }, 600)
    }, [])

    const toggleToolMenu = useCallback(() => {
        if (!toolWrapper.current) return
        ((toolWrapper?.current as HTMLBaseElement)?.classList.contains("animate-exit"))
            ? openToolMenu()
            : closeToolsMenu()
    }, [])

    useEffect(() => {
        const close = globalEventBus.on('userinput:menu:close', closeToolsMenu)
        const open = globalEventBus.on('userinput:menu:open', openToolMenu)
        const toggle = globalEventBus.on('userinput:menu:toggle', toggleToolMenu)
        return () => {
            close.unsubscribe()
            open.unsubscribe()
            toggle.unsubscribe()
        }
    }, [])


    const shouldToggleCanvas = useCallback((event: MouseEvent) => {
        if (!event.target) return

        if (!canvasCheckBoxRef || !canvasCheckBoxRef.current) return
        const canvasCheck = (canvasCheckBoxRef.current as HTMLBaseElement)
        const clickedElement: EventTarget = event.target;

        // Check if the click was directly on the checkbox or within its label
        if (canvasCheck.contains(clickedElement as Node) || clickedElement === canvasCheck) return

        // Toggle the canvas for any other part of the button
        globalEventBus.emit('canvas:toggle')
    }, []);

    return (
        <section
            ref={toolWrapper}
            onMouseLeave={closeToolsMenu}
            className='block absolute -left-12 bottom-12 z-[51] bg-gray-200 dark:bg-primary-400 rounded-md p-2 space-y-2 hidden animate-exit'>

            {/* Voice Recording */}
            <div onClick={onToggleRecording} className='hidden flex gap-1 text-gray-800 dark:text-gray-200 items-center cursor-pointer hover:bg-black/20 dark:hover:bg-black/50 p-1 rounded-sm'>
                <button id="microphone" className="flex items-center justify-center rounded-lg  transition-colors duration-300" title="Voice recording">
                    <svg id="microphoneSVG" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" className="stroke-blue-600 dark:stroke-cyan-400 w-5 h-5 transition-colors duration-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                </button>Record
            </div>

            {/* Diagram/Flow Tool */}
            <div
                onClick={() => StateManager.get('openDiagramView')()}
                className='flex items-center gap-1 text-gray-800 dark:text-gray-200 hover:bg-black/20 dark:hover:bg-black/50 p-1 rounded-sm cursor-pointer select-none'>
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

            {/* Right side: Canvas Tools */}
            <CanvasMenu />

            {/* File Attachment */}
            <FileAttachment />
        </section>

    )
}

const CanvasMenu = ({ }) => {
    const canvasCheckBoxRef = useRef(null)
    const [canvasOn, setCanvasOn] = useState(false)

    return (
        <div className="hidden xs:flex items-center space-x-1 bg-white/0 dark:bg-gray-800/0 rounded-lg select-none">
            <button
                onClick={(e) => {
                    if (e.target !== canvasCheckBoxRef.current) {
                        globalEventBus.emit('canvas:toggle')
                    }
                }}
                className="group flex items-center gap-1 px-2 py-1 rounded-xl w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-primary-700 dark:to-primary-600 text-blue-700 dark:text-teal-200 border-2 border-blue-500 dark:border-primary-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
                aria-pressed="false"
                title="Toggle AI Canvas"
            >
                {/* Animated background pulse when AI is active */}
                <div className={`absolute inset-0 bg-gradient-to-r from-green-200 to-emerald-300 dark:from-green-800 dark:to-emerald-700 opacity-0 transition-opacity duration-300 ${canvasOn ? 'opacity-20' : ''}`}></div>

                {/* Canvas Toggle Indicator */}
                <div className="relative flex items-center justify-start">
                    <div className={`absolute w-5 h-5 border-2 border-blue-300 dark:border-teal-400 rounded-full transition-all duration-300 opacity-0 scale-125 ${canvasOn ? 'opacity-100 animate-ping' : ''}`}></div>
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
                {/* Text and Canvas Status */}
                <div className="flex flex-col items-start min-w-fit">
                    <div className='flex gap-2'>
                        <span className="text-[12px] font-bold tracking-wide select-none whitespace-nowrap inline">&lt;/&gt; <span className='hidden xs:inline'>Canvas</span></span>
                    </div>
                    {/* Canvas Toggle Status */}
                    <div className='flex justify-between w-full'>
                        <div className="hidden xs:flex items-center gap-1 transition-all duration-300 opacity-60 group-hover:opacity-100">
                            <div className={`w-1.5 h-1.5 bg-gray-400 rounded-full transition-all duration-300 ${canvasOn ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className="text-[9.5px] font-medium text-gray-600 dark:text-gray-300 transition-all duration-300">{canvasOn ? 'Canvas on' : 'Canvas off'}</span>
                        </div>

                        {/* Mini Checkbox Indicator */}
                        <div className="relative flex ml-0.5">
                            <input
                                ref={canvasCheckBoxRef}
                                type="checkbox"
                                id="CanvasToggle"
                                className="absolute opacity-0 w-0 h-0"
                                onChange={(e) => setCanvasOn(e.target.checked)}
                            />
                            <label
                                htmlFor="CanvasToggle"
                                className="relative flex items-center justify-center w-4 h-4 border-2 border-blue-400 dark:border-teal-500 rounded bg-white dark:bg-slate-700 transition-all duration-300 cursor-pointer group/checkbox hover:border-blue-600 dark:hover:border-teal-300"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Checkmark */}
                                <svg
                                    className={`w-3 h-3 text-green-600 dark:text-teal-400 transition-all duration-200 ${canvasOn ? '' : 'opacity-0 scale-50'}`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                {/* Glow effect when checked */}
                                <div className={`absolute inset-0 rounded bg-green-500 dark:bg-teal-500 opacity-0 scale-150 transition-all duration-300 blur-sm ${canvasOn ? 'opacity-30' : ''}`}></div>
                            </label>
                        </div>
                    </div>
                </div>
            </button>
        </div>
    )
}

const FileAttachment = ({ }) => (
    <div onClick={() => globalEventBus.emit('dropzone:open')} id="AttachFiles" className="flex items-center rounded-sm text-gray-800 dark:text-gray-200 hover:bg-black/20 dark:hover:bg-black/50 p-1 cursor-pointer" title="Attach files select-none">
        <button aria-label="Attach files" className="flex items-center justify-center rounded-lg text-token-text-primary dark:text-white focus-visible:outline-black dark:focus-visible:outline-white transition-colors duration-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M9 7C9 4.23858 11.2386 2 14 2C16.7614 2 19 4.23858 19 7V15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15V9C5 8.44772 5.44772 8 6 8C6.55228 8 7 8.44772 7 9V15C7 17.7614 9.23858 20 12 20C14.7614 20 17 17.7614 17 15V7C17 5.34315 15.6569 4 14 4C12.3431 4 11 5.34315 11 7V15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15V9C13 8.44772 13.4477 8 14 8C14.5523 8 15 8.44772 15 9V15C15 16.6569 13.6569 18 12 18C10.3431 18 9 16.6569 9 15V7Z" fill="currentColor"></path>
            </svg>
        </button> Upload files
    </div>
)
