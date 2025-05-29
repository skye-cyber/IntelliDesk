const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const dropZoneModal = document.getElementById('dropZoneModal');
const dropZoneText = document.getElementById('dropZoneText');
const uploadedFilesContainer = document.getElementById('uploadedFiles');
const attachFiles = document.getElementById("AttachFiles");
const imagePrompt = document.getElementById("imagePrompt");
const submitImage = document.getElementById("submitImage");

attachFiles.addEventListener("click", OpenFileModal);

const FileModalClose = document.getElementById("closeFileEModal");
FileModalClose.addEventListener("click", (e) => {
    e.stopPropagation();
    CloseFileModal();
});

function OpenFileModal() {
    dropZoneModal.classList.remove('hidden')
}

function CloseFileModal() {
    dropZoneModal.classList.add('hidden');
    // Clear file input and prompt
    fileInput.value = "";
    imagePrompt.value = "";
    uploadedFilesContainer.innerHTML = `<span class="font-bold text-cyan-600 dark:text-teal-400">No files uploaded yet.</span>`;
    //dropZoneText.textContent = "Drag and drop files here or click to select";
}

dropZoneModal.addEventListener('click', (event) =>{
    if (event.target.id === "dropZoneModal"){
        dropZoneModal.classList.add('hidden')
    }
})
// Handle file selection
fileInput.addEventListener('change', handleFileSelect);

// Handle drag and drop
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileDrop, false);

// Handle click on drop zone to trigger file input
dropZone.addEventListener('click', function(event) {
    // Check if the clicked element or any of its parents is the modalTrigger
    if (event.target.id === "modalTrigger" || event.target.closest("#modalTrigger")) {
        // If it is, do nothing (prevent fileInput click)
        return;
    }

    // Prevent the default click behavior
    event.stopPropagation();
    event.preventDefault();

    // Check if the clicked element is within the dropZone
    if (event.target.closest("#dropZone")) {
        fileInput.click();
    }
});

function handleFileSelect(event) {
    const files = event.target.files;
    handleFiles(files);
}

function handleDragOver(event) {
    event.stopPropagation();
    event.preventDefault();

    // Check if the dragged over element or its parent is the dropZone
    if (event.target.closest("#dropZone")) {
        event.dataTransfer.dropEffect = 'copy';
    }
}

function handleFileDrop(event) {
    event.stopPropagation();
    event.preventDefault();

    // Check if the dragged over element or its parent is the dropZone
    if (event.target.closest("#dropZone")) {
        const files = event.dataTransfer.files;
        handleFiles(files);
    }
}

function handleFiles(files) {
    const previewContainer = document.getElementById('uploadedFiles');
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
            //Remove content from preview container
            if (!clear){
                uploadedFilesContainer.innerHTML = "";
                clear = true;
            }

            Uploaded += 1;
            // Create a list item for the file
            console.log('File uploaded:', file.name, file.type, file.size);
            // Hide svgbefore displaying files
            document.getElementById('dropZoneSVG').classList.add('hidden')
            const previewItem = document.createElement('div');
            previewItem.className = 'flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg';
            previewItem.innerHTML = `
                      <div class="flex items-center overflow-auto scrollbar-hide p-4 w-full">
                          <svg class="fill-current h-6 w-6 text-gray-500 mr-1" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h2v4a2 2 0 002 2h2a2 2 0 002-2v-4h2a2 2 0 002-2V4a2 2 0 00-2-2H9z"></path>
                          </svg>
                          <p class="flex text-gray-800 dark:text-stone-300 w-full text-ellipsis whitespace-nowrap">${file.name}</p>
                      </div>
                      <span class="p-1 border-l border-bg-stone-400 rounded-md bg-blue-400 dark:bg-stone-300 text-gray-700 dark:text-zinc-950">${((file.size / (1024 * 1024)).toFixed(2))} MB</span>
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
            window.displayStatus("Unsupported files were ignored!", "success");
            setTimeout(()=>{
                window.hideStatus('success')
            }, 3000)
        }
    }
    // Store the image data URL in the global window object
    window.fileDataUrl = fileUrls;

    // Update the drop zone text if files are uploaded
    if (Uploaded > 0) {
        document.getElementById("dropZoneText").textContent = `${Uploaded} File(s) uploaded successfully`;
    }
}

submitImage.addEventListener('click', (event) =>{
     event.preventDefault();
    submitImageAndText()
});

submitImage.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const inputText = userInput.textContent.trim();

        if (inputText) {
            //Reset the input field content
            imagePrompt.textContent = "";
            // Reset th input field size/height
            imagePrompt.style.height = 'auto';
            imagePrompt.style.height = Math.min(userInput.scrollHeight, 28 * window.innerHeight / 100) + 'px';
            imagePrompt.scrollTop = userInput.scrollHeight;
            submitImageAndText();
        }
    }
});

function submitImageAndText() {
    const imageDataUrl = window.fileDataUrl;
    const fileType = window.AllfileTypes;
    const text = imagePrompt.value;
    if (imageDataUrl && text) {
        // Dispatch an event with the image data URL and text
        const event = new CustomEvent('imageLoaded', { detail: { fileDataUrl: fileDataUrl, text: text, fileType: fileType } });
        document.dispatchEvent(event);
        document.getElementById('dropZoneSVG').classList.remove('hidden')
        CloseFileModal();
        const suggestions = document.getElementById('suggestions')
        suggestions ? suggestions.classList.add('hidden') : '';
    } else {
        if (!imageDataUrl) {
            window.displayStatus("Please select a file!", "success");
            setTimeout(()=>{
                window.hideStatus('success')
            }, 3000)
        } else if (!text) {
            window.displayStatus("Please Enter a prompt relating to the upload", "success");
            setTimeout(()=>{
                window.hideStatus('success')
            }, 3000)
        }
    }
}

window.submitImageAndText = submitImageAndText;
window.CloseFileModal = CloseFileModal;
