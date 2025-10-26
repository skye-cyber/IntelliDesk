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
        <div id="diagViewModal" className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-all duration-1000 z-40 translate-x-full opacity-0">
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-[99vw] lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl w-full h-[90vh] overflow-hidden relative transition-all duration-1000">
                <button
                    onClick="closediagViewModal();"
                    className="absolute top-1 right-3 text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded z-30 transition-all duration-1000"
                >Close</button>
                <div className="w-full h-[96%] my-4 overflow-auto scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-cyan-600 dark:scrollbar-track-gray-950 dark:scrollbar-thumb-cyan-600 scroll-smooth">
                    <div id="modal-content" className="p-4 flex flex-col"></div>
                </div>
            </section>
        </div>
    );
};
