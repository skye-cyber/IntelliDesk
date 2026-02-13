const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { dialog } = require('electron');

const fsOperations = {
    /**
     * Read file content
     * @param {string} filePath - Path to file
     * @param {string} [encoding='utf8'] - File encoding
     * @returns {Promise<{success: boolean, data?: string, error?: string, path: string}>}
     */
    async readFile(filePath, encoding = 'utf8') {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return { success: false, error: 'Invalid file path', path: filePath };
            }

            const absolutePath = path.resolve(filePath);
            const data = await fs.readFile(absolutePath, encoding);

            return {
                success: true,
                data,
                path: absolutePath,
                size: data.length,
                encoding
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
     * Write content to file
     * @param {string} filePath - Path to file
     * @param {string} content - Content to write
     * @param {string} [encoding='utf8'] - File encoding
     * @returns {Promise<{success: boolean, path?: string, error?: string, bytesWritten?: number}>}
     */
    async writeFile(filePath, content, encoding = 'utf8') {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return { success: false, error: 'Invalid file path', path: filePath };
            }

            if (content === undefined || content === null) {
                return { success: false, error: 'Content cannot be null or undefined', path: filePath };
            }

            const absolutePath = path.resolve(filePath);

            // Create directory if it doesn't exist
            const dir = path.dirname(absolutePath);
            await fs.mkdir(dir, { recursive: true });

            await fs.writeFile(absolutePath, content, encoding);

            const stats = await fs.stat(absolutePath);

            return {
                success: true,
                path: absolutePath,
                bytesWritten: stats.size,
                created: !(await this.exists(filePath)).exists
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
    async appendFile(filePath, content, encoding = 'utf8') {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return { success: false, error: 'Invalid file path', path: filePath };
            }

            const absolutePath = path.resolve(filePath);
            await fs.appendFile(absolutePath, content, encoding);

            const stats = await fs.stat(absolutePath);

            return {
                success: true,
                path: absolutePath,
                size: stats.size
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
    async exists(filePath) {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return { success: false, exists: false, error: 'Invalid path' };
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
                        exists: false,
                        path: absolutePath
                    };
                }
                throw error;
            }
        } catch (error) {
            return {
                success: false,
                exists: false,
                error: error.message,
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
    async readDir(dirPath, recursive = false) {
        try {
            if (!dirPath || typeof dirPath !== 'string') {
                return { success: false, error: 'Invalid directory path', path: dirPath };
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
                        mode: stats.mode.toString(8)
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
                files,
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
    async mkdir(dirPath, recursive = true) {
        try {
            if (!dirPath || typeof dirPath !== 'string') {
                return { success: false, error: 'Invalid directory path', path: dirPath };
            }

            const absolutePath = path.resolve(dirPath);
            const existed = (await this.exists(absolutePath)).exists;

            if (!existed) {
                await fs.mkdir(absolutePath, { recursive });
            }

            return {
                success: true,
                path: absolutePath,
                created: !existed,
                existed
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
    async delete(filePath, recursive = false) {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return { success: false, error: 'Invalid path', path: filePath };
            }

            const absolutePath = path.resolve(filePath);
            const existsCheck = await this.exists(absolutePath);

            if (!existsCheck.exists) {
                return {
                    success: false,
                    error: 'Path does not exist',
                    path: absolutePath
                };
            }

            if (existsCheck.isDirectory) {
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
                path: filePath
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
    async copy(source, destination, overwrite = false) {
        try {
            if (!source || typeof source !== 'string') {
                return { success: false, error: 'Invalid source path', source };
            }
            if (!destination || typeof destination !== 'string') {
                return { success: false, error: 'Invalid destination path', destination };
            }

            const sourcePath = path.resolve(source);
            let destPath = path.resolve(destination);

            const sourceExists = await this.exists(sourcePath);
            if (!sourceExists.exists) {
                return {
                    success: false,
                    error: 'Source path does not exist',
                    source: sourcePath
                };
            }

            let destExists = await this.exists(destPath);
            // If destination exists and is a directory, append source filename
            if (destExists) {
                if (destExists.isDirectory && sourceExists.isFile) {
                    destPath = path.resolve(path.join(destPath, path.basename(sourcePath)));
                    destExists = await this.exists(destPath);
                }
            }

            if (destExists.exists && !overwrite) {
                return {
                    success: false,
                    error: 'Destination already exists. Use overwrite=true to replace.',
                    source: sourcePath,
                    destination: destPath
                };
            }


            if (sourceExists.isDirectory) {
                const realDest = path.join(destPath, path.basename(sourcePath))
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
                source,
                destination
            };
        }
    },

    findCommonRoot(src, dst) {
        const destParts = dst.split('/')
        const sourceParts = src.split('/')

        let root = ''
        const destDirs = []
        const sourceDirs = []

        destParts.forEach(part => {
            if (part.trim()) {
                root += `/${part}`
                destDirs.push(root)
            }
        })

        root = ''

        sourceParts.forEach(part => {
            if (part.trim()) {
                root += `/${part}`
                sourceDirs.push(root)
            }
        })

        const sharedRoots = destDirs.filter(dir => sourceDirs.includes(dir))
        const rightMostRoot = sharedRoots.slice(-1)[0]

        return rightMostRoot
    },

    /**
     * Helper: Copy directory recursively
     */
    async _copyDirectory(sourceDir, destDir, overwrite) {
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
    async move(source, destination, overwrite = false) {
        try {
            if (!source || typeof source !== 'string') {
                return { success: false, error: 'Invalid source path', source };
            }
            if (!destination || typeof destination !== 'string') {
                return { success: false, error: 'Invalid destination path', destination };
            }

            const sourcePath = path.resolve(source);
            let destPath = path.resolve(destination);

            const sourceExists = await this.exists(sourcePath);
            const sourceType = sourceExists.isDirectory ? 'directory' : 'file'

            if (!sourceExists.exists) {
                return {
                    success: false,
                    error: 'Source path does not exist',
                    source: sourcePath
                };
            }

            let destExists = await this.exists(destPath);
            // If destination exists and is a directory, append source filename
            if (destExists.exists) {
                if (destExists.isDirectory) {
                    destPath = path.resolve(path.join(destPath, path.basename(sourcePath)));
                    destExists = await this.exists(destPath);
                }
            }

            if (destExists.exists && !overwrite) {
                return {
                    success: false,
                    error: 'Destination already exists. Use overwrite=true to replace.',
                    source: sourcePath,
                    destination: destPath
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
                source,
                destination
            };
        }
    },

    /**
     * Get file/directory stats
     * @param {string} filePath - Path to check
     * @returns {Promise<{success: boolean, stats?: object, error?: string, path: string}>}
     */
    stat(filePath) {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return { success: false, error: 'Invalid path', path: filePath };
            }

            const absolutePath = path.resolve(filePath);
            const stats = fsSync.statSync(absolutePath);

            const mode = stats.mode.toString(8)

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
    async openFileDialog(options = {}) {
        try {
            const result = await dialog.showOpenDialog({
                title: options.title || 'Select File',
                defaultPath: options.defaultPath || process.cwd(),
                buttonLabel: options.buttonLabel || 'Select',
                filters: options.filters || [
                    { name: 'All Files', extensions: ['*'] }
                ],
                properties: options.properties || ['openFile'],
                message: options.message
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
    async saveFileDialog(options = {}) {
        try {
            const result = await dialog.showSaveDialog({
                title: options.title || 'Save File',
                defaultPath: options.defaultPath || process.cwd(),
                buttonLabel: options.buttonLabel || 'Save',
                filters: options.filters || [
                    { name: 'All Files', extensions: ['*'] }
                ],
                message: options.message
            });

            if (result.canceled) {
                return {
                    success: true,
                    canceled: true
                };
            }

            return {
                success: true,
                filePath: result.filePath,
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
     * Read file as JSON
     * @param {string} filePath - Path to JSON file
     * @returns {Promise<{success: boolean, data?: any, error?: string, path: string}>}
     */
    async readJSON(filePath) {
        try {
            const result = await this.readFile(filePath);
            if (!result.success) {
                return result;
            }

            const data = JSON.parse(result.data);
            return {
                success: true,
                data,
                path: result.path,
                size: result.size
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to parse JSON: ${error.message}`,
                path: filePath
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
    async writeJSON(filePath, data, indent = 2) {
        try {
            const jsonString = JSON.stringify(data, null, indent);
            return await this.writeFile(filePath, jsonString);
        } catch (error) {
            return {
                success: false,
                error: `Failed to write JSON: ${error.message}`,
                path: filePath
            };
        }
    },

    /**
     * Watch file for changes
     * @param {string} filePath - File to watch
     * @param {Function} callback - Callback on change
     * @returns {Promise<{success: boolean, watcher?: fs.FSWatcher, error?: string}>}
     */
    async watchFile(filePath, callback) {
        try {
            const absolutePath = path.resolve(filePath);
            const watcher = fsSync.watch(absolutePath, (eventType, filename) => {
                callback({ eventType, filename, path: absolutePath });
            });

            return {
                success: true,
                watcher,
                path: absolutePath
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                path: filePath
            };
        }
    }
};

module.exports = fsOperations;
