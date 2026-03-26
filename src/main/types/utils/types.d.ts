import { FSWatcher } from "original-fs";
export type dialogMenufilter = [
    {
        name: string;
        extensions: [string];
    }
];
export type DialogOptions = {
    title: string;
    defaultPath: string;
    buttonLabel: string;
    filters: dialogMenufilter;
    properties: string | undefined;
    message: string;
};
export interface readFileSuccess {
    success: boolean;
    data: string | object | undefined;
    path: string;
    size: number;
    encoding: BufferEncoding | string | null;
}
export interface fileOpError {
    success: boolean;
    error: string | any | unknown | null;
    code: number | string | null | any | unknown;
    path: string;
}
export type readFileError = fileOpError;
export interface writeFileSuccess {
    success: boolean;
    path: string;
    bytesWritten: number;
    created: boolean;
}
export type writeFileError = fileOpError;
export type appendFileError = fileOpError;
export type fileExistsStatError = fileOpError;
export interface fileExistsStats {
    success: boolean;
    exists: boolean;
    isFile: boolean;
    isDirectory: boolean;
    size: number;
    modified: Date;
    path: string;
}
export interface watchFileSuccess {
    success: boolean;
    watcher: FSWatcher | null;
    path: string;
}
export type watchFileError = fileOpError;
export type readJSONError = readFileError;
export interface dialogRessponse {
    success: boolean;
    path: string | null;
    canceled: boolean;
}
export interface fileFullStats {
    size: number | string | null;
    isFile: boolean;
    isDirectory: boolean;
    isSymbolicLink: boolean;
    modified: Date;
    created: Date;
    accessed: Date;
    permissions: {
        owner: number | string;
        group: number | string;
        other: number | string;
    };
    mode: string;
    uid: number;
    gid: number;
    blocks: number;
}
export interface statPathSuccess {
    success: boolean;
    stats: fileFullStats;
    path: string;
}
export interface statPathError {
    success: boolean;
    error: string | any | unknown;
    code: number | string | null | any | unknown;
    path: string;
}
export interface FileInfo {
    name: string;
    path: string;
    type: 'directory' | 'file' | 'symlink' | 'other' | string;
    size: string | number;
    modified: Date;
    created: Date;
    mode: string;
    children: null | any;
}
export interface FileInfoSuccess {
    success: boolean;
    path: string;
    count: number;
    files: Array<FileInfo>;
}
export type mkdirSuccess = writeFileSuccess;
export interface deleteSuccess {
    success: boolean;
    path: string;
    type: 'directory' | 'file' | 'symlink' | string;
    deleted: boolean;
}
export interface deleteError {
    success: boolean;
    error: string | any | unknown;
    code: number | string | null | any | unknown;
    path: string;
    type: 'directory' | 'file' | 'symlink' | string | null | undefined;
}
export interface copySuccess {
    success: boolean;
    source: string;
    destination: string;
    copied: boolean;
    type: 'directory' | 'file';
}
export interface copyError {
    success: boolean;
    error: string;
    code: number | string;
    source: string;
    destination: string;
}
export interface moveSuccess {
    success: boolean;
    source: string;
    destination: string;
    moved: boolean;
    type: 'directory' | 'file';
}
export type moveError = copyError;
//# sourceMappingURL=types.d.ts.map