import { staticPortalBridge } from "../../../PortalBridge.ts";
import { StateManager } from "../../StatesManager.ts";
import { MessageRole } from "./types.ts";

interface ConfigType {
    maxFiles: number
    maxFileSize: number
    allowMixedTypes: boolean
}

type ImageURL = {
    url: string;
    detail?: string | null | undefined;
};

type DocumentURLType = 'document_url'

type DocumentUrl = {
    documentUrl: string;
    documentName?: string | null | undefined;
    type?: DocumentURLType | undefined;
}

enum ContentType {
    text = "text",
    document_url = "document_url",
    image_url = 'image_url',
}

enum FileType {
    image = 'image',
    document = 'document',
    text = 'text'
}

interface FileMetadata {
    lastModified: string | Date | any
    name: string
    size: number
    type: string
    webkitRelativePath: string
}

export interface File {
    id?: string
    name: string
    used?: boolean
    size: number
    type: FileType
    url: string | any
    isImage?: boolean
    isDocument?: boolean
    file?: FileMetadata
    preview?: string
}
interface rejectedFile {
    name: string
    reasons: string[]
}

interface userContent {
    type: ContentType,
    text?: string
    imageUrl?: ImageURL | string
    documentUrl?: DocumentUrl | string
}

interface FileGroup {
    image?: File[]
    document?: File[]
    text?: File[]
}

interface processResult {
    userMessagePID: string
    userContent: userContent[]
}
interface validationResponse {
    validFiles: File[]
    rejectedFiles: rejectedFile[]
}

// MIME type mappings by category
export const FileMimeMap = {
    image: [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "image/gif",
        "image/avif",
        "image/tiff"
    ],
    document: [
        "application/pdf",
        "text/plain",
        "text/markdown",
        "text/html",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ],
    text: [
        "text/plain",
        "text/markdown",
        "text/x-markdown",
        "text/html",
        "text/xml",
        "application/json",
        "text/json",
        "text/yaml",
        "text/x-yaml",
        "text/csv",
        "text/css",
        "text/javascript",
        "application/javascript",
        "text/typescript",
        "application/x-typescript",
        "text/x-python",
        "text/x-java",
        "text/x-c",
        "text/x-c++",
        "text/x-go",
        "text/x-rust",
        "text/x-ruby",
        "text/x-php",
        "text/x-swift",
        "text/x-kotlin",
        "text/x-scala",
        "text/x-r",
        "text/x-shellscript",
        "application/x-sh",
        "text/x-sql",
        "text/x-dockerfile",
        "text/x-makefile",
        "text/x-cmake",
        "text/x-asm",
        "text/x-latex",
        "text/x-bibtex"
    ]
}

// Flat array of all supported MIME types for quick lookup
const SUPPORTED_FILE_MIMETYPES = [
    ...FileMimeMap.image,
    ...FileMimeMap.document,
    ...FileMimeMap.text
]

// Get category from MIME type
function getMimeCategory(mimeType: string): FileType | null {
    if (FileMimeMap.image.includes(mimeType)) return FileType.image;
    if (FileMimeMap.document.includes(mimeType)) return FileType.document;
    if (FileMimeMap.text.includes(mimeType)) return FileType.text;
    return null;
}

// Check if MIME type is supported
function isSupportedMimeType(mimeType: string): boolean {
    return SUPPORTED_FILE_MIMETYPES.includes(mimeType);
}

class FileInputProcessor {
    public config: ConfigType

    constructor() {
        this.config = {
            maxFiles: 3,
            maxFileSize: 20 * 1024 * 1024, // 20MB default
            allowMixedTypes: false
        }
    }
    updateConfig(options: ConfigType) {
        this.config = {
            ...this.config,
            ...options
        }
    }
    /**
     * Prepares user input content with file attachments
     * @param {string} text - The user's text message
     * @returns {processResult} Formatted content array for API
     */
    process(text: string): processResult {
        const files: File[] = StateManager.get('uploaded_files') || [];
        let userContent: userContent[] = [];

        // Always include text content
        if (text && text.trim()) {
            userContent.push(
                {
                    type: ContentType.text,
                    text: text?.trim()
                }
            );
        }

        // Process files if available
        if (files.length >= 1) {
            const { validFiles, rejectedFiles } = this.validateFiles(files);
            // Log rejected files for debugging
            if (rejectedFiles.length > 0) {
                console.warn(rejectedFiles.length, 'Files rejected');
            }
            if (validFiles.length > 0) {
                const fileContent = this.processFilesByType(validFiles);
                userContent = [...userContent, ...fileContent];
            }
            // Mark file as use
            files.forEach(file => this.MarkUsedFile(file))
        }

        const userMessagePID = staticPortalBridge.showComponentInTarget('UserMessage', 'chatArea', { message: text, files: userContent.filter(c => c.type !== "text") }, 'user_message')
        window.desk.api.addHistory({ role: MessageRole.user, content: userContent });

        //console.log('Prepared user content:', userContent);
        return { userMessagePID: userMessagePID, userContent: userContent };
    }
    /**
     * Validates files based on this.config constraints
     * @param {files} File[]
     * @returns {validationResponse}
     */
    validateFiles(files: File[]): validationResponse {
        const validFiles: File[] = [];
        const rejectedFiles: rejectedFile[] = [];
        const seenTypes = new Set();

        for (const file of files) {
            const rejectionReasons: string[] = [];

            // Check if file was appended to conversation
            if (file.used) {
                rejectionReasons.push(`File already used/exists in current conversation`);
            }
            // Check file count
            if (validFiles.length >= this.config.maxFiles) {
                rejectionReasons.push(`Maximum ${this.config.maxFiles} files allowed`);
            }

            // Check file size
            if (file.size > this.config.maxFileSize) {
                const maxSizeMB = (this.config.maxFileSize / (1024 * 1024)).toFixed(1);
                rejectionReasons.push(`File exceeds ${maxSizeMB}MB limit`);
            }

            // Get actual MIME type from file metadata
            const mimeType = file.file?.type || file.type as unknown as string;

            // Check if MIME type is supported using the new helper
            if (!mimeType || !isSupportedMimeType(mimeType)) {
                rejectionReasons.push('Invalid or unsupported file type');
            }

            // Determine category for mixed type checking
            const category = mimeType ? getMimeCategory(mimeType) : null;

            // Check for mixed types if not allowed
            if (!this.config.allowMixedTypes && category && seenTypes.size > 0 && !seenTypes.has(category)) {
                rejectionReasons.push('Mixing different file types not allowed');
            }

            if (rejectionReasons.length === 0) {
                // Update file type to normalized category
                if (category) {
                    file.type = category;
                }
                validFiles.push(file);
                if (category) {
                    seenTypes.add(category);
                }
            } else {
                rejectedFiles.push({
                    name: file.name,
                    reasons: rejectionReasons
                });
            }
        }

        return { validFiles, rejectedFiles };
    }
    /**
     * Processes files and converts to appropriate content types
     */
    processFilesByType(files: File[]): userContent[] {
        const content: userContent[] = [];
        const filesByType = this.groupFilesByType(files);

        // Handle images
        if (filesByType.image && filesByType.image.length > 0) {
            const imageContent = filesByType.image.map((file: File) => ({
                type: ContentType.image_url,
                imageUrl: {
                    url: file.url,
                    details: `Name: ${file.name}`
                }
            }));
            content.push(...imageContent);
        }

        // Handle documents (includes PDFs and office docs)
        if (filesByType.document && filesByType.document.length > 0) {
            const documentContent = filesByType.document.map((file: File) => ({
                type: ContentType.document_url,
                documentUrl: file.url,
                documentName: file.name

            }));
            content.push(...documentContent);
        }

        // Handle text files
        if (filesByType.text && filesByType.text.length > 0) {
            const textContent = filesByType.text.map((file: File) => ({
                type: ContentType.document_url,
                documentUrl: file.url,
                documentName: file.name
            }));
            content.push(...textContent);
        }

        return content;
    }

    /**
     * Groups files by their type for processing
     */
    groupFilesByType(files: File[]): FileGroup {
        return files.reduce((groups, file) => {
            const category = file.type as FileType;

            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(file);

            return groups;
        }, {} as FileGroup);
    }

    simpleprocessor(text: string) {
        const files = StateManager.get('uploaded_files') || [];
        const userContent: userContent[] = [];

        // Add text content
        if (text && text.trim()) {
            userContent.push(
                {
                    type: ContentType.text,
                    text: text.trim()
                }
            );
        }

        // Add file content with basic validation
        const validFiles = files.slice(0, 5).filter((file: File) => {
            const mimeType = file.file?.type || file.type as unknown as string;
            return file.url && mimeType && isSupportedMimeType(mimeType) && (file.file?.size || file.size) <= 20 * 1024 * 1024;
        });

        for (const file of validFiles) {
            const mimeType = file.file?.type || file.type as unknown as string;
            const category = getMimeCategory(mimeType);

            if (category === FileType.image) {
                userContent.push({
                    type: ContentType.image_url,
                    imageUrl: {
                        url: file.url
                    }
                });
            } else {
                // Document or text files both use document_url
                userContent.push({
                    type: ContentType.document_url,
                    documentUrl: {
                        documentUrl: file.url,
                        documentName: file.name
                    }
                });
            }
        }

        return userContent;
    }

    /**
     * Mark file as use
     */
    MarkUsedFile(file: File): void {
        // console.log("Mark:", file)
        StateManager.get('uploaded_files')?.map((fileItem: File) => {
            if (fileItem === file) fileItem.used = true
        });
    }
    MarkUnused(file: File): void {
        StateManager.get('uploaded_files')?.map((fileItem: File) => {
            if (fileItem !== file) fileItem.used = false
        });
    }
    useAll(): void {
        StateManager.get('uploaded_files')?.map((fileItem: File) => fileItem.used = true);
    }
    unuseAll(): void {
        StateManager.get('uploaded_files')?.map((fileItem: File) => fileItem.used = false);
    }
}

export const fileInputProcessor = new FileInputProcessor()
