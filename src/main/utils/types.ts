import { FSWatcher } from "original-fs"

export type dialogMenufilter = [
    { name: string, extensions: [string] }
]

export interface SuccessBase {
    success: boolean
}


export interface ErrorBase {
    success: boolean
    error: string | any | unknown | null
    code: number | string | null | any | unknown
}

export type DialogOptions = {
    title: string
    defaultPath: string
    buttonLabel: string
    filters: dialogMenufilter
    properties: string | undefined
    message: string
}

export interface readFileSuccess {
    success: boolean
    data: string | object | undefined
    path: string
    size: number
    encoding: BufferEncoding | string | null
}

export interface FileSystemError extends ErrorBase {
    path: string
}

export type readFileError = FileSystemError

export interface writeFileSuccess extends SuccessBase {
    path: string
    bytesWritten: number
    created: boolean
}

export type writeFileError = FileSystemError
export type appendFileError = FileSystemError

export interface appendFileSuccess extends SuccessBase {
    path: string
    size: number
    encoding: BufferEncoding | null
}

export type fileExistsStatError = FileSystemError

export interface fileExistsStats extends SuccessBase {
    exists: boolean
    isFile: boolean
    isDirectory: boolean
    size: number
    modified: Date
    path: string
}

export interface watchFileSuccess {
    success: boolean
    watcher: FSWatcher | null
    path: string
}

export type watchFileError = FileSystemError
export type readJSONError = readFileError

export interface dialogRessponse extends SuccessBase {
    path: string | null
    canceled: boolean
}

export interface fileFullStats {
    size: number | string | null
    isFile: boolean
    isDirectory: boolean
    isSymbolicLink: boolean
    modified: Date
    created: Date
    accessed: Date
    permissions: {
        owner: number | string
        group: number | string
        other: number | string
    }
    mode: string
    uid: number
    gid: number
    blocks: number
}

export interface statPathSuccess extends SuccessBase {
    stats: fileFullStats
    path: string
}
export interface statPathError extends ErrorBase {
    path: string
}

export interface FileInfo {
    name: string
    path: string
    type: 'directory' | 'file' | 'symlink' | 'other' | string
    size: string | number
    modified: Date
    created: Date
    mode: string
    children: null | any
}
export interface FileInfoSuccess extends SuccessBase {
    path: string
    count: number
    files: Array<FileInfo>
}

export interface mkdirSuccess extends SuccessBase {
    path: string
    created: boolean
}

export interface rmdirError extends ErrorBase {
    path: string
}
export interface rmdirSuccess extends SuccessBase {
    deleted: boolean
    path: string
}

export interface deleteSuccess extends SuccessBase {
    path: string
    type: 'directory' | 'file' | 'symlink' | string
    deleted: boolean
}

export interface deleteError extends ErrorBase {
    path: string
    type: 'directory' | 'file' | 'symlink' | string | null | undefined
}

export interface copySuccess extends SuccessBase {
    source: string
    destination: string
    copied: boolean
    type: 'directory' | 'file'
}

export interface copyError extends ErrorBase {
    source: string
    destination: string
}

export interface moveSuccess extends SuccessBase {
    source: string
    destination: string
    moved: boolean
    type: 'directory' | 'file'
}

export type moveError = copyError

export interface saveDialogResponse extends SuccessBase {
    path: string | null
    code: string | number | undefined
}

export interface saveDialogError extends ErrorBase {
    path: string | null | undefined
    canceled: boolean
}

export interface openDialogResponse extends SuccessBase {
    files: Array<string | any>
    canceled: boolean
}

export interface openDialogError extends ErrorBase {
    code: string | number | undefined
    files: Array<string | any>
    canceled: boolean
}
