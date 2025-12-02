/**
 * Prepares user input content with file attachments
 * @param {string} text - The user's text message
 * @param {Object} options - Configuration options
 * @returns {Array} Formatted content array for API
 */
export function prep_user_input(text, options = {}) {
    const {
        maxFiles = 3,
        maxFileSize = 20 * 1024 * 1024, // 20MB default
        allowMixedTypes = false
    } = options;

    const filedata = window.filedata || [];
    let userContent = [];

    // Always include text content
    if (text && text.trim()) {
        userContent.push({
            type: "text",
            text: text.trim()
        });
    }

    // Process files if available
    if (filedata.length >= 1) {
        const { validFiles, rejectedFiles } = validateFiles(filedata, {
            maxFiles,
            maxFileSize,
            allowMixedTypes
        });

        // Log rejected files for debugging
        if (rejectedFiles.length > 0) {
            console.warn('Files rejected:', rejectedFiles);
        }

        if (validFiles.length > 0) {
            const fileContent = processFilesByType(validFiles);
            userContent = [...userContent, ...fileContent];
        }
    }

    const user_message_portal = window.reactPortalBridge.showComponentInTarget('UserMessage', 'chatArea', { message: text, filedata: userContent.filter(c => c.type !== "text") }, 'user_message')

    window.desk.api.addHistory({ role: "user", content: userContent });

    StateManager.set('user_message_portal', user_message_portal)

    //console.log('Prepared user content:', userContent);
    return { user_message_portal: user_message_portal, userContent: userContent };
}

/**
 * Validates files based on constraints
 */
export function validateFiles(filedata, constraints) {
    const validFiles = [];
    const rejectedFiles = [];
    const seenTypes = new Set();

    for (const file of filedata) {
        const rejectionReasons = [];

        // Check file count
        if (validFiles.length >= constraints.maxFiles) {
            rejectionReasons.push(`Maximum ${constraints.maxFiles} files allowed`);
        }

        // Check file size
        if (file.size > constraints.maxFileSize) {
            const maxSizeMB = (constraints.maxFileSize / (1024 * 1024)).toFixed(1);
            rejectionReasons.push(`File exceeds ${maxSizeMB}MB limit`);
        }

        // Check file type validity
        if (!file.type || !['image', 'document', 'pdf', 'text'].includes(file.type)) {
            rejectionReasons.push('Invalid file type');
        }

        // Check for mixed types if not allowed
        if (!constraints.allowMixedTypes && seenTypes.size > 0 && !seenTypes.has(file.type)) {
            rejectionReasons.push('Mixing different file types not allowed');
        }

        if (rejectionReasons.length === 0) {
            validFiles.push(file);
            seenTypes.add(file.type);
        } else {
            rejectedFiles.push({
                file: file.name,
                reasons: rejectionReasons
            });
        }
    }

    return { validFiles, rejectedFiles };
}

/**
 * Processes files and converts to appropriate content types
 */
export function processFilesByType(files) {
    const content = [];
    const filesByType = groupFilesByType(files);

    // Handle images
    if (filesByType.image && filesByType.image.length > 0) {
        const imageContent = filesByType.image.map(file => ({
            type: "image_url",
            imageUrl: file.url
        }));
        content.push(...imageContent);
    }

    // Handle documents
    if (filesByType.document && filesByType.document.length > 0) {
        const documentContent = filesByType.document.map(file => ({
            type: "document_url", // or "file" depending on your API
            documentUrl: file.url
            /*{ // Fixed: should be document_url not documentUrl
                url: file.url,
                name: file.name,
                size: file.size
            }
            */
        }));
        content.push(...documentContent);
    }

    // Handle PDFs separately if needed
    if (filesByType.pdf && filesByType.pdf.length > 0) {
        const pdfContent = filesByType.pdf.map(file => ({
            type: "document_url",
            documentUrl: file.url
            /*
             * {
                url: file.url,
                name: file.name,
                size: file.size,
                mime_type: 'application/pdf'
            }*/
        }));
        content.push(...pdfContent);
    }

    return content;
}

/**
 * Groups files by their type for processing
 */
export function groupFilesByType(files) {
    return files.reduce((groups, file) => {
        let type = file.type // Default to document if type missing
        if (!type && typeof (file.is_image) === 'bolean') {
            type = file.is_image ? "image" : "document"
        } else {
            type = "document"
        }

        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(file);

        return groups;
    }, {});
}

export function prep_user_input_simple(text) {
    const filedata = window.filedata || [];
    const userContent = [];

    // Add text content
    if (text && text.trim()) {
        userContent.push({
            type: "text",
            text: text.trim()
        });
    }

    // Add file content with basic validation
    const validFiles = filedata.slice(0, 5).filter(file =>
        file.url && file.type && file.size <= 20 * 1024 * 1024
    );

    for (const file of validFiles) {
        if (file.type === "image") {
            userContent.push({
                type: "image_url",
                image_url: { url: file.url }
            });
        } else {
            userContent.push({
                type: "document_url",
                document_url: {
                    url: file.url,
                    name: file.name
                }
            });
        }
    }

    return userContent;
}
