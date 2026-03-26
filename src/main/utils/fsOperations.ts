import { dialog } from "electron";
import { OpenDialogOptions } from "electron/utility";
import fsSync from "fs";
import fs from "fs/promises";
import path from "node:path";
import type { readFileSuccess, readFileError, writeFileSuccess, writeFileError, appendFileSuccess, appendFileError, fileExistsStats, fileExistsStatError, fileOpError, FileInfoSuccess, mkdirSuccess, deleteSuccess, deleteError, copySuccess, copyError, moveSuccess, moveError, statPathSuccess, statPathError, dialogRessponse, watchFileSuccess, watchFileError } from "./types";



export const fsOperations = {
    /**
     * Read file content
     * @param {string} filePath - Path to file
     * @param {string} [encoding='utf8'] - File encoding
     * @returns {Promise<{success: boolean, data?: string, error?: string, path: string}>}
     */
    async readFile(filePath: string, encoding: BufferEncoding | null = 'utf8'): Promise<readFileSuccess | readFileError> {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return { success: false, code: 404, error: 'Invalid file path', path: filePath };
            }

            const absolutePath = path.resolve(filePath);
            const data = await fs.readFile(absolutePath, { encoding: encoding });

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
                error: error && error.message ? error.message : null,
                code: error && error.message ? error?.code : null,
                path: filePath
            };
        }
    },

    /**
     * Write content to file
     * @param {string} filePath - Path to file
     * @param {string} content - Content to write
     * @param {string} [encoding='utf8'] - File encoding
     * @returns {Promise<{success: boolean, path?: string, error?: string, bytesWritten?: number}>}
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

            await fs.writeFile(absolutePath, content, { encoding: encoding });

            const stats = await fs.stat(absolutePath);
            const existsCheck = await this.exists(filePath);

            return {
                success: true,
                path: absolutePath,
                bytesWritten: stats.size,
                created: (existsCheck.success && existsCheck.exists)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code,
                path: filePath
            };
        }
    },

    /**
     * Append content to file
     * @param {string} filePath - Path to file
     * @param {string} content - Content to append
     * @param {string} [encoding='utf8'] - File encoding
     * @returns {Promise<{success: boolean, path?: string, error?: string}>}
     */
    async appendFile(filePath: string, content: string, encoding: BufferEncoding | null = 'utf8'): Promise<appendFileSuccess | appendFileError> {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return { success: false, code: 404, error: 'Invalid file path', path: filePath };
            }

            const absolutePath = path.resolve(filePath);
            await fs.appendFile(absolutePath, content, { encoding: encoding });

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
                error: error.message,
                code: error.code,
                path: filePath
            };
        }
    },

    /**
     * Check if file or directory exists
     * @param {string} filePath - Path to check
     * @returns {Promise<{success: boolean, exists: boolean, isFile?: boolean, isDirectory?: boolean, error?: string}>}
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
            } catch (error) {
                if (error.code === 'ENOENT') {
                    return {
                        success: true,
                        error: error,
                        code: 400,
                        path: absolutePath
                    };
                }
                throw error;
            }
        } catch (error) {
            return {
                success: false,
                error: error,
                path: filePath,
                code: error.code
            };
        }
    },

    /**
     * List directory contents
     * @param {string} dirPath - Directory path
     * @param {boolean} [recursive=false] - List recursively
     * @returns {Promise<{success: boolean, files?: Array, error?: string, path: string}>}
     */
    async readDir(dirPath: string, recursive: boolean = false): Promise<fileOpError | FileInfoSuccess> {
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

                    const fileInfo = {
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
                        if (subResult.success) {
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
                error: error.message,
                code: error.code,
                path: dirPath
            };
        }
    },

    /**
     * Create directory
     * @param {string} dirPath - Directory path
     * @param {boolean} [recursive=true] - Create parent directories
     * @returns {Promise<{success: boolean, path?: string, error?: string, created: boolean}>}
     */
    async mkdir(dirPath: string, recursive: boolean = true): Promise<mkdirSuccess | fileOpError> {
        try {
            if (!dirPath || typeof dirPath !== 'string') {
                return { success: false, code: 400, error: 'Invalid directory path', path: dirPath };
            }

            const absolutePath = path.resolve(dirPath);
            const existsCheck = await this.exists(dirPath);
            const existed = (existsCheck.success && existsCheck.exists);

            if (!existed) {
                await fs.mkdir(absolutePath, { recursive });
            }

            return {
                success: true,
                path: absolutePath,
                created: !existed,
                bytesWritten: 0
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code,
                path: dirPath
            };
        }
    },

    /**
     * Delete file or directory
     * @param {string} filePath - Path to delete
     * @param {boolean} [recursive=false] - Delete recursively for directories
     * @returns {Promise<{success: boolean, path?: string, error?: string, type?: string}>}
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

            if (existsCheck.success && !existsCheck.exists) {
                return {
                    success: false,
                    error: 'Path does not exist',
                    path: absolutePath,
                    code: 403,
                    type: undefined
                };
            }

            if (existsCheck.success && existsCheck.isDirectory) {
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
                type: existsCheck.isDirectory ? 'directory' : 'file',
                deleted: true
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code,
                path: filePath,
                type: undefined,
            };
        }
    },

    /**
     * Copy file or directory
     * @param {string} source - Source path
     * @param {string} destination - Destination path
     * @param {boolean} [overwrite=false] - Overwrite if exists
     * @returns {Promise<{success: boolean, source?: string, destination?: string, error?: string}>}
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
            if (sourceExists.success && !sourceExists.exists) {
                return {
                    success: false,
                    error: 'Source path does not exist',
                    source: sourcePath,
                    code: 403,
                    destination: destination
                };
            }

            let destExists = await this.exists(destPath);
            // If destination exists and is a directory, append source filename
            if (destExists.success && destExists.exists) {
                if (destExists.isDirectory && sourceExists.isFile) {
                    destPath = path.resolve(path.join(destPath, path.basename(sourcePath)));
                    destExists = await this.exists(destPath);
                }
            }

            if (destExists.success && destExists.exists && !overwrite) {
                return {
                    success: false,
                    error: 'Destination already exists. Use overwrite=true to replace.',
                    source: sourcePath,
                    destination: destPath,
                    code: 403
                };
            }


            if (sourceExists.success && sourceExists.isDirectory) {
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
                error: error.message,
                code: error.code,
                source: source,
                destination: destination
            };
        }
    },

    findCommonRoot(src: string, dst: string): string | null | undefined {
        const destParts = dst.split('/');
        const sourceParts = src.split('/');

        let root = '';
        const destDirs: [string | null | undefined] = [undefined];
        const sourceDirs: [string | null | undefined] = [undefined];

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
     * @param {string} source - Source path
     * @param {string} destination - Destination path
     * @param {boolean} [overwrite=false] - Overwrite if exists
     * @returns {Promise<{success: boolean, source?: string, destination?: string, error?: string}>}
     */
    async move(source: string, destination: string, overwrite: boolean = false): Promise<moveSuccess | moveError> {
        try {
            if (!source || typeof source !== 'string') {
                return {
                    success: false,
                    code: 403,
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
            const sourceType = sourceExists.isDirectory ? 'directory' : 'file';

            if (sourceExists.success && !sourceExists.exists) {
                return {
                    success: false,
                    error: 'Source path does not exist',
                    source: sourcePath,
                    destination: destination,
                    code: 403
                };
            }

            let destExists = await this.exists(destPath);
            // If destination exists and is a directory, append source filename
            if (destExists.success && destExists.exists) {
                if (destExists.isDirectory) {
                    destPath = path.resolve(path.join(destPath, path.basename(sourcePath)));
                    destExists = await this.exists(destPath);
                }
            }

            if (destExists.success && destExists.exists && !overwrite) {
                return {
                    success: false,
                    error: 'Destination already exists. Use overwrite=true to replace.',
                    source: sourcePath,
                    destination: destPath,
                    code: 403
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
                error: error.message,
                code: error.code,
                source: source,
                destination: destination
            };
        }
    },

    /**
     * Get file/directory stats
     * @param {string} filePath - Path to check
     * @returns {Promise<{success: boolean, stats?: object, error?: string, path: string}>}
     */
    stat(filePath: string): Promise<statPathSuccess | statPathError> {
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
                error: error.message,
                code: error.code,
                path: filePath
            };
        }
    },

    /**
     * Open file dialog to select files
     * @param {Object} [options] - Dialog options
     * @returns {Promise<{success: boolean, files?: string[], canceled?: boolean, error?: string}>}
     */
    async openFileDialog(options: OpenDialogOptions) {
        try {
            const result = await dialog.showOpenDialog({
                title: options?.title || 'Select File',
                defaultPath: options?.defaultPath || process.cwd(),
                buttonLabel: options?.buttonLabel || 'Select',
                filters: options?.filters || [
                    { name: 'All Files', extensions: ['*'] }
                ],
                properties: options?.properties || [('openFile')],
                message: options?.message
            });

            if (result.canceled) {
                return {
                    success: true,
                    canceled: true,
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
                error: error.message
            };
        }
    },

    /**
     * Open save file dialog
     * @param {Object} [options] - Dialog options
     * @returns {Promise<{success: boolean, filePath?: string, canceled?: boolean, error?: string}>}
     */
    async saveFileDialog(options: OpenDialogOptions): Promise<dialogRessponse | writeFileError> {
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
                    path: result.filePath || null
                };
            }

            return {
                success: true,
                path: result.filePath,
                canceled: false,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: 500,
                path: options?.defaultPath || ''
            };
        }
    },

    /**
     * Read file as JSON
     * @param {string} filePath - Path to JSON file
     * @returns {Promise<{success: boolean, data?: any, error?: string, path: string}>}
     */
    async readJSON(filePath: string): Promise<readFileSuccess | readFileError> {
        try {
            const result = await this.readFile(filePath);
            if (!result.success) {
                return result;
            }

            const data = JSON.parse(result.data);
            return {
                success: true,
                data: data,
                path: result.path,
                size: result.size,
                encoding: null
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to parse JSON: ${error.message}`,
                path: filePath,
                code: 500,
            };
        }
    },

    /**
     * Write data as JSON
     * @param {string} filePath - Path to write
     * @param {any} data - Data to write
     * @param {number} [indent=2] - JSON indentation
     * @returns {Promise<{success: boolean, path?: string, error?: string}>}
     */
    async writeJSON(filePath: string, data: object, indent = 2): Promise<watchFileSuccess | writeFileError> {
        try {
            const jsonString = JSON.stringify(data, null, indent);
            return await this.writeFile(filePath, jsonString);
        } catch (error) {
            return {
                success: false,
                error: `Failed to write JSON: ${error.message}`,
                path: filePath,
                code: 500
            };
        }
    },

    /**
     * Watch file for changes
     * @param {string} filePath - File to watch
     * @param {Function} callback - Callback on change
     * @returns {Promise<{success: boolean, watcher?: fs.FSWatcher, error?: string}>}
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
                error: error.message,
                path: filePath,
                code: 500
            };
        }
    }
};
