import { waitForElement } from "../../../renderer/js/Utils/dom_utils";

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


export function handleFiles(files) {
    const previewContainer = document.getElementById('uploadedFiles');

    let ignored = 0

    let Uploaded = 0
    //Create a list to hold file urls
    let clear = false
    let fileUrls = []
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Determine if the file is an image or a document
        const isImage = file.type.startsWith('image/');
        const fileType = isImage ? 'image' : 'document';
        window.fileType = fileType;

        // Convert the file to a data URL if it's an image
        if (isImage) {
            waitForElement('#EmptyDisplay', (el) => el.classList.add('hidden'))

            //Remove content from preview container
            if (!clear) {
                clear = true;
            }

            Uploaded += 1;
            // Create a list item for the file
            console.log('File uploaded:', file.name, file.type, file.size);

            const previewItem = document.createElement('div');
            previewItem.className = 'group flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 backdrop-blur-sm';
            previewItem.innerHTML = `
                <div class="flex items-center space-x-4 flex-1 min-w-0">
                    <!-- File Icon with Progress -->
                    <div class="relative flex-shrink-0">
                        <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <!-- Progress Ring -->
                        <div class="absolute -inset-1">
                            <svg class="w-14 h-14 transform -rotate-90" viewBox="0 0 50 50">
                                <circle cx="25" cy="25" r="20" stroke="currentColor" stroke-width="3" fill="none"
                                        stroke-dasharray="125.6" stroke-dashoffset="125.6"
                                        class="text-green-500/30 transition-all duration-500"
                                        style="stroke-dashoffset: ${125.6 * (1 - (file.progress || 1))}">
                                </circle>
                            </svg>
                        </div>
                    </div>

                    <!-- File Info -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-1">
                            <h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate flex-1" title="${file.name}">
                                ${file.name}
                            </h4>
                            <span class="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                                ${file.progress ? Math.round(file.progress * 100) + '%' : 'Ready'}
                            </span>
                        </div>

                        <!-- Progress Bar -->
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div class="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                                style="width: ${(file.progress || 0) * 100}%"></div>
                        </div>

                        <div class="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
                            <span class="flex items-center space-x-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>${new Date().toLocaleDateString()}</span>
                            </span>
                            <span>${formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span class="flex items-center space-x-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                            </svg>
                            <span>${getFileType(file.name)}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Remove Button -->
                <div class="flex items-center space-x-2 flex-shrink-0">
                    <span class="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-xl border border-blue-400 font-medium">
                    ${formatFileSize(file.size)}
                    </span>
                    <button class="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                            onclick="removeFile('${file.name}')"
                            title="Remove file">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.981-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            `;

            previewContainer.appendChild(previewItem);
            const reader = new FileReader();

            const AllfileTypes = "image";
            window.AllfileTypes = fileType //AllfileTypes
            reader.onload = (e) => {
                const imageDataUrl = e.target.result;
                fileUrls.push(imageDataUrl);
            };
            reader.readAsDataURL(file);

        } else {
            ignored += 1
        }
    }
    // Store the image data URL in the global window object
    window.fileDataUrl = fileUrls;

    // Update the drop zone text if files are uploaded

    if (ignored>0) window.ModalManager.showMessage(` ${ignored} Unsupported ${(ignored>1)? "files were" :"file was"} ignored!`, "warning");

    if (Uploaded > 0) {
        window.ModalManager.showMessage(`${Uploaded} ${(Uploaded>1)? "files" :"file"} uploaded successfully`, "success");
    } else {
        waitForElement('#EmptyDisplay', (el) => el.classList.remove('hidden'))
    }
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

export function HandleFileSubmit() {
    const userInput = document.getElementById('fileInput');
    const submitFiles = document.getElementById("submitFiles");

    const inputText = userInput.textContent.trim();

    if (inputText) {
        //Reset the input field content
        submitFiles.textContent = "";
        // Reset th input field size/height
        submitFiles.style.height = 'auto';
        submitFiles.style.height = Math.min(userInput.scrollHeight, 28 * window.innerHeight / 100) + 'px';
        submitFiles.scrollTop = userInput.scrollHeight;
        submitFilesAndText();
    }
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
