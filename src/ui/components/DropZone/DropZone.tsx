import { useEffect, useCallback, useRef, useState } from 'react';
import { globalEventBus } from '../../../core/Globals/eventBus';
import { FiX, FiUpload, FiCheck, FiFile, FiImage, FiMusic, FiVideo, FiArchive } from 'react-icons/fi';
import { File as UploadFile } from '../../../core/managers/Conversation/Mistral/InputProcessor';
import { StateManager } from '../../../core/managers/StatesManager';
import { motion, AnimatePresence } from 'framer-motion';

interface FileItem {
    id: string;
    file: File;
    name: string;
    size: number;
    type: string;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    progress: number;
    preview?: string;
    url?: string;
}

export const DropZone = ({ isOpen, onToggle }) => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
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
        if (!modalRef.current || !contentRef.current) return

        (modalRef.current as HTMLBaseElement).classList.remove('hidden');
        setTimeout(() => {
            if (!contentRef.current) return
            const ContentRef = (contentRef.current as HTMLBaseElement)

            ContentRef.classList.remove('scale-95', 'opacity-0');
            ContentRef.classList.add('scale-100', 'opacity-100');
        }, 10);
    };

    const closeModal = () => {
        if (contentRef.current) {
            const ContentRef = (contentRef.current as HTMLBaseElement)

            ContentRef.classList.remove('scale-100', 'opacity-100');
            ContentRef.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                if (modalRef.current) (modalRef.current as HTMLBaseElement).classList.add('hidden');
            }, 300);
        }
    };

    const processFile = async (fileObj: FileItem): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const url = e.target?.result as string;
                fileObj.url = url;
                if (fileObj.type.startsWith('image/')) {
                    fileObj.preview = url;
                }
                resolve(url);
            };
            reader.onerror = reject;
            reader.readAsDataURL(fileObj.file);
        });
    };

    const handleFiles = useCallback(async (selectedFiles: FileList | File[]) => {
        const fileArray = Array.from(selectedFiles);
        const newFiles: FileItem[] = fileArray.map(file => ({
            id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'pending',
            progress: 0
        }));

        setFiles(prev => [...prev, ...newFiles]);

        // Process each file
        for (const fileObj of newFiles) {
            await uploadFile(fileObj);
        }
    }, []);

    const uploadFile = async (fileObj: FileItem) => {
        // Update status to uploading
        setFiles(prev => prev.map(f =>
            f.id === fileObj.id ? { ...f, status: 'uploading' } : f
        ));

        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 50));
            setUploadProgress(prev => ({ ...prev, [fileObj.id]: i }));
            setFiles(prev => prev.map(f =>
                f.id === fileObj.id ? { ...f, progress: i } : f
            ));
        }

        // Process file (convert to data URL)
        try {
            const url = await processFile(fileObj);

            // Mark as completed
            setFiles(prev => prev.map(f =>
                f.id === fileObj.id ? { ...f, status: 'completed', progress: 100, url } : f
            ));

            // Emit to global state for input display
            const uploadedFileData = {
                id: fileObj.id,
                name: fileObj.name,
                size: fileObj.size,
                type: fileObj.type,
                url: url,
                isImage: fileObj.type.startsWith('image/'),
                preview: fileObj.preview
            };

            globalEventBus.emit('files:uploaded', [uploadedFileData as UploadFile]);

            // Store in StateManager for persistence
            const existingFiles = StateManager.get('uploaded_files') || [];
            StateManager.set('uploaded_files', [...existingFiles, uploadedFileData]);

        } catch (error) {
            console.error('File processing error:', error);
            setFiles(prev => prev.map(f =>
                f.id === fileObj.id ? { ...f, status: 'error' } : f
            ));
        }
    };

    const removeFile = (fileId: string) => {
        const file = files.find(f => f.id === fileId);
        if (file?.preview) {
            URL.revokeObjectURL(file.preview);
        }

        setFiles(prev => prev.filter(f => f.id !== fileId));
        setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
        });

        // Emit removal event
        globalEventBus.emit('file:removed', fileId);

        // Update StateManager
        const currentFiles = StateManager.get('uploaded_files') || [];
        StateManager.set('uploaded_files', currentFiles.filter(f => f.id !== fileId));
    };

    const clearAllFiles = () => {
        files.forEach(file => {
            if (file.preview) URL.revokeObjectURL(file.preview);
        });
        setFiles([]);
        setUploadProgress({});
        globalEventBus.emit('files:cleared');
        StateManager.set('uploaded_files', []);
    };

    const handleSubmit = () => {
        const completedFiles = files.filter(f => f.status === 'completed');
        if (completedFiles.length > 0) {
            // Switch to multimodal model if needed
            const model = "mistral-large-latest";
            globalEventBus.emit('model:change', model);

            // Emit final submission
            globalEventBus.emit('files:submitted', completedFiles.map(f => ({
                id: f.id,
                used: false,
                name: f.name,
                size: f.size,
                type: f.type,
                url: f.url,
                isImage: f.type.startsWith('image/')
            })) as UploadFile[]);

            closeModal();
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length) {
            handleFiles(droppedFiles);
        }
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <FiImage className="w-5 h-5" />;
        if (type.startsWith('video/')) return <FiVideo className="w-5 h-5" />;
        if (type.startsWith('audio/')) return <FiMusic className="w-5 h-5" />;
        if (type.includes('zip') || type.includes('tar')) return <FiArchive className="w-5 h-5" />;
        return <FiFile className="w-5 h-5" />;
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={openModal}
                className="hidden fixed bottom-24 right-6 z-40 p-3 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
                title="Upload Files"
            >
                <FiUpload className="w-6 h-6 text-white" />
            </button>

            <button
                onClick={openModal}
                className="fixed bottom-24 right-6 z-40 p-3 rounded-2xl bg-gradient-to-br from-primary-500 to-blend-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
                title="Upload Files"
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {/* Animated Badge */}
                <AnimatePresence>
                    {files.length > 0 && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -top-2 -right-2"
                            title="Uploaded Files"
                        >
                            <div className="relative">
                                {/* Pulsing ring */}
                                <motion.div
                                    animate={{ scale: [1, 1.5, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute inset-0 rounded-full bg-primary-400 opacity-75"
                                />
                                {/* Badge content */}
                                <div className="relative min-w-[22px] h-[22px] px-1.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 shadow-lg flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">
                                        {files.length > 10 ? '10+' : files.length}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
            {/* Modal */}
            <div
                ref={modalRef}
                onClick={(e) => e.target === modalRef.current && closeModal()}
                className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 hidden transition-all duration-300"
            >
                <div
                    ref={contentRef}
                    className="relative w-full max-w-4xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl transform transition-all duration-300 scale-95 opacity-0 overflow-hidden"
                >
                    {/* Header */}
                    <div className="relative px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                    File Studio
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    Upload, manage, and process your files
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                            >
                                <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)] custom-scroll bg-gray-50/50 dark:bg-gray-950">
                        {/* Drop Zone */}
                        <div
                            ref={dropZoneRef}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => ((fileInputRef.current as any) as HTMLBaseElement)?.click()}
                            className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer ${isDragging
                                ? 'border-primary-500 bg-primary-50 dark:bg-gray-800/50'
                                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primary-400 dark:hover:border-primary-500'
                                }`}
                        >
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl animate-pulse"></div>
                                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-2xl">
                                        <FiUpload className="w-10 h-10 text-white" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Drop files here or click to browse
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                    Supports images, documents, videos, audio, and archives
                                </p>

                                {/* File Type Chips */}
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {['📄 Documents', '🖼️ Images', '🎵 Audio', '🎬 Video', '📦 Archives'].map((type, i) => (
                                        <span key={i} className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
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
                                        <FiFile className="w-4 h-4 text-primary-500" />
                                        Upload Queue ({files.length})
                                    </h3>
                                    <div className="flex gap-2">
                                        {files.some(f => f.status === 'completed') && (
                                            <button
                                                onClick={handleSubmit}
                                                className="px-4 py-1.5 text-sm bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
                                            >
                                                Process All
                                            </button>
                                        )}
                                        <button
                                            onClick={clearAllFiles}
                                            className="px-4 py-1.5 text-sm text-red-500 hover:text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>

                                {files.map(file => (
                                    <FileItem
                                        key={file.id}
                                        file={file}
                                        progress={uploadProgress[file.id] || 0}
                                        onRemove={() => removeFile(file.id)}
                                        getFileIcon={getFileIcon}
                                        formatSize={formatSize}
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
                accept=".txt,.doc,.docx,.pdf,.png,.jpg,.jpeg,.gif,.webp,.svg,.mp3,.mp4,.wav,.zip,.tar,.gz,.json,.xml,.md"
            />
        </>
    );
};

// File Item Component
const FileItem = ({ file, progress, onRemove, getFileIcon, formatSize }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isCompleted = progress >= 100;

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:border-gray-200 dark:hover:border-primary-500/50 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary-500/10"
        >
            {/* Progress Background */}
            <div
                className="absolute inset-0 bg-gray-50 dark:bg-primary-900/20 transition-all duration-500"
                style={{ width: `${progress}%` }}
            />

            <div className="relative flex items-center gap-4 p-4">
                {/* File Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-red-500 dark:text-gray-400">
                    {getFileIcon(file.type)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate" title={file.name}>
                            {file.name}
                        </p>
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
                            {isCompleted ? (
                                <span className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400">
                                    <FiCheck className="w-3 h-3" /> Ready
                                </span>
                            ) : (
                                `${Math.round(progress)}%`
                            )}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${ isCompleted ? 'bg-green-700/80' : 'bg-green-700/40'} dark:bg-gradient-to-r dark:from-primary-500 dark:to-purple-500 rounded-full transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Metadata - Light: gray-400, Dark: gray-500 */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                        <span>{formatSize(file.size)}</span>
                        <span>•</span>
                        <span>{file.type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                    </div>
                </div>

                {/* Actions - Remove Button */}
                <div className={`flex-shrink-0 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <button
                        onClick={onRemove}
                        className="p-2 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                        title="Remove file"
                    >
                        <FiX className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
