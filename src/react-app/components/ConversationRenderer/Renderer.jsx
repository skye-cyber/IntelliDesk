import React, { useCallback } from 'react';
import { CopyMessage } from '../../../renderer/js/Utils/chatUtils';
import { normalizeMathDelimiters } from '../../../renderer/js/MathBase/MathNormalize';
import { toggleExportOptions } from '../../../renderer/js/ChatExport/export';
import { HTML2Jpg, HTML2Word, HTML2Pdf } from '../../../renderer/js/ChatExport/export';
import { markitdown } from '../Code/CodeHighlighter';
import { CodeBlockRenderer, SimpleUserCodeRenderer } from '../Code/CodeBlockRenderer';
import { ChatUtil } from '../../../renderer/js/managers/ConversationManager/util';
// import { unsafe } from '../../../renderer/js/Utils/chatUtils';
import { GenerateId } from './utils';
import { mathStandardize } from '../../../renderer/js/MathBase/mathRenderer';
import { normalizeCodeBlocks } from '../../../renderer/js/Code/codeNormalize';

const chatutil = new ChatUtil()

export const UserMessage = ({
    message,
    files = [],
    save = true
}) => {

    const userContent = markitdown(message);

    const message_id = GenerateId('user_msg')

    //if (save) window.desk.api.addHistory({ role: "user", content: message });

    chatutil.render_math(`.${message_id}`, 0)

    return (
        <>
            <section className="block">
                <div className="flex items-end gap-x-2 justify-end">
                    <div id="user_message" data-id={message_id} className={`${message_id} relative bg-blue-100/70 dark:bg-primary-700 text-black dark:text-white rounded-lg rounded-br-none p-2 md:p-3 shadow-none w-fit max-w-full md:max-w-[80%]`}>
                        <SimpleUserCodeRenderer htmlContent={userContent} />
                    </div>
                </div>

                <UserMessageOptions message_id={message_id} />
            </section >

            <div className='flex justify-end'>
                <FileContainer files={files} />
            </div>
        </>
    )
}


export const AiMessage = ({
    actual_response,
    isThinking,
    think_content,
    message_id = GenerateId('ai-msg'),
    export_id = GenerateId('export'),
    fold_id = GenerateId('fold')
}) => {
    let processedHtml

    //console.log(actual_response)
    try {
        // Normalize code
        actual_response = normalizeCodeBlocks(actual_response)
        processedHtml = markitdown(mathStandardize(actual_response))
    } catch (err) {
        //console.log(err)
    }

    window.StateManager.set("current_message_id", message_id)

    const processedThinkHtml = think_content ? markitdown(normalizeMathDelimiters(think_content)) : null;

    const FoldThinking = useCallback((e, selector) => {
        const content = document.getElementById(selector);
        if (content) {
            content.classList.toggle('hidden');
        }
        document.querySelector('.fold_svg')?.classList.toggle('rotate-180')
    })


    return (
        <div id="ai_response_container" className='flex justify-start mb-12 overflow-wrap'>
            <section id="ai_response" className="relative w-fit max-w-full mb-[2vh] p-2">
                {
                    actual_response ?
                        (
                            <>
                                <div id="ai_response_think" className={`think-${message_id} w-full bg-none py-4 text-gray-900 dark:text-white font-brand leading-loose rounded-lg rounded-bl-none px-4 mb-6 pb-4 transition-colors duration-700`}>
                                    {
                                        (isThinking || think_content) ? (
                                            <div className="think-section">
                                                <div className="flex items-center justify-between">
                                                    <strong className="leading-widest font-brand text-light text-blue-400 dark:text-blue-400">Thoughts:</strong>
                                                    <button
                                                        className="text-sm text-gray-600 dark:text-gray-200"
                                                        onClick={(e) => FoldThinking(e, fold_id)}
                                                    >
                                                        <svg className="fold_svg mb-2 fold-icon transition-transform duration-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" width="32" height="38">
                                                            <path d="M297.4 169.4C309.9 156.9 330.2 156.9 342.7 169.4L534.7 361.4C547.2 373.9 547.2 394.2 534.7 406.7C522.2 419.2 501.9 419.2 489.4 406.7L320 237.3L150.6 406.6C138.1 419.1 117.8 419.1 105.3 406.6C92.8 394.1 92.8 373.8 105.3 361.3L297.3 169.3z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div id={fold_id} className="">
                                                    <div id="think-content" className='text-gray-500 dark:text-gray-400'>
                                                        <CodeBlockRenderer htmlContent={processedThinkHtml} />
                                                    </div>
                                                </div>
                                                {
                                                    (think_content && actual_response) ?
                                                        <p className="w-full rounded-lg border-2 border-blue-200 dark:border-gray-400 mb-2"></p>
                                                        : ""
                                                }
                                            </div>
                                        )
                                            : ''
                                    }
                                    {
                                        actual_response && think_content ?
                                            <strong className="text-green-400 dark:text-green-400">Response:</strong>
                                            : ''
                                    }
                                    <div id={message_id} className={message_id}>
                                        <CodeBlockRenderer htmlContent={processedHtml} />
                                    </div>
                                    <AiMessageOptions export_id={export_id} message_id={message_id} />
                                </div>
                                <ExportMenu export_id={export_id} message_id={message_id} />
                            </>
                        ) :
                        ''
                }
            </section >
        </div >
    )
}
export const FileContainer = ({ files }) => {
    const file_container_id = `file_container-${Math.random().toString(36).substring(2, 6)}`;

    // Handle case where files is undefined or empty
    if (!files || !Array.isArray(files) || files.length === 0) {
        return null;
    }

    return (
        <div id={file_container_id} className="flex justify-end">
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

export const ExportMenu = ({ export_id, message_id }) => {
    return (
        <div
            onMouseLeave={() => toggleExportOptions(export_id, 'off')}
            data-action="export-menu"
            id={`exportOptions-${export_id}`}
            className="hidden absolute z-[10] bottom-12 left-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 z-50 overflow-hidden transition-all duration-300 transform origin-bottom-left">
            <div className="p-1">
                <div className="relative">
                    {/* Header */}
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight">Export Options</p>
                    </div>

                    {/* Export Items */}
                    <div className="py-1">
                        <button onClick={(event) => HTML2Pdf(event, `.${message_id}`)}
                            className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 group">
                            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <div className="font-medium">PDF Document</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">High quality</div>
                            </div>
                        </button>

                        <button onClick={(event) => HTML2Jpg(event, `.${message_id}`)}
                            className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 group">
                            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <div className="font-medium">JPEG Image</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">High resolution</div>
                            </div>
                        </button>

                        <button onClick={(event) => HTML2Word(event, `.${message_id}`)}
                            className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 group">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <div className="font-medium">Word Document</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Editable format</div>
                            </div>
                        </button>
                    </div>

                    {/* Coming Soon Section */}
                    <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700">
                        <button className="w-full flex items-center px-3 py-2.5 text-sm text-gray-400 dark:text-gray-500 rounded-lg transition-all duration-200 cursor-not-allowed group">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <div className="font-medium text-gray-400">Advanced Export</div>
                                <div className="text-xs text-gray-400">Coming soon</div>
                            </div>
                            <span className="ml-auto px-1.5 py-0.5 text-xs bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full">Soon</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Arrow indicator */}
            <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45"></div>
        </div>
    )
}

export const AiMessageOptions = ({ message_id, export_id }) => {
    const copy_button_id = GenerateId('ai-copy-button')
    const clone_button_id = GenerateId('ai-clone');

    const clone_markdown_content = useCallback((selector, html = true) => {
        CopyMessage(selector, html)
    });

    return (
        <section className="options absolute bottom-2 flex mt-6 space-x-2 cursor-pointer">
            {/*EXPORT OPTION*/}
            <div className="group relative max-w-fit transition-all duration-300 hover:z-50">
                <div
                    role="button"
                    id={export_id}
                    aria-expanded="false"
                    onClick={() => toggleExportOptions(export_id)}
                    aria-label="Export"
                    className="relative overflow-hidden bg-white/80 backdrop-blur-md transition-all duration-700 hover:bg-white hover:shadow-lg hover:shadow-blue-500/10 dark:bg-[#5500ff]/80 dark:hover:bg-[#00aa00]/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/50 rounded-full"
                    style={{
                        border: '2px solid rgba(255,85,0,0)',
                        backgroundClip: 'padding-box, border-box',
                        backgroundOrigin: "border-box",
                        backgroundImage: 'linear-gradient(to bottom right, hsl(0 0% 100% / 0.8), hsl(0 0% 100% / 0.8)), linear-gradient(135deg, rgba(255,0,255,170) 0%, rgba(0,0,255,85) 50%, rgba(0,255,255,170) 100%)'
                    }}
                >
                    <div className="flex items-center space-x-0.5 px-1 py-0.5">
                        <div className="relative h-6 w-6">
                            <svg className="absolute inset-0 h-full w-full fill-current text-blue-600 transition-all duration-700 group-hover:rotate-90 group-hover:scale-110 group-hover:text-blue-500 dark:text-[#00aaff] dark:group-hover:text-sky-800"
                                viewBox="0 0 24 24"
                                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" className="origin-center transition-transform duration-300" />
                            </svg>
                        </div>
                        <span className="bg-gradient-to-r from-blue-700 to-[#550000] bg-clip-text text-sm font-semibold text-transparent transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-400 dark:from-blue-600 dark:to-[#00007f] dark:group-hover:from-sky-700 dark:group-hover:to-[#984fff]">
                            Export
                        </span>
                    </div>

                    {/* Gradient border overlay */}
                    <div className="absolute inset-0 -z-10 rounded-[12px] bg-gradient-to-br from-blue-400/20 via-purple-400/10 to-blue-400/20 opacity-60 dark:from-blue-400/15 dark:via-purple-400/10 dark:to-blue-400/15"></div>
                </div>

                {/* Hover enhancement effect */}
                <div className="absolute -inset-2 -z-10 rounded-xl bg-blue-500/10 blur-xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-blue-400/15"></div>
            </div>

            {/* COPY OPTION */}
            <div data-id={copy_button_id} className="rounded-lg p-1 cursor-pointer" aria-label="Copy" title="Copy" id="copy-all" onClick={() => CopyMessage(`.${message_id}`)}>
                <svg className="w-5 md:w-6 h-5 md:h-6 transition-transform duration-200 ease-in-out hover:scale-110 cursor-pointer" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: "#FF4081", stopOpacity: 100 }} />
                            <stop offset="100%" style={{ stopColor: "#4a1dff", stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <g clipPath="url(#clip0)">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z"
                            fill="url(#gradient1)"
                        />
                    </g>
                </svg>
            </div>

            {/*CLONE OPTION*/}
            <button data-id={clone_button_id} className="rounded-lg p-1 text-gray-700 cursor-pointer" aria-label="Clone" title="Clone Raw" id="clone_content" onClick={() => clone_markdown_content(`.${message_id}`)}>
                <svg className="w-5 md:w-6 h-5 md:h-6 fill-gray-700 dark:fill-gray-200 transition-transform duration-200 ease-in-out hover:scale-110 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path d="M296.5 69.2C311.4 62.3 328.6 62.3 343.5 69.2L562.1 170.2C570.6 174.1 576 182.6 576 192C576 201.4 570.6 209.9 562.1 213.8L343.5 314.8C328.6 321.7 311.4 321.7 296.5 314.8L77.9 213.8C69.4 209.8 64 201.3 64 192C64 182.7 69.4 174.1 77.9 170.2L296.5 69.2zM112.1 282.4L276.4 358.3C304.1 371.1 336 371.1 363.7 358.3L528 282.4L562.1 298.2C570.6 302.1 576 310.6 576 320C576 329.4 570.6 337.9 562.1 341.8L343.5 442.8C328.6 449.7 311.4 449.7 296.5 442.8L77.9 341.8C69.4 337.8 64 329.3 64 320C64 310.7 69.4 302.1 77.9 298.2L112 282.4zM77.9 426.2L112 410.4L276.3 486.3C304 499.1 335.9 499.1 363.6 486.3L527.9 410.4L562 426.2C570.5 430.1 575.9 438.6 575.9 448C575.9 457.4 570.5 465.9 562 469.8L343.4 570.8C328.5 577.7 311.3 577.7 296.4 570.8L77.9 469.8C69.4 465.8 64 457.3 64 448C64 438.7 69.4 430.1 77.9 426.2z" />
                </svg>
            </button>
        </section>
    )
}

export const UserMessageOptions = ({ message_id }) => {
    const copy_button_id = GenerateId('copy-button')
    const clone_button_id = GenerateId('clone')

    const clone_markdown_content = useCallback((selector, html = true) => {
        CopyMessage(selector, html)
    });

    return (
        <div className="message-actions text-secondary-700 dark:text-white flex items-center justify-end space-x-1 opacity-100 transition-opacity duration-300 hover:opacity-100 motion-safe:transition-opacity">
            <button id={copy_button_id} onClick={(e) => CopyMessage(`.${message_id}`, e.currentTarget, false)} className="relative group rounded-lg cursor-pointer" aria-label="Copy">
                <span className="flex items-center justify-center w-6 h-6">
                    <svg width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                        <path d="M480 400L288 400C279.2 400 272 392.8 272 384L272 128C272 119.2 279.2 112 288 112L421.5 112C425.7 112 429.8 113.7 432.8 116.7L491.3 175.2C494.3 178.2 496 182.3 496 186.5L496 384C496 392.8 488.8 400 480 400zM288 448L480 448C515.3 448 544 419.3 544 384L544 186.5C544 169.5 537.3 153.2 525.3 141.2L466.7 82.7C454.7 70.7 438.5 64 421.5 64L288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L368 496L368 512C368 520.8 360.8 528 352 528L160 528C151.2 528 144 520.8 144 512L144 256C144 247.2 151.2 240 160 240L176 240L176 192L160 192z" />
                    </svg>
                </span>
                <span className="gradient-neon dark:gradient-neon-dark hidden group-hover:flex absolute z-[30] -left-3 -bottom-4 text-xs font-modern rounded-lg text-primary-700 dark:text-gray-50 py-0 px-1 shadow-balanced-lg shadow-primray-400 active:outline-none" >copy</span>
            </button>
            <button id={clone_button_id} onClick={(e) => clone_markdown_content(`.${message_id}`, true)} className="relative group rounded-lg cursor-pointer" aria-label="Clone">
                <span className="flex items-center justify-center w-6 h-6">
                    <svg width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                        <path d="M352 528L128 528C119.2 528 112 520.8 112 512L112 288C112 279.2 119.2 272 128 272L176 272L176 224L128 224C92.7 224 64 252.7 64 288L64 512C64 547.3 92.7 576 128 576L352 576C387.3 576 416 547.3 416 512L416 464L368 464L368 512C368 520.8 360.8 528 352 528zM288 368C279.2 368 272 360.8 272 352L272 128C272 119.2 279.2 112 288 112L512 112C520.8 112 528 119.2 528 128L528 352C528 360.8 520.8 368 512 368L288 368zM224 352C224 387.3 252.7 416 288 416L512 416C547.3 416 576 387.3 576 352L576 128C576 92.7 547.3 64 512 64L288 64C252.7 64 224 92.7 224 128L224 352z" />
                    </svg>
                </span>
                <span className="gradient-neon dark:gradient-neon-dark hidden group-hover:flex absolute z-[30] -left-3 -bottom-4 text-xs font-modern rounded-lg text-primary-700 dark:text-gray-50 py-0 px-1 shadow-balanced-lg shadow-primray-400 active:outline-none" >clone</span>
            </button>
            <button className="hidden relative group hover:bg-sky-100 rounded-lg cursor-pointer" aria-label="Report message">
                <span className="flex items-center justify-center w-6 h-6">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon">
                        <path d="M3.50171 17.5003V3.84799C3.50185 3.29 3.81729 2.74214 4.37476 2.50522L4.80737 2.3353C6.9356 1.5739 8.52703 2.07695 9.948 2.60385C11.4516 3.16139 12.6757 3.68996 14.3953 3.19272L14.572 3.15268C15.4652 3.00232 16.4988 3.59969 16.4988 4.68198V11.8998C16.4986 12.4958 16.1364 13.0672 15.5427 13.2777L15.4216 13.3148C12.9279 13.9583 11.1667 13.2387 9.60815 12.7621C8.82352 12.5221 8.0928 12.3401 7.28784 12.3441C6.5809 12.3477 5.78505 12.4961 4.83179 12.9212V17.5003C4.83161 17.8675 4.53391 18.1654 4.16675 18.1654C3.79959 18.1654 3.50189 17.8675 3.50171 17.5003ZM4.83179 11.4847C5.71955 11.1539 6.52428 11.0178 7.28101 11.014C8.2928 11.0089 9.17964 11.2406 9.99683 11.4906C11.642 11.9938 13.024 12.5603 15.0886 12.0277L15.115 12.016C15.1234 12.0102 15.1316 12.0021 15.1394 11.9915C15.1561 11.969 15.1686 11.9366 15.1687 11.8998V4.68198C15.1687 4.62687 15.1436 4.56746 15.0652 4.51596C15.0021 4.47458 14.9225 4.45221 14.8435 4.45639L14.7644 4.47006C12.5587 5.10779 10.9184 4.38242 9.48511 3.85092C8.15277 3.3569 6.92639 2.98314 5.23804 3.59311L4.89429 3.72885C4.8709 3.73888 4.83192 3.77525 4.83179 3.84799V11.4847Z"></path>
                    </svg>
                </span>
                <span className="gradient-neon dark:gradient-neon-dark hidden group-hover:flex absolute z-[30] -left-3 -bottom-4 text-xs font-modern rounded-lg text-primary-700 dark:text-gray-50 py-0 px-1 shadow-balanced-lg shadow-primray-400 active:outline-none" >Flag</span>
            </button>
            <button className="hidden relative group hover:bg-sky-100 rounded-lg cursor-pointer" aria-label="Edit message">
                <span className="flex items-center justify-center w-6 h-6">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon">
                        <path d="M11.3312 3.56837C12.7488 2.28756 14.9376 2.33009 16.3038 3.6963L16.4318 3.83106C17.6712 5.20294 17.6712 7.29708 16.4318 8.66895L16.3038 8.80372L10.0118 15.0947C9.68833 15.4182 9.45378 15.6553 9.22179 15.8457L8.98742 16.0225C8.78227 16.1626 8.56423 16.2832 8.33703 16.3828L8.10753 16.4756C7.92576 16.5422 7.73836 16.5902 7.5216 16.6348L6.75695 16.7705L4.36339 17.169C4.22053 17.1928 4.06908 17.2188 3.94054 17.2285C3.84177 17.236 3.70827 17.2386 3.56261 17.2031L3.41417 17.1543C3.19115 17.0586 3.00741 16.8908 2.89171 16.6797L2.84581 16.5859C2.75951 16.3846 2.76168 16.1912 2.7716 16.0596C2.7813 15.931 2.80736 15.7796 2.83117 15.6367L3.2296 13.2432L3.36437 12.4785C3.40893 12.2616 3.45789 12.0745 3.52453 11.8926L3.6173 11.6621C3.71685 11.4352 3.83766 11.2176 3.97765 11.0127L4.15343 10.7783C4.34386 10.5462 4.58164 10.312 4.90538 9.98829L11.1964 3.6963L11.3312 3.56837ZM5.84581 10.9287C5.49664 11.2779 5.31252 11.4634 5.18663 11.6162L5.07531 11.7627C4.98188 11.8995 4.90151 12.0448 4.83507 12.1963L4.77355 12.3506C4.73321 12.4607 4.70242 12.5761 4.66808 12.7451L4.54113 13.4619L4.14269 15.8555L4.14171 15.8574H4.14464L6.5382 15.458L7.25499 15.332C7.424 15.2977 7.5394 15.2669 7.64953 15.2266L7.80285 15.165C7.95455 15.0986 8.09947 15.0174 8.23644 14.9238L8.3839 14.8135C8.53668 14.6876 8.72225 14.5035 9.0714 14.1543L14.0587 9.16602L10.8331 5.94044L5.84581 10.9287ZM15.3634 4.63673C14.5281 3.80141 13.2057 3.74938 12.3097 4.48048L12.1368 4.63673L11.7735 5.00001L15.0001 8.22559L15.3634 7.86329L15.5196 7.68946C16.2015 6.85326 16.2015 5.64676 15.5196 4.81056L15.3634 4.63673Z"></path>
                    </svg>
                </span>
                <span className="gradient-neon dark:gradient-neon-dark hidden group-hover:flex absolute z-[30] -left-3 -bottom-4 text-xs font-modern rounded-lg text-primary-700 dark:text-gray-50 py-0 px-1 shadow-balanced-lg shadow-primray-400 active:outline-none" >Edit</span>
            </button>
        </div>
    )
}
