import { useEffect, useState } from 'react';
import { globalEventBus } from '../../../core/Globals/eventBus';
import { FiX, FiPaperclip, FiImage, FiFile, FiMusic, FiVideo } from 'react-icons/fi';
import { File as UploadedFile } from '../../../core/managers/Conversation/Mistral/InputProcessor';


export const InputFileDisplay = () => {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    useEffect(() => {
        // Listen for file uploads
        const handleFileUpload = (newFiles: UploadedFile[]) => {
            setFiles(prev => [...prev, ...newFiles]);
        };

        const handleFileRemoved = (fileId: string) => {
            setFiles(prev => prev.filter(f => f.id !== fileId));
        };

        const handleClearAll = () => {
            setFiles([]);
        };

        globalEventBus.on('files:uploaded', handleFileUpload);
        globalEventBus.on('file:removed', handleFileRemoved);
        globalEventBus.on('files:cleared', handleClearAll);

        return () => {
            globalEventBus.off('files:uploaded', handleFileUpload);
            globalEventBus.off('file:removed', handleFileRemoved);
            globalEventBus.off('files:cleared', handleClearAll);
        };
    }, []);

    const removeFile = (fileId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        globalEventBus.emit('file:remove-request', fileId);
        setFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const clearAllFiles = () => {
        globalEventBus.emit('files:clear-request');
        setFiles([]);
    };

    const openDropzone = () => {
        globalEventBus.emit('dropzone:open');
    };

    if (files.length === 0) return null;

    const getFileIcon = (file: UploadedFile) => {
        if (file.isImage) return <FiImage className="w-4 h-4 text-blue-500" />;
        if (file.type.startsWith('video')) return <FiVideo className="w-4 h-4 text-purple-500" />;
        if (file.type.startsWith('audio')) return <FiMusic className="w-4 h-4 text-green-500" />;
        return <FiFile className="w-4 h-4 text-gray-500" />;
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="relative mb-2 px-4">
            {/* File chips container */}
            <div className="flex flex-wrap gap-2 items-center">
                {files.slice(0, 3).map(file => (
                    <div
                        key={file.id}
                        className="group relative flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200"
                    >
                        {/* File preview for images */}
                        {file.isImage && file.preview ? (
                            <img
                                src={file.preview}
                                alt={file.name}
                                className="w-5 h-5 rounded object-cover"
                            />
                        ) : (
                            getFileIcon(file)
                        )}

                        <span className="text-sm text-gray-700 dark:text-gray-300 max-w-[150px] truncate">
                            {file.name}
                        </span>

                        <span className="text-xs text-gray-400">
                            {formatSize(file.size)}
                        </span>

                        <button
                            onClick={(e) => removeFile((file.id as string), e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                        >
                            <FiX className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>
                ))}

                {files.length > 3 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 px-2">
                        +{files.length - 3} more
                    </div>
                )}

                {/* Add more button */}
                <button
                    onClick={openDropzone}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all duration-200"
                >
                    <FiPaperclip className="w-4 h-4" />
                    <span>Add</span>
                </button>

                {/* Clear all button */}
                {files.length > 0 && (
                    <button
                        onClick={clearAllFiles}
                        className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                    >
                        Clear all
                    </button>
                )}
            </div>
        </div>
    );
};
