import { waitForElement } from "../../../renderer/js/Utils/dom_utils";
import { Router } from "../../../renderer/js/managers/router";

// Update show/hide functions with new animations
export function showDropZoneModal() {
    const modal = document.getElementById('dropZoneModal');
    const content = document.getElementById('dropZoneContent');

    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
}

export function CloseDropZone() {
    const modal = document.getElementById('dropZoneModal');
    const content = document.getElementById('dropZoneContent');

    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');

    setTimeout(() => modal.classList.add('hidden'), 500);
}

export function openPreview() {
    const modal = document.getElementById('previewModal');
    const content = document.getElementById('modalContent');

    modal.classList.remove('opacity-0', 'hidden');
    modal.classList.add('opacity-100');
    setTimeout(() => {
        content.classList.remove('animate-exit');
        content.classList.add('animate-enter');
    }, 10);
}


export function closePreview() {
    const modal = document.getElementById('previewModal');
    const content = document.getElementById('modalContent');

    content.classList.remove('animate-enter');
    content.classList.add('animate-exit');
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0')

    setTimeout(() => {
        modal.classList.add('hidden');
    }, 510);
}


window.filedata = [{ name: '', size: '', type: '', url: '' }]

export function handleFiles(files) {
    //const previewContainer = document.getElementById('uploadedFiles');

    let ignored = 0

    window.filedata = []

    let filedata = []
    let uploaded_file = []
    let Uploaded = 0
    //Create a list to hold file urls
    let clear = false
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (uploaded_file.includes(file.name)) continue;

        // Determine if the file is an image or a document
        const isImage = file.type.startsWith('image/');
        const fileType = isImage ? 'image' : 'document';

        // Convert the file to a data URL if it's an image
        waitForElement('#EmptyDisplay', (el) => el.classList.add('hidden'))

        //Remove content from preview container
        if (!clear) {
            clear = true;
        }

        Uploaded += 1;

        // Create a list item for the file
        window.reactPortalBridge.showComponentInTarget('FileItem', 'FilePreview', { file: file, is_image: fileType === 'image' }, "uploade_files")

        const reader = new FileReader();


        window.AllfileTypes = fileType //AllfileTypes

        reader.onload = (e) => {
            const filedataurl = e.target.result;
            filedata.push({ file: file, name: file.name, type: getFileType(file.name)?.toLocaleLowerCase(), is_image: fileType === "image", url: filedataurl, size: file.size, used: false })
        };
        reader.readAsDataURL(file);

        uploaded_file.push(file.name)
        console.log(filedata)
        window.filedata = filedata
    }

    // switch model to multi-modal
    const model = "pixtral-large-2411"
    new Router().change_model(model)
    console.log("changing model")

    if (ignored > 0) window.ModalManager.showMessage(` ${ignored} Unsupported ${(ignored > 1) ? "files were" : "file was"} ignored!`, "warning");

    if (Uploaded > 0) {
        window.ModalManager.showMessage(`${Uploaded} ${(Uploaded > 1) ? "files" : "file"} uploaded successfully`, "success");
    } else {
        waitForElement('#EmptyDisplay', (el) => el.classList.remove('hidden'))
    }

    setTimeout(() => {
        window.reactPortalBridge.showComponentInTarget('UploadeFileIndicator', 'userInputContainer', {}, "file_count")
    }, 1000)
}

// Helper functions you'll need to add:
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const fileTypes = {
        'pdf': 'PDF',
        'doc': 'Word',
        'docx': 'Word',
        'txt': 'Text',
        'jpg': 'Image',
        'jpeg': 'Image',
        'png': 'Image',
        'gif': 'Image',
        'svg': 'Vector',
        'mp4': 'Video',
        'mp3': 'Audio',
        'zip': 'Archive',
        'rar': 'Archive'
    };
    return fileTypes[extension] || extension.toUpperCase();
}

export function submitFilesAndText() {
    const imageDataUrl = window.fileDataUrl;
    const fileType = window.AllfileTypes;
    const text = imagePrompt.value;
    if (imageDataUrl && text) {
        // Dispatch an event with the image data URL and text
        const event = new CustomEvent('filesUploaded', { detail: { fileDataUrl: fileDataUrl, text: text, fileType: fileType } });

        document.dispatchEvent(event);
        document.getElementById('dropZoneSVG').classList.remove('hidden')

        CloseFileModal();
        const suggestions = document.getElementById('suggestions')
        suggestions ? suggestions.classList.add('hidden') : '';
    } else {
        if (!imageDataUrl) {
            window.ModalManager.showMessage("Please select a file!", "warning");
        } else if (!text) {
            window.ModalManager.showMessag("Please Enter a prompt relating to the upload", "warn");
        }
    }
}
