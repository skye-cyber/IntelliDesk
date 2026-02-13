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

    async _execute({ path: filePath, offset = 0, limit = null }, context) {
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

    validateFilePath(filePath) {
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

        return true;
    }

    formatResult(result) {
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
        };
    }
}
