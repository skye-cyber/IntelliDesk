export const FileContainer = ({ setOpen, files }) => {
    const file_container_id = `file_container-${Math.random().toString(36).substring(2, 6)}`;

    // Handle case where files is undefined or empty
    if (!files || !Array.isArray(files) || files.length === 0) {
        return null;
    }

    return (
        <div id={file_container_id} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} className="flex justify-end">
            <article className="flex flex-row md:flex-row w-fit p-1 rounded-lg">
                {files.map((file, index) => {
                    // Handle different file object structures
                    const url = file.url || file.imageUrl || file.documentUrl;
                    const name = file.name || 'File';
                    const type = file.type || ((file.is_image || file.imageUrl) ? 'image' : 'document');

                    if (!url) {
                        console.warn('File missing URL:', file);
                        return null;
                    }
                    let ftype

                    if (type === 'image_url' || file.is_image || file.imageUrl) {
                        const mimetype = file?.imageUrl.split(';')[0]?.replace('data:', '');

                        return (
                            <div key={`image-${index}`} className="inline-flex items-center bg-gray-200 dark:bg-gray-100 p-1 rounded-md m-1">
                                <img
                                    key={`image-${index}`}
                                    src={url}
                                    alt={`Uploaded ${name}`}
                                    className="rounded-md w-8 h-8 my-auto mx-1 object-cover"
                                />
                                {name === 'File' ? mimetype.split('/')[1] : 'File'}
                            </div>
                        );
                    } else {
                        const mimetype = file?.documentUrl.split(';')[0]?.replace('data:', '')
                        return (
                            <div key={`doc-${index}`} className="inline-flex items-center bg-gray-200 dark:bg-gray-200 p-2 rounded-md m-1">
                                <Mimesvg mime={mimetype} type={type} />
                                <span className="text-sm font-medium truncate font-semibold font-handwriting max-w-32">
                                    {name === 'File' ? mimetype.split('/')[1] : 'File'}
                                </span>
                            </div>
                        );
                    }
                })}
            </article>
        </div>
    );
};

export const Mimesvg = ({ mime, className = "w-6 h-6 mr-1 text-gray-600" }) => {
    // Common mime type mappings with SVG icons
    const mimeIcons = {
        // PDF Documents
        'application/pdf': (
            <svg className={`${className} fill-[#b80000]`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M240 112L128 112C119.2 112 112 119.2 112 128L112 512C112 520.8 119.2 528 128 528L208 528L208 576L128 576C92.7 576 64 547.3 64 512L64 128C64 92.7 92.7 64 128 64L261.5 64C278.5 64 294.8 70.7 306.8 82.7L429.3 205.3C441.3 217.3 448 233.6 448 250.6L448 400.1L400 400.1L400 272.1L312 272.1C272.2 272.1 240 239.9 240 200.1L240 112.1zM380.1 224L288 131.9L288 200C288 213.3 298.7 224 312 224L380.1 224zM272 444L304 444C337.1 444 364 470.9 364 504C364 537.1 337.1 564 304 564L292 564L292 592C292 603 283 612 272 612C261 612 252 603 252 592L252 464C252 453 261 444 272 444zM304 524C315 524 324 515 324 504C324 493 315 484 304 484L292 484L292 524L304 524zM400 444L432 444C460.7 444 484 467.3 484 496L484 560C484 588.7 460.7 612 432 612L400 612C389 612 380 603 380 592L380 464C380 453 389 444 400 444zM432 572C438.6 572 444 566.6 444 560L444 496C444 489.4 438.6 484 432 484L420 484L420 572L432 572zM508 464C508 453 517 444 528 444L576 444C587 444 596 453 596 464C596 475 587 484 576 484L548 484L548 508L576 508C587 508 596 517 596 528C596 539 587 548 576 548L548 548L548 592C548 603 539 612 528 612C517 612 508 603 508 592L508 464z" />
            </svg>
        ),

        // Microsoft Word
        'application/msword': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM16 11H13.5V12.5H15V14H13.5V15.5H16V17H12V10H16V11Z" />
            </svg>
        ),
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM16 11H13.5V12.5H15V14H13.5V15.5H16V17H12V10H16V11Z" />
            </svg>
        ),

        // Microsoft Excel
        'application/vnd.ms-excel': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM15.2 10H13V12.2L15.2 10ZM7 12H9.8L12 14.2L14.2 12H17L13.8 15.2L17 18.4H14.2L12 16.2L9.8 18.4H7L10.2 15.2L7 12Z" />
            </svg>
        ),
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM15.2 10H13V12.2L15.2 10ZM7 12H9.8L12 14.2L14.2 12H17L13.8 15.2L17 18.4H14.2L12 16.2L9.8 18.4H7L10.2 15.2L7 12Z" />
            </svg>
        ),

        // Microsoft PowerPoint
        'application/vnd.ms-powerpoint': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM15 11H13.5V14.5H15.3C16 14.5 16.5 14 16.5 13.2V12C16.5 11.2 16 10.7 15.3 10.7H15V11ZM15 12.5V13.5H15.3C15.5 13.5 15.7 13.3 15.7 13.1V12.4C15.7 12.2 15.5 12 15.3 12H15ZM9 11H7V17H8.5V15.5H9C10.1 15.5 11 14.6 11 13.5V13C11 11.9 10.1 11 9 11ZM9 14H8.5V12.5H9C9.3 12.5 9.5 12.7 9.5 13V13.5C9.5 13.8 9.3 14 9 14Z" />
            </svg>
        ),
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM15 11H13.5V14.5H15.3C16 14.5 16.5 14 16.5 13.2V12C16.5 11.2 16 10.7 15.3 10.7H15V11ZM15 12.5V13.5H15.3C15.5 13.5 15.7 13.3 15.7 13.1V12.4C15.7 12.2 15.5 12 15.3 12H15ZM9 11H7V17H8.5V15.5H9C10.1 15.5 11 14.6 11 13.5V13C11 11.9 10.1 11 9 11ZM9 14H8.5V12.5H9C9.3 12.5 9.5 12.7 9.5 13V13.5C9.5 13.8 9.3 14 9 14Z" />
            </svg>
        ),

        // Text files
        'text/plain': (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        'text/csv': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 11H10V13H8V11ZM12 11H14V13H12V11ZM16 11H18V13H16V11ZM8 15H10V17H8V15ZM12 15H14V17H12V15ZM16 15H18V17H16V15Z" />
            </svg>
        ),

        // Images
        'image/jpeg': (
            <svg className={className} viewBox="0 0 24 24" fill="#ff007f">
                <path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14.14 11.86L11.14 15.73L9 13.14L6 17H18L14.14 11.86Z" />
            </svg>
        ),
        'image/jpg': (
            <svg className={`${className} fill-[#c70064] dark:fill-[#d80070]`} viewBox="0 0 24 24">
                <path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14.14 11.86L11.14 15.73L9 13.14L6 17H18L14.14 11.86Z" />
            </svg>
        ),
        'image/png': (
            <svg className={`${className} fill-[#c70064] dark:fill-[#d80070]`} viewBox="0 0 24 24">
                <path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14.14 11.86L11.14 15.73L9 13.14L6 17H18L14.14 11.86Z" />
            </svg>
        ),
        'image/gif': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.5 9H13V15H11.5V9ZM9 9H10.5V10.5H9V9ZM15 9H16.5V10.5H15V9ZM9 11.5H10.5V13H9V11.5ZM15 11.5H16.5V13H15V11.5ZM9 14H10.5V15.5H9V14ZM15 14H16.5V15.5H15V14ZM19 19H5V5H19V19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" />
            </svg>
        ),
        'image/svg+xml': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM10.2 13.2L12 16.2L13.8 13.2L15.6 16.2L17.4 13.2L19 16V9H5V16L7.2 12L9 15L10.2 13.2Z" />
            </svg>
        ),

        // Archives
        'application/zip': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6H12L10 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6ZM20 18H4V8H20V18ZM18 12H6V10H18V12ZM16 16H6V14H16V16Z" />
            </svg>
        ),
        'application/x-rar-compressed': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6H12L10 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6ZM20 18H4V8H20V18ZM18 12H6V10H18V12ZM16 16H6V14H16V16Z" />
            </svg>
        ),

        // Code files
        'text/html': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM10 15.5L11.4 14.1L10.3 13L11.7 11.6L12.8 12.7L14.2 11.3L13.1 10.2L14.5 8.8L16.6 10.9L10 17.5L7.4 14.9L8.8 13.5L10 14.7V15.5Z" />
            </svg>
        ),
        'text/css': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 15.5L9.4 14.1L8.3 13L9.7 11.6L10.8 12.7L12.2 11.3L11.1 10.2L12.5 8.8L14.6 10.9L8 17.5L5.4 14.9L6.8 13.5L8 14.7V15.5ZM14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" />
            </svg>
        ),
        'application/javascript': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM16.1 12.6L15 14.1C15.7 14.7 16.1 15.6 16.1 16.5C16.1 18.4 14.5 20 12.6 20H9V18H12.6C13.4 18 14.1 17.3 14.1 16.5C14.1 15.7 13.4 15 12.6 15H9.9V13H12.6C13.4 13 14.1 12.3 14.1 11.5C14.1 10.7 13.4 10 12.6 10H9V8H12.6C14.5 8 16.1 9.6 16.1 11.5C16.1 12.1 15.9 12.7 15.6 13.2L16.1 12.6Z" />
            </svg>
        ),
        'text/x-python': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.6 9.6C10.4 9.6 11 10.2 11 11C11 11.8 10.4 12.4 9.6 12.4C8.8 12.4 8.2 11.8 8.2 11C8.2 10.2 8.8 9.6 9.6 9.6ZM14.4 14.4C15.2 14.4 15.8 15 15.8 15.8C15.8 16.6 15.2 17.2 14.4 17.2C13.6 17.2 13 16.6 13 15.8C13 15 13.6 14.4 14.4 14.4ZM14 2H10V6H14V2ZM20 10V14H16V20H10V16H4V8H10V4H16V8H20V10ZM18 12H16V14H18V12ZM8 16H6V18H8V16Z" />
            </svg>
        ),

        // Audio/Video
        'audio/mpeg': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3V13.55C11.41 13.21 10.73 13 10 13C7.79 13 6 14.79 6 17C6 19.21 7.79 21 10 21C12.21 21 14 19.21 14 17V7H18V3H12ZM10 19C8.9 19 8 18.1 8 17C8 15.9 8.9 15 10 15C11.1 15 12 15.9 12 17C12 18.1 11.1 19 10 19Z" />
            </svg>
        ),
        'video/mp4': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 10.5V7C17 5.9 16.1 5 15 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19H15C16.1 19 17 18.1 17 17V13.5L21 17.5V6.5L17 10.5ZM15 17H5V7H15V17Z" />
            </svg>
        ),

        // JSON/XML
        'application/json': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM10 16.5L11.4 15.1L10.3 14L11.7 12.6L12.8 13.7L14.2 12.3L13.1 11.2L14.5 9.8L16.6 11.9L10 18.5L7.4 15.9L8.8 14.5L10 15.7V16.5ZM16.1 12.6L15 14.1C15.7 14.7 16.1 15.6 16.1 16.5C16.1 18.4 14.5 20 12.6 20H9V18H12.6C13.4 18 14.1 17.3 14.1 16.5C14.1 15.7 13.4 15 12.6 15H9.9V13H12.6C13.4 13 14.1 12.3 14.1 11.5C14.1 10.7 13.4 10 12.6 10H9V8H12.6C14.5 8 16.1 9.6 16.1 11.5C16.1 12.1 15.9 12.7 15.6 13.2L16.1 12.6Z" />
            </svg>
        ),
        'application/xml': (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM10 15.5L11.4 14.1L10.3 13L11.7 11.6L12.8 12.7L14.2 11.3L13.1 10.2L14.5 8.8L16.6 10.9L10 17.5L7.4 14.9L8.8 13.5L10 14.7V15.5Z" />
            </svg>
        ),
    };

    // First try exact mime match
    if (mime && mimeIcons[mime]) {
        return mimeIcons[mime];
    }

    // Try to match by type prefix (e.g., "image/", "application/")
    if (mime) {
        const typePrefix = mime.split('/')[0];
        const typeIcons = {
            'image': mimeIcons['image/jpeg'],
            'video': mimeIcons['video/mp4'],
            'audio': mimeIcons['audio/mpeg'],
            'text': mimeIcons['text/plain'],
            'application': mimeIcons['application/pdf'],
        };

        if (typeIcons[typePrefix]) {
            console.log(typeIcons[typePrefix])
            return typeIcons[typePrefix];
        }
    }

    // Default fallback icon (generic document)
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
        </svg>
    );
};
