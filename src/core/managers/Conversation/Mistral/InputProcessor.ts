import { staticPortalBridge } from "../../../PortalBridge.ts";
import { StateManager } from "../../StatesManager";
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
    documentName?: string | null | undefined; // The filename of the document
    type?: DocumentURLType | undefined;
}

enum ContentType {
    text = "text",
    document_url = "document_url",
    image_url = 'image_url',
}

enum FileType {
    image = 'image',
    document = 'document'
}

interface FileMetadata {
    lastModified: string | Date | any
    name: string
    size: number
    type: string
    webkitRelativePath: string
}

interface File {
    name: string
    used: boolean
    size: number
    type: FileType
    url: string | any
    is_image?: boolean
    is_document?: boolean
    file?: FileMetadata
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
    pdf?: File[]
}

interface processResult {
    userMessagePID: string
    userContent: userContent[]
}
interface validationResponse {
    validFiles: File[]
    rejectedFiles: rejectedFile[]
}

class MultimodalProcessor {
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

            // Check file type validity
            if (!file.type && file.file?.type || !['image', 'document', 'pdf', 'text'].includes(file.type)) {
                rejectionReasons.push('Invalid file type');
            }

            // Check for mixed types if not allowed
            if (!this.config.allowMixedTypes && seenTypes.size > 0 && !seenTypes.has(file.type)) {
                rejectionReasons.push('Mixing different file types not allowed');
            }

            if (rejectionReasons.length === 0) {
                validFiles.push(file);
                seenTypes.add(file.type || file.file?.type);
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
                image_url: file.url
            }));
            content.push(...imageContent);
        }

        // Handle documents
        if (filesByType.document && filesByType.document.length > 0) {
            const documentContent = filesByType.document.map((file: File) => ({
                type: ContentType.document_url,
                documentUrl: file.url
                // { // Fixed: should be document_url not documentUrl
                //     url: file.url,
                //     name: file.name,
                //     size: file.size
                // }

            }));
            content.push(...documentContent);
        }

        // Handle PDFs separately if needed
        if (filesByType.pdf && filesByType.pdf.length > 0) {
            const pdfContent = filesByType.pdf.map((file: File) => ({
                type: ContentType.document_url,
                documentUrl: file.url
                // {
                //     url: file.url,
                //     name: file.name,
                //     size: file.size,
                //     mime_type: 'application/pdf'
                // }
            }));
            content.push(...pdfContent);
        }

        return content;
    }

    /**
     * Groups files by their type for processing
     */
    groupFilesByType(files: File[]): FileGroup {
        return files.reduce((groups, file) => {
            let filetype = file.type // Default to document if type missing

            filetype = (filetype === FileType.image || file.is_image) ? FileType.image : FileType.document

            if (!groups[filetype]) {
                groups[filetype] = [];
            }
            groups[filetype].push(file);

            return groups;
        }, {}) as FileGroup;
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
        const validFiles = files.slice(0, 5).filter((file: File) =>
            file.url && (file.type || file.file?.type) && (file.file?.size || file.size) <= 20 * 1024 * 1024
        );

        for (const file of validFiles) {
            if (file.type === "image") {
                userContent.push({
                    type: ContentType.image_url,
                    imageUrl: {
                        url: file.url
                    }
                });
            } else {
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

export const multimodalProcessor = new MultimodalProcessor()

