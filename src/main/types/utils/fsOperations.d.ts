import { OpenDialogOptions } from "electron/utility";
import type { readFileSuccess, readFileError, writeFileSuccess, writeFileError, appendFileSuccess, appendFileError, fileExistsStats, fileExistsStatError, fileOpError, FileInfoSuccess, mkdirSuccess, deleteSuccess, deleteError, copySuccess, copyError, moveSuccess, moveError, statPathSuccess, statPathError, watchFileSuccess, watchFileError, saveDialogResponse, saveDialogError, openDialogResponse, openDialogError } from "./types";
export declare const fsOperations: {
    /**
     * Read file content
     */
    readFile(filePath: string, encoding?: BufferEncoding | null): Promise<readFileSuccess | readFileError>;
    /**
     * Write content to file
     */
    writeFile(filePath: string, content: string, encoding?: BufferEncoding | null): Promise<writeFileSuccess | writeFileError>;
    /**
     * Append content to file
     */
    appendFile(filePath: string, content: string, encoding?: BufferEncoding | null): Promise<appendFileSuccess | appendFileError>;
    /**
     * Check if file or directory exists
     */
    exists(filePath: string): Promise<fileExistsStats | fileExistsStatError>;
    /**
     * List directory contents
     */
    readDir(dirPath: string, recursive?: boolean): Promise<fileOpError | FileInfoSuccess>;
    /**
     * Create directory
     */
    mkdir(dirPath: string, recursive?: boolean): Promise<mkdirSuccess | fileOpError>;
    /**
     * Delete file or directory
     */
    delete(filePath: string, recursive?: boolean): Promise<deleteSuccess | deleteError>;
    /**
     * Copy file or directory
     */
    copy(source: string, destination: string, overwrite?: boolean): Promise<copySuccess | copyError>;
    findCommonRoot(src: string, dst: string): string | null | undefined;
    /**
     * Helper: Copy directory recursively
     */
    _copyDirectory(sourceDir: string, destDir: string, overwrite: boolean): Promise<void>;
    /**
     * Move/rename file or directory
     */
    move(source: string, destination: string, overwrite?: boolean): Promise<moveSuccess | moveError>;
    /**
     * Get file/directory stats
     */
    stat(filePath: string): statPathSuccess | statPathError;
    /**
     * Open file dialog to select files
     */
    openFileDialog(options: OpenDialogOptions): Promise<openDialogResponse | openDialogError>;
    /**
     * Open save file dialog
     */
    saveFileDialog(options: OpenDialogOptions): Promise<saveDialogResponse | saveDialogError>;
    /**
     * Read file as JSON
     */
    readJSON(filePath: string): Promise<readFileSuccess | readFileError>;
    /**
     * Write data as JSON
     */
    writeJSON(filePath: string, data: object, indent?: number): Promise<writeFileSuccess | writeFileError>;
    /**
     * Watch file for changes
     */
    watchFile(filePath: string, callback: CallableFunction): Promise<watchFileSuccess | watchFileError>;
};
//# sourceMappingURL=fsOperations.d.ts.map