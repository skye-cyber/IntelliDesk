import { StateManager } from "../../../core/managers/StatesManager.ts";
import { globalEventBus } from "../../../core/Globals/eventBus";
import { File as UploadedFile } from "../../../core/managers/Conversation/Mistral/InputProcessor";

export const fileUploadUtils = {
    getUploadedFiles(): UploadedFile[] {
        return StateManager.get('uploaded_files') as any || [];
    },

    clearAllFiles(): void {
        StateManager.set('uploaded_files', []);
        globalEventBus.emit('files:cleared');
    },

    removeFile(fileId: string): void {
        const files = this.getUploadedFiles();
        const updated = files.filter(f => f.id !== fileId);
        StateManager.set('uploaded_files', updated);
        globalEventBus.emit('file:removed', fileId);
    },

    getFileType(filename: string): string {
        const extension = filename.split('.').pop()?.toLowerCase() || '';
        const typeMap: Record<string, string> = {
            'pdf': 'PDF', 'doc': 'Word', 'docx': 'Word', 'txt': 'Text',
            'jpg': 'Image', 'jpeg': 'Image', 'png': 'Image', 'gif': 'Image',
            'svg': 'Vector', 'mp4': 'Video', 'mp3': 'Audio', 'zip': 'Archive'
        };
        return typeMap[extension] || extension.toUpperCase();
    },

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};
