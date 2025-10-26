import React, { useEffect, useState, useRef, useCallback } from 'react';

export const DropZone = ({ isOpen, onToggle }) => {

    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const isControlledCloseRef = useRef(false); // Track if WE initiated the close

    const refs = useRef({})


    // Handle opening
    useEffect(() => {
        if (isOpen) {
            //setShouldRender(true);
            // Wait for render then show with animation
            setTimeout(() => setIsVisible(true), 10);
        }
    }, [isOpen]);

    // Handle close animation then notify parent
    const handleClose = useCallback((notifyParent = true) => {
        closeRecording()
        setIsVisible(false);
        // Wait for animation to complete before unmounting
        setTimeout(() => {
            //setShouldRender(false);
            if (notifyParent) {
                onToggle(); // Only notify parent if this was user-initiated
            }
        }, 1000);
    }, [onToggle]);

    // Close when isOpen becomes false (only if WE didn't initiate it)
    useEffect(() => {
        if (!isOpen && isVisible && !isControlledCloseRef.current) {
            // This close was initiated by parent prop change
            handleClose(false); // Don't notify parent to avoid loop
        }
    }, [isOpen, isVisible, handleClose]);

    useEffect(() => {
        if (!isOpen) return;
    }, [])

    return (
        <div id="settingsModal" className="hidden fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 dark:bg-opacity-40 dark:bg-gray-900 transition-colors duration-1000" onclick="if (event.target.id === 'settingsModal') {this.classNameList.add('hidden');}">
            {/* Modal Content */}
            <div className="relative bg-[#ffaa7f] border-2 border-gray-200 dark:bg-[#171f30] dark:border-2 dark:border-[#28636f] dark:shadow-lg dark:shadow-[#22242e] shadow-xl p-6 rounded-lg w-full mx-2 md:mx-auto max-w-md lg:max-w-xl xl:max-w-2xl max-h-full transition-colors duration-1000">

                {/* Close Button */}
                <button id="closeModal" onclick="document.getElementById('settingsModal').classNameList.add('hidden')" className="absolute top-2 right-2 text-[#00557f] dark:text-[#00ffff] hover:text-gray-900 hover:rotate-45 transform duration-300 dark:hover:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokelinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Modal Title */}
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Settings</h2>

                {/*Scrollable content container*/}
                <section className="bg-[#fdfdfd]  dark:bg-zinc-800 overflow-auto max-h-[80vh] shadow-inner-md border-2 border-[#8f45ff] dark:border-[#2b3a59] rounded-md p-2 transition-colors transform duration-600 scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-cyan-600 dark:scrollbar-track-gray-950 dark:scrollbar-thumb-cyan-600 scroll-smooth">

                    <section className="mb-4 space-y-1" arial-label="Control Stection" title="Control Section">
                        <section className="grid grid-cols-2 grid-rows-2 md:grid-cols-3 mb-4 space-y-3">
                            {/* Theme Switching Option */}
                            <div className="flex items-center">
                                <label for="themeSwitch" className="text-gray-700 dark:text-gray-200">Theme</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input id="themeSwitch" type="checkbox" className="sr-only peer"></input>
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {/* AutoScroll option */}
                            <div className="flex items-center" title="scroll on content" aial-label="scroll on content">
                                <label for="AutoScroll" className="text-gray-700 dark:text-gray-200">Auto scroll</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input id="AutoScroll" checked type="checkbox" className="sr-only peer"></input>
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            {/* Image Generation model change */}
                            <div className="flex items-center">
                                <label className="relative inline-flex items-center cursor-pointer text-gray-700 dark:text-gray-200">Use Flux</label>
                                <label className="relative inline-flex items-center cursor-pointer" title="Change image generation model to FLUX">
                                    <input id="CModel" type="checkbox" className="sr-only peer"></input>
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {/* Body/ChatArea Animation Control Option */}
                            <div className="flex items-center" arial-label="Toggle spinning spher balls animation in the ChatArea" title="Toggle spinning spher balls animation in the ChatArea">
                                <label for="animationToggle" className="text-gray-700 dark:text-gray-200">Animation</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input name="animationToggle" id="animation-toggle" type="checkbox" className="sr-only peer"></input>
                                    <div id="animation-toggle-peer" className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </section>
                    </section>

                    {/*Misceleneous*/}

                    <div id="pref-inputSection" className="mb-6">
                        <label for="recommendations" className="block text-lg font-medium mb-2 text-gray-600 dark:text-gray-300 flex items-center transition-colors duration-1000">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokelinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m4 0h1M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            Enter Your &nbsp;<i> <span className="text-orange-500">wish</span></i> /<span className="text-pink-500"> infor</span>/<span className="text-purple-500"> preference</span>:
                        </label>
                        <section title="What would you like quickai to know about you? Tell me what you would want me to do for you and in what manner?" className="w-full rounded-lg border-2 border-blue-500 dark:border-blue-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 dark:bg-gray-700 transition-colors duration-1000">
                            <textarea id="pref-input" className="scrollbar-hide resize-none overflow-wrap w-full text-rose-950 dark:text-white pt-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 ring-none outline-none transition-colors duration-1000" placeholder="What would you like quickai to do or know about you?..." oninput="this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 28 * window.innerHeight / 100) + 'px'; this.scrollTop = this.scrollHeight;"></textarea>
                            <div className="flex justify-end">
                                {/* Checkmark Circle Icon Button */}
                                <button id="pref-submit" className="bg-green-500 hover:bg-yellow-500 text-white p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors duration-1000">
                                    Submit
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokelinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                            </div>
                        </section>
                    </div>

                    <div id="pref-section" className="mb-6">
                        <label className="block text-lg font-medium mb-2 text-gray-600 dark:text-gray-300 flex items-center ml-2 transition-colors duration-1000">
                            User &nbsp;<span className="text-sky-500">command</span> &nbsp;/ &nbsp;<span className="text-pink-900 font-semibold">Data</span>
                        </label>
                        <div id="pref-preview" className="relative p-6 bg-blue-200 dark:bg-stone-900 border-none border-blue-300 rounded-lg shadow-md shadow-gray-700 transition-colors duration-1000">
                            <p id="pref-content" className="text-gray-800 dark:text-orange-400 transition-colors duration-1000"></p>
                            <section className="absolute top-0.5 right-1 flex flex-col space-y-2">
                                <button id="pref-delete" aria-label="Delete preference" title="Delete preference" className="rounded-md p-1 bg-slate-600 dark:bg-gray-800 text-red-400 hover:text-red-500 shadow-md transition-colors duration-1000">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokelinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.981-1.858L5 7m5 4v6m4-6v6"></path>
                                    </svg>
                                </button>
                                <button id="pref-edit" aria-label="Edit" title="Edit" className="p-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-md transition-colors duration-1000">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white hover:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokelinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                            </section>
                        </div>
                    </div>

                    {/* Additional Settings Options */}
                    <div className="flex justify-center w-full my-4">
                        <button onclick="showApiManModal()" className="px-6 py-3 rounded-lg bg-blue-500 dark:bg-black border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-900 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-colors duration-1000">
                            <span className="bg-gradient-to-r from-[#ffff7f] via-[#550000] to-[#0000ff] text-transparent bg-clip-text font-bold">
                                Manage API Key
                            </span>
                        </button>
                    </div>


                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Language:</label>
                        <select className="form-select w-fit font-bold bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 transition-colors duration-1000">
                            <option value="en" className="text-yellow-400 font-bold">English</option>
                            <option value="fr">French</option>
                            <option value="es">Spanish</option>
                        </select>
                    </div>

                    {/* Save Settings Button */}
                    <section className="w-full flex justify-center">
                        <button id="saveSettings" className="w-fit bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-1000">
                            Save Settings
                        </button>
                    </section>
                </section>
            </div>
        </div>
    );
};
