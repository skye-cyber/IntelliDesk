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
        <section>
            <div id="apiKeyModal" className="fixed inset-0 bg-blue-900/40 dark:bg-zinc-900/80 flex items-center justify-center z-30 hidden transition-colors duration-1000">
                <div id="apiKeyModalContent" className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-2xl w-96 fade-in">
                    <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-gray-100 transition-colors duration-1000">
                        Enter Your API Keys
                    </h2>
                    <div className="mt-4 space-y-4">
                        <div className="space-y-2">
                            <label for="mistralKey" className="block text-gray-700 dark:text-gray-300 transition-colors duration-1000">Mistral API Key</label>
                            <div className="relative">
                                <input id="mistralKey" type="password" className="w-full p-2 border border-orange-400 dark:border-blue-300 rounded-md dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-colors duration-1000"></input>
                                <button type="button" className="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-400" onClick="toggleVisibility('mistralKey')">
                                    👁
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label for="huggingfaceKey" className="block text-gray-700 dark:text-gray-300 transition-colors duration-1000">Hugging Face API Key</label>
                            <div className="relative">
                                <input id="huggingfaceKey" type="password" className="w-full p-2 border border-pink-400 rounded-md dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-colors duration-1000"></input>
                                <button type="button" className="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-400 transition-colors duration-1000" onClick="toggleVisibility('huggingfaceKey')">
                                    👁
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end mt-6 space-x-3">
                        <button className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition" onClick="closeApiQueryModal()">
                            Cancel
                        </button>
                        <button id="saveKeysBt" className="px-4 py-2 bg-blue-600 text-white rounded-md dark:hover:bg-blue-700 hover:bg-green-600 transition" onClick="saveKeys()">
                            Save
                        </button>
                    </div>
                </div>
            </div>

            {/* Key management modal*/}
            <div id="apiKeyManPage" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 translate-y-[100vh] hidden transition-all duration-700">
                <div className="relative w-fit max-w-3xl mx-auto bg-white dark:bg-stone-800 p-6 rounded-lg shadow-lg aimate-fadeIn overflow-hidden">
                    {/* Close Button */}
                    <button id="closeModalManPage" className="absolute top-2 right-2 text-black dark:text-blue-400 hover:text-gray-900 hover:rotate-45 duration-300 dark:hover:text-gray-400 transition-colors duration-1000">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinejoin="round" strokeLinecapinejoin="round" strokeWidthidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white text-center mb-4 transition-colors duration-1000">Manage API Keys</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300">Mistral API Key</label>
                            <div className="relative">
                                <input id="mistralKeyMan" type="password" value="***************" className="w-full p-2 border rounded-md dark:bg-stone-600 dark:border-gray-400 dark:text-gray-100 transition-colors duration-1000"></input>
                                <button type="button" className="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-400 transition-colors duration-1000" onClick="toggleVisibility('mistralKeyMan')">
                                    👁
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 dark:text-gray-300">Hugging Face API Key</label>
                            <div className="relative">
                                <input id="huggingfaceKeyMan" type="password" value="***************" className="w-full p-2 border rounded-md dark:bg-zinc-600 dark:border-gray-400 dark:text-gray-100"></input>
                                <button type="button" className="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-400" onClick="toggleVisibility('huggingfaceKeyMan')">
                                    👁
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6 space-x-3">
                        <button className="px-4 py-2 dark:text-white text-gray-900 bg-gray-300 dark:bg-gray-500 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 cursor-not-allowed pointer-events-none transition-colors duration-1000" onClick="resetKeys()">
                            Reset
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-1000" onClick="saveKeys('update')">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>


            {/*Warning Modal: No API Key Set*/}
            <div id="warningModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 pointer-events-none transition-all duration-700 hidden">
                <div id="warningModalContent" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 transform translate-y-full transition-all duration-300 animate-exit">

                    {/* Warning Title */}
                    <h2 className="text-xl font-semibold text-center text-red-500 dark:text-red-400 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRuleule="evenodd" d="M12 2a1 1 0 0 1 .894.553l9 18A1 1 0 0 1 21 22H3a1 1 0 0 1-.894-1.447l9-18A1 1 0 0 1 12 2zm-1 8a1 1 0 0 0 2 0v4a1 1 0 0 0-2 0v-4zm1 8a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 12 18z" clipRuleule="evenodd" />
                        </svg>
                        <span className="font-bold text-red-500">Warning:</span> <span className="text-orange-400 font-normal">API Key Not Set</span>
                    </h2>

                    {/* Warning Message */}
                    <p className="mt-4 text-center text-gray-800 dark:text-gray-200">
                        It looks like you haven't set up your API keys. To proceed, please enter your keys.
                    </p>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-between space-x-4">
                        <button className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-1000"
                            onClick="closeWarningModal(); showApiQueryModal();">
                            Close
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-1000"
                            onClick="closeWarningModal(); showApiQueryModal();">
                            Set API Keys
                        </button>
                    </div>
                </div>
            </div>


            {/*ApiNotSetModal Modal: atleast one API must be set*/}
            <div id="ApiNotSetModal" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden z-50 transition-colors duration-1000">
                <div id="ApiNotSetContent" className="relative bg-white dark:bg-gray-800 p-6 xl:p-8 rounded-lg shadow-lg flex flex-col items-center animate-exit md:min-w-md lg:min-w-lg xl:min-w-2xl transition-colors duration-1000">
                    {/* Close Button */}
                    <button id="closeModalApiWarn" onClick="closeApiNotSetWarning(); showApiQueryModal();" className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-red-500 duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 hover:rotate-45 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Warning Icon */}
                    <div className="flex items-center justify-center w-16 h-16 bg-yellow-500 dark:bg-yellow-500 rounded-full shadow-md transition-colors duration-1000">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRuleule="evenodd" d="M12 2a1 1 0 0 1 .894.553l9 18A1 1 0 0 1 21 22H3a1 1 0 0 1-.894-1.447l9-18A1 1 0 0 1 12 2zm-1 8a1 1 0 0 0 2 0v4a1 1 0 0 0-2 0v-4zm1 8a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 12 18z" clipRuleule="evenodd" />
                        </svg>
                    </div>

                    {/* Warning Message */}
                    <p id="warningMSG" className="mt-4 text-gray-700 dark:text-gray-200 text-center font-medium transition-colors duration-1000">
                        Please set at least one API key:
                    </p>
                    <div className="flex gap-2 mt-2">
                        <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-md transition-colors duration-1000">HF--Huggingface</span>
                        <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-md transition-colors duration-1000">Mistral</span>
                    </div>
                    <p className="mt-2 text-gray-700 dark:text-gray-200 text-center">
                        or <span className="font-semibold text-blue-500 dark:text-blue-400">both</span>.
                    </p>

                </div>
            </div>

            {/*API setting Success Modal*/}
            <div id="successModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-none transition-opacity duration-500 hidden">
                <div id="successModalContent" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 transform scale-95 transition-all transform duration-1000">

                    {/* Success Icon & Title */}
                    <h2 className="text-xl font-semibold text-center text-green-500 dark:text-green-400 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 dark:text-green-400" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M10 15.172l7.071-7.071a1 1 0 011.415 1.414l-8.486 8.485a1 1 0 01-1.414 0L4.929 13.9a1 1 0 011.415-1.414L10 15.172z" clipRule="evenodd" />
                        </svg>
                        Success!
                    </h2>

                    {/* Success Message */}
                    <p id="success-message" className="mt-4 text-center text-gray-800 dark:text-gray-200">
                        Operation Successful
                    </p>
                    <p id="restartBt" className="hidden text-center text-black dark:text-gray-200">Need to <span className="text-green-400 font-semibold">Restart</span> the app for changes to take effect!</p>
                    {/* Action Buttons */}
                    <div className="hidden mt-6 flex justify-between space-x-4">
                        <button className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-1000 cursor-not-allowed"
                            onClick="closeSuccessModal();">
                            Close
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-orange-400 hover:text-slate-900 transition-colors duration-1000"
                            onClick="closeSuccessModal(); onSuccessAction();">
                            Ok
                        </button>
                    </div>
                </div>
            </div>
        </section>

    );
};
