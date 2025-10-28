import React, { useCallback, useEffect, useState } from 'react';
import { opendiagViewModal, closediagViewModal } from '@js/diagraming/Utils.js';
import { showDropZoneModal } from '@components/DropZone/util.js'

export const InputSection = ({ onSendMessage, onToggleCanvas, onToggleRecording }) => {
    // State management for the toggle
    const [isCanvasOpen, setIsCanvasOpen] = useState(false);
    const [isAIActive, setIsAIActive] = useState(false);

    useEffect(() => {
        //const element = document.getElementById('userInput');
        //element.a
        //console.log(element);
    }, []);

    const showApiNotSetWarning = useCallback(() => {
        const ApiwarnModal = document.getElementById('ApiNotSetModal');
        const ApiWarnContent = document.getElementById('ApiNotSetContent');
        ApiwarnModal.classList.remove('hidden');
        ApiWarnContent.classList.remove('animate-exit');
        ApiWarnContent.classList.add('animate-enter')
    })

    const handleSendMessage = useCallback(() => {
        if (document.getElementById('mistralKey').value || document.getElementById('huggingfaceKey').value) {
            onSendMessage()
        } else {
            showApiNotSetWarning()
        }
    })


    /*
     * const onToggleCanvas = () => {
        const newState = !isCanvasOpen;
        setIsCanvasOpen(newState);

        // Toggle icons
        const plusIcon = document.getElementById('plusIcon');
        const closeIcon = document.getElementById('closeIcon');
        const button = document.getElementById('ToggleCanvasBt');

        if (newState) {
            plusIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
            button.setAttribute('aria-pressed', 'true');
            button.classList.add('border-blue-500', 'dark:border-teal-400');
        } else {
            plusIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            button.setAttribute('aria-pressed', 'false');
            button.classList.remove('border-blue-500', 'dark:border-teal-400');
        }
    };
    */

    const shouldToggleCanvas = useCallback((event) => {
        //if (!event) return;

        event.stopPropagation();

        // Check if the click was on the AI toggle checkbox or its label
        const aiToggleElement = document.getElementById('aiCanvasToggle');
        const clickedElement = event.target;

        // Check if the click was directly on the checkbox or within its label
        const isAIToggleClick = aiToggleElement?.contains(clickedElement) ||
            clickedElement === aiToggleElement ||
            clickedElement.htmlFor === 'aiCanvasToggle';

        if (isAIToggleClick) {
            // Let the checkbox handle its own change event
            console.log('AI toggle clicked - letting checkbox handle');
            return; // Don't toggle canvas when AI checkbox is clicked
        } else {
            // Toggle the canvas for any other part of the button
            console.log('Canvas area clicked - toggling canvas');
            onToggleCanvas(); // Your canvas toggle function
        }
    }, [onToggleCanvas]); // Add dependencies

    const onAICanvasToggle = (event) => {
        const isChecked = event.target.checked;
        setIsAIActive(isChecked);

        const aiStatusDot = document.getElementById('aiStatusDot');
        const aiStatusText = document.getElementById('aiStatusText');
        const aiToggleRing = document.getElementById('aiToggleRing');
        const aiActivePulse = document.getElementById('aiActivePulse');
        const checkmark = event.target.nextElementSlection.querySelector('svg');
        const glow = event.target.nextElementSlection.querySelector('div:last-child');

        if (isChecked) {
            // AI Active state
            aiStatusDot.classList.remove('bg-gray-400');
            aiStatusDot.classList.add('bg-green-500', 'animate-pulse');
            aiStatusText.textContent = 'AI active';
            aiStatusText.classList.add('text-green-600', 'dark:text-green-400');
            aiToggleRing.classList.add('opacity-100', 'animate-ping');
            aiActivePulse.classList.add('opacity-20');
            checkmark.classList.remove('opacity-0', 'scale-50');
            glow.classList.add('opacity-30');
        } else {
            // AI Inactive state
            aiStatusDot.classList.add('bg-gray-400');
            aiStatusDot.classList.remove('bg-green-500', 'animate-pulse');
            aiStatusText.textContent = 'AI ready';
            aiStatusText.classList.remove('text-green-600', 'dark:text-green-400');
            aiToggleRing.classList.remove('opacity-100', 'animate-ping');
            aiActivePulse.classList.remove('opacity-20');
            checkmark.classList.add('opacity-0', 'scale-50');
            glow.classList.remove('opacity-30');
        }
    };
    return (
        <div id="userInput-wrapper" className="absolute flex justify-center left-0 lg:left-auto w-full lg:items-center lg:justify-center z-30 bottom-[2%] transition-all duration-1000">
            <section className="relative w-full sm:w-[70vw] xl:w-[50vw] space-x-4 transition-all duration-700">
                {/* Custom input field */}
                <div id="userInput"
                    contentEditable="true"
                    role="textbox"
                    aria-label="Message input"
                    autoFocus
                    data-placeholder="Message IntelliDesk 💫"
                    value="this.textContent()"
                    className="w-full overflow-auto scrollbar-hide py-1 px-[4%] md:py-3 md:pl-[2%] md:pr-[7%] border border-teal-400 dark:border-teal-600 rounded-lg focus:outline-none dark:outline-teal-600 focus:border-2 bg-gray-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-700 dark:text-white max-h-[28vh] pb-2 transition-all duration-1000"></div>

                <section id="userInputSection" className="absolute right-[0.5px] -bottom-2 p-0 flex w-full rounded-b-md dark:border-teal-600 shadow-xl justify-between w-full">
                    <section className='flex'>
                        {/* Left side: File and Media Tools */}
                        <div className="flex items-center space-x-1 bg-white/0 dark:bg-gray-800/0 rounded-lg px-0 py-0 mr-0">
                            {/* File Attachment */}
                            <div onClick={showDropZoneModal} id="AttachFiles" className="flex items-center rounded-lg" title="Attach files">
                                <button aria-label="Attach files" className="flex items-center justify-center h-8 w-8 rounded-lg text-token-text-primary dark:text-white dark:hover:text-blue-400 focus-visible:outline-black dark:focus-visible:outline-white hover:bg-black/20 transition-colors duration-300">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M9 7C9 4.23858 11.2386 2 14 2C16.7614 2 19 4.23858 19 7V15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15V9C5 8.44772 5.44772 8 6 8C6.55228 8 7 8.44772 7 9V15C7 17.7614 9.23858 20 12 20C14.7614 20 17 17.7614 17 15V7C17 5.34315 15.6569 4 14 4C12.3431 4 11 5.34315 11 7V15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15V9C13 8.44772 13.4477 8 14 8C14.5523 8 15 8.44772 15 9V15C15 16.6569 13.6569 18 12 18C10.3431 18 9 16.6569 9 15V7Z" fill="currentColor"></path>
                                    </svg>
                                </button>
                            </div>

                            {/* Voice Recording */}
                            <button id="microphone" onClick={onToggleRecording} className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-black/20 transition-colors duration-300" title="Voice recording">
                                <svg id="microphoneSVG" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" className="stroke-blue-600 dark:stroke-cyan-400 hover:stroke-sky-800 dark:hover:stroke-sky-200 w-5 h-5 transition-colors duration-300">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                                </svg>
                            </button>
                        </div>

                        {/* Center: Creation & Visualization Tools */}
                        <div className="flex items-center space-x-1 bg-white/0 dark:bg-gray-800/0 rounded-lg px-2 py-1">
                            {/* Image Generation */}
                            <button id="image-gen" className="hidden xs:flex items-center justify-center text-sm font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md hover:scale-105 hover:shadow-lg dark:shadow-none dark:text-blue-950 h-8 rounded-full gap-1 text-black px-2 py-1 focus:ring-none transform transition-all duration-300 ease-in-out border border-black sm:bg-[#ffaa7f] dark:bg-orange-400" type="button" aria-pressed="false" aria-label="Generate image" title="Generate image">
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                    <path d="M2.5 1H12.5C13.3284 1 14 1.67157 14 2.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V2.5C1 1.67157 1.67157 1 2.5 1ZM2.5 2C2.22386 2 2 2.22386 2 2.5V8.3636L3.6818 6.6818C3.76809 6.59551 3.88572 6.54797 4.00774 6.55007C4.12975 6.55216 4.24568 6.60372 4.32895 6.69293L7.87355 10.4901L10.6818 7.6818C10.8575 7.50607 11.1425 7.50607 11.3182 7.6818L13 9.3636V2.5C13 2.22386 12.7761 2 12.5 2H2.5ZM2 12.5V9.6364L3.98887 7.64753L7.5311 11.4421L8.94113 13H2.5C2.22386 13 2 12.7761 2 12.5ZM12.5 13H10.155L8.48336 11.153L11 8.6364L13 10.6364V12.5C13 12.7761 12.7761 13 12.5 13ZM6.64922 5.5C6.64922 5.03013 7.03013 4.64922 7.5 4.64922C7.96987 4.64922 8.35078 5.03013 8.35078 5.5C8.35078 5.96987 7.96987 6.35078 7.5 6.35078C7.03013 6.35078 6.64922 5.96987 6.64922 5.5ZM7.5 3.74922C6.53307 3.74922 5.74922 4.53307 5.74922 5.5C5.74922 6.46693 6.53307 7.25078 7.5 7.25078C8.46693 7.25078 9.25078 6.46693 9.25078 5.5C9.25078 4.53307 8.46693 3.74922 7.5 3.74922Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                </svg>
                                <span className="text-xs hidden md:inline">Image</span>
                            </button>

                            {/* Diagram/Flow Tool */}
                            <button
                                id='diagToggle'
                                onClick={opendiagViewModal}
                                className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-300"
                                aria-label="Create diagram"
                                title="Create diagram">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 dark:text-gray-100 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <circle cx="5" cy="12" r="2" strokeWidth="2" />
                                    <circle cx="12" cy="5" r="2" strokeWidth="2" />
                                    <circle cx="12" cy="19" r="2" strokeWidth="2" />
                                    <circle cx="19" cy="12" r="2" strokeWidth="2" />
                                    <path d="M7 12h4M13 5v2M13 19v-2M17 12h-4" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>

                            {/* Preview Button */}
                            <button id="previewBtn"
                                className="hidden xs:flex h-8 min-w-8 items-center justify-center rounded-full border p-2 text-[13px] font-medium
                                    border-sky-900 bg-blue-100 hover:bg-sky-300 dark:border-[#aa55ff] dark:bg-[#171717] dark:hover:bg-[#225]
                                    text-gray-900 dark:text-white transition-colors duration-300"
                                aria-pressed="false"
                                aria-label="Preview content"
                                title="Preview content">
                                <div className="h-[18px] w-[18px]">
                                    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path className="fill-current"
                                            d="M12 3c-3.585 0-6.5 2.9225-6.5 6.5385 0 2.2826 1.162 4.2913 2.9248 5.4615h7.1504c1.7628-1.1702 2.9248-3.1789 2.9248-5.4615 0-3.6159-2.915-6.5385-6.5-6.5385zm2.8653 14h-5.7306v1h5.7306v-1zm-1.1329 3h-3.4648c0.3458 0.5978 0.9921 1 1.7324 1s1.3866-0.4022 1.7324-1zm-5.6064 0c0.44403 1.7252 2.0101 3 3.874 3s3.43-1.2748 3.874-3c0.5483-0.0047 0.9913-0.4506 0.9913-1v-2.4593c2.1969-1.5431 3.6347-4.1045 3.6347-7.0022 0-4.7108-3.8008-8.5385-8.5-8.5385-4.6992 0-8.5 3.8276-8.5 8.5385 0 2.8977 1.4378 5.4591 3.6347 7.0022v2.4593c0 0.5494 0.44301 0.9953 0.99128 1z"
                                            clipRule="evenodd" fillRule="evenodd"></path>
                                    </svg>
                                </div>
                                <div className="whitespace-nowrap pl-1 pr-1 hidden md:inline">Preview</div>
                            </button>
                        </div>

                        {/* Right side: AI & Canvas Tools */}
                        <div className="hidden xs:flex items-center space-x-1 bg-white/0 dark:bg-gray-800/0 rounded-lg px-2 py-1 mr-2">
                            {/* Multi-Purpose Canvas Toggle */}
                            <button
                                id="ToggleCanvasBt"
                                onClick={shouldToggleCanvas}
                                className="group flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 text-blue-700 dark:text-teal-300 border-2 border-blue-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
                                aria-pressed="false"
                                title="Toggle AI Canvas"
                            >
                                {/* Animated background pulse when AI is active */}
                                <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-emerald-300 dark:from-green-800 dark:to-emerald-700 opacity-0 transition-opacity duration-300"
                                    id="aiActivePulse"></div>

                                {/* AI Toggle Indicator */}
                                <div className="relative flex items-center justify-center">
                                    <div id="aiToggleRing" className="absolute w-5 h-5 border-2 border-blue-300 dark:border-teal-400 rounded-full transition-all duration-300 opacity-0 scale-125"></div>
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
                                {/* Text and AI Status */}
                                <div className="flex flex-col items-start min-w-fit">
                                    <div className='flex gap-2'>
                                        <span className="text-[12px] font-bold tracking-wide select-none whitespace-nowrap inline">&lt;/&gt; <span className='hidden xs:inline'>Canvas</span></span>
                                    </div>
                                    {/* AI Toggle Status */}
                                    <div className='flex justify-between'>
                                        <div className="hidden xs:flex items-center gap-1 transition-all duration-300 opacity-60 group-hover:opacity-100">
                                            <div id="aiStatusDot" className="w-1.5 h-1.5 bg-gray-400 rounded-full transition-all duration-300"></div>
                                            <span id="aiStatusText" className="text-[9.5px] font-medium text-gray-600 dark:text-gray-300 transition-all duration-300">AI ready</span>
                                        </div>

                                        {/* Mini Checkbox Indicator */}
                                        <div className="relative flex ml-0.5">
                                            <input
                                                type="checkbox"
                                                id="aiCanvasToggle"
                                                className="absolute opacity-0 w-0 h-0"
                                                onChange={onAICanvasToggle}
                                            />
                                            <label
                                                htmlFor="aiCanvasToggle"
                                                className="relative flex items-center justify-center w-4 h-4 border-2 border-blue-400 dark:border-teal-400 rounded bg-white dark:bg-slate-700 transition-all duration-300 cursor-pointer group/checkbox hover:border-blue-600 dark:hover:border-teal-300"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {/* Checkmark */}
                                                <svg
                                                    className="w-2.5 h-2.5 text-green-600 dark:text-teal-400 opacity-0 transition-all duration-200 scale-50"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                                {/* Glow effect when checked */}
                                                <div className="absolute inset-0 rounded bg-green-500 dark:bg-teal-500 opacity-0 scale-150 transition-all duration-300 blur-sm"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </section>

                    <section>
                        {/* Send Button - Always prominent */}
                        <button id="sendBtn" onClick={handleSendMessage} className="flex relative items-center justify-center h-12 w-12 rounded-full transition-all ease-in-out duration-300 z-50 bg-white border border-gray-200 bg-gradient-to-br from-[#00246c] dark:from-[#a800fc] to-[#008dd3] dark:to-indigo-900 overflow-hidden shadow-lg hover:scale-110 hover:shadow-xl ml-2" aria-label="Send message" title="Send message">
                            <div id="normalSend" className="flex items-center justify-center h-full w-full">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="planeGradient2" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#ff8a65" />
                                            <stop offset="100%" stopColor="#ff7043" />
                                        </linearGradient>
                                    </defs>
                                    <path fill="url(#planeGradient2)" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </div>
                            <div id="spinningSquares" className="hidden absolute inset-0 flex items-center justify-center">
                                <span className="ripple-single-1"></span>
                                <span className="ripple-single-2"></span>
                                <span className="ripple-single-3"></span>
                            </div>
                        </button>
                    </section>
                </section>
            </section>
        </div>
    );
};
