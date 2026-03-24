/**
 * Write File Tool - Create or overwrite UTF-8 files with safety constraints
 */
import { ToolBase } from '../ToolBase';
const path = window.desk.path

const fs = window.desk.fs

export class WriteFileTool extends ToolBase {
    constructor() {
        super('write_file', 'Create or overwrite a UTF-8 file. Fails if file exists unless \'overwrite=True\'.');
    }

    defineSchema() {
        return {
            type: "function",
            function: {
                name: "write_file",
                description: "Create or overwrite a UTF-8 file. Fails if file exists unless 'overwrite=True'.",
                parameters: {
                    type: "object",
                    properties: {
                        path: {
                            type: "string",
                            description: "The file path (relative or absolute)"
                        },
                        content: {
                            type: "string",
                            description: "The content to write to the file"
                        },
                        overwrite: {
                            type: "boolean",
                            default: false,
                            description: "Must be set to true to overwrite an existing file."
                        }
                    },
                    required: ["path", "content"]
                }
            }
        };
    }

    async _execute({ path: filePath, content, overwrite = false }, context) {
        // Validate file path
        this.validateFilePath(filePath);

        // Check if file exists
        const fileExists = fs.existsSync(filePath);

        if (fileExists && !overwrite) {
            throw new Error(`File already exists at ${filePath}. Set overwrite=true to overwrite.`);
        }

        // Ensure directory exists
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            // Create directory recursively
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Write file
        fs.writeFileSync(filePath, content, 'utf8');

        // Create backup if configured
        let backupCreated = false;
        if (this.config.create_backup && fileExists) {
            const backupPath = filePath + '.backup_' + Date.now();
            fs.writeFileSync(backupPath, content, 'utf8');
            backupCreated = true;
        }

        return {
            path: filePath,
            bytes_written: Buffer.byteLength(content, 'utf8'),
            file_created: !fileExists,
            file_overwritten: fileExists && overwrite,
            backup_created: backupCreated,
            timestamp: new Date().toISOString()
        };
    }

    validateFilePath(filePath) {
        // Basic validation to prevent directory traversal attacks
        if (!filePath || typeof filePath !== 'string') {
            throw new Error('Invalid file path');
        }

        // Check for suspicious patterns
        if (filePath.includes('..') || filePath.includes('~')) {
            throw new Error('File path contains invalid characters');
        }

        // Check file extension against denylist
        const deniedExtensions = this.config.denied_extensions || ['.exe', '.bat', '.sh', '.js', '.deb'];
        const fileExt = path.extname(filePath).toLowerCase();

        // if(path.isAbsolute(filePath)){
        //     throw new Error("File path must be absolute")
        // }

        if (deniedExtensions.includes(fileExt)) {
            throw new Error(`File extension ${fileExt} is not allowed`);
        }

        return true;
    }

    formatResult(result) {
        return {
            success: true,
            path: result.path,
            bytes_written: result.bytes_written,
            file_created: result.file_created,
            file_overwritten: result.file_overwritten,
            backup_created: result.backup_created,
            timestamp: result.timestamp
        };
    }
}
