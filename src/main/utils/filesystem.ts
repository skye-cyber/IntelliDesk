import { dialog } from "electron";
import { OpenDialogOptions } from "electron/utility";
import fsSync from "fs";
import fs from "fs/promises";
import path from "node:path";
import type {
    readFileSuccess, readFileError, writeFileSuccess, writeFileError,
    appendFileSuccess, appendFileError, fileExistsStats, fileExistsStatError,
    FileSystemError, FileInfoSuccess, mkdirSuccess, deleteSuccess, deleteError,
    copySuccess, copyError, moveSuccess, moveError, statPathSuccess, statPathError,
    watchFileSuccess,
    watchFileError,
    saveDialogResponse,
    saveDialogError,
    openDialogResponse,
    openDialogError,
    rmdirError,
    rmdirSuccess
} from "./types";

// Type guard functions
function isWriteFileSuccess(obj: any): obj is writeFileSuccess {
    return obj && typeof obj === 'object' && 'success' in obj && 'exists' in obj;
}

function isFileExistsStats(obj: any): obj is fileExistsStats {
    return obj && typeof obj === 'object' && 'success' in obj && 'exists' in obj && 'isDirectory' in obj;
}

function isFileInfoSuccess(obj: any): obj is FileInfoSuccess {
    return obj && typeof obj === 'object' && 'success' in obj && 'files' in obj;
}

export const fsOperations = {
    /**
     * Read file content
     */
    async readFile(filePath: string, encoding: BufferEncoding | null = 'utf8'): Promise<readFileSuccess | readFileError> {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return { success: false, code: 404, error: 'Invalid file path', path: filePath };
            }

            const absolutePath = path.resolve(filePath);
            const data = await fs.readFile(absolutePath, { encoding: encoding as BufferEncoding | undefined });

            return {
                success: true,
                data,
                path: absolutePath,
                size: data.length,
                encoding: encoding
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: (error as NodeJS.ErrnoException)?.code || 500,
                path: filePath
            };
        }
    },

    /**
     * Write content to file
     */
    async writeFile(filePath: string, content: string, encoding: BufferEncoding | null = 'utf8'): Promise<writeFileSuccess | writeFileError> {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return { success: false, code: 404, error: 'Invalid file path', path: filePath };
            }

            if (content === undefined || content === null) {
                return { success: false, code: 400, error: 'Content cannot be null or undefined', path: filePath };
            }

            const absolutePath = path.resolve(filePath);

            // Create directory if it doesn't exist
            const dir = path.dirname(absolutePath);
            await fs.mkdir(dir, { recursive: true });

            await fs.writeFile(absolutePath, content, { encoding: encoding as BufferEncoding | undefined });

            const stats = await fs.stat(absolutePath);
            const existsCheck = await this.exists(filePath);

            return {
                success: true,
                path: absolutePath,
                bytesWritten: stats.size,
                created: (isFileExistsStats(existsCheck) && existsCheck.exists)
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: (error as NodeJS.ErrnoException)?.code || 500,
                path: filePath
            };
        }
    },

    /**
     * Append content to file
     */
    async appendFile(filePath: string, content: string, encoding: BufferEncoding | null = 'utf8'): Promise<appendFileSuccess | appendFileError> {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return { success: false, code: 404, error: 'Invalid file path', path: filePath };
            }

            const absolutePath = path.resolve(filePath);
            await fs.appendFile(absolutePath, content, { encoding: encoding as BufferEncoding | undefined });

            const stats = await fs.stat(absolutePath);

            return {
                success: true,
                path: absolutePath,
                size: stats.size,
                encoding: encoding,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: (error as NodeJS.ErrnoException)?.code || 500,
                path: filePath
            };
        }
    },

    /**
     * Check if file or directory exists
     */
    async exists(filePath: string): Promise<fileExistsStats | fileExistsStatError> {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return { success: false, code: 404, path: filePath, error: 'Invalid path' };
            }

            const absolutePath = path.resolve(filePath);

            try {
                const stats = await fs.stat(absolutePath);
                return {
                    success: true,
                    exists: true,
                    isFile: stats.isFile(),
                    isDirectory: stats.isDirectory(),
                    size: stats.size,
                    modified: stats.mtime,
                    path: absolutePath
                };
            } catch (error: any) {
                if (error.code === 'ENOENT') {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        code: (error as NodeJS.ErrnoException)?.code || 500,
                        path: absolutePath
                    };
                }
                throw error;
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: (error as NodeJS.ErrnoException)?.code || 500,
                path: filePath,
            };
        }
    },

    /**
     * List directory contents
     */
    async readDir(dirPath: string, recursive: boolean = false): Promise<FileSystemError | FileInfoSuccess> {
        try {
            if (!dirPath || typeof dirPath !== 'string') {
                return { success: false, code: 400, error: 'Invalid directory path', path: dirPath };
            }

            const absolutePath = path.resolve(dirPath);
            const items = await fs.readdir(absolutePath, { withFileTypes: true });

            const files = await Promise.all(
                items.map(async (item) => {
                    const itemPath = path.join(absolutePath, item.name);
                    const stats = await fs.stat(itemPath);

                    const fileInfo: any = {
                        name: item.name,
                        path: itemPath,
                        type: item.isDirectory() ? 'directory' :
                            item.isFile() ? 'file' :
                                item.isSymbolicLink() ? 'symlink' : 'other',
                        size: stats.size,
                        modified: stats.mtime,
                        created: stats.birthtime,
                        mode: stats.mode.toString(8),
                        children: null
                    };

                    if (recursive && item.isDirectory()) {
                        const subResult = await this.readDir(itemPath, recursive);
                        if (isFileInfoSuccess(subResult)) {
                            fileInfo.children = subResult.files;
                        }
                    }

                    return fileInfo;
                })
            );

            return {
                success: true,
                files: files,
                path: absolutePath,
                count: files.length
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: (error as NodeJS.ErrnoException)?.code || 500,
                path: dirPath
            };
        }
    },

    /**
     * Create directory
     */
    async mkdir(dirPath: string): Promise<mkdirSuccess | FileSystemError> {
        try {
            if (!dirPath || typeof dirPath !== 'string') {
                return { success: false, code: 400, error: 'Invalid directory path', path: dirPath };
            }

            const absolutePath = path.resolve(dirPath);
            const existsCheck = await this.exists(dirPath);
            const existed = (isFileExistsStats(existsCheck) && existsCheck.exists);

            if (!existed) {
                await fs.rmdir(absolutePath);
            }

            return {
                success: true,
                path: absolutePath,
                created: !existed,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: (error as NodeJS.ErrnoException)?.code || 500,
                path: dirPath
            };
        }
    },

    /**
     * Remove empty directory
     */
    async rmdir(dirPath: string, recursive: boolean = true): Promise<rmdirError | rmdirSuccess> {
        try {
            if (!dirPath || typeof dirPath !== 'string') {
                return { success: false, code: 400, error: 'Invalid directory path', path: dirPath };
            }

            const absolutePath = path.resolve(dirPath);
            const existsCheck = await this.exists(dirPath);
            const existed = (isFileExistsStats(existsCheck) && existsCheck.exists);

            if (!existed) {
                await fs.mkdir(absolutePath, { recursive });
            }

            return {
                success: true,
                path: absolutePath,
                deleted: !existed,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: (error as NodeJS.ErrnoException)?.code || 500,
                path: dirPath
            };
        }
    },
    /**
     * Delete file or directory
     */
    async delete(filePath: string, recursive: boolean = false): Promise<deleteSuccess | deleteError> {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return {
                    success: false,
                    code: 400,
                    error: 'Invalid path',
                    path: filePath,
                    type: undefined
                };
            }

            const absolutePath = path.resolve(filePath);
            const existsCheck = await this.exists(absolutePath);

            if (!isFileExistsStats(existsCheck) || !existsCheck.exists) {
                return {
                    success: false,
                    error: 'Path does not exist',
                    path: absolutePath,
                    code: 404,
                    type: undefined
                };
            }

            const isDirectory = existsCheck.isDirectory || false;

            if (isDirectory) {
                if (recursive) {
                    await fs.rm(absolutePath, { recursive: true, force: true });
                } else {
                    // Check if directory is empty
                    const items = await fs.readdir(absolutePath);
                    if (items.length > 0) {
                        return {
                            success: false,
                            error: 'Directory is not empty. Use recursive=true to delete.',
                            path: absolutePath,
                            code: 403,
                            type: 'directory'
                        };
                    }
                    await fs.rmdir(absolutePath);
                }
            } else {
                await fs.unlink(absolutePath);
            }

            return {
                success: true,
                path: absolutePath,
                type: isDirectory ? 'directory' : 'file',
                deleted: true
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: (error as NodeJS.ErrnoException)?.code || 500,
                path: filePath,
                type: undefined,
            };
        }
    },

    /**
     * Copy file or directory
     */
    async copy(source: string, destination: string, overwrite: boolean = false): Promise<copySuccess | copyError> {
        try {
            if (!source || typeof source !== 'string') {
                return {
                    success: false,
                    code: 400,
                    error: 'Invalid source path',
                    source: source,
                    destination: destination
                };
            }
            if (!destination || typeof destination !== 'string') {
                return {
                    success: false,
                    code: 400,
                    error: 'Invalid destination path',
                    source: source,
                    destination: destination
                };
            }

            const sourcePath = path.resolve(source);
            let destPath = path.resolve(destination);

            const sourceExists = await this.exists(sourcePath);
            if (!isFileExistsStats(sourceExists) || !sourceExists.exists) {
                return {
                    success: false,
                    error: 'Source path does not exist',
                    source: sourcePath,
                    code: 404,
                    destination: destination
                };
            }

            let destExists = await this.exists(destPath);
            // If destination exists and is a directory, append source filename
            if (isFileExistsStats(destExists) && destExists.exists) {
                if (destExists.isDirectory && sourceExists.isFile) {
                    destPath = path.resolve(path.join(destPath, path.basename(sourcePath)));
                    destExists = await this.exists(destPath);
                }
            }

            if (isFileExistsStats(destExists) && destExists.exists && !overwrite) {
                return {
                    success: false,
                    error: 'Destination already exists. Use overwrite=true to replace.',
                    source: sourcePath,
                    destination: destPath,
                    code: 409
                };
            }

            if (isFileExistsStats(sourceExists) && sourceExists.isDirectory) {
                const realDest = path.join(destPath, path.basename(sourcePath));
                await this._copyDirectory(sourcePath, realDest, overwrite);
            } else {
                await fs.copyFile(sourcePath, destPath);
            }

            return {
                success: true,
                source: sourcePath,
                destination: destPath,
                copied: true,
                type: sourceExists.isDirectory ? 'directory' : 'file'
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: (error as NodeJS.ErrnoException)?.code || 500,
                source: source,
                destination: destination
            };
        }
    },

    findCommonRoot(src: string, dst: string): string | null | undefined {
        const destParts = dst.split('/');
        const sourceParts = src.split('/');

        let root = '';
        const destDirs: string[] = [];
        const sourceDirs: string[] = [];

        destParts.forEach(part => {
            if (part.trim()) {
                root += `/${part}`;
                destDirs.push(root);
            }
        });

        root = '';

        sourceParts.forEach(part => {
            if (part.trim()) {
                root += `/${part}`;
                sourceDirs.push(root);
            }
        });

        const sharedRoots = destDirs.filter(dir => sourceDirs.includes(dir));
        const rightMostRoot = sharedRoots.slice(-1)[0];

        return rightMostRoot;
    },

    /**
     * Helper: Copy directory recursively
     */
    async _copyDirectory(sourceDir: string, destDir: string, overwrite: boolean): Promise<void> {
        await fs.mkdir(destDir, { recursive: true });

        const items = await fs.readdir(sourceDir, { withFileTypes: true });

        for (const item of items) {
            const sourcePath = path.join(sourceDir, item.name);
            const destPath = path.join(destDir, item.name);
            if (item.isDirectory()) {
                await this._copyDirectory(sourcePath, destPath, overwrite);
            } else {
                await fs.copyFile(sourcePath, destPath);
            }
        }
    },

    /**
     * Move/rename file or directory
     */
    async move(source: string, destination: string, overwrite: boolean = false): Promise<moveSuccess | moveError> {
        try {
            if (!source || typeof source !== 'string') {
                return {
                    success: false,
                    code: 400,
                    error: 'Invalid source path',
                    source: source,
                    destination: destination
                };
            }
            if (!destination || typeof destination !== 'string') {
                return {
                    success: false,
                    code: 400,
                    error: 'Invalid destination path',
                    destination: destination,
                    source: source
                };
            }

            const sourcePath = path.resolve(source);
            let destPath = path.resolve(destination);

            const sourceExists = await this.exists(sourcePath);

            if (!isFileExistsStats(sourceExists) || !sourceExists.exists) {
                return {
                    success: false,
                    error: 'Source path does not exist',
                    source: sourcePath,
                    destination: destination,
                    code: 404
                };
            }

            const sourceType = sourceExists.isDirectory ? 'directory' : 'file';

            let destExists = await this.exists(destPath);
            // If destination exists and is a directory, append source filename
            if (isFileExistsStats(destExists) && destExists.exists) {
                if (destExists.isDirectory) {
                    destPath = path.resolve(path.join(destPath, path.basename(sourcePath)));
                    destExists = await this.exists(destPath);
                }
            }

            if (isFileExistsStats(destExists) && destExists.exists && !overwrite) {
                return {
                    success: false,
                    error: 'Destination already exists. Use overwrite=true to replace.',
                    source: sourcePath,
                    destination: destPath,
                    code: 409
                };
            }

            await fs.rename(sourcePath, destPath);

            return {
                success: true,
                source: sourcePath,
                destination: destPath,
                moved: true,
                type: sourceType
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: (error as NodeJS.ErrnoException)?.code || 500,
                source: source,
                destination: destination
            };
        }
    },

    /**
     * Get file/directory stats
     */
    stat(filePath: string): statPathSuccess | statPathError {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return {
                    success: false,
                    code: 400,
                    error: 'Invalid path',
                    path: filePath
                };
            }

            const absolutePath = path.resolve(filePath);
            const stats = fsSync.statSync(absolutePath);

            const mode = stats.mode.toString(8);

            return {
                success: true,
                stats: {
                    size: stats.size,
                    isFile: stats.isFile(),
                    isDirectory: stats.isDirectory(),
                    isSymbolicLink: stats.isSymbolicLink(),
                    modified: stats.mtime,
                    created: stats.birthtime,
                    accessed: stats.atime,
                    permissions: {
                        owner: mode[0],
                        group: mode[1],
                        other: mode[2],
                    },
                    mode: mode,
                    uid: stats.uid,
                    gid: stats.gid,
                    blocks: stats.blocks
                },
                path: absolutePath
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: (error as NodeJS.ErrnoException)?.code || 500,
                path: filePath
            };
        }
    },

    /**
     * Open file dialog to select files
     */
    async openFileDialog(options: OpenDialogOptions): Promise<openDialogResponse | openDialogError> {
        try {
            const result = await dialog.showOpenDialog({
                title: options?.title || 'Select File',
                defaultPath: options?.defaultPath || process.cwd(),
                buttonLabel: options?.buttonLabel || 'Select',
                filters: options?.filters || [
                    { name: 'All Files', extensions: ['*'] }
                ],
                properties: options?.properties || ['openFile'],
                message: options?.message
            });

            if (result.canceled) {
                return {
                    success: true,
                    canceled: true,
                    code: undefined,
                    files: []
                };
            }

            return {
                success: true,
                files: result.filePaths,
                canceled: false
            };
        } catch (error) {
            return {
                success: false,
                canceled: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: (error as NodeJS.ErrnoException)?.code || 500,
                files: []
            };
        }
    },

    /**
     * Open save file dialog
     */
    async saveFileDialog(options: OpenDialogOptions): Promise<saveDialogResponse | saveDialogError> {
        try {
            const result = await dialog.showSaveDialog({
                title: options?.title || 'Save File',
                defaultPath: options?.defaultPath || process.cwd(),
                buttonLabel: options?.buttonLabel || 'Save',
                filters: options?.filters || [
                    { name: 'All Files', extensions: ['*'] }
                ],
                message: options?.message
            });

            if (result.canceled) {
                return {
                    success: true,
                    canceled: true,
                    path: result.filePath || null,
                    code: 403
                };
            }

            return {
                success: true,
                path: result.filePath,
                canceled: false,
                code: 200
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: (error as NodeJS.ErrnoException)?.code || 500,
                path: options?.defaultPath || '',
                canceled: false
            };
        }
    },

    /**
     * Read file as JSON
     */
    async readJSON(filePath: string): Promise<readFileSuccess | readFileError> {
        try {
            const result = await this.readFile(filePath);
            if (!result.success) {
                return result;
            }

            const data = JSON.parse((result as readFileSuccess).data as string);
            return {
                success: true,
                data: data,
                path: result.path,
                size: (result as readFileSuccess).size,
                encoding: null
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? `Failed to parse JSON: ${error.message}` : 'Unknown error',
                code: (error as NodeJS.ErrnoException)?.code || 500,
                path: filePath,
            };
        }
    },

    /**
     * Write data as JSON
     */
    async writeJSON(filePath: string, data: object, indent = 2): Promise<writeFileSuccess | writeFileError> {
        try {
            const jsonString = JSON.stringify(data, null, indent);
            return await this.writeFile(filePath, jsonString);
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? `Failed to write JSON: ${error.message}` : 'Unknown error',
                code: (error as NodeJS.ErrnoException)?.code || 500,
                path: filePath,
            };
        }
    },

    /**
     * Watch file for changes
     */
    async watchFile(filePath: string, callback: CallableFunction): Promise<watchFileSuccess | watchFileError> {
        try {
            const absolutePath = path.resolve(filePath);
            const watcher = fsSync.watch(absolutePath, (eventType, filename) => {
                callback({ eventType, filename, path: absolutePath });
            });

            return {
                success: true,
                watcher: watcher,
                path: absolutePath,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: (error as NodeJS.ErrnoException)?.code || 500,
                path: filePath,
            };
        }
    }
};
