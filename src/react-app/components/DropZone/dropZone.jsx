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
            <div id="dropZoneModal" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-40 hidden z-40 transition-colors duration-1000">
                <section id="dropZoneContent" title="Attach files" className="relative p-3 bg-white dark:bg-stone-800 rounded-xl shadow-lg w-full h-full md:mx-auto max-w-[70vw] max-h-[70vh] md:max-h-[80vh] lg:md:max-w-[50vw] mb-16 transition-colors duration-1000" >
                    <button id="closeFileEModal" title="Close" className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:rotate-90 transition-colors duration-1000">
                        <svg className="fill-current h-5 w-5" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.65-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"></path>
                        </svg>
                    </button>
                    <h2 className="text-2xl font-semibold text-blue-700 dark:text-sky-300 mb-6">Upload File</h2>
                    <div id="dropZone" className="p-4 rounded-xl border-2 border-dashed border-blue-400 dark:border-cyan-400 w-full h-full md:mx-auto max-w-[calc(70vw-30px)] max-h-[calc(70vh-20vh)] md:max-h-[calc(80vh-20vh] cursor-pointer transition-colors duration-1000" onClick="event.stopPropagation()">
                        <div className="flex flex-col items-center justify-center h-full">
                            <div id="dropZoneSVG" className="flex items-center justify-center">
                                <svg className="fill-current h-12 w-12 text-blue-400 dark:text-blue-300 transition-colors duration-1000" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                                    <path d="M14 2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z"></path>
                                </svg>
                            </div>
                            <p id="dropZoneText" className="text-gray-600 dark:text-gray-300 text-lg mb-4 transition-colors duration-1000">Drag & drop files here or <span className="text-cyan-400 dark:text-blue-400">click to select</span></p>
                            {{/* Modal Trigger Button */ }}
                            <button id="modalTrigger" onClick="document.getElementById('previewModal').classNameList.remove('hidden')" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white font-semibold py-2.5 px-6 rounded-full shadow-md transition-colors duration-1000 focus:outline-none focus:ring-2 focus:ring-purple-400">
                                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                                Preview Files
                            </button>
                        </div>
                    </div>
                    <section className="w-[calc(70vw-30px)] lg:max-w-[calc(50vw-30px)] absolute bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-200 dark:bg-gradient-to-r dark:from-purple-800 dark:via-pink-800 dark:to-indigo-800 flex space-x-2 bottom-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2 transition-colors duration-1000">
                        <textarea type="text" aria-label="prompt input field" title="prompt field" id="imagePrompt" className="w-full pt-2 scrollbar-hide resize-none text-black dark:text-white max-h-[10vh] overflow-wrap rows-2 bg-transparent focus:outline-none" oninput="this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px';" placeholder="Enter your prompt here"></textarea>
                        <div className="flex items-center justify-end">
                            <button id="submitImage" aria-label="submit button" title="submit" className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg focus:outline-none hover:from-blue-600 hover:to-purple-700 w-fit">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </section>
                </section>
            </div>

            {/*-- Modal Structure -->*/}
            <div id="previewModal" className="hidden scrollbar-thin fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ease-in-out">
                <div className="relative p-3 bg-white dark:bg-slate-800 rounded-xl shadow-2xl md:mx-auto min-w-[30vw] max-w-[calc(70vw-30px)] max-h-[calc(70vh-20vh)] md:max-h-[calc(80vh-20vh)] overflow-hidden transform transition-transform duration-300 ease-out scale-95 transition-colors duration-1000" id="modalContent">
                    <h2 className="text-2xl font-semibold text-blue-600 dark:text-sky-400 mb-1 transition-colors duration-1000">Preview Files</h2>
                    <div className="overflow-hidden">
                        <div id="uploadedFiles" className="pb-4 mb-2 rounde-lg dark:bg-[#002a3d] p-2 space-y-3 max-h-[calc(60vh-100px)] overflow-y-auto scrollbar-hide transition-colors duration-1000">
                            <p className="font-bold mb-12 px-12 text-cyan-600 dark:text-teal-400 transition-colors duration-1000">No files uploaded yet.</p>
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0.5 z-60 w-24 p-2 border-t border-gray-200 dark:border-[#4d7339] flex justify-end v">
                        <button id="closeModal" onClick="document.getElementById('previewModal').classList.add('hidden')" className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-pink-600 hover:to-red-500 text-white font-semibold py-2 px-5 rounded-full shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-1000">
                            Close
                        </button>
                    </div>
                </div>
            </div>

            <input multiple className="absolute opacity-0" accept=".txt, .doc, .docx, .rtf, .md, .markdown, .epub, .mobi, .pdf, .png, .jpg, .jpeg, .svg, .gif, .bmp" type="file" id="fileInput" onClick="handleFileInputClick();" />
        </section>
    );
};
