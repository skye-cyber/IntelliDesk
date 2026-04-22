/// <reference path="../../../main/preload.type.ts" />
/**
 * File Operations Tool - Perform comprehensive file operations
 */
import { ToolBase } from '../ToolBase';
const path = window.desk.path

const fs = window.desk.fs
const fsops = window.desk.fsops

export class FileSystemTool extends ToolBase {
    constructor() {
        super('filesystem', 'Perform file operations (read, write, list, stats, delete, copy, move, exists, read_dir, rmdir, mkdir)');
    }

    defineSchema() {
        return {
            type: "function",
            function: {
                name: "filesystem",
                description: "Perform file system operations (read, write, list, stats, delete, copy, move, exists, read_dir, rmdir, mkdir)",
                parameters: {
                    type: "object",
                    properties: {
                        operation: {
                            type: "string",
                            enum: ["read", "write", "list", "delete", "copy", "move", "stats", 'exists', 'read_dir', 'rmdir', 'mkdir'],
                            description: "Filesystem operation to perform"
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

    async _execute({ operation, path: filePath, content, destination, recursive = true, overwrite = false }, context) {
        // Validate file path
        this.validateFilePath(filePath);

        if (this.config.denylist.includes(operation)) throw new Error("Operation not permitted. Requires explicit permission from user.")

        switch (operation) {
            case 'read':
                return this.readFile(filePath);
            case 'write':
                return this.writeFile(filePath, content, overwrite);
            case 'list':
                return this.listDirectory(filePath, recursive);
            case 'delete':
                return this.delete(filePath, recursive);
            case 'copy':
                return this.copy(filePath, destination, overwrite);
            case 'move':
                return this.move(filePath, destination, overwrite);
            case 'stats':
                return this.getFileInfo(filePath);
            case 'exists':
                return this.exists(filePath)
            case 'read_dir':
                return this.readDir(filePath, recursive)
            case 'rmdir':
                return this.rmdir(filePath, recursive)
            case 'mkdir':
                return this.mkdir(filePath, recursive)
            default:
                throw new Error(`Unsupported operation: ${operation}`);
        }
    }

    readFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const stats = fsops.stat(filePath).stats //fs.statSync(filePath);
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
            modified: stats.modified,
            created: stats.created
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

    async exists(filePath) {
        const result = await fsops.exists(filePath)
        if (result.success) return {
            ...result,
            operation: "existence_check"
        }
        throw new Error(result.error)
    }

    async readDir(filePath, recursive) {
        const result = fs.rmdirSync(filePath, recursive)
        if (result.success) return {
            ...result,
            operation: "read_dir"
        }
        throw new Error(result.error)
    }

    async readDir(filePath, recursive) {
        const result = await fsops.readDir(filePath, recursive)
        if (result.success) return {
            ...result,
            operation: "read_dir"
        }
        throw new Error(result.error)
    }
    async rmdir(filePath, recursive) {
        const result = await fsops.rmdir(filePath, recursive)
        console.log(result)
        if (result.success) return {
            ...result,
            operation: "rmdir"
        }
        throw new Error(result.error)
    }
    async mkdir(filePath, recursive) {
        const result = fsops.mkdir(filePath, recursive)
        if (result.success) return {
            ...result,
            operation: "mkdir"
        }
        throw new Error(result.error)
    }

    listDirectory(dirPath, recursive) {
        if (!fs.existsSync(dirPath)) {
            throw new Error(`Directory not found: ${dirPath}`);
        }

        // const stats = fs.statSync(dirPath);
        // if (!stats.isDirectory()) {
        //     throw new Error(`Path is not a directory: ${dirPath}`);
        // }

        let items = [];
        if (recursive) {
            items = this.listDirectoryRecursive(dirPath);
        } else {
            const files = fs.readdirSync(dirPath);
            items = files.map(file => {
                const fullPath = path.join(dirPath, file);
                const stat = fsops.stat(fullPath).stats //fs.statSync(fullPath);
                return {
                    name: file,
                    path: fullPath,
                    type: stat.isDirectory ? 'directory' : 'file',
                    size: stat.size,
                    modified: stat.modified
                };
            });
        }

        return {
            operation: 'list',
            path: dirPath,
            items: [...items],
            count: items.length
        };
    }

    listDirectoryRecursive(dirPath, max_depth = 30) {
        const items = [];

        try {
            const files = fs.readdirSync(dirPath);
            let depth = 1

            for (const file of files) {
                const fullPath = path.join(dirPath, file);
                if (depth >= max_depth) break

                try {
                    // Call statSync (not async stat)
                    const result = fsops.stat(fullPath);

                    if (!result.success) {
                        console.warn(`Failed to stat ${file}: ${result.error}`);
                        continue;
                    }

                    const stats = result.stats;

                    // Create item object with all stats
                    const item = {
                        name: file,
                        path: fullPath,
                        ...stats,
                        isDirectory: stats.isDirectory,
                        isFile: stats.isFile,
                        isSymbolicLink: stats.isSymbolicLink
                    };

                    items.push(item);

                    // Recurse if it's a directory
                    if (stats.isDirectory === true) {
                        const subItems = this.listDirectoryRecursive(fullPath);
                        items.push(...subItems);
                    }

                } catch (err) {
                    console.warn(`Error processing ${file}:`, err.message);
                }
                depth += 1
            }

        } catch (err) {
            console.error(`Cannot read directory ${dirPath}:`, err.message);
        }

        return items;
    }

    delete(filePath, recursive) {
        // const existsCheck = this.exists(filePath);
        // if (!existsCheck.exists) {
        //     throw new Error(`File/directory not found: ${filePath}`);
        // }
        //
        // //const stats = fsops.stat(filePath).stats //fs.statSync(filePath);
        //
        // if (existsCheck.isDirectory) {
        //     if (recursive) {
        //         fs.rmSync(filePath, { recursive: true, force: true });
        //     } else {
        //         throw new Error(`Directory not empty, use recursive=true to delete: ${filePath}`);
        //     }
        // } else {
        //     fs.unlinkSync(filePath);
        // }

        const result = fsops.delete(filePath, recursive)
        return {
            operation: 'delete',
            ...result,
            path: filePath,
            was_directory: stats.isDirectory,
            recursive: recursive
        };
    }

    async copy(sourcePath, destinationPath, overwrite) {
        const result = await fsops.copy(sourcePath, destinationPath, overwrite)
        const stats = fsops.stat(sourcePath).stats
        let count = 1

        if (stats.isDirectory) count = this.listDirectory(sourcePath, true).count

        if (result.success) return {
            ...result,
            count: count,
            operation: "copy"
        }
        throw new Error(result.error)
    }

    async move(sourcePath, destinationPath, overwrite) {
        const stats = fsops.stat(sourcePath).stats
        let count = 1

        if (stats.isDirectory) count = this.listDirectory(sourcePath, true).count

        const result = await fsops.move(sourcePath, destinationPath, overwrite)

        if (result.success) return {
            ...result,
            count: count,
            operation: "move"
        }
        throw new Error(result.error)
    }

    getFileInfo(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const stats = fsops.stat(filePath).stats //fs.statSync(filePath);
        return {
            operation: 'stats',
            path: filePath,
            stats: {
                ...stats,
                exists: true,
                type: stats.isDirectory ? 'directory' : 'file',
            }
        };
    }

    getFilePermissions(stats) {
        return {
            owner: stats.owner,
            group: stats.group,
            other: stats.other,
        };
    }

    validateFilePath(filePath) {
        if (!filePath || typeof filePath !== 'string') {
            throw new Error('Invalid file path');
        }

        if (['/', '\\'].includes(filePath)) {
            throw new Error('File path cannot be root');
        }

        if (filePath.includes('..') || filePath.includes('~')) {
            throw new Error('File path contains invalid characters');
        }

        const allowedDirectories = this.config.safe_paths || [];
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
            operation: result.operation,
            ...result
        };
    }
}
