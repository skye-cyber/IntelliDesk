import { useEffect, useCallback, useRef, useState } from 'react';
import { ChatManager } from '../../../core/managers/Conversation/ChatManager';
import indellidesk from '@assets/intellidesk.png';
import { ChatContextMenu } from '../Chat/ContextMenu.jsx';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import { clearMessages } from '../../../core/PortalBridge.ts';
import { ChatsList } from '../Chat/ChatsList';
import { StateManager } from '../../../core/managers/StatesManager.ts';
import { PanelLeftClose } from 'lucide-react';
import { globalEventBus } from '../../../core/Globals/eventBus.ts';
import { modelManager } from '../../../core/managers/Conversation/ModelManager.ts';
import {
    FiPlus,
    FiSearch,
    FiTrash2,
} from 'react-icons/fi';
import {
    BsIncognito,
} from 'react-icons/bs';
import { RiSettings3Line } from 'react-icons/ri';
import DockerContainer from './DockTools.tsx';

StateManager.set("sidebarOpen", false)

const Manager = new ChatManager();

export const Sidebar = ({ isOpen, onToggle, isCanvasOn }) => {
    const refs = useRef({
        isOpen: null,
        conversations: []
    });
    const conversationsRef = useRef(null)
    const [panelOpen, setPanelOpen] = useState(false)
    const searchInput = useRef(null)
    const [searchON, setSearchOn] = useState(false)
    const [panelClass, setPanelClass] = useState('')

    useEffect(() => {
        setTimeout(() => {
            Manager.fetchConversations(conversationsRef.current);
        }, 2000)

    }, [isOpen]);


    const togglePanel = useCallback(() => {
        setPanelOpen(!panelOpen)
    })

    const searchChats = useCallback((e) => {
        const value = e.target.value.trim().toLowerCase();
        //if (!value) return;

        // const parts = value.split(/\s+/);
        const conversations = refs.current?.length ? refs.current : document.querySelectorAll('#chat-item');

        if (!conversations?.length) return;

        conversations.forEach(chat => {
            // Unhide items hidden by previous chat
            if (!value) return chat.classList.remove('hidden')

            //Perform search
            const name = chat.dataset?.name?.toLowerCase() || "";
            const id = chat.dataset?.id?.toLowerCase() || "";
            const highlight = chat.dataset?.highlight?.toLowerCase() || "";
            const fmatch = name.includes(value) || id.includes(value) || highlight.includes(value);
            chat.classList.toggle('hidden', !fmatch);
        });
    }, []);

    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            if (!document.getElementById('chatOptions-overlay')?.classList.contains('hidden')) return
            if (searchInput.current?.classList.contains('hidden')) {
                setPanelOpen(false);
            }
            setSearchOn(false);
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleEscape);
        const panelExpand = globalEventBus.on('panel:chats:expand', () => setPanelOpen(true))
        const panelShrink = globalEventBus.on('panel:chats:shrink', () => setPanelOpen(false))
        const panelToggle = globalEventBus.on('panel:chats:toggle', () => setPanelOpen(!panelOpen))
        const newSession = globalEventBus.on('conversation:new', (temporary = false) => {
            const currentModel = StateManager.get('currentModel')
            const model = modelManager.usesArrayStructure(currentModel)
                ? 'multimodal'
                : 'chat'
            clearMessages()
            window.desk.api.startNew(model, temporary)
        })

        return () => {
            newSession.unsubscribe()
            panelExpand.unsubscribe()
            panelShrink.unsubscribe()
            panelToggle.unsubscribe()
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, panelOpen, searchON]);

    useEffect(() => {
        if (panelOpen) {
            globalEventBus.emit('panel:chats:change', (panelOpen))
        }
        StateManager.set("sidebarOpen", panelOpen)
    }, [panelOpen])

    useEffect(() => {
        if (searchON) searchInput.current?.focus()
    }, [searchON])


    useEffect(() => {
        if (panelOpen && isCanvasOn) {
            setPanelClass('fixed z-[41] left-0 top-0 w-[250px] bg-opacity-100')
        } else if (panelOpen) {
            setPanelClass('fixed z-[41] left-0 top-0 w-[250px] lg:relative md:top-auto lg:left-auto lg:w-[25vw] xl:w-[20vw] sm:block bg-opacity-100')
        } else {
            setPanelClass(`w-[40px] ${isCanvasOn ? 'md:w-[5vw]' : 'lg:[4vw]'}`)
        }
    }, [isCanvasOn, panelOpen])

    return (
        <>
            <DockerContainer />
            <div
                id="conversationPane"
                className={`h-screen ${panelClass} border-x border-l-0 border-gray-200 dark:border-accent-700 bg-gradient-to-b from-slate-50 to-gray-50 dark:from-blend-900 dark:to-blend-900 transition-all duration-700 ease-in-out overflow-hidden`}
            >
                {/* Header Section */}
                <section className="sticky top-0 z-[50] bg-white/80 dark:bg-blend-950 backdrop-blur-md border-b border-primary-200/50 dark:border-primary-800/50 p-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-center space-x-2">
                            <div
                                title='Close'
                                className="relative size-6 xl:size-8 bg-accent-500/0 rounded-lg flex items-center justify-center dark:shadow-lg cursor-pointer group transition-all duration-300"
                            >
                                <img
                                    src={indellidesk}
                                    className="size-6 xl:size-8 text-secondary-400 dark:text-secondary-600 group-hover:hidden"
                                    alt="logo"
                                />
                                <PanelLeftClose
                                    onClick={togglePanel}
                                    className='text-secondary-600 dark:text-secondary-200 transition-colors hover:text-accent-600 dark:hover:text-accent-400'
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className={`${panelOpen ? 'opacity-100' : 'opacity-0'} flex items-center space-x-2 transition-opacity duration-300`}>
                            {/* Search Button */}
                            <button
                                onClick={() => setSearchOn(true)}
                                className={`${searchON ? 'hidden' : ''} p-2 rounded-lg hover:bg-primary-100/10 dark:hover:bg-primary-400/40 transition-all duration-200 group relative focus:ring-none focus:outline-none`}
                                title="Search conversations"
                                aria-label="Search conversations"
                            >
                                <svg
                                    className="w-5 h-5 text-secondary-500 group-hover:text-accent-600 dark:text-secondary-400 dark:group-hover:text-accent-400 transition-colors duration-200 stroke-current dark:stroke-accent-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Search Bar (Hidden by default) */}
                    <div className={`${searchON ? 'animate-slideDown' : 'hidden'} mt-3`}>
                        <div className="relative">
                            <input
                                ref={searchInput}
                                id='searchInput'
                                type="text"
                                autoFocus
                                onInput={searchChats}
                                placeholder="Search conversations..."
                                className={`${panelOpen ? 'w-full' : 'w-0 opacity-0'} text-primary-950 dark:text-white w-full pl-10 pr-4 py-2 bg-white dark:bg-primary-800 border border-secondary-200 dark:border-primary-300/80 rounded-xl focus:outline-none focus:ring-none focus:ring-accent-500/50 dark:focus:ring-accent-400/50 focus:border-accent-500 dark:focus:border-accent-400 text-sm transition-all duration-300 placeholder:text-secondary-400 dark:placeholder:text-secondary-200`}
                            />
                            <svg
                                className="absolute left-3 top-2.5 w-4 h-4 text-accent-500 dark:stroke-accent-100 pointer-events-none"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>

                            {/* Clear search button */}
                            {searchON && (
                                <button
                                    onClick={() => {
                                        setSearchOn(false);
                                        if (searchInput.current) {
                                            searchInput.current.value = '';
                                            searchChats({ target: { value: '' } });
                                        }
                                    }}
                                    className="absolute right-3 top-2 text-secondary-400 hover:text-accent-600 dark:text-secondary-200 dark:hover:text-accent-400 transition-colors focus:outline-none"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <section data-action="options" className='ml-1 mt-0 space-y-1 text-gray-800 dark:text-white'>
                    {/* New Chat - Improved */}
                    <div
                        onClick={() => globalEventBus.emit('conversation:new', false)}
                        id="new-chat"
                        className="group flex items-center rounded-lg gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-primary-600 p-0.5 transition-all duration-200 ease-in-out"
                    >
                        <div className="flex items-center justify-center w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            <FiPlus size={18} strokeWidth={1.5} />
                        </div>
                        <div className={`${panelOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} truncate text-sm font-medium transition-opacity duration-200`}>
                            New chat
                        </div>
                    </div>

                    {/* Temporary Chat - Improved */}
                    <div
                        onClick={() => globalEventBus.emit('conversation:new', true)}
                        className="group flex items-center rounded-lg gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-primary-600 p-0.5 transition-all duration-200 ease-in-out"
                    >
                        <div className="flex items-center justify-center w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            <BsIncognito size={16} />
                        </div>
                        <div className={`${panelOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} truncate text-sm font-medium transition-opacity duration-200`}>
                            Temporary chat
                        </div>
                        <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-primary-100/30 text-gray-500 dark:text-gray-400">
                            Beta
                        </span>
                    </div>

                    {/* Search in Chats - Improved */}
                    <div
                        onClick={() => setSearchOn(true)}
                        className="group flex items-center rounded-lg gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-primary-600 p-0.5 transition-all duration-200 ease-in-out"
                    >
                        <div className="flex items-center justify-center w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            <FiSearch size={18} strokeWidth={1.5} />
                        </div>
                        <div className={`${panelOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} truncate text-sm font-medium transition-opacity duration-200`}>
                            Search in chats
                        </div>
                        <kbd className="ml-auto hidden sm:inline-flex text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-primary-100/30 text-gray-500 dark:text-gray-400 font-mono">
                            ⌘K
                        </kbd>
                    </div>

                    {/* Divider for additional options */}
                    <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>

                    {/* Clear Conversations - Example additional option */}
                    <div
                        onClick={() => {/* clear logic */ }}
                        className="hidden group flex items-center rounded-lg gap-3 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 p-0.5 transition-all duration-200 ease-in-out"
                    >
                        <div className="flex items-center justify-center w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                            <FiTrash2 size={16} strokeWidth={1.5} />
                        </div>
                        <div className={`${panelOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} truncate text-sm font-medium group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors`}>
                            Clear conversations
                        </div>
                    </div>

                    {/* Settings - Example additional option */}
                    <div
                        onClick={() => globalEventBus.emit('setting:toggle')}
                        className="group flex items-center rounded-lg p-0.5 gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-primary-600 transition-all duration-200 ease-in-out"
                    >
                        <div className="flex items-center justify-center w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                            <RiSettings3Line size={16} />
                        </div>
                        <div className={`${panelOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} truncate text-sm font-medium transition-opacity duration-200`}>
                            Settings
                        </div>
                    </div>
                </section>
                <div className={`${panelOpen ? '' : 'opacity-0'}`}>
                    <h2 className="text-sm mt-2 ml-3 underline font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                        Chats
                    </h2>
                </div>
                {/* Conversations List */}
                <ChatsList conversationsRef={conversationsRef} searchON={searchON} panelOpen={panelOpen} />
                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 py-2 px-4 bg-gradient-to-t from-white/80 to-transparent dark:from-gray-900/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-between text-xs">
                        <span className={`${panelOpen ? '' : 'hidden'} text-gray-500 dark:text-gray-400`}>
                            Powered by IntelliDesk
                        </span>
                        <button
                            onClick={() => globalEventBus.emit('setting:toggle')}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 focus:outline-none focus:ring-none"
                            title="Settings"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                        <button onClick={togglePanel} className={`${panelOpen ? 'rotate-180' : 'opacity-0'} h-6 w-6 transition-opacity duration-700 cursor-w-resize focus:outline-none focus:ring-none`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className='fill-gray-500 dark:fill-gray-400' viewBox="0 0 640 640"><path d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z" /></svg>
                        </button>
                    </div>
                </div>

                <ErrorBoundary>
                    <ChatContextMenu isOpen={true} onToggle={null} />
                </ErrorBoundary>
            </div>
        </>
    );
};
