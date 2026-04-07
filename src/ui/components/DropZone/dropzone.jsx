import { useEffect, useCallback, useRef, useState } from 'react';
import { globalEventBus } from '../../../core/Globals/eventBus.ts';

export const DropZone = ({ isOpen, onToggle }) => {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const dropZoneRef = useRef(null);
    const fileInputRef = useRef(null);
    const modalRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        const handleDropzoneOpen = () => openModal();
        const handleDropzoneClose = () => closeModal();

        globalEventBus.on('dropzone:open', handleDropzoneOpen);
        globalEventBus.on('dropzone:close', handleDropzoneClose);

        return () => {
            globalEventBus.off('dropzone:open', handleDropzoneOpen);
            globalEventBus.off('dropzone:close', handleDropzoneClose);
        };
    }, []);

    const openModal = () => {
        if (modalRef.current && contentRef.current) {
            modalRef.current.classList.remove('hidden');
            setTimeout(() => {
                contentRef.current.classList.remove('scale-95', 'opacity-0');
                contentRef.current.classList.add('scale-100', 'opacity-100');
            }, 10);
        }
    };

    const closeModal = () => {
        if (contentRef.current) {
            contentRef.current.classList.remove('scale-100', 'opacity-100');
            contentRef.current.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                if (modalRef.current) modalRef.current.classList.add('hidden');
            }, 300);
        }
    };

    const handleFiles = useCallback(async (selectedFiles) => {
        const fileArray = Array.from(selectedFiles);
        const newFiles = fileArray.map(file => ({
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'pending',
            progress: 0
        }));

        setFiles(prev => [...prev, ...newFiles]);

        for (const fileObj of newFiles) {
            await uploadFile(fileObj);
        }
    }, []);

    const uploadFile = async (fileObj) => {
        setUploadProgress(prev => ({ ...prev, [fileObj.id]: 0 }));

        for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            setUploadProgress(prev => ({ ...prev, [fileObj.id]: i }));
        }

        setFiles(prev => prev.map(f =>
            f.id === fileObj.id ? { ...f, status: 'completed' } : f
        ));
    };

    const removeFile = (fileId) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
        setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
        });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length) {
            handleFiles(droppedFiles);
        }
    };

    const handleSubmit = () => {
        const completedFiles = files.filter(f => f.status === 'completed');
        if (completedFiles.length > 0) {
            globalEventBus.emit('files:submitted', completedFiles);
            closeModal();
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={openModal}
                className="fixed bottom-24 right-6 z-40 p-3 rounded-2xl bg-gradient-to-br from-primary-500 to-blend-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
                title="Upload Files"
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            </button>

            {/* Modal */}
            <div
                ref={modalRef}
                onClick={(e) => e.target === modalRef.current && closeModal()}
                className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 hidden transition-all duration-300"
            >
                <div
                    ref={contentRef}
                    className="relative w-full max-w-4xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl transform transition-all duration-300 scale-95 opacity-0 overflow-hidden"
                >
                    {/* Header */}
                    <div className="relative px-6 py-5 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-blend-500 shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">File Studio</h2>
                                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Upload, manage, and process your files</p>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 group"
                            >
                                <svg className="w-5 h-5 text-gray-500 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)] custom-scroll bg-gray-50/50 dark:bg-slate-950">
                        {/* Drop Zone */}
                        <div
                            ref={dropZoneRef}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer ${isDragging
                                    ? 'border-primary-500 bg-primary-50 dark:bg-slate-800/50'
                                    : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary-400 dark:hover:border-primary-500'
                                }`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                {/* Animated Icon */}
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl animate-pulse"></div>
                                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-blend-500 flex items-center justify-center shadow-2xl">
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Drop files here or click to browse
                                </h3>
                                <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
                                    Supports images, documents, archives, and more
                                </p>

                                {/* File Type Chips */}
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {['📄 Documents', '🖼️ Images', '🎵 Audio', '🎬 Video', '📦 Archives'].map((type, i) => (
                                        <span key={i} className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Files List */}
                        {files.length > 0 && (
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeJoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Upload Queue ({files.length})
                                    </h3>
                                    {files.every(f => f.status === 'completed') && (
                                        <button
                                            onClick={handleSubmit}
                                            className="px-4 py-1.5 text-sm bg-gradient-to-r from-primary-500 to-blend-500 text-white rounded-lg hover:shadow-lg transition-all"
                                        >
                                            Process All
                                        </button>
                                    )}
                                </div>

                                {files.map(file => (
                                    <FileItem
                                        key={file.id}
                                        file={file}
                                        progress={uploadProgress[file.id] || 0}
                                        onRemove={() => removeFile(file.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                accept=".txt,.doc,.docx,.pdf,.png,.jpg,.jpeg,.gif,.webp,.svg,.mp3,.mp4,.zip,.tar,.gz,.json,.xml,.md"
            />
        </>
    );
};

// File Item Component
export const FileItem = ({ file, progress, onRemove }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isCompleted = progress >= 100;

    const getFileIcon = () => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return '🖼️';
        if (['mp3', 'wav', 'flac', 'ogg'].includes(ext)) return '🎵';
        if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) return '🎬';
        if (['pdf'].includes(ext)) return '📕';
        if (['doc', 'docx'].includes(ext)) return '📘';
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦';
        if (['json', 'xml', 'yaml'].includes(ext)) return '⚙️';
        return '📄';
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative bg-white dark:bg-primary-900 rounded-xl border border-gray-200 dark:border-primary-800 overflow-hidden transition-all duration-300 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg"
        >
            {/* Progress Background */}
            <div
                className="absolute inset-0 bg-primary-50 dark:bg-primary-800/50 transition-all duration-500"
                style={{ width: `${progress}%` }}
            />

            <div className="relative flex items-center gap-4 p-4">
                {/* File Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-100 dark:bg-primary-800 flex items-center justify-center text-2xl">
                    {getFileIcon()}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                            {file.name}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-primary-300 ml-2 flex-shrink-0">
                            {isCompleted ? '✓ Ready' : `${Math.round(progress)}%`}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-primary-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-primary-400">
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7h-4.5M20 7v10m0-10l-4.5-4.5M4 5h4.5M4 5v10m0-10l4.5 4.5" />
                            </svg>
                            {formatSize(file.size)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date().toLocaleTimeString()}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className={`flex-shrink-0 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <button
                        onClick={onRemove}
                        className="p-2 rounded-lg text-gray-400 dark:text-primary-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                        title="Remove file"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.981-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
