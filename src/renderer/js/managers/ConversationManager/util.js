import { implementUserCopy, InputPurify } from "../../Utils/chatUtils";
import { markitdown } from '../../CodeRenderer/code_renderer';
import { normaliZeMathDisplay, normalizeMathDelimiters } from "../../MathBase/MathNormalize";
import { debounceRenderKaTeX } from "../../MathBase/mathRenderer";
import { interpret } from "../../diagraming/jscharting";
import { dot_interpreter } from "../../diagraming/vizcharting";
import { waitForElement } from "../../Utils/dom_utils";

export class ChatUtil {
    constructor() {
        this.diagram_interpreter = dot_interpreter
        this.diagram_interpreter = interpret
    }
    scrollToBottom(element = document.getElementById('chatArea'), check = false) {
        this.updateScrollButtonVisibility()
        if (check) {
            if (document.getElementById('autoScroll').checked)
                // Use setTimeout to ensure the scroll happens after the DOM has updated
                setTimeout(() => {
                    element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
                }, 100);
        }
    }

    // Function to update scroll button visibility
    updateScrollButtonVisibility() {
        //console.log("Scrollable")
        const chatArea = document.getElementById('chatArea')
        //const scrollButton = document.getElementById('scroll-bottom')

        const isScrollable = chatArea.scrollHeight > chatArea.clientHeight;
        const isAtBottom = chatArea.scrollTop + chatArea.clientHeight >= chatArea.scrollHeight;

        waitForElement('#scroll-bottom', (el) => el.classList.toggle('hidden', !(isScrollable && !isAtBottom)));
    }


    addUserMessage(text, chatArea, fileType, fileDataUrl, save = true) {
        if (!chatArea) chatArea = document.getElementById('chatArea')

        if (!chatArea) return window.ModalManager.showMessage('Could not retrieve chatArea container', 'error')

        const userMessageId = `msg_${Math.random().toString(36).substring(2, 9)}`;
        const copyButtonId = `copy-button-${Math.random().toString(36).substring(2, 6)}`;
        const cloneButtonId = `clone-${Math.random().toString(36).substring(2, 6)}`;

        const userMessage = document.createElement("div");
        //userMessage.className = 'block mb-2';

        userMessage.innerHTML = `
        <section class="block">
            <div class="flex items-end gap-x-2 justify-end">
                <div id="user_message" data-id="${userMessageId}" class="${userMessageId} relative bg-gray-200 dark:bg-primary-700 text-black dark:text-white rounded-lg rounded-br-none p-2 md:p-3 shadow-lg w-fit max-w-full md:max-w-[80%]">
                    <p class="whitespace-pre-wrap break-words max-w-full">${InputPurify(text)}</p>
                </div>
            </div>

            <div class="message-actions text-secondary-700 dark:text-white flex items-center justify-end space-x-1 opacity-100 transition-opacity duration-300 hover:opacity-100 motion-safe:transition-opacity">
                <button id="${copyButtonId}" onclick="CopyAll('.${userMessageId}', this, true)" class="relative group rounded-lg cursor-pointer" aria-label="Copy">
                    <span class="flex items-center justify-center w-6 h-6">
                        <svg width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                            <path d="M480 400L288 400C279.2 400 272 392.8 272 384L272 128C272 119.2 279.2 112 288 112L421.5 112C425.7 112 429.8 113.7 432.8 116.7L491.3 175.2C494.3 178.2 496 182.3 496 186.5L496 384C496 392.8 488.8 400 480 400zM288 448L480 448C515.3 448 544 419.3 544 384L544 186.5C544 169.5 537.3 153.2 525.3 141.2L466.7 82.7C454.7 70.7 438.5 64 421.5 64L288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L368 496L368 512C368 520.8 360.8 528 352 528L160 528C151.2 528 144 520.8 144 512L144 256C144 247.2 151.2 240 160 240L176 240L176 192L160 192z"/>
                            </svg>
                    </span>
                    <span class="gradient-neon dark:gradient-neon-dark hidden group-hover:flex absolute z-[30] -left-3 -bottom-3 text-xs font-modern rounded-lg text-primary-700 dark:text-gray-50 py-0 px-1 shadow-balanced-lg shadow-primray-400" >copy</span>
                </button>
                <button id="${cloneButtonId}" onclick="clone('.${userMessageId}', this, true)" class="relative group rounded-lg cursor-pointer" aria-label="Clone">
                    <span class="flex items-center justify-center w-6 h-6">
                        <svg width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                        <path d="M352 528L128 528C119.2 528 112 520.8 112 512L112 288C112 279.2 119.2 272 128 272L176 272L176 224L128 224C92.7 224 64 252.7 64 288L64 512C64 547.3 92.7 576 128 576L352 576C387.3 576 416 547.3 416 512L416 464L368 464L368 512C368 520.8 360.8 528 352 528zM288 368C279.2 368 272 360.8 272 352L272 128C272 119.2 279.2 112 288 112L512 112C520.8 112 528 119.2 528 128L528 352C528 360.8 520.8 368 512 368L288 368zM224 352C224 387.3 252.7 416 288 416L512 416C547.3 416 576 387.3 576 352L576 128C576 92.7 547.3 64 512 64L288 64C252.7 64 224 92.7 224 128L224 352z"/>
                        </svg>
                    </span>
                    <span class="gradient-neon dark:gradient-neon-dark hidden group-hover:flex absolute z-[30] -left-3 -bottom-3 text-xs font-modern rounded-lg text-primary-700 dark:text-gray-50 py-0 px-1 shadow-balanced-lg shadow-primray-400" >clone</span>
                </button>
                <button class="relative group hover:bg-accent-400 rounded-lg cursor-pointer" aria-label="Report message">
                    <span class="flex items-center justify-center w-6 h-6">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon">
                            <path d="M3.50171 17.5003V3.84799C3.50185 3.29 3.81729 2.74214 4.37476 2.50522L4.80737 2.3353C6.9356 1.5739 8.52703 2.07695 9.948 2.60385C11.4516 3.16139 12.6757 3.68996 14.3953 3.19272L14.572 3.15268C15.4652 3.00232 16.4988 3.59969 16.4988 4.68198V11.8998C16.4986 12.4958 16.1364 13.0672 15.5427 13.2777L15.4216 13.3148C12.9279 13.9583 11.1667 13.2387 9.60815 12.7621C8.82352 12.5221 8.0928 12.3401 7.28784 12.3441C6.5809 12.3477 5.78505 12.4961 4.83179 12.9212V17.5003C4.83161 17.8675 4.53391 18.1654 4.16675 18.1654C3.79959 18.1654 3.50189 17.8675 3.50171 17.5003ZM4.83179 11.4847C5.71955 11.1539 6.52428 11.0178 7.28101 11.014C8.2928 11.0089 9.17964 11.2406 9.99683 11.4906C11.642 11.9938 13.024 12.5603 15.0886 12.0277L15.115 12.016C15.1234 12.0102 15.1316 12.0021 15.1394 11.9915C15.1561 11.969 15.1686 11.9366 15.1687 11.8998V4.68198C15.1687 4.62687 15.1436 4.56746 15.0652 4.51596C15.0021 4.47458 14.9225 4.45221 14.8435 4.45639L14.7644 4.47006C12.5587 5.10779 10.9184 4.38242 9.48511 3.85092C8.15277 3.3569 6.92639 2.98314 5.23804 3.59311L4.89429 3.72885C4.8709 3.73888 4.83192 3.77525 4.83179 3.84799V11.4847Z"></path>
                        </svg>
                    </span>
                    <span class="gradient-neon dark:gradient-neon-dark hidden group-hover:flex absolute z-[30] -left-3 -bottom-3 text-xs font-modern rounded-lg text-primary-700 dark:text-gray-50 py-0 px-1 shadow-balanced-lg shadow-primray-400" >Report</span>
                </button>
                <button class="relative group hover:bg-accent-400 rounded-lg cursor-pointer" aria-label="Edit message">
                    <span class="flex items-center justify-center w-6 h-6">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon">
                            <path d="M11.3312 3.56837C12.7488 2.28756 14.9376 2.33009 16.3038 3.6963L16.4318 3.83106C17.6712 5.20294 17.6712 7.29708 16.4318 8.66895L16.3038 8.80372L10.0118 15.0947C9.68833 15.4182 9.45378 15.6553 9.22179 15.8457L8.98742 16.0225C8.78227 16.1626 8.56423 16.2832 8.33703 16.3828L8.10753 16.4756C7.92576 16.5422 7.73836 16.5902 7.5216 16.6348L6.75695 16.7705L4.36339 17.169C4.22053 17.1928 4.06908 17.2188 3.94054 17.2285C3.84177 17.236 3.70827 17.2386 3.56261 17.2031L3.41417 17.1543C3.19115 17.0586 3.00741 16.8908 2.89171 16.6797L2.84581 16.5859C2.75951 16.3846 2.76168 16.1912 2.7716 16.0596C2.7813 15.931 2.80736 15.7796 2.83117 15.6367L3.2296 13.2432L3.36437 12.4785C3.40893 12.2616 3.45789 12.0745 3.52453 11.8926L3.6173 11.6621C3.71685 11.4352 3.83766 11.2176 3.97765 11.0127L4.15343 10.7783C4.34386 10.5462 4.58164 10.312 4.90538 9.98829L11.1964 3.6963L11.3312 3.56837ZM5.84581 10.9287C5.49664 11.2779 5.31252 11.4634 5.18663 11.6162L5.07531 11.7627C4.98188 11.8995 4.90151 12.0448 4.83507 12.1963L4.77355 12.3506C4.73321 12.4607 4.70242 12.5761 4.66808 12.7451L4.54113 13.4619L4.14269 15.8555L4.14171 15.8574H4.14464L6.5382 15.458L7.25499 15.332C7.424 15.2977 7.5394 15.2669 7.64953 15.2266L7.80285 15.165C7.95455 15.0986 8.09947 15.0174 8.23644 14.9238L8.3839 14.8135C8.53668 14.6876 8.72225 14.5035 9.0714 14.1543L14.0587 9.16602L10.8331 5.94044L5.84581 10.9287ZM15.3634 4.63673C14.5281 3.80141 13.2057 3.74938 12.3097 4.48048L12.1368 4.63673L11.7735 5.00001L15.0001 8.22559L15.3634 7.86329L15.5196 7.68946C16.2015 6.85326 16.2015 5.64676 15.5196 4.81056L15.3634 4.63673Z"></path>
                        </svg>
                    </span>
                    <span class="gradient-neon dark:gradient-neon-dark hidden group-hover:flex absolute z-[30] -left-3 -bottom-3 text-xs font-modern rounded-lg text-primary-700 dark:text-gray-50 py-0 px-1 shadow-balanced-lg shadow-primray-400" >Edit</span>
                </button>
            </div>
        </section>
        `;

        // Create files container if they exist
        if (fileDataUrl) {
            const fileHtml = `
            <div id="${fileContainerId}" class="flex justify-end">
            <article class="flex flex-rows-1 md:flex-rows-3 bg-cyan-100 w-fit p-1 rounded-lg">
            ${fileDataUrl && fileType === "image" ? fileDataUrl.map(url => `<img src="${url}" alt="Uploaded Image" class="rounded-md w-14 h-14 my-auto mx-1" />`).join('') : fileType === "document" ? fileDataUrl.map(url => `<div class="inline-flex items-center"><svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16V4a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2zm1-1h4v10h-4V4z"/></svg><span>${url}</span></div>`).join('') : ""}
            </article>
            </div>
            `;
            const filesContainer = document.createElement("div");
            filesContainer.className = "flex justify-end";
            filesContainer.innerHTML = fileHtml;
            chatArea.appendChild(filesContainer);
        }

        userMessage.classList.add("flex", "justify-end", "mb-4", "overflow-wrap");

        chatArea.appendChild(userMessage);

        // Add Timestamp to user prompt
        text = `${text} [${window.desk.api.getDateTime()} UTC]`

        if (save) window.desk.api.addHistory({ role: "user", content: text });
        //User_wfit(canvasutil..isCanvasOpen() ? 'add' : 'remove') -> handled by cnvas component
        return userMessage
    }

    addLoadingAnimation(chatArea = document.getElementById('chatArea')) {
        const loaderUUID = `loader_${Math.random().toString(30).substring(3, 9)}`;
        const loader = document.createElement('div')
        loader.className = 'fixed bottom-[10vh] left-2 z-[51]'
        loader.id = loaderUUID
        loader.innerHTML = `
        <div id="loader-parent">
            <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" class="transform scale-75">
                <circle cx="12" cy="24" r="4" class="fill-green-500">
                <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" />
                <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" />
                </circle>
                <circle cx="24" cy="24" r="4" class="fill-blue-500">
                <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" begin="-0.4s" />
                <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="-0.4s" />
                </circle>
                <circle cx="36" cy="24" r="4" class="fill-yellow-500">
                <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" begin="-0.8s" />
                <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="-0.8s" />
                </circle>
            </svg>
        </div>
        `;

        chatArea.appendChild(loader);
        chatArea.scrollTop = chatArea.scrollHeight;
        implementUserCopy()
        return { loader, loaderUUID }
    }

    removeLoadingAnimation() {
        const loader = document.getElementById('loader-parent')?.parentElement
        if (loader?.id.startsWith("loader_")) loader?.remove()
    }

    render_dg(input, scope = 'all') {
        // render diagrams fromthis response
        if (['dg', 'all'].includes(scope)) this.diagram_interpreter(input, scope);
        if (['charts', 'all'].includes(scope)) this.diagram_interpreter(input)
    }

    render_math(container_selector, scope = 'all') {
        if (['math', 'all'].includes(scope)) debounceRenderKaTeX(`.${container_selector}`, null, true);
        if (['norm', 'all'].includes(scope)) normaliZeMathDisplay(`.${container_selector}`)
    }

    addChatMessage(container, isThinking, thinkContent, actualResponse, MessageUId, exportId, foldId = null) {
        container.classList.add("flex", "justify-start", "mb-12", "overflow-wrap");

        container.innerHTML = `
			<section id="ai_response" class="relative w-fit max-w-full lg:max-w-5xl mb-[2vh] p-2">
				${actualResponse ? `
					<div id="ai_response_think" class="${MessageUId} w-full bg-none py-4 text-gray-900 dark:text-white font-brand leading-loose rounded-lg rounded-bl-none px-4 mb-6 pb-4 transition-colors duration-700">
					${isThinking || thinkContent ? `
                        <div class="think-section">
                            <div class="flex items-center justify-between">
                                <strong class="leading-widest font-brand text-light" style="color: #007bff;">Thoughts:</strong>
                                <button class="text-sm text-gray-600 dark:text-gray-300" onclick="window.toggleFold(event, this.parentElement.nextElementSibling.id)">
                                <p class="flex">Fold
                                <svg class="mb-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="32" height="38" class="fold-icon">
                                <path class="fill-blue-400 dark:fill-yellow-400" d="M6 9h12l-6 6z"/>
                                <path fill="currentColor" d="M6 15h12l-6-6z"/>
                                </svg>
                                </p>
                                </button>
                                </div>
                                <div id="${foldId}" class="">
                                <p id="think-content" style="color: #333;">${markitdown(normalizeMathDelimiters(thinkContent))}</p>
                            </div>
                            ${thinkContent && actualResponse ? `<p class="w-full rounded-lg border-2 border-blue-400 dark:border-orange-400 mb-2"></p>` : ""}
                        </div>
                    ` : ''}
					${actualResponse && thinkContent ? `<strong class="text-[#28a745]">Response:</strong>` : ''}
					<p style="color: #333;">${markitdown(normalizeMathDelimiters(actualResponse))}</p>
                        <section class="options absolute bottom-2 flex mt-6 space-x-2 cursor-pointer">
                            <div class="group relative max-w-fit transition-all duration-300 hover:z-50">
                                <div
                                    role="button"
                                    id="${exportId}"
                                    aria-expanded="false"
                                    onclick="window.toggleExportOptions(this);"
                                    aria-label="Export"
                                    class="relative overflow-hidden bg-white/80 backdrop-blur-md transition-all duration-700 hover:bg-white hover:shadow-lg hover:shadow-blue-500/10 dark:bg-[#5500ff]/80 dark:hover:bg-[#00aa00]/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/50 rounded-full"
                                    style="border: 2px solid rgba(255,85,0,0); background-clip: padding-box, border-box; background-origin: border-box; background-image: linear-gradient(to bottom right, hsl(0 0% 100% / 0.8), hsl(0 0% 100% / 0.8)), linear-gradient(135deg, rgba(255,0,255,170) 0%, rgba(0,0,255,85) 50%, rgba(0,255,255,170) 100%);"
                                >
                                    <div class="flex items-center space-x-0.5 px-1 py-0.5">
                                        <div class="relative h-6 w-6">
                                            <svg class="absolute inset-0 h-full w-full fill-current text-blue-600 transition-all duration-700 group-hover:rotate-90 group-hover:scale-110 group-hover:text-blue-500 dark:text-[#00aaff] dark:group-hover:text-sky-800"
                                            viewBox="0 0 24 24"
                                            style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1))">
                                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" class="origin-center transition-transform duration-300"/>
                                            </svg>
                                        </div>
                                        <span class="bg-gradient-to-r from-blue-700 to-[#550000] bg-clip-text text-sm font-semibold text-transparent transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-400 dark:from-blue-600 dark:to-[#00007f] dark:group-hover:from-sky-700 dark:group-hover:to-[#984fff]">
                                            Export
                                        </span>
                                    </div>

                                    <!-- Gradient border overlay -->
                                    <div class="absolute inset-0 -z-10 rounded-[12px] bg-gradient-to-br from-blue-400/20 via-purple-400/10 to-blue-400/20 opacity-60 dark:from-blue-400/15 dark:via-purple-400/10 dark:to-blue-400/15"></div>
                                </div>

                                <!-- Hover enhancement effect -->
                                <div class="absolute -inset-2 -z-10 rounded-xl bg-blue-500/10 blur-xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-blue-400/15"></div>
                            </div>
                            <div class="rounded-lg p-1 cursor-pointer" aria-label="Copy" title="Copy" id="copy-all" onclick="CopyAll('.${MessageUId}');">
                                <svg class="w-5 md:w-6 h-5 md:h-6 transition-transform duration-200 ease-in-out hover:scale-110 cursor-pointer" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style="stop-color: #FF4081; stop-opacity: 100" />
                                            <stop offset="100%" style="stop-color: #4a1dff; stop-opacity: 1" />
                                        </linearGradient>
                                    </defs>
                                    <g clip-path="url(#clip0)">
                                        <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z"
                                            fill="url(#gradient1)"
                                        />
                                    </g>
                                </svg>
                            </div>
                        </section>
					</div>

                    <div data-action="export-menu" id="exportOptions-${exportId}" class="hidden absolute z-[10] bottom-12 left-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 z-50 overflow-hidden transition-all duration-300 transform origin-bottom-left">
                        <div class="p-1">
                            <div class="relative">
                                <!-- Header -->
                                <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                                    <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight">Export Options</p>
                                </div>

                                <!-- Export Items -->
                                <div class="py-1">
                                    <button onclick="HTML2Pdf(event, '.${MessageUId}')"
                                            class="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 group">
                                        <div class="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                                            <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                            </svg>
                                        </div>
                                        <div class="text-left">
                                            <div class="font-medium">PDF Document</div>
                                            <div class="text-xs text-gray-500 dark:text-gray-400">High quality</div>
                                        </div>
                                    </button>

                                    <button onclick="HTML2Jpg(event, '.${MessageUId}')"
                                            class="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 group">
                                        <div class="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                                            <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                            </svg>
                                        </div>
                                        <div class="text-left">
                                            <div class="font-medium">JPEG Image</div>
                                            <div class="text-xs text-gray-500 dark:text-gray-400">High resolution</div>
                                        </div>
                                    </button>

                                    <button onclick="HTML2Word(event, '.${MessageUId}')"
                                            class="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 group">
                                        <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                                            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                            </svg>
                                        </div>
                                        <div class="text-left">
                                            <div class="font-medium">Word Document</div>
                                            <div class="text-xs text-gray-500 dark:text-gray-400">Editable format</div>
                                        </div>
                                    </button>
                                </div>

                                <!-- Coming Soon Section -->
                                <div class="px-3 py-2 border-t border-gray-100 dark:border-gray-700">
                                    <button class="w-full flex items-center px-3 py-2.5 text-sm text-gray-400 dark:text-gray-500 rounded-lg transition-all duration-200 cursor-not-allowed group">
                                        <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                            </svg>
                                        </div>
                                        <div class="text-left">
                                            <div class="font-medium text-gray-400">Advanced Export</div>
                                            <div class="text-xs text-gray-400">Coming soon</div>
                                        </div>
                                        <span class="ml-auto px-1.5 py-0.5 text-xs bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full">Soon</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Arrow indicator -->
                        <div class="absolute -bottom-2 left-4 w-4 h-4 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45"></div>
                    </div>
			</section>`:
                ""}
        `;

        return container
    }
    addMultimodalMessage(container, isThinking, thinkContent, actualResponse, MessageUId, exportId, foldId = null) {

        container.innerHTML = `
			<section id="ai_response" class="relative w-fit max-w-full lg:max-w-5xl mb-[2vh] p-2">
				${actualResponse ? `
					<div id="ai_response_think" class="${MessageUId} w-full bg-none py-4 text-gray-900 dark:text-white font-brand leading-loose rounded-lg rounded-bl-none px-4 mb-6 pb-4 transition-colors duration-700">
					${isThinking || thinkContent ? `
                        <div class="think-section">
                            <div class="flex items-center justify-between">
                                <strong class="leading-widest font-brand text-light" style="color: #007bff;">Thoughts:</strong>
                                <button class="text-sm text-gray-600 dark:text-gray-300" onclick="window.toggleFold(event, this.parentElement.nextElementSibling.id)">
                                <p class="flex">Fold
                                <svg class="mb-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="32" height="38" class="fold-icon">
                                <path class="fill-blue-400 dark:fill-yellow-400" d="M6 9h12l-6 6z"/>
                                <path fill="currentColor" d="M6 15h12l-6-6z"/>
                                </svg>
                                </p>
                                </button>
                                </div>
                                <div id="${foldId}" class="">
                                <p id="think-content" style="color: #333;">${markitdown(normalizeMathDelimiters(thinkContent))}</p>
                            </div>
                            ${thinkContent && actualResponse ? `<p class="w-full rounded-lg border-2 border-blue-400 dark:border-orange-400 mb-2"></p>` : ""}
                        </div>
                    ` : ''}
					${actualResponse && thinkContent ? `<strong class="text-[#28a745]">Response:</strong>` : ''}
					<p style="color: #333;">${markitdown(normalizeMathDelimiters(actualResponse))}</p>
                        <section class="options absolute bottom-2 flex mt-6 space-x-2 cursor-pointer">
                            <div class="group relative max-w-fit transition-all duration-300 hover:z-50">
                                <div
                                    role="button"
                                    id="${exportId}"
                                    aria-expanded="false"
                                    onclick="window.toggleExportOptions(this);"
                                    aria-label="Export"
                                    class="relative overflow-hidden bg-white/80 backdrop-blur-md transition-all duration-700 hover:bg-white hover:shadow-lg hover:shadow-blue-500/10 dark:bg-[#5500ff]/80 dark:hover:bg-[#00aa00]/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/50 rounded-full"
                                    style="border: 2px solid rgba(255,85,0,0); background-clip: padding-box, border-box; background-origin: border-box; background-image: linear-gradient(to bottom right, hsl(0 0% 100% / 0.8), hsl(0 0% 100% / 0.8)), linear-gradient(135deg, rgba(255,0,255,170) 0%, rgba(0,0,255,85) 50%, rgba(0,255,255,170) 100%);"
                                >
                                    <div class="flex items-center space-x-0.5 px-1 py-0.5">
                                        <div class="relative h-6 w-6">
                                            <svg class="absolute inset-0 h-full w-full fill-current text-blue-600 transition-all duration-700 group-hover:rotate-90 group-hover:scale-110 group-hover:text-blue-500 dark:text-[#00aaff] dark:group-hover:text-sky-800"
                                            viewBox="0 0 24 24"
                                            style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1))">
                                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" class="origin-center transition-transform duration-300"/>
                                            </svg>
                                        </div>
                                        <span class="bg-gradient-to-r from-blue-700 to-[#550000] bg-clip-text text-sm font-semibold text-transparent transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-400 dark:from-blue-600 dark:to-[#00007f] dark:group-hover:from-sky-700 dark:group-hover:to-[#984fff]">
                                            Export
                                        </span>
                                    </div>

                                    <!-- Gradient border overlay -->
                                    <div class="absolute inset-0 -z-10 rounded-[12px] bg-gradient-to-br from-blue-400/20 via-purple-400/10 to-blue-400/20 opacity-60 dark:from-blue-400/15 dark:via-purple-400/10 dark:to-blue-400/15"></div>
                                </div>

                                <!-- Hover enhancement effect -->
                                <div class="absolute -inset-2 -z-10 rounded-xl bg-blue-500/10 blur-xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-blue-400/15"></div>
                            </div>
                            <div class="rounded-lg p-1 cursor-pointer" aria-label="Copy" title="Copy" id="copy-all" onclick="CopyAll('.${MessageUId}');">
                                <svg class="w-5 md:w-6 h-5 md:h-6 transition-transform duration-200 ease-in-out hover:scale-110 cursor-pointer" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style="stop-color: #FF4081; stop-opacity: 100" />
                                            <stop offset="100%" style="stop-color: #4a1dff; stop-opacity: 1" />
                                        </linearGradient>
                                    </defs>
                                    <g clip-path="url(#clip0)">
                                        <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z"
                                            fill="url(#gradient1)"
                                        />
                                    </g>
                                </svg>
                            </div>
                        </section>
					</div>

                    <div data-action="export-menu" id="exportOptions-${exportId}" class="hidden absolute z-[10] bottom-12 left-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 z-50 overflow-hidden transition-all duration-300 transform origin-bottom-left">
                        <div class="p-1">
                            <div class="relative">
                                <!-- Header -->
                                <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                                    <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tight">Export Options</p>
                                </div>

                                <!-- Export Items -->
                                <div class="py-1">
                                    <button onclick="HTML2Pdf(event, '.${MessageUId}')"
                                            class="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 group">
                                        <div class="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                                            <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                            </svg>
                                        </div>
                                        <div class="text-left">
                                            <div class="font-medium">PDF Document</div>
                                            <div class="text-xs text-gray-500 dark:text-gray-400">High quality</div>
                                        </div>
                                    </button>

                                    <button onclick="HTML2Jpg(event, '.${MessageUId}')"
                                            class="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 group">
                                        <div class="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                                            <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                            </svg>
                                        </div>
                                        <div class="text-left">
                                            <div class="font-medium">JPEG Image</div>
                                            <div class="text-xs text-gray-500 dark:text-gray-400">High resolution</div>
                                        </div>
                                    </button>

                                    <button onclick="HTML2Word(event, '.${MessageUId}')"
                                            class="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 group">
                                        <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                                            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                            </svg>
                                        </div>
                                        <div class="text-left">
                                            <div class="font-medium">Word Document</div>
                                            <div class="text-xs text-gray-500 dark:text-gray-400">Editable format</div>
                                        </div>
                                    </button>
                                </div>

                                <!-- Coming Soon Section -->
                                <div class="px-3 py-2 border-t border-gray-100 dark:border-gray-700">
                                    <button class="w-full flex items-center px-3 py-2.5 text-sm text-gray-400 dark:text-gray-500 rounded-lg transition-all duration-200 cursor-not-allowed group">
                                        <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                            </svg>
                                        </div>
                                        <div class="text-left">
                                            <div class="font-medium text-gray-400">Advanced Export</div>
                                            <div class="text-xs text-gray-400">Coming soon</div>
                                        </div>
                                        <span class="ml-auto px-1.5 py-0.5 text-xs bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full">Soon</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Arrow indicator -->
                        <div class="absolute -bottom-2 left-4 w-4 h-4 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45"></div>
                    </div>
			</section>`:
                ""}
        `;
        return container
    }
    get_models() {
        const MSmodels = [
            "open-mistral-7b",
            "open-mixtral-8x7b",
            "open-mixtral-8x22b",
            "mistral-small-latest", //vision && document capabilities
            "mistral-small-2402",
            "mistral-small-2409",
            "mistral-small-2501",
            "mistral-medium",
            "mistral-large-latest",
            "mistral-large-2402",
            "mistral-large-2407",
            "mistral-large-2411",
            "mistral-saba-2502",
            "mistral-embed", //embending
            "codestral-latest",//coding
            "codestral-2405", //coding
            "codestral-2501", //coding
            "codestral-mamba-2407", //coding
            "open-mistral-nemo",
            "pixtral-12b-latest", //MistraVision
            "pixtral-12b-2409", //MistraVision
            "pixtral-large-latest", //MistraVision
            "pixtral-large-2411",         //MistraVision
            "ministral-3b-2410",
            "ministral-8b-2410",
            "mistral-moderation-2411",   //moderation
            "mistral-moderation-latest", //moderation
        ]
        return MSmodels
    }

    get_codestral_endpoint() {
        const codestral = {
            'https://codestral.mistral.ai/v1/fim/completions': 'Completion Endpoint',
            'https://codestral.mistral.ai/v1/chat/completions': 'Chat Endpoint'
        }
        return codestral
    }

    get_vision_modesl() {
        return [
            "mistral-small-latest",
            "pixtral-12b-2409",
            "pixtral-large-2411",
            "Qwen/Qwen2-VL-7B-Instruct",
            "meta-llama/Llama-3.2-11B-Vision-Instruct",
            "Qwen/QVQ-72B-Preview"
        ]
    }

    hide_suggestions() {
        document.getElementById('suggestions')?.classList?.add('hidden')
    }
    open_canvas() {
        document.getElementById('ToggleCanvasBt')?.click()
    }
}

export class ChatDisplay {
    constructor() {
        //
    }
    chats_size_adjust(task = 'scale_down') {
        const user_chats = document.querySelectorAll('#ai_response')
        const ai_chats = document.querySelectorAll('#user_message')
        if (task === "scale_down") {
            if (user_chats?.length > 0) {
                user_chats.forEach(chat => {
                    chat?.classList?.remove('lg:max-w-5xl')
                    chat?.classList?.add('w-fit')
                })
            } else {
                if (ai_chats?.length > 0) {
                    user_chats.forEach(chat => {

                        chat?.classList?.remove('lg:max-w-5xl')
                        chat?.classList?.add('w-fit')
                    })
                }
            }
        }
        else {
            if (ai_chats?.length > 0) {
                ai_chats.forEach(chat => {
                    chat?.classList?.remove('w-fit')
                    chat?.classList?.add('lg:max-w-5xl')
                })
            } else {
                if (ai_chats?.length > 0) {
                    user_chats.forEach(chat => {
                        chat?.classList?.remove('w-fit')
                        chat?.classList?.add('lg:max-w-5xl')
                    })
                }
            }
        }
    }
}

function toggleFold(event, selector) {
    const content = document.getElementById(selector);
    if (content) {
        content.classList.toggle('hidden');
    }
}

window.toggleFold = toggleFold
