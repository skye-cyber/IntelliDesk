/// <reference path="../../../main/preload.type.ts" />
/**
 * Read File Tool - Read UTF-8 files with safety constraints and line range support
 */
import { ToolBase } from '../ToolBase';

const path = window.desk.path
const fs = window.desk.fs

export class ReadFileTool extends ToolBase {
    constructor() {
        super('read_file', 'Read a UTF-8 file, returning content from a specific line range. Reading is capped by a byte limit for safety.');
    }

    defineSchema() {
        return {
            type: "function",
            function: {
                name: "read_file",
                description: "Read a UTF-8 file, returning content from a specific line range. Reading is capped by a byte limit for safety.",
                parameters: {
                    type: "object",
                    properties: {
                        path: {
                            type: "string",
                            description: "The file path to read"
                        },
                        offset: {
                            type: "integer",
                            default: 0,
                            description: "Line number to start reading from (0-indexed, inclusive)."
                        },
                        limit: {
                            anyOf: [
                                {
                                    type: "integer"
                                },
                                {
                                    type: "null"
                                }
                            ],
                            default: null,
                            description: "Maximum number of lines to read."
                        }
                    },
                    required: ["path"]
                }
            }
        };
    }

    async _execute(params: any, context: any) {
        const { path: filePath, offset = 0, limit = null } = params
        // Validate file path
        this.validateFilePath(filePath);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        // Get file stats
        const stats = fs.statSync(filePath);
        const fileSize = stats.size;

        // Apply max file size limit
        const maxFileSize = this.config.max_file_size || 1024 * 1024; // Default: 1MB
        if (fileSize > maxFileSize) {
            throw new Error(`File size ${fileSize} bytes exceeds maximum allowed ${maxFileSize} bytes`);
        }

        // Read file content
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const allLines = fileContent.split('\n');
        const totalLines = allLines.length;

        // Validate offset
        if (offset < 0 || offset >= totalLines) {
            throw new Error(`Offset ${offset} is out of bounds for file with ${totalLines} lines`);
        }

        // Determine lines to read
        let linesToRead = allLines;
        if (offset > 0) {
            linesToRead = allLines.slice(offset);
        }

        // Apply limit
        if (limit !== null && limit > 0) {
            linesToRead = linesToRead.slice(0, limit);
        }

        // Check if content was truncated
        const wasTruncated = limit !== null && limit > 0 && linesToRead.length === limit && offset + limit < totalLines;

        return {
            path: filePath,
            content: linesToRead.join('\n'),
            offset: offset,
            limit: limit,
            lines_read: linesToRead.length,
            total_lines: totalLines,
            was_truncated: wasTruncated,
            file_size: fileSize,
            timestamp: new Date().toISOString()
        };
    }

    validateFilePath(filePath: string) {
        // Basic validation to prevent directory traversal attacks
        if (!filePath || typeof filePath !== 'string') {
            throw new Error('Invalid file path');
        }

        // Check for suspicious patterns
        if (filePath.includes('..') || filePath.includes('~')) {
            throw new Error('File path contains invalid characters');
        }

        // Check if path is within allowed directories
        const allowedDirectories = this.config.allowed_directories || [];
        if (allowedDirectories.length > 0) {
            const fileDir = path.dirname(filePath);
            const isAllowed = allowedDirectories.some(allowedDir =>
                fileDir.startsWith(allowedDir)
            );

            if (!isAllowed) {
                throw new Error(`File path ${filePath} is not in allowed directories`);
            }
        }

        // Check if path leads to binary file

        return this.validateNotBinary(filePath);
    }

    /**
     * Checks if a given file path leads to a binary file
     * @param filePath - The file path to validate
     * @returns True if the file is binary, false otherwise
     */
    isBinaryFile(filePath: string): boolean {
        // Common binary file extensions (not covered by the MIME map)
        const binaryExtensions = [
            // Executables
            '.exe', '.bin', '.appimage', '.deb', '.nsis', '.snap',
            // Archives
            '.zip', '.tar', '.gz', '.7z', '.rar', '.bz2', '.xz',
            // Media files (additional to image/audio)
            '.mp3', '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv',
            '.wav', '.flac', '.m4a', '.ogg',
            // Disk images
            '.iso', '.img', '.dmg',
            // Other binaries
            '.so', '.dll', '.dylib', '.o', '.obj', '.class',
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
            // System files
            '.dat', '.db', '.sqlite', '.mdb'
        ];

        const lowerPath = filePath.toLowerCase();

        // Check against known binary extensions
        return binaryExtensions.some(ext => lowerPath.endsWith(ext));
    }

    /**
     * Checks if a file is supported (not binary and in allowed MIME types)
     * @param filePath - The file path to validate
     * @returns True if the file is supported, false otherwise
     */
    isSupportedFile(filePath: string): boolean {
        return !this.isBinaryFile(filePath);
    }

    /**
     * Validates a file path and throws an error if it's binary
     * @param filePath - The file path to validate
     * @throws Error if the file is binary
     */
    validateNotBinary(filePath: string): void {
        if (this.isBinaryFile(filePath)) {
            throw new Error(`Binary file detected and not supported: ${filePath}`);
        }
    }

    formatResult(result: any) {
        return {
            success: true,
            //tool: this.name,
            path: result.path,
            content: result.content,
            offset: result.offset,
            limit: result.limit,
            lines_read: result.lines_read,
            total_lines: result.total_lines,
            was_truncated: result.was_truncated,
            file_size: result.file_size,
            timestamp: result.timestamp
        } as any;
    }
}
