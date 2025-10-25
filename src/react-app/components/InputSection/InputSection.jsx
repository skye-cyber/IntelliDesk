import React, { useEffect } from 'react';

export const InputSection = ({ onSendMessage, onToggleCanvas }) => {
    useEffect(() => {
        //const element = document.getElementById('userInput');
        //element.a
        //console.log(element);
    }, []);

    return (
        <div id="userInput-wrapper" className="absolute flex left-0 lg:left-auto w-full lg:items-center lg:justify-center z-30 bottom-[2%] transition-all duration-1000">
            <section className="relative w-full lg:w-[70vw] flex space-x-4  transition-all duration-700">
                {/* Custom input field */}
                <div id="userInput"
                    contentEditable="true"
                    role="textbox"
                    aria-label="Message input"
                    autoFocus
                    data-placeholder="Message IntelliDesk 💫 To generate an image, start with `/image`"
                    value="this.textContent()"
                    className="w-full overflow-auto scrollbar-hide py-1 px-[4%] md:py-3 md:pl-[2%] md:pr-[7%] border border-teal-400 dark:border-teal-600 rounded-lg focus:outline-none dark:outline-teal-600 focus:border-2 bg-gray-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-700 dark:text-white max-h-[28vh] pb-2 transition-all duration-1000"></div>

                <section className="absolute right-[0.5px] bottom-0 p-1 flex w-full rounded-b-md dark:border-teal-600 shadow-xl">
                    {/* Tools section (Attach Files and Preview) */}
                    <div className="flex px-3">
                        <div id="AttachFiles" className="flex rounded-lg" title="Attach files">
                            <button aria-label="Attach files" className="flex items-center justify-center h-8 w-8 rounded-lg rounded-bl-xl text-token-text-primary dark:text-white dark:hover:text-blue-400 focus-visible:outline-black dark:focus-visible:outline-white hover:bg-black/20">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http:/*www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M9 7C9 4.23858 11.2386 2 14 2C16.7614 2 19 4.23858 19 7V15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15V9C5 8.44772 5.44772 8 6 8C6.55228 8 7 8.44772 7 9V15C7 17.7614 9.23858 20 12 20C14.7614 20 17 17.7614 17 15V7C17 5.34315 15.6569 4 14 4C12.3431 4 11 5.34315 11 7V15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15V9C13 8.44772 13.4477 8 14 8C14.5523 8 15 8.44772 15 9V15C15 16.6569 13.6569 18 12 18C10.3431 18 9 16.6569 9 15V7Z" fill="currentColor"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <div style={{ viewTransitionName: 'var(--vt-composer-reason-action)' }}>
                            <div>
                            {/* Toggle button with aria-pressed to indicate state */}
                            <button id="previewBtn"
                                    className="flex h-9 min-w-8 items-center justify-center rounded-full border p-2 text-[13px] font-medium
                                            border-sky-900 bg-blue-100 hover:bg-sky-300 dark:border-[#aa55ff] dark:bg-[#171717] dark:hover:bg-[#225]
                                            text-gray-900 dark:text-white transition-colors duration-1000"
                                    aria-pressed="false"
                                    aria-label="Preview">
                                <div className="h-[18px] w-[18px]">
                                <svg fill="none" viewBox="0 0 24 24" xmlns="http:/*www.w3.org/2000/svg">
                                    <path className="fill-current"
                                        d="M12 3c-3.585 0-6.5 2.9225-6.5 6.5385 0 2.2826 1.162 4.2913 2.9248 5.4615h7.1504c1.7628-1.1702 2.9248-3.1789 2.9248-5.4615 0-3.6159-2.915-6.5385-6.5-6.5385zm2.8653 14h-5.7306v1h5.7306v-1zm-1.1329 3h-3.4648c0.3458 0.5978 0.9921 1 1.7324 1s1.3866-0.4022 1.7324-1zm-5.6064 0c0.44403 1.7252 2.0101 3 3.874 3s3.43-1.2748 3.874-3c0.5483-0.0047 0.9913-0.4506 0.9913-1v-2.4593c2.1969-1.5431 3.6347-4.1045 3.6347-7.0022 0-4.7108-3.8008-8.5385-8.5-8.5385-4.6992 0-8.5 3.8276-8.5 8.5385 0 2.8977 1.4378 5.4591 3.6347 7.0022v2.4593c0 0.5494 0.44301 0.9953 0.99128 1z"
                                        clipRule="evenodd" fillRule="evenodd"></path>
                                </svg>
                                </div>
                                <div className="whitespace-nowrap pl-1 pr-1">Preview</div>
                            </button>
                            </div>
                        </div>
                        <button id="microphone" className="mx-2">
                            <svg id="microphoneSVG" xmlns="http:/*www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" className="stroke-blue-600 dark:stroke-cyan-400 hover:stroke-sky-800 dark:hover:stroke-sky-200 w-6 h-6 transition-colors duration-1000">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                            </svg>
                        </button>

                        {/* Toolbar button with SVG icon */}
                        <button
                        id='diagToggle'
                        className="px-1 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-300 bg-blue-200 dark:bg-teal-700 rounded-md"
                        aria-label="Open Diagram modal"
                        title="Open Diagram modal">
                        {/* SVG: Nodes/Flow Diagram */}
                            <svg xmlns="http:/*www.w3.org/2000/svg" className="h-6 w-8 text-gray-800 dark:text-gray-100 transition-colors duration-1000" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <circle cx="5" cy="12" r="2" strokeWidth="2" />
                                <circle cx="12" cy="5" r="2" strokeWidth="2" />
                                <circle cx="12" cy="19" r="2" strokeWidth="2" />
                                <circle cx="19" cy="12" r="2" strokeWidth="2" />
                                <path d="M7 12h4M13 5v2M13 19v-2M17 12h-4" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>

                        {/*Image Generation Toggle tool*/}
                        <button id="image-gen" className="hidden sm:flex items-center bg-[#ffaa7f] dark:bg-orange-400 justify-center text-sm font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md hover:scale-105 hover:shadow-lg dark:shadow-none dark:text-blue-950 h-10 rounded-full gap-2 text-black px-2 py-1 focus:ring-none transform transition-all duration-700 ease-in-out border border-black" type="button" aria-pressed="false" aria-label="Image Gen">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http:/*www.w3.org/2000/svg" className="h-4 w-4">
                                <path d="M2.5 1H12.5C13.3284 1 14 1.67157 14 2.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V2.5C1 1.67157 1.67157 1 2.5 1ZM2.5 2C2.22386 2 2 2.22386 2 2.5V8.3636L3.6818 6.6818C3.76809 6.59551 3.88572 6.54797 4.00774 6.55007C4.12975 6.55216 4.24568 6.60372 4.32895 6.69293L7.87355 10.4901L10.6818 7.6818C10.8575 7.50607 11.1425 7.50607 11.3182 7.6818L13 9.3636V2.5C13 2.22386 12.7761 2 12.5 2H2.5ZM2 12.5V9.6364L3.98887 7.64753L7.5311 11.4421L8.94113 13H2.5C2.22386 13 2 12.7761 2 12.5ZM12.5 13H10.155L8.48336 11.153L11 8.6364L13 10.6364V12.5C13 12.7761 12.7761 13 12.5 13ZM6.64922 5.5C6.64922 5.03013 7.03013 4.64922 7.5 4.64922C7.96987 4.64922 8.35078 5.03013 8.35078 5.5C8.35078 5.96987 7.96987 6.35078 7.5 6.35078C7.03013 6.35078 6.64922 5.96987 6.64922 5.5ZM7.5 3.74922C6.53307 3.74922 5.74922 4.53307 5.74922 5.5C5.74922 6.46693 6.53307 7.25078 7.5 7.25078C8.46693 7.25078 9.25078 6.46693 9.25078 5.5C9.25078 4.53307 8.46693 3.74922 7.5 3.74922Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                            </svg>
                            <span className="text-xs">Image Gen</span>
                        </button>

                        {/* Open Canvas */}
                        <button id="CanvasOpen" onClick={onToggleCanvas} className="group hidden sm:flex items-center gap-3 px-2 py-1 rounded-full bg-white dark:bg-slate-700 text-blue-600 dark:text-teal-300 border border-blue-300 dark:border-gray-500 shadow-md hover:shadow-lg transition-all duration-500" aria-pressed="false">
                            <span id="iconContainer" className="transition-transform duration-300">
                                <svg id="plusIcon" className="w-6 h-6 transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                <svg id="closeIcon" className="w-6 h-6 hidden transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </span>
                            <span className="text-md font-semibold tracking-wide select-none">&lt;/&gt; canvas</span>
                        </button>

                        {/* Triple Ripple with Gradient Border */}
                        <button id="sendBtn" onClick={onSendMessage} className="absolute right-2 h-14 w-14 bottom-4 rounded-full transition-all ease-in-out duration-1000 z-50 bg-white border border-gray-200 bg-gradient-to-br from-[#00246c] dark:from-[#a800fc] to-[#008dd3] dark:to-indigo-900 overflow-hidden" aria-label="Send message" title="Send message">
                            <div id="normalSend" className=" flex items-center justify-center h-full w-full">
                            {/* Alternative Send Icon with a warm gradient */}
                                <svg className="w-8 h-8" viewBox="0 0 24 24" xmlns="http:/*www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="planeGradient2" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#ff8a65" />
                                    <stop offset="100%" stopColor="#ff7043" />
                                    </linearGradient>
                                </defs>
                                <path fill="url(#planeGradient2)" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                </svg>
                            </div>
                            <div id="spinningSquares" className="hidden absolute inset-0 flex items-center justify-center">
                                <span className="ripple-single-1 ripple-single-1"></span>
                                <span className="ripple-single-2 ripple-single-2"></span>
                                <span className="ripple-single-3 ripple-single-3"></span>
                            </div>
                        </button>
                    </div>

                </section>

            </section>
        </div>
    );
};
