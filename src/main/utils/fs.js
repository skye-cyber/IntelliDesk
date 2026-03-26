"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fsOperations = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
// Type guard functions
function isFileExistsStats(obj) {
    return obj && typeof obj === 'object' && 'success' in obj && 'exists' in obj && 'isDirectory' in obj;
}
function isFileInfoSuccess(obj) {
    return obj && typeof obj === 'object' && 'success' in obj && 'files' in obj;
}
function isReadFileSuccess(obj) {
    return obj && typeof obj === 'object' && 'success' in obj && 'data' in obj;
}
exports.fsOperations = {
    /**
     * Read file content
     */
    async readFile(filePath, encoding = 'utf8') {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return { success: false, code: 404, error: 'Invalid file path', path: filePath };
            }
            const absolutePath = path_1.default.resolve(filePath);
            const data = await promises_1.default.readFile(absolutePath, { encoding: encoding });
            return {
                success: true,
                data: data.toString(),
                path: absolutePath,
                size: data.length,
                encoding: encoding
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: error?.code || 500,
                path: filePath
            };
        }
    },
    /**
     * Write content to file
     */
    async writeFile(filePath, content, encoding = 'utf8') {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return { success: false, code: 404, error: 'Invalid file path', path: filePath };
            }
            if (content === undefined || content === null) {
                return { success: false, code: 400, error: 'Content cannot be null or undefined', path: filePath };
            }
            const absolutePath = path_1.default.resolve(filePath);
            // Create directory if it doesn't exist
            const dir = path_1.default.dirname(absolutePath);
            await promises_1.default.mkdir(dir, { recursive: true });
            await promises_1.default.writeFile(absolutePath, content, { encoding: encoding });
            const stats = await promises_1.default.stat(absolutePath);
            const existsCheck = await this.exists(filePath);
            return {
                success: true,
                path: absolutePath,
                bytesWritten: stats.size,
                created: isFileExistsStats(existsCheck) && existsCheck.exists
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: error?.code || 500,
                path: filePath
            };
        }
    },
    /**
     * Append content to file
     */
    async appendFile(filePath, content, encoding = 'utf8') {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return { success: false, code: 404, error: 'Invalid file path', path: filePath };
            }
            const absolutePath = path_1.default.resolve(filePath);
            await promises_1.default.appendFile(absolutePath, content, { encoding: encoding });
            const stats = await promises_1.default.stat(absolutePath);
            return {
                success: true,
                path: absolutePath,
                size: stats.size,
                encoding: encoding,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: error?.code || 500,
                path: filePath
            };
        }
    },
    /**
     * Check if file or directory exists
     */
    async exists(filePath) {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return { success: false, code: 404, path: filePath, error: 'Invalid path' };
            }
            const absolutePath = path_1.default.resolve(filePath);
            try {
                const stats = await promises_1.default.stat(absolutePath);
                return {
                    success: true,
                    exists: true,
                    isFile: stats.isFile(),
                    isDirectory: stats.isDirectory(),
                    size: stats.size,
                    modified: stats.mtime,
                    path: absolutePath
                };
            }
            catch (error) {
                if (error.code === 'ENOENT') {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        code: error?.code || 500,
                        path: absolutePath
                    };
                }
                throw error;
            }
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                path: filePath,
                code: error?.code || 500,
            };
        }
    },
    /**
     * List directory contents
     */
    async readDir(dirPath, recursive = false) {
        try {
            if (!dirPath || typeof dirPath !== 'string') {
                return { success: false, code: 400, error: 'Invalid directory path', path: dirPath };
            }
            const absolutePath = path_1.default.resolve(dirPath);
            const items = await promises_1.default.readdir(absolutePath, { withFileTypes: true });
            const files = await Promise.all(items.map(async (item) => {
                const itemPath = path_1.default.join(absolutePath, item.name);
                const stats = await promises_1.default.stat(itemPath);
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
                    if (isFileInfoSuccess(subResult)) {
                        fileInfo.children = subResult.files;
                    }
                }
                return fileInfo;
            }));
            return {
                success: true,
                files: files,
                path: absolutePath,
                count: files.length
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: error?.code || 500,
                path: dirPath
            };
        }
    },
    /**
     * Create directory
     */
    async mkdir(dirPath, recursive = true) {
        try {
            if (!dirPath || typeof dirPath !== 'string') {
                return { success: false, code: 400, error: 'Invalid directory path', path: dirPath };
            }
            const absolutePath = path_1.default.resolve(dirPath);
            const existsCheck = await this.exists(dirPath);
            const existed = isFileExistsStats(existsCheck) && existsCheck.exists;
            if (!existed) {
                await promises_1.default.mkdir(absolutePath, { recursive });
            }
            return {
                success: true,
                path: absolutePath,
                created: !existed,
                bytesWritten: 0
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: error?.code || 500,
                path: dirPath
            };
        }
    },
    /**
     * Delete file or directory
     */
    async delete(filePath, recursive = false) {
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
            const absolutePath = path_1.default.resolve(filePath);
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
            if (existsCheck.isDirectory) {
                if (recursive) {
                    await promises_1.default.rm(absolutePath, { recursive: true, force: true });
                }
                else {
                    // Check if directory is empty
                    const items = await promises_1.default.readdir(absolutePath);
                    if (items.length > 0) {
                        return {
                            success: false,
                            error: 'Directory is not empty. Use recursive=true to delete.',
                            path: absolutePath,
                            code: 403,
                            type: 'directory'
                        };
                    }
                    await promises_1.default.rmdir(absolutePath);
                }
            }
            else {
                await promises_1.default.unlink(absolutePath);
            }
            return {
                success: true,
                path: absolutePath,
                type: existsCheck.isDirectory ? 'directory' : 'file',
                deleted: true
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: error?.code || 500,
                path: filePath,
                type: undefined,
            };
        }
    },
    /**
     * Copy file or directory
     */
    async copy(source, destination, overwrite = false) {
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
            const sourcePath = path_1.default.resolve(source);
            let destPath = path_1.default.resolve(destination);
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
                    destPath = path_1.default.resolve(path_1.default.join(destPath, path_1.default.basename(sourcePath)));
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
            if (sourceExists.isDirectory) {
                const realDest = path_1.default.join(destPath, path_1.default.basename(sourcePath));
                await this._copyDirectory(sourcePath, realDest, overwrite);
            }
            else {
                await promises_1.default.copyFile(sourcePath, destPath);
            }
            return {
                success: true,
                source: sourcePath,
                destination: destPath,
                copied: true,
                type: sourceExists.isDirectory ? 'directory' : 'file'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: error?.code || 500,
                source: source,
                destination: destination
            };
        }
    },
    findCommonRoot(src, dst) {
        const destParts = dst.split('/');
        const sourceParts = src.split('/');
        let root = '';
        const destDirs = [];
        const sourceDirs = [];
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
    async _copyDirectory(sourceDir, destDir, overwrite) {
        await promises_1.default.mkdir(destDir, { recursive: true });
        const items = await promises_1.default.readdir(sourceDir, { withFileTypes: true });
        for (const item of items) {
            const sourcePath = path_1.default.join(sourceDir, item.name);
            const destPath = path_1.default.join(destDir, item.name);
            if (item.isDirectory()) {
                await this._copyDirectory(sourcePath, destPath, overwrite);
            }
            else {
                await promises_1.default.copyFile(sourcePath, destPath);
            }
        }
    },
    /**
     * Move/rename file or directory
     */
    async move(source, destination, overwrite = false) {
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
            const sourcePath = path_1.default.resolve(source);
            let destPath = path_1.default.resolve(destination);
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
                    destPath = path_1.default.resolve(path_1.default.join(destPath, path_1.default.basename(sourcePath)));
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
            await promises_1.default.rename(sourcePath, destPath);
            return {
                success: true,
                source: sourcePath,
                destination: destPath,
                moved: true,
                type: sourceType
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: error?.code || 500,
                source: source,
                destination: destination
            };
        }
    },
    /**
     * Get file/directory stats
     */
    stat(filePath) {
        try {
            if (!filePath || typeof filePath !== 'string') {
                return {
                    success: false,
                    code: 400,
                    error: 'Invalid path',
                    path: filePath
                };
            }
            const absolutePath = path_1.default.resolve(filePath);
            const stats = fs_1.default.statSync(absolutePath);
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: error?.code || 500,
                path: filePath
            };
        }
    },
    /**
     * Open file dialog to select files
     */
    async openFileDialog(options) {
        try {
            const result = await electron_1.dialog.showOpenDialog({
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
        }
        catch (error) {
            return {
                success: false,
                canceled: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: error?.code || 500,
                files: []
            };
        }
    },
    /**
     * Open save file dialog
     */
    async saveFileDialog(options) {
        try {
            const result = await electron_1.dialog.showSaveDialog({
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: error?.code || 500,
                path: options?.defaultPath || '',
                canceled: false
            };
        }
    },
    /**
     * Read file as JSON
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
                data: data,
                path: result.path,
                size: result.size,
                encoding: null
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? `Failed to parse JSON: ${error.message}` : 'Unknown error',
                code: error?.code || 500,
                path: filePath,
            };
        }
    },
    /**
     * Write data as JSON
     */
    async writeJSON(filePath, data, indent = 2) {
        try {
            const jsonString = JSON.stringify(data, null, indent);
            return await this.writeFile(filePath, jsonString);
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? `Failed to write JSON: ${error.message}` : 'Unknown error',
                code: error?.code || 500,
                path: filePath,
            };
        }
    },
    /**
     * Watch file for changes
     */
    async watchFile(filePath, callback) {
        try {
            const absolutePath = path_1.default.resolve(filePath);
            const watcher = fs_1.default.watch(absolutePath, (eventType, filename) => {
                callback({ eventType, filename, path: absolutePath });
            });
            return {
                success: true,
                watcher: watcher,
                path: absolutePath,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                code: error?.code || 500,
                path: filePath,
            };
        }
    }
};
//# sourceMappingURL=fs.js.map