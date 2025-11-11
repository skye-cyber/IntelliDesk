import React, { useEffect, useCallback } from 'react';
import { CloseDropZone, openPreview, closePreview, handleFiles, formatFileSize, getFileType } from './util.js'
import { MistraMultimodal } from '../../../renderer/js/managers/ConversationManager/Mistral/MultiModal.js';

export const DropZone = ({ isOpen, onToggle }) => {

    useEffect(() => {
        const dropZone = document.getElementById('dropZone');
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => {
                e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                dropZone.classList.add('border-blue-500', 'bg-blue-50/80');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('border-blue-500', 'bg-blue-50/80');
            });

            dropZone.addEventListener('drop', (e) => {
                e.stopPropagation();
                e.preventDefault();
                dropZone.classList.remove('border-blue-500', 'bg-blue-50/80');
                // Handle file drop
                const files = e.dataTransfer.files;
                handleFiles(files);
            });

        }

        if (fileInput) {
            const fileInput = document.getElementById('fileInput');
            fileInput.addEventListener('change', handleFileSelect);
        }
        document.getElementById("submitFiles")?.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitFiles()
            }
        });
    })

    function handleFileSelect(event) {
        const files = event.target.files;
        handleFiles(files);
    }

    const shouldClose = useCallback((e) => {
        if (e.target.id === 'dropZoneModal') CloseDropZone();
    })

    const shouldClosePreview = useCallback((e) => {
        if (!document.getElementById('modalContent').contains(e.target)) closePreview();
    })

    const handleEscape = useCallback((e) => {
        if (e.key === 'Escape' && !e.shiftKey) {
            if (!document.getElementById('previewModal')?.classList.contains('hidden')) {
                return closePreview()
            }
            CloseDropZone();
        }
        else if (e.key === "Enter" && !e.shiftKey) {
            HandleFileSubmit(e)
        }
    });

    const HandleFileSubmit = useCallback((e) => {
        e.preventDefault()
        const userInput = document.getElementById('dropzone_input');

        //document.dispatchEvent(new CustomEvent('Clear-all-files'))

        const inputText = userInput.value?.trim();
        userInput.value = ''; // clear input

        if (inputText) {
            //Reset the input field content
            MistraMultimodal({ text: inputText })
            CloseDropZone()
        }
    })


    useEffect(() => {
        document.addEventListener('keydown', handleEscape)
        return () => {
            document.removeEventListener('keydown', handleEscape)
        }
    })
    return (
        <section id="dropZoneModalContainer" >
            {/* Main Dropzone Modal */}
            <div onClick={shouldClose} id="dropZoneModal" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 transition-all duration-500 hidden">
                <div id="dropZoneContent" className="relative bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-4xl h-[95vh] backdrop-blur-lg transform transition-all duration-500 scale-95 opacity-0">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200/50 dark:border-gray-700/50 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-500/10 rounded-xl">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                                        Upload Files
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Drag & drop or select files to upload
                                    </p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={CloseDropZone}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
                            >
                                <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Dropzone Area */}
                    <div className="p-6 h-[calc(85vh-200px)]">
                        <div
                            id="dropZone"
                            className="relative border-3 border-dashed border-blue-300 dark:border-blue-600 rounded-2xl w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 hover:from-blue-100/50 hover:to-purple-100/50 dark:hover:from-blue-800/20 dark:hover:to-purple-800/20 transition-all duration-300 group cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Animated Background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent dark:via-white/2 group-hover:via-white/10 transition-all duration-1000 transform -translate-x-full group-hover:translate-x-full"></div>

                            {/* Main Content */}
                            <div className="relative z-10 text-center p-8">
                                {/* Animated Icon */}
                                <div className="w-fit h-fit p-3 bg-gradient-to-br from-sky-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>

                                {/* Text Content */}
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                                    Drop your files here
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                    Supports documents, images, and various file types
                                </p>

                                {/* File Type Indicators */}
                                <div className="flex flex-wrap justify-center gap-3 mb-6">
                                    {['📄 PDF', '🖼️ Image', '📝 Document', '🎨 SVG'].map((type, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
                                        >
                                            {type}
                                        </span>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={() => document.getElementById('fileInput').click()}
                                        className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-blue-500 text-blue-600 dark:text-blue-400 rounded-xl font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                                    >
                                        Select Files
                                    </button>
                                    <button
                                        onClick={openPreview}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center space-x-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span>Preview Files</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Prompt Input Section */}
                    <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-b-2xl">
                        <div className="flex items-center space-x-3">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Add context for your files
                                </label>
                                <textarea
                                    id="dropzone_input"
                                    aria-label="prompt input field"
                                    title="prompt field"
                                    className="w-full max-h-24 px-4 py-3 text-gray-700 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 scrollbar-custom scroll-smooth"
                                    placeholder="Describe what you'd like to do with these files..."
                                    rows="2"
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                ></textarea>
                            </div>
                            <button
                                id="submitFiles"
                                onClick={HandleFileSubmit}
                                aria-label="submit button"
                                title="submit"
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                                <span>Process</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <FilePreview shouldClosePreview={shouldClosePreview} closePreview={closePreview} />
            {/* Hidden File Input */}
            <input
                multiple
                className="absolute opacity-0"
                accept=".txt, .doc, .docx, .rtf, .md, .markdown, .epub, .mobi, .pdf, .png, .jpg, .jpeg, .svg, .gif, .bmp"
                type="file"
                id="fileInput"
            />
        </section>
    );

};

export const FilePreview = ({ shouldClosePreview, closePreview }) => {
    return (
        <>
            {/* Preview Modal */}
            < div onClick={shouldClosePreview} id="previewModal" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-500 hidden opacity-0" >
                <div id="modalContent" className="relative bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] backdrop-blur-lg transform transition-all duration-500 animate-exit">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200/50 dark:border-gray-700/50 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-500/10 rounded-xl">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                                        File Preview
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Review your uploaded files
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={closePreview}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
                            >
                                <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <div data-portal-container='FilePreview' id="uploadedFiles" className="FilePreview space-y-4">
                            {/* Empty State */}
                            <div id="EmptyDisplay" className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                                    No files uploaded yet
                                </p>
                                <p className="text-gray-400 dark:text-gray-500 text-sm">
                                    Upload some files to see them here
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-b-2xl">
                        <div className="flex justify-end">
                            <button
                                onClick={closePreview}
                                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}

export const FileItem = ({ file, portal_id }) => {
    const removeFile = useCallback((name) => {
        // Filter out files whose name matches the given name
        window.filedata = window.filedata.filter(file => file.name !== name);

        // Close the portal component
        window.reactPortalBridge.closeComponent(portal_id);
    }, []);

    return (
        <div className='group flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 backdrop-blur-sm'>
            <div className="flex items-center space-x-4 flex-1 min-w-0">
                {/* File Icon with Progress */}
                <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    {/* Progress Ring */}
                    <div className="absolute -inset-1">
                        <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 50 50">
                            <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="3" fill="none"
                                strokeDasharray="125.6" strokeDashoffset="125.6"
                                className="text-green-500/30 transition-all duration-500"
                                style={{ strokeDashoffset: `${125.6 * (1 - (file.progress || 1))}` }}>
                            </circle>
                        </svg>
                    </div>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate flex-1" title={file.name}>
                            {file.name}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                            {file.progress ? Math.round(file.progress * 100) + '%' : 'Ready'}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${((file.progress || 0) * 100)}%` }}></div>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <span className="flex items-center space-x-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>{new Date().toLocaleDateString()}</span>
                        </span>
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                            </svg>
                            <span>{getFileType(file.name)}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Remove Button */}
            <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-xl border border-blue-400 font-medium">
                    {formatFileSize(file.size)}
                </span>
                <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                    onClick={() => removeFile(file.name)}
                    title="Remove file">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.981-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>

        </div >
    )
}
