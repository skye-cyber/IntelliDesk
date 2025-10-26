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
        <div id="loadingModal" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden z-41">
            <div id="modalMainBox" className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center animate-exit transition-all duration-1000">
                {/* Spinner Animation */}
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p id="loadingMSG" className="mt-3 text-gray-700">Processing, please wait...</p>
            </div>
        </div>

        {/* General Success Modal */}
        <div id="success-modal-GN" className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 hidden z-41">
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
                <button id="CloseSucsessModal-GN" onClick="window.hideStatus('success')" className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                    OK
                </button>
            </div>
        </div>

        {/* Error Modal */}
        <div id="errorModal-GN" className="hidden fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-41">
            <div id="errorBox-GN" className="bg-white p-6 rounded-lg shadow-lg min-w-80 max-w-[90vw] md:max-w-[70vw] animate-exit transition-all duration-1000">
                <h2 className="text-lg font-semibold text-red-600">Error!</h2>
                <p className="error-message-GN mt-2 text-gray-600" id="errorMessage">Something went wrong.</p>
                <section className="flex justify-center">
                    <button onClick="window.hideStatus('error')" className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                        Close
                    </button>
                </section>
            </div>
        </div>
        </section>
            );
};
