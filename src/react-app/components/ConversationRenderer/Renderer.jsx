import React, { useCallback } from 'react';
import { CopyMessage } from '../../../renderer/js/Utils/chatUtils';
import { normalizeMathDelimiters } from '../../../renderer/js/MathBase/MathNormalize';
import { toggleExportOptions } from '../../../renderer/js/ChatExport/export';
import { HTML2Jpg, HTML2Word, HTML2Pdf } from '../../../renderer/js/ChatExport/export';
import { markitdown } from './CodeHighlighter';
import { CodeBlockRenderer } from './CodeBlockRenderer';
import { ChatUtil } from '../../../renderer/js/managers/ConversationManager/util';
import { InputPurify } from '../../../renderer/js/Utils/chatUtils';

const chatutil = new ChatUtil()

export function GenerateId(prefix = '', postfix = '', length = 6) {
    // Generate a random alphanumeric string (letters + digits) for valid class/ID characters
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let randomStr = '';
    for (let i = 0; i < length; i++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Build id ensuring no extra hyphens when prefix or postfix are empty
    let id = '';
    if (prefix) {
        id += prefix;
    }
    if (prefix && randomStr) {
        id += '-';
    }
    id += randomStr;
    if (postfix) {
        id += '-' + postfix;
    }

    return id;
}

export const UserMessage = ({ message, file_type = null, file_data_url = null, save = true }) => {
    const message_id = GenerateId('user_msg')

    //if (save) window.desk.api.addHistory({ role: "user", content: message });

    chatutil.render_math(`.${message_id}`, 0)

    return (
        <>
            <section className="block">
                <div className="flex items-end gap-x-2 justify-end">
                    <div id="user_message" data-id={message_id} className={`${message_id} relative bg-gray-200 dark:bg-primary-700 text-black dark:text-white rounded-lg rounded-br-none p-2 md:p-3 shadow-lg w-fit max-w-full md:max-w-[80%]`}>
                        <div className="prose whitespace-pre-wrap break-words max-w-full h-fit"
                            dangerouslySetInnerHTML={{ __html: InputPurify(message) }}
                        ></div>
                    </div>
                </div>

                <UserMessageOptions message_id={message_id} />
            </section >

            {file_data_url ? (
                <div className='flex justify-end'>
                    <FileContainer file_type={file_type} file_data_url={file_data_url} />
                </div>
            )
                : ''
            }
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
        processedHtml = markitdown(actual_response);
    } catch (err) {
        //console.log(err)
    }

    const processedThinkHtml = think_content ? markitdown(normalizeMathDelimiters(think_content)) : null;

    const FoldThinking = useCallback((e, selector) => {
        const content = document.getElementById(selector);
        if (content) {
            content.classList.toggle('hidden');
        }
        document.querySelector('.fold_svg')?.classList.toggle('rotate-180')
    })

    chatutil.render_math(`.${message_id}`, 2000)

    return (
        <div id="ai_response_container" className='flex justify-start mb-12 overflow-wrap'>
            <section id="ai_response" className="relative w-fit max-w-full lg:max-w-5xl mb-[2vh] p-2">
                {
                    actual_response ?
                        (
                            <>
                                <div id="ai_response_think" className={`think-${message_id} w-full bg-none py-4 text-gray-900 dark:text-white font-brand leading-loose rounded-lg rounded-bl-none px-4 mb-6 pb-4 transition-colors duration-700`}>
                                    {
                                        (isThinking || think_content) ? (
                                            <div className="think-section">
                                                <div className="flex items-center justify-between">
                                                    <strong className="leading-widest font-brand text-light text-blue-400 dark:text-blue-300">Thoughts:</strong>
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
                                                    <div id="think-content">
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
                                            <strong className="text-green-300 dark:text-green-400">Response:</strong>
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

export const FileContainer = ({ file_type, file_data_url }) => {
    const file_container_id = `file_container-${Math.random().toString(36).substring(2, 6)}`;

    return (
        <div id={file_container_id} className="flex justify-end">
            <article className="flex flex-rows-1 md:flex-rows-3 bg-cyan-100 w-fit p-1 rounded-lg">
                {
                    (file_data_url && file_type === "image") ?
                        file_data_url.map(url =>
                            <img src={url} alt="Uploaded Image" className="rounded-md w-14 h-14 my-auto mx-1" />)
                            .join('') :
                        (file_type === "document") ?
                            file_data_url.map(url =>
                                <div className="inline-flex items-center">
                                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16V4a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2zm1-1h4v10h-4V4z" />
                                    </svg>
                                    <span>{url}</span>
                                </div>)
                                .join('') :
                            ""
                }
            </article>
        </div>
    )
}

export const LoadingAnimation = ({ }) => {
    const loaderUUID = `loader_${Math.random().toString(30).substring(3, 9)}`;

    return (
        <div id={loaderUUID} className='fixed bottom-[10vh] left-2 z-[51]'>
            <div id="loader-parent">
                <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="transform scale-75">
                    <circle cx="12" cy="24" r="4" className="fill-green-500">
                        <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" />
                        <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="24" cy="24" r="4" className="fill-blue-500">
                        <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" begin="-0.4s" />
                        <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="-0.4s" />
                    </circle>
                    <circle cx="36" cy="24" r="4" className="fill-yellow-500">
                        <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" begin="-0.8s" />
                        <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="-0.8s" />
                    </circle>
                </svg>
            </div>
        </div>
    )
}

export const ExportMenu = ({ export_id, message_id }) => {
    return (
        <div data-action="export-menu" id={`exportOptions-${export_id}`} className="hidden absolute z-[10] bottom-12 left-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 z-50 overflow-hidden transition-all duration-300 transform origin-bottom-left">
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

    const clone_markdown_content = useCallback((id) => {
        return
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

    const clone_markdown_content = useCallback((selector, html=true) => {
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
            <button className="relative group hover:bg-accent-400 rounded-lg cursor-pointer" aria-label="Report message">
                <span className="flex items-center justify-center w-6 h-6">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon">
                        <path d="M3.50171 17.5003V3.84799C3.50185 3.29 3.81729 2.74214 4.37476 2.50522L4.80737 2.3353C6.9356 1.5739 8.52703 2.07695 9.948 2.60385C11.4516 3.16139 12.6757 3.68996 14.3953 3.19272L14.572 3.15268C15.4652 3.00232 16.4988 3.59969 16.4988 4.68198V11.8998C16.4986 12.4958 16.1364 13.0672 15.5427 13.2777L15.4216 13.3148C12.9279 13.9583 11.1667 13.2387 9.60815 12.7621C8.82352 12.5221 8.0928 12.3401 7.28784 12.3441C6.5809 12.3477 5.78505 12.4961 4.83179 12.9212V17.5003C4.83161 17.8675 4.53391 18.1654 4.16675 18.1654C3.79959 18.1654 3.50189 17.8675 3.50171 17.5003ZM4.83179 11.4847C5.71955 11.1539 6.52428 11.0178 7.28101 11.014C8.2928 11.0089 9.17964 11.2406 9.99683 11.4906C11.642 11.9938 13.024 12.5603 15.0886 12.0277L15.115 12.016C15.1234 12.0102 15.1316 12.0021 15.1394 11.9915C15.1561 11.969 15.1686 11.9366 15.1687 11.8998V4.68198C15.1687 4.62687 15.1436 4.56746 15.0652 4.51596C15.0021 4.47458 14.9225 4.45221 14.8435 4.45639L14.7644 4.47006C12.5587 5.10779 10.9184 4.38242 9.48511 3.85092C8.15277 3.3569 6.92639 2.98314 5.23804 3.59311L4.89429 3.72885C4.8709 3.73888 4.83192 3.77525 4.83179 3.84799V11.4847Z"></path>
                    </svg>
                </span>
                <span className="gradient-neon dark:gradient-neon-dark hidden group-hover:flex absolute z-[30] -left-3 -bottom-4 text-xs font-modern rounded-lg text-primary-700 dark:text-gray-50 py-0 px-1 shadow-balanced-lg shadow-primray-400 active:outline-none" >Report</span>
            </button>
            <button className="relative group hover:bg-accent-400 rounded-lg cursor-pointer" aria-label="Edit message">
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
