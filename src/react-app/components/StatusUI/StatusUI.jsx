import React, { useCallback } from 'react';
import { hideStatus } from '@js/StatusUIManager/SimpleManager.js'
export const StatusUI = ({ isOpen, onToggle }) => {
    const hideErrorModal = useCallback(() => {
        hideStatus('error')
    })

    const hideSuccessModal = useCallback(() => {
        hideStatus('success')
    })

    return (
        <section>
            <div id="loadingModal" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden z-41">
                <div id="modalMainBox" className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center animate-exit transition-all duration-1000">
                    {/* Spinner Animation */}
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p id="loadingMSG" className="mt-3 text-gray-700">Processing, please wait...</p>
                </div>
            </div>

            {/* General Success Modal */}
            <div id="success-modal-GN" className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 hidden z-[60]">
                <div id="successBoxBody-GN" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm text-center animate-exit transition-all duration-1000">
                    {/* Animated Checkmark */}
                    <div className="flex items-center justify-center">
                        <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center animate-scale">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 animate-draw" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                    </div>

                    {/* Success Message */}
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4">Success!</h2>
                    <p id="SuccessMsg-GN" className="text-sm text-gray-600 dark:text-gray-300 mt-2">Your action was completed successfully.</p>

                    {/* Close Button */}
                    <button id="CloseSucsessModal-GN" onClick={hideSuccessModal} className="hidden mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                        OK
                    </button>
                </div>
            </div>

            {/* Error Modal */}
            <div id="errorModal-GN" className="hidden fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60]">
                <div id="errorBox-GN" className="bg-white p-6 rounded-lg shadow-lg min-w-80 max-w-[90vw] md:max-w-[70vw] animate-exit transition-all duration-1000">
                    <h2 className="text-lg font-semibold text-red-600">Error!</h2>
                    <p className="error-message-GN mt-2 text-gray-600" id="errorMessage">Something went wrong.</p>
                    <section className="flex justify-center">
                        <button onClick={hideErrorModal} className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                            Close
                        </button>
                    </section>
                </div>
            </div>
        </section>
    );
};


export const LoadingAnimation = ({ }) => {
    const loaderUUID = `loader_${Math.random().toString(30).substring(3, 9)}`;

    return (
        <div id={loaderUUID} className='fixed bottom-[10vh] left-16 z-[71]'>
            <div id="loader-parent">
                <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="transform scale-75">
                    <circle cx="12" cy="24" r="4" className="fill-green-500">
                        <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" />
                        <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="24" cy="24" r="4" className="fill-blue-500">
                        <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" begin="-0.4s" />
                        <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="-0.4s" />
                    </circle>
                    <circle cx="36" cy="24" r="4" className="fill-yellow-500">
                        <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" begin="-0.8s" />
                        <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="-0.8s" />
                    </circle>
                </svg>
            </div>
        </div>
    )
}
