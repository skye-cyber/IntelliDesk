import type { readFileSuccess, readFileError, writeFileSuccess, writeFileError, appendFileError, fileExistsStats, fileExistsStatError, watchFileSuccess, watchFileError, dialogRessponse, statPathError, statPathSuccess, fileOpError, FileInfoSuccess, mkdirSuccess, deleteSuccess, deleteError, copyError, copySuccess, moveSuccess, moveError } from "./types";
import { OpenDialogOptions } from "electron/utility";
export declare const fsOperations: {
    /**
     * Read file content
     * @param {string} filePath - Path to file
     * @param {string} [encoding='utf8'] - File encoding
     * @returns {Promise<{success: boolean, data?: string, error?: string, path: string}>}
     */
    readFile(filePath: string, encoding?: BufferEncoding | null): Promise<readFileSuccess | readFileError>;
    /**
     * Write content to file
     * @param {string} filePath - Path to file
     * @param {string} content - Content to write
     * @param {string} [encoding='utf8'] - File encoding
     * @returns {Promise<{success: boolean, path?: string, error?: string, bytesWritten?: number}>}
     */
    writeFile(filePath: string, content: string, encoding?: BufferEncoding | null): Promise<writeFileSuccess | writeFileError>;
    /**
     * Append content to file
     * @param {string} filePath - Path to file
     * @param {string} content - Content to append
     * @param {string} [encoding='utf8'] - File encoding
     * @returns {Promise<{success: boolean, path?: string, error?: string}>}
     */
    appendFile(filePath: string, content: string, encoding?: BufferEncoding | null): Promise<writeFileSuccess | appendFileError>;
    /**
     * Check if file or directory exists
     * @param {string} filePath - Path to check
     * @returns {Promise<{success: boolean, exists: boolean, isFile?: boolean, isDirectory?: boolean, error?: string}>}
     */
    exists(filePath: string): Promise<fileExistsStats | fileExistsStatError>;
    /**
     * List directory contents
     * @param {string} dirPath - Directory path
     * @param {boolean} [recursive=false] - List recursively
     * @returns {Promise<{success: boolean, files?: Array, error?: string, path: string}>}
     */
    readDir(dirPath: string, recursive?: boolean): Promise<fileOpError | FileInfoSuccess>;
    /**
     * Create directory
     * @param {string} dirPath - Directory path
     * @param {boolean} [recursive=true] - Create parent directories
     * @returns {Promise<{success: boolean, path?: string, error?: string, created: boolean}>}
     */
    mkdir(dirPath: string, recursive?: boolean): Promise<mkdirSuccess | fileOpError>;
    /**
     * Delete file or directory
     * @param {string} filePath - Path to delete
     * @param {boolean} [recursive=false] - Delete recursively for directories
     * @returns {Promise<{success: boolean, path?: string, error?: string, type?: string}>}
     */
    delete(filePath: string, recursive?: boolean): Promise<deleteSuccess | deleteError>;
    /**
     * Copy file or directory
     * @param {string} source - Source path
     * @param {string} destination - Destination path
     * @param {boolean} [overwrite=false] - Overwrite if exists
     * @returns {Promise<{success: boolean, source?: string, destination?: string, error?: string}>}
     */
    copy(source: string, destination: string, overwrite?: boolean): Promise<copySuccess | copyError>;
    findCommonRoot(src: string, dst: string): string | null | undefined;
    /**
     * Helper: Copy directory recursively
     */
    _copyDirectory(sourceDir: string, destDir: string, overwrite: boolean): Promise<void>;
    /**
     * Move/rename file or directory
     * @param {string} source - Source path
     * @param {string} destination - Destination path
     * @param {boolean} [overwrite=false] - Overwrite if exists
     * @returns {Promise<{success: boolean, source?: string, destination?: string, error?: string}>}
     */
    move(source: string, destination: string, overwrite?: boolean): Promise<moveSuccess | moveError>;
    /**
     * Get file/directory stats
     * @param {string} filePath - Path to check
     * @returns {Promise<{success: boolean, stats?: object, error?: string, path: string}>}
     */
    stat(filePath: string): Promise<statPathSuccess | statPathError>;
    /**
     * Open file dialog to select files
     * @param {Object} [options] - Dialog options
     * @returns {Promise<{success: boolean, files?: string[], canceled?: boolean, error?: string}>}
     */
    openFileDialog(options: OpenDialogOptions): Promise<{
        success: boolean;
        files: string[];
        canceled: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        files?: undefined;
        canceled?: undefined;
    }>;
    /**
     * Open save file dialog
     * @param {Object} [options] - Dialog options
     * @returns {Promise<{success: boolean, filePath?: string, canceled?: boolean, error?: string}>}
     */
    saveFileDialog(options: OpenDialogOptions): Promise<dialogRessponse | writeFileError>;
    /**
     * Read file as JSON
     * @param {string} filePath - Path to JSON file
     * @returns {Promise<{success: boolean, data?: any, error?: string, path: string}>}
     */
    readJSON(filePath: string): Promise<readFileSuccess | readFileError>;
    /**
     * Write data as JSON
     * @param {string} filePath - Path to write
     * @param {any} data - Data to write
     * @param {number} [indent=2] - JSON indentation
     * @returns {Promise<{success: boolean, path?: string, error?: string}>}
     */
    writeJSON(filePath: string, data: object, indent?: number): Promise<watchFileSuccess | writeFileError>;
    /**
     * Watch file for changes
     * @param {string} filePath - File to watch
     * @param {Function} callback - Callback on change
     * @returns {Promise<{success: boolean, watcher?: fs.FSWatcher, error?: string}>}
     */
    watchFile(filePath: string, callback: CallableFunction): Promise<watchFileSuccess | watchFileError>;
};
//# sourceMappingURL=fs.d.ts.map