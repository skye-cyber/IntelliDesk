import React, { useCallback } from 'react';
import { opendiagViewModal, closediagViewModal } from '@js/diagraming/Utils.js';

export const DiagramUi = ({ isOpen, onToggle }) => {

    const shouldClose = useCallback((e)=>{
        const overlay = document.getElementById('view-content');
        if (!overlay?.contains(e.target)) closediagViewModal();
    })

    return (
        <div onClick={shouldClose} id="diagViewModal" className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-all duration-1000 z-40 translate-x-full opacity-0">
            <section id="view-content" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-[99vw] lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl w-full h-[90vh] overflow-hidden relative transition-all duration-1000">
                <button
                    onClick={closediagViewModal}
                    className="absolute top-1 right-3 text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded z-30 transition-all duration-1000"
                >Close</button>
                <div className="w-full h-[96%] my-4 overflow-auto scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-cyan-600 dark:scrollbar-track-gray-950 dark:scrollbar-thumb-cyan-600 scroll-smooth">
                    <div id="modal-content" className="p-4 flex flex-col"></div>
                </div>
            </section>
        </div>
    );
};
