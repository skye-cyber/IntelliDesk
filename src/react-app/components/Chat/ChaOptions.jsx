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
        <div id="chatOptions-overlay" className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 hidden w-full h-full">
        {/*-- Conversation options */}
        {/*-- Background Overlay */}
            {/*-- Main Modal */}
            <div id="chatOptions" className="fixed flex inset-0 items-center justify-center rounded-lg shadow-xl z-50 animate-exit">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full bg-gradient-to-r from-blue-400 to-sky-400">
                <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Options</h2>
                <section className="grid grid-rows-2 space-y-4">
                    <div className="flex flex-row justify-center space-x-4">
                        <button id="renameOption" className="bg-blue-800 text-white p-1 rounded-lg w-full shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
                            Rename
                        </button>
                        <button id="DeleteOption" className="bg-red-500 text-white p-2 rounded-lg w-full shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
                            Delete
                        </button>
                    </div>
                    <div className="items-center">
                    <button id="renameOptionsBt" className="bg-gray-300 text-gray-700 mt-4 p-3 rounded-lg w-fit shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
                        Cancel
                    </button>
                    </div>
                </section>
                </div>
            </div>
        </div>
        </div>
    );
};
