/**
 * File Operations Tool - Perform comprehensive file operations
 */
import { ToolBase } from '../ToolBase';
const path = window.desk.path

const fs = window.desk.fsops


export class FileOperationsTool extends ToolBase {
    constructor() {
        super('file_operations', 'Perform file operations (read, write, list, delete, copy, move)');
    }

    defineSchema() {
        return {
            type: "function",
            function: {
                name: "file_operations",
                description: "Perform file operations (read, write, list, delete, copy, move)",
                parameters: {
                    type: "object",
                    properties: {
                        operation: {
                            type: "string",
                            enum: ["read", "write", "list", "delete", "copy", "move", "info"],
                            description: "File operation to perform"
                        },
                        path: {
                            type: "string",
                            description: "Source file path"
                        },
                        content: {
                            type: "string",
                            description: "Content to write (for write operations)"
                        },
                        destination: {
                            type: "string",
                            description: "Destination path (for copy/move operations)"
                        },
                        recursive: {
                            type: "boolean",
                            default: false,
                            description: "Recursive operation (for list/delete operations)"
                        },
                        overwrite: {
                            type: "boolean",
                            default: false,
                            description: "Overwrite existing files"
                        }
                    },
                    required: ["operation", "path"]
                }
            }
        };
    }

    async _execute({ operation, path: filePath, content, destination, recursive = false, overwrite = false }, context) {
        // Validate file path
        this.validateFilePath(filePath);

        switch (operation) {
            case 'read':
                return this.readFile(filePath);
            case 'write':
                return this.writeFile(filePath, content, overwrite);
            case 'list':
                return this.listDirectory(filePath, recursive);
            case 'delete':
                return this.deleteFile(filePath, recursive);
            case 'copy':
                return this.copyFile(filePath, destination, overwrite);
            case 'move':
                return this.moveFile(filePath, destination, overwrite);
            case 'info':
                return this.getFileInfo(filePath);
            default:
                throw new Error(`Unsupported operation: ${operation}`);
        }
    }

    readFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const stats = fs.statSync(filePath);
        const maxFileSize = this.config.max_file_size || 1024 * 1024; // 1MB default
        if (stats.size > maxFileSize) {
            throw new Error(`File size ${stats.size} bytes exceeds maximum allowed ${maxFileSize} bytes`);
        }

        const content = fs.readFileSync(filePath, 'utf8');

        return {
            operation: 'read',
            path: filePath,
            content: content,
            size: stats.size,
            modified: stats.mtime,
            created: stats.birthtime
        };
    }

    writeFile(filePath, content, overwrite) {
        if (!content) {
            throw new Error('Content is required for write operations');
        }

        const fileExists = fs.existsSync(filePath);
        if (fileExists && !overwrite) {
            throw new Error(`File already exists at ${filePath}. Set overwrite=true to overwrite.`);
        }

        // Ensure directory exists
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        fs.writeFileSync(filePath, content, 'utf8');

        return {
            operation: 'write',
            path: filePath,
            bytes_written: Buffer.byteLength(content, 'utf8'),
            file_created: !fileExists,
            file_overwritten: fileExists && overwrite
        };
    }

    listDirectory(dirPath, recursive) {
        if (!fs.existsSync(dirPath)) {
            throw new Error(`Directory not found: ${dirPath}`);
        }

        const stats = fs.statSync(dirPath);
        if (!stats.isDirectory()) {
            throw new Error(`Path is not a directory: ${dirPath}`);
        }

        let items = [];
        if (recursive) {
            items = this.listDirectoryRecursive(dirPath);
        } else {
            const files = fs.readdirSync(dirPath);
            items = files.map(file => {
                const fullPath = path.join(dirPath, file);
                const stat = fs.statSync(fullPath);
                return {
                    name: file,
                    path: fullPath,
                    type: stat.isDirectory() ? 'directory' : 'file',
                    size: stat.size,
                    modified: stat.mtime
                };
            });
        }

        return {
            operation: 'list',
            path: dirPath,
            items: items,
            count: items.length
        };
    }

    listDirectoryRecursive(dirPath) {
        const items = [];
        const files = fs.readdirSync(dirPath);

        for (const file of files) {
            const fullPath = path.join(dirPath, file);
            const stat = fs.statSync(fullPath);

            items.push({
                name: file,
                path: fullPath,
                type: stat.isDirectory() ? 'directory' : 'file',
                size: stat.size,
                modified: stat.mtime
            });

            if (stat.isDirectory()) {
                items.push(...this.listDirectoryRecursive(fullPath));
            }
        }

        return items;
    }

    deleteFile(filePath, recursive) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File/directory not found: ${filePath}`);
        }

        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            if (recursive) {
                fs.rmSync(filePath, { recursive: true, force: true });
            } else {
                throw new Error(`Directory not empty, use recursive=true to delete: ${filePath}`);
            }
        } else {
            fs.unlinkSync(filePath);
        }

        return {
            operation: 'delete',
            path: filePath,
            was_directory: stats.isDirectory(),
            recursive: recursive
        };
    }

    copyFile(sourcePath, destinationPath, overwrite) {
        if (!fs.existsSync(sourcePath)) {
            throw new Error(`Source file not found: ${sourcePath}`);
        }

        if (!destinationPath) {
            throw new Error('Destination path is required for copy operations');
        }

        const destExists = fs.existsSync(destinationPath);
        if (destExists && !overwrite) {
            throw new Error(`Destination already exists: ${destinationPath}. Set overwrite=true to overwrite.`);
        }

        // Ensure destination directory exists
        const destDir = path.dirname(destinationPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        fs.copyFileSync(sourcePath, destinationPath);

        const stats = fs.statSync(destinationPath);

        return {
            operation: 'copy',
            source: sourcePath,
            destination: destinationPath,
            bytes_copied: stats.size,
            file_overwritten: destExists && overwrite
        };
    }

    moveFile(sourcePath, destinationPath, overwrite) {
        if (!fs.existsSync(sourcePath)) {
            throw new Error(`Source file not found: ${sourcePath}`);
        }

        if (!destinationPath) {
            throw new Error('Destination path is required for move operations');
        }

        const destExists = fs.existsSync(destinationPath);
        if (destExists && !overwrite) {
            throw new Error(`Destination already exists: ${destinationPath}. Set overwrite=true to overwrite.`);
        }

        // Ensure destination directory exists
        const destDir = path.dirname(destinationPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        fs.renameSync(sourcePath, destinationPath);

        const stats = fs.statSync(destinationPath);

        return {
            operation: 'move',
            source: sourcePath,
            destination: destinationPath,
            bytes_moved: stats.size,
            file_overwritten: destExists && overwrite
        };
    }

    getFileInfo(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const stats = fs.statSync(filePath);

        return {
            operation: 'info',
            path: filePath,
            exists: true,
            type: stats.isDirectory() ? 'directory' : 'file',
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            accessed: stats.atime,
            permissions: this.getFilePermissions(stats)
        };
    }

    getFilePermissions(stats) {
        const mode = stats.mode.toString(8).slice(-3);
        return {
            owner: mode[0],
            group: mode[1],
            other: mode[2],
            octal: stats.mode.toString(8)
        };
    }

    validateFilePath(filePath) {
        if (!filePath || typeof filePath !== 'string') {
            throw new Error('Invalid file path');
        }

        if (filePath.includes('..') || filePath.includes('~')) {
            throw new Error('File path contains invalid characters');
        }

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
            tool: this.name,
            operation: result.operation,
            ...result
        };
    }
}
