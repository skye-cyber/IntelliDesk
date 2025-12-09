import React, { useEffect, useCallback, useRef, useState } from 'react';
import { ChatManager } from '@js/managers/ConversationManager/ChatManager';
import indellidesk from '@assets/intellidesk.png';
import { waitForElement } from '../../../renderer/js/Utils/dom_utils';
import { ChatOptions } from '@components/Chat/ChatOptions.jsx';
import ErrorBoundary from '@components/ErrorBoundary/ErrorBoundary';
import { ClosePrefixed } from '../../../renderer/js/react-portal-bridge';
import { ChatUtil } from '../../../renderer/js/managers/ConversationManager/util';
import { MessageList } from '../Chat/MessageList';

const chatutil = new ChatUtil()

window.StateManager.set("sidebar-open", false)

const Manager = new ChatManager();
export const StartNewConversation = (model, details = {}) => {
    // Clear chatArea
    ClosePrefixed()
    //Display suggestion
    document.getElementById('suggestions')?.classList?.remove('hidden')
    const event = new CustomEvent("NewConversation", {
        detail: details
    })

    document.dispatchEvent(event)

    window.desk.api.setModel(model)
}


export const Sidebar = ({ isOpen, onToggle }) => {
    const refs = useRef({
        isOpen: null,
        conversations: []
    });

    useEffect(() => {
        const ConversationSection = document.getElementById('conversations');
        setTimeout(() => {
            Manager.fetchConversations(ConversationSection);
        }, 2000)

    }, [isOpen]);

    const showPanel = useCallback(() => {
        onToggle();
        waitForElement('#conversationPane', (panel) => {
            panel.querySelectorAll('.verbose-hide').forEach(el => el.classList.remove('hidden'));
            panel.classList.remove('w-[40px]', 'md:w-[5vw]', 'lg:w-[4vw]')
            panel.classList.add('fixed', 'z-[41]', 'left-0', 'top-0', 'w-[250px]', 'md:relative', 'md:top-auto', 'md:left-auto', 'md:w-[25vw]', 'lg:w-[20vw]', 'md:block')

            waitForElement('#main-container-center', (container) => {
                if (container.classList.contains('md:w-[96vw]')) {
                    //container.classList.replace('w-[96vw]', 'w-[75vw]');
                    container.classList.remove('w-[calc(100vw-40px)]', 'md:w-[96vw]', 'lg:w-[94vw]')
                    container.classList.add('w-[100vw]', 'md:w-[calc(100vw-25vw)]', 'lg:w-[calc(100vw-20vw)]');
                }
            });
        });
        window.StateManager.set("sidebar-open", true)
    }, [onToggle]);

    const hidePanel = useCallback(() => {
        waitForElement('#conversationPane', (panel) => {
            panel.querySelectorAll('.verbose-hide').forEach(el => el.classList.add('hidden'));
            panel.classList.remove('fixed', 'z-[41]', 'left-0', 'top-0', 'w-[300px]', 'lg:relative', 'lg:top-auto', 'md:left-auto', 'md:w-[25vw]', 'lg:w-[20vw]', 'md:block')
            panel.classList.add('w-[40px]', 'md:w-[5vw]', 'lg:w-[4vw]')

            waitForElement('#main-container-center', (container) => {
                if (container.classList.contains('w-[100vw]')) {
                    container.classList.remove('w-[100vw]', 'md:w-[calc(100vw-25vw)]', 'lg:w-[calc(100vw-20vw)]')
                    container.classList.add('w-[calc(100vw-40px)]', 'md:w-[96vw]', 'lg:w-[94vw]');
                }
            });
        });
        window.StateManager.set("sidebar-open", false)
    }, []);

    const togglePanel = useCallback(() => {
        if (document.querySelector('.verbose-hide')?.classList?.contains('hidden')) {
            showPanel()
        } else {
            hidePanel()
        }
    })

    const showConversationOptions = useCallback(() => {
        const chatOptionsOverlay = document.getElementById('chatOptions-overlay');
        const chatOptions = document.getElementById('chatOptions');
        chatOptionsOverlay.classList.remove('hidden');
        chatOptions.classList.remove('animate-exit');
        chatOptions.classList.add('animate-enter');
    }, []);

    const shouldClosePanel = useCallback((e) => {
        if (document.getElementById('conversations')?.contains(e.target)) {
            document.getElementById('chat-container')?.classList.replace('mx-2', 'mx-36');
        }
    }, []);

    const showSearchInput = useCallback(() => {
        document.getElementById('search-container')?.classList.remove('hidden');
        document.getElementById('searchInput')?.focus();
        document.getElementById('search-chats')?.classList.add('hidden');
        document.getElementById('recent-chats')?.classList.add('hidden');
        document.getElementById('conversations')?.classList.replace('h-[64vh]', 'h-[60vh]')
    }, []);

    const hideSearchInput = useCallback(() => {
        document.getElementById('search-container')?.classList.add('hidden');
        document.getElementById('search-chats')?.classList.remove('hidden');
        document.getElementById('recent-chats')?.classList.remove('hidden');
        document.getElementById('conversations')?.classList.replace('h-[60vh]', 'h-[64vh]')
    }, []);

    const searchChats = useCallback((e) => {
        const value = e.target.value.trim().toLowerCase();
        //if (!value) return;

        const parts = value.split(/\s+/);
        const conversations = refs.current?.length ? refs.current : document.querySelectorAll('#chat-item');

        if (!conversations?.length) return;

        conversations.forEach(chat => {
            // Unhide items hidden by previous chat
            if (!value) return chat.classList.remove('hidden')

            //Perform search
            const name = chat.dataset?.name?.toLowerCase() || "";
            const id = chat.dataset?.id?.toLowerCase() || "";
            const highlight = chat.dataset?.highlight?.toLowerCase() || "";
            const match = parts.some(part => name.includes(part) || name.includes(part) || highlight.includes(part));
            chat.classList.toggle('hidden', !match);
        });
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (!document.getElementById('chatOptions-overlay')?.classList.contains('hidden')) return
                if (document.getElementById('searchInput')?.classList.contains('hidden')) {
                    hidePanel();
                }
                hideSearchInput();
            }
        };

        const handleClick = (e) => {
            e.stopPropagation()
            if (!document.getElementById('chatOptions-overlay')?.classList.contains('hidden')) return Manager.hideConversationOptions()

            if (!document.getElementById('conversationPane')?.contains(e.target) && !document.getElementById('modelButton')?.contains(e.taget) && !e.target?.role != 'menuitem') {
                hidePanel();
            }
        };




        document.addEventListener('keydown', handleEscape);
        //document.addEventListener('click', handleClick);
        document.addEventListener('close-panel', hidePanel);
        document.addEventListener('open-panel', showPanel);
        document.addEventListener('toggle-panel', togglePanel);

        return () => {
            document.removeEventListener('keydown', handleEscape);
            //document.removeEventListener('click', handleClick);
            document.removeEventListener('close-panel', hidePanel);
            document.removeEventListener('open-panel', showPanel);
            document.removeEventListener('toggle-panel', togglePanel);
        };
    }, [isOpen, hidePanel, showPanel, hideSearchInput]);


    return (
        <div
            id="conversationPane"
            onClick={shouldClosePanel}
            className="h-screen w-[40px] md:w-[5vw] lg:w-[4vw] border-x border-l-0 border-gray-200 dark:border-accent-700 bg-gradient-to-b from-slate-50 to-blue-50/30 dark:from-blend-900 dark:to-blend-900 transition-all duration-700 ease-in-out overflow-hidden"
        >
            {/* Header Section */}
            <section className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 p-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className=" relative size-6 xl:size-8 bg-blue-500/0 rounded-lg flex items-center justify-center dark:shadow-lg cursor-pointer group transition-all duration-300">
                            <img src={indellidesk} className="size-6 xl:size-8 text-gray-400 dark:text-gray-500 group-hover:hidden"></img>

                            <svg onClick={togglePanel} width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" data-rtl-flip="" className="icon max-md:hidden hidden group-hover:flex size-6 xl:size-8 fill-primary-300 dark:fill-white cursor-w-resize group">
                                <path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z">
                                </path>
                            </svg>
                            <span data-action='arial-title' className='absolute -bottom-4 z-[50] -left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-xs font-semibold text-primary-950 dark:text-gray-900 bg-primary-100/0 dark:bg-zinc-200 rounded-xl px-0.5 w-fit max-w-18 whitespace-pre font-handwriting'>Close Panel</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="verbose-hide hidden flex items-center space-x-2">
                        {/* Search Button */}
                        <button
                            onClick={showSearchInput}
                            id="search-chats"
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group"
                            title="Search conversations"
                            aria-label="Search conversations"
                        >
                            <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
                {/* Search Bar (Hidden by default) */}
                <div id="search-container" className="hidden mt-3">
                    <div className="relative">
                        <input
                            id='searchInput'
                            type="text"
                            autoFocus
                            onInput={searchChats}
                            placeholder="Search conversations..."
                            className="verbose-hide hidden text-primary-950 dark:text-white w-full pl-10 pr-4 py-2 bg-gray-200 dark:bg-gray-900 border border-secondary-400 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary-50/0 dark:focus:ring-blue-500 dark:focus:border-transparent text-sm transition-all duration-200"
                        />
                        <svg className="absolute left-3 top-2.5 w-4 h-4 text-accent-400 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </section>


            <section data-action="options" className='ml-1 mt-0 space-y-0.5 text-gray-800 dark:text-white'>
                <div onClick={() => {
                    StartNewConversation(
                        chatutil.get_multimodal_models().includes(window.currentModel)
                            ? 'multimodal'
                            : 'chat')

                }
                } id="new-chat" className="flex items-center rounded-lg flex min-w-0 items-center gap-1.5 cursor-pointer hover:bg-gray-200 p-1.5 dark:hover:bg-blend-600">
                    <div className="flex items-center justify-center group-disabled:opacity-50 group-data-disabled:opacity-50 icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon" aria-hidden="true">
                            <path d="M2.6687 11.333V8.66699C2.6687 7.74455 2.66841 7.01205 2.71655 6.42285C2.76533 5.82612 2.86699 5.31731 3.10425 4.85156L3.25854 4.57617C3.64272 3.94975 4.19392 3.43995 4.85229 3.10449L5.02905 3.02149C5.44666 2.84233 5.90133 2.75849 6.42358 2.71582C7.01272 2.66769 7.74445 2.66797 8.66675 2.66797H9.16675C9.53393 2.66797 9.83165 2.96586 9.83179 3.33301C9.83179 3.70028 9.53402 3.99805 9.16675 3.99805H8.66675C7.7226 3.99805 7.05438 3.99834 6.53198 4.04102C6.14611 4.07254 5.87277 4.12568 5.65601 4.20313L5.45581 4.28906C5.01645 4.51293 4.64872 4.85345 4.39233 5.27149L4.28979 5.45508C4.16388 5.7022 4.08381 6.01663 4.04175 6.53125C3.99906 7.05373 3.99878 7.7226 3.99878 8.66699V11.333C3.99878 12.2774 3.99906 12.9463 4.04175 13.4688C4.08381 13.9833 4.16389 14.2978 4.28979 14.5449L4.39233 14.7285C4.64871 15.1465 5.01648 15.4871 5.45581 15.7109L5.65601 15.7969C5.87276 15.8743 6.14614 15.9265 6.53198 15.958C7.05439 16.0007 7.72256 16.002 8.66675 16.002H11.3337C12.2779 16.002 12.9461 16.0007 13.4685 15.958C13.9829 15.916 14.2976 15.8367 14.5447 15.7109L14.7292 15.6074C15.147 15.3511 15.4879 14.9841 15.7117 14.5449L15.7976 14.3447C15.8751 14.128 15.9272 13.8546 15.9587 13.4688C16.0014 12.9463 16.0017 12.2774 16.0017 11.333V10.833C16.0018 10.466 16.2997 10.1681 16.6667 10.168C17.0339 10.168 17.3316 10.4659 17.3318 10.833V11.333C17.3318 12.2555 17.3331 12.9879 17.2849 13.5771C17.2422 14.0993 17.1584 14.5541 16.9792 14.9717L16.8962 15.1484C16.5609 15.8066 16.0507 16.3571 15.4246 16.7412L15.1492 16.8955C14.6833 17.1329 14.1739 17.2354 13.5769 17.2842C12.9878 17.3323 12.256 17.332 11.3337 17.332H8.66675C7.74446 17.332 7.01271 17.3323 6.42358 17.2842C5.90135 17.2415 5.44665 17.1577 5.02905 16.9785L4.85229 16.8955C4.19396 16.5601 3.64271 16.0502 3.25854 15.4238L3.10425 15.1484C2.86697 14.6827 2.76534 14.1739 2.71655 13.5771C2.66841 12.9879 2.6687 12.2555 2.6687 11.333ZM13.4646 3.11328C14.4201 2.334 15.8288 2.38969 16.7195 3.28027L16.8865 3.46485C17.6141 4.35685 17.6143 5.64423 16.8865 6.53613L16.7195 6.7207L11.6726 11.7686C11.1373 12.3039 10.4624 12.6746 9.72827 12.8408L9.41089 12.8994L7.59351 13.1582C7.38637 13.1877 7.17701 13.1187 7.02905 12.9707C6.88112 12.8227 6.81199 12.6134 6.84155 12.4063L7.10132 10.5898L7.15991 10.2715C7.3262 9.53749 7.69692 8.86241 8.23218 8.32715L13.2791 3.28027L13.4646 3.11328ZM15.7791 4.2207C15.3753 3.81702 14.7366 3.79124 14.3035 4.14453L14.2195 4.2207L9.17261 9.26856C8.81541 9.62578 8.56774 10.0756 8.45679 10.5654L8.41772 10.7773L8.28296 11.7158L9.22241 11.582L9.43433 11.543C9.92426 11.432 10.3749 11.1844 10.7322 10.8271L15.7791 5.78027L15.8552 5.69629C16.185 5.29194 16.1852 4.708 15.8552 4.30371L15.7791 4.2207Z"></path>
                        </svg>
                    </div>
                    <div className="verbose-hide hidden truncate">New chat</div>
                </div>
                <div onClick={() => {
                    StartNewConversation(
                        (chatutil.get_multimodal_models().includes(window.currentModel)
                            ? 'multimodal'
                            : 'chat'),
                        { type: "temporary" }
                    )

                }
                } className='flex items-center rounded-lg flex min-w-0 items-center cursor-pointer hover:bg-gray-200 px-1.5 dark:hover:bg-blend-600'>
                    <div className="flex justify-start items-center text-primary no-draggable hover:bg-token-surface-hover keyboard-focused:bg-token-surface-hover touch:h-10 touch:w-10 h-9 w-9  rounded-lg focus:outline-none disabled:opacity-50 rounded-full" aria-label="Turn on temporary chat">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" data-rtl-flip="" className="icon">
                            <path d="M4.52148 15.1664C4.61337 14.8108 4.39951 14.4478 4.04395 14.3559C3.73281 14.2756 3.41605 14.4295 3.28027 14.7074L3.2334 14.8334C3.13026 15.2324 3.0046 15.6297 2.86133 16.0287L2.71289 16.4281C2.63179 16.6393 2.66312 16.8775 2.79688 17.06C2.93067 17.2424 3.14825 17.3443 3.37402 17.3305L3.7793 17.3002C4.62726 17.2265 5.44049 17.0856 6.23438 16.8764C6.84665 17.1788 7.50422 17.4101 8.19434 17.558C8.55329 17.6348 8.9064 17.4062 8.9834 17.0473C9.06036 16.6882 8.83177 16.3342 8.47266 16.2572C7.81451 16.1162 7.19288 15.8862 6.62305 15.5815C6.50913 15.5206 6.38084 15.4946 6.25391 15.5053L6.12793 15.5277C5.53715 15.6955 4.93256 15.819 4.30566 15.9027C4.33677 15.8053 4.36932 15.7081 4.39844 15.6098L4.52148 15.1664Z"></path>
                            <path d="M15.7998 14.5365C15.5786 14.3039 15.2291 14.2666 14.9668 14.4301L14.8604 14.5131C13.9651 15.3633 12.8166 15.9809 11.5273 16.2572C11.1682 16.3342 10.9396 16.6882 11.0166 17.0473C11.0936 17.4062 11.4467 17.6348 11.8057 17.558C13.2388 17.2509 14.5314 16.5858 15.5713 15.6645L15.7754 15.477C16.0417 15.2241 16.0527 14.8028 15.7998 14.5365Z"></path>
                            <path d="M2.23828 7.58927C1.97668 8.34847 1.83496 9.15958 1.83496 10.0004C1.835 10.736 1.94324 11.4483 2.14551 12.1234L2.23828 12.4106C2.35793 12.7576 2.73588 12.9421 3.08301 12.8227C3.3867 12.718 3.56625 12.4154 3.52637 12.1088L3.49512 11.977C3.2808 11.3549 3.16508 10.6908 3.16504 10.0004C3.16504 9.30977 3.28072 8.64514 3.49512 8.02286C3.61476 7.67563 3.43024 7.2968 3.08301 7.17716C2.73596 7.05778 2.35799 7.24232 2.23828 7.58927Z"></path>
                            <path d="M16.917 12.8227C17.2641 12.9421 17.6421 12.7576 17.7617 12.4106C18.0233 11.6515 18.165 10.8411 18.165 10.0004C18.165 9.15958 18.0233 8.34847 17.7617 7.58927C17.642 7.24231 17.264 7.05778 16.917 7.17716C16.5698 7.2968 16.3852 7.67563 16.5049 8.02286C16.7193 8.64514 16.835 9.30977 16.835 10.0004C16.8349 10.6908 16.7192 11.3549 16.5049 11.977C16.3852 12.3242 16.5698 12.703 16.917 12.8227Z"></path>
                            <path d="M8.9834 2.95255C8.90632 2.59374 8.55322 2.3651 8.19434 2.44181C6.76126 2.74892 5.46855 3.41405 4.42871 4.33536L4.22461 4.52286C3.95829 4.77577 3.94729 5.19697 4.2002 5.46329C4.42146 5.69604 4.77088 5.73328 5.0332 5.56973L5.13965 5.4877C6.03496 4.63748 7.18337 4.0189 8.47266 3.74259C8.83177 3.66563 9.06036 3.31166 8.9834 2.95255Z"></path>
                            <path d="M15.5713 4.33536C14.5314 3.41405 13.2387 2.74892 11.8057 2.44181C11.4468 2.3651 11.0937 2.59374 11.0166 2.95255C10.9396 3.31166 11.1682 3.66563 11.5273 3.74259C12.7361 4.00163 13.8209 4.56095 14.6895 5.33048L14.8604 5.4877L14.9668 5.56973C15.2291 5.73327 15.5785 5.69604 15.7998 5.46329C16.0211 5.23026 16.0403 4.87903 15.8633 4.6254L15.7754 4.52286L15.5713 4.33536Z"></path>
                        </svg>
                    </div>
                    <div className="verbose-hide hidden truncate">Temporary chat</div>
                </div>

                <div className='flex items-center rounded-lg flex min-w-0 gap-1.5 items-center cursor-pointer hover:bg-gray-200 p-1.5 dark:hover:bg-blend-600'>
                    <svg className="text-blend-700 w-5 h-5 group-hover:text-primary-700 dark:text-gray-100 dark:group-hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <div className="verbose-hide hidden truncate">Search chats</div>
                </div>
            </section >

            <div className='verbose-hide hidden'>
                <h2 className="text-sm mt-2 ml-3 underline font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    Chats
                </h2>
            </div>
            {/* Conversations List */}
            <MessageList />
            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 py-2 px-4 bg-gradient-to-t from-white/80 to-transparent dark:from-gray-900/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between text-xs">
                    <span className="verbose-hide hidden text-gray-500 dark:text-gray-400">
                        Powered by IntelliDesk
                    </span>
                    <button
                        onClick={() => document.getElementById('settings').click()}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                        title="Settings"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                    <button onClick={() => document.getElementById('togglePane')?.click()} className='verbose-hide hidden h-6 w-6 hover:rotate-180 transition-all duration-700 cursor-w-resize focus:outline-none'>
                        <svg xmlns="http://www.w3.org/2000/svg" className='fill-cyan-400' viewBox="0 0 640 640"><path d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z" /></svg>
                    </button>
                </div>
            </div>

            <ErrorBoundary>
                <ChatOptions isOpen={true} onToggle={null} />
            </ErrorBoundary>
        </div >
    );
};
