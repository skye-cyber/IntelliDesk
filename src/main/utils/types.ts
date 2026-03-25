export interface readFileSuccess {
    success: boolean,
    data: string | object | undefined,
    path: string,
    size: number,
    encoding: BufferEncoding | string | null
}

export type fileOpError = {
    success: boolean,
    error: string,
    code: number | string | null,
    path: string
}

export type readFileError = fileOpError

export interface writeFileSuccess {
    success: boolean,
    path: string,
    bytesWritten: number,
    created: boolean
}

export type writeFileError = fileOpError
export type appendFileError = fileOpError
export type fileStatError = fileOpError

export interface fileStats {
    success: boolean,
    exists: boolean,
    isFile: boolean,
    isDirectory: boolean,
    size: number,
    modified: Date,
    path: string
}
