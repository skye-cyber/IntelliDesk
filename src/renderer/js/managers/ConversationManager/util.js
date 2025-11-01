import { implementUserCopy, InputPurify } from "../../Utils/chatUtils";
import { markitdown } from '../../CodeRenderer/code_renderer';
import { normalizeMathDelimiters } from '../../MathBase/MathNormalize';

export class ChatUtil {
    constructor() {
        //
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
        const scrollButton = document.getElementById('scroll-bottom')

        const isScrollable = chatArea.scrollHeight > chatArea.clientHeight;
        const isAtBottom = chatArea.scrollTop + chatArea.clientHeight >= chatArea.scrollHeight;

        scrollButton.classList.toggle('hidden', !(isScrollable && !isAtBottom));
    }


    addUserMessage(text, chatArea = document.getElementById('chatArea'), fileType, fileDataUrl, fileContainerId,) {
        //console.log("Date time + text:", text)
        const userMessageId = `msg_${Math.random().toString(34).substring(3, 9)}`;
        const copyButtonId = `copy-button-${Math.random().toString(36).substring(5, 9)}`;
        const userMessage = document.createElement("div");

        userMessage.innerHTML = `
        <div id="user_message" data-id="${userMessageId}" class="${userMessageId} relative bg-[#566fdb] dark:bg-[#142384] text-black dark:text-white rounded-lg rounded-br-none p-2 md:p-3 shadow-md w-fit max-w-full lg:max-w-5xl">
        <p class="whitespace-pre-wrap break-words max-w-xl md:max-w-2xl lg:max-w-3xl">${InputPurify(text)}</p>
        <button id="${copyButtonId}" class="user-copy-button absolute rounded-md px-2 py-2 right-1 bottom-0.5 bg-gradient-to-r from-indigo-400 to-pink-400 dark:from-gray-700 dark:to-gray-900 hover:bg-indigo-200 dark:hover:bg-gray-600 text-white dark:text-gray-100 rounded-lg font-semibold border border-2 cursor-pointer opacity-40 hover:opacity-80 " onclick="CopyAll('.${userMessageId}', this, true)">
        Copy
        </button>
        </div>
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

        //window.desk.api.addHistory({ role: "user", content: text });
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

    addChatMessage(container, isThinking, thinkContent, actualResponse, MessageUId, exportId, foldId = null) {
        container.classList.add("flex", "justify-start", "mb-12", "overflow-wrap");

        container.innerHTML = `
			<section id="ai_response" class="relative w-fit max-w-full lg:max-w-5xl mb-[2vh] p-2">
				${actualResponse ? `
					<div id="ai_response_think" class="${MessageUId} w-full bg-blue-200 py-4 text-gray-800 dark:bg-[#002f42] dark:text-white rounded-lg rounded-bl-none px-4 mb-6 pb-4 transition-colors duration-1000">
					${isThinking || thinkContent ? `
                        <div class="think-section bg-blue-200 text-gray-800 dark:bg-[#004a62] dark:text-white px-4 pt-2 lg:max-w-6xl transition-colors duration-1000 border border-[#005979] rounded-lg">
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
					<section class="options absolute bottom-2 flex mt-6 space-x-4 cursor-pointer">
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
								<div class="flex items-center space-x-2 px-4 py-1">
								<div class="relative h-6 w-6">
									<svg
									class="absolute inset-0 h-full w-full fill-current text-blue-600 transition-all duration-700 group-hover:rotate-90 group-hover:scale-110 group-hover:text-blue-500 dark:text-[#00aaff] dark:group-hover:text-sky-800"
									viewBox="0 0 24 24"
									style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
									>
									<path
										d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
										class="origin-center transition-transform duration-300"
									/>
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
							<svg
								class="w-5 md:w-6 h-5 md:h-6 mt-1 transition-transform duration-200 ease-in-out hover:scale-110 cursor-pointer"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
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
                                    <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Export Options</p>
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
        <section id="ai_response" class="relative w-fit w-full max-w-full lg:max-w-5xl mb-[2vh] p-2">
            ${actualResponse ?
                `<div  id="ai_response_think" class="${MessageUId} w-full bg-blue-200 py-4 text-gray-800 dark:bg-[#002f42] dark:text-white rounded-lg rounded-bl-none px-4 mb-6 pb-4 transition-colors duration-100">
                ${isThinking || thinkContent ? `
                    <div class="think-section bg-blue-200 text-gray-800 dark:bg-[#004a62] dark:text-white px-4 pt-2 lg:max-w-6xl transition-colors duration-1000 border border-[#005979] rounded-lg">
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
                    <p style="color: #333;">${markitdown(normalizeMathDelimiters(thinkContent))}</p>
                    </div>
                    ${thinkContent && actualResponse ? `<p class="w-full rounded-lg border-2 border-blue-400 dark:border-orange-400 mb-2"></p>` : ""}
                    </div>
                    ` : ''}
                    ${actualResponse && thinkContent ? `<strong class="text-[#28a745]">Response:</strong>` : ''}
                <p style="color: #333;">${markitdown(normalizeMathDelimiters(actualResponse))}</p>
                <section class="options absolute bottom-2 flex mt-6 space-x-4 cursor-pointer">
                <div class="group relative max-w-fit transition-all duration-500 hover:z-50">
                <div
                role="button"
                id="${exportId}"
                aria-expanded="false"
                onclick="window.toggleExportOptions(this);"
                class="relative overflow-hidden bg-[white]/80 backdrop-blur-md transition-all duration-700 hover:bg-white hover:shadow-lg hover:shadow-blue-500/10 dark:bg-[#5500ff]/80 dark:hover:bg-[#00aa00]/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/50 rounded-full"
                style="border: 2px solid rgba(255,85,0,0); background-clip: padding-box, border-box; background-origin: border-box; background-image: linear-gradient(to bottom right, hsl(0 0% 100% / 0.8), hsl(0 0% 100% / 0.8)), linear-gradient(135deg, rgba(255,0,255,170) 0%, rgba(0,0,255,85) 50%, rgba(0,255,255,170) 100%);"
                >
                <div class="flex items-center space-x-2 px-4 py-1">
                <div class="relative h-6 w-6">
                <svg
                class="absolute inset-0 h-full w-full fill-current text-blue-600 transition-all duration-700 group-hover:rotate-90 group-hover:scale-110 group-hover:text-blue-500 dark:text-[#00aaff] dark:group-hover:text-sky-800"
                viewBox="0 0 24 24"
                style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                >
                <path
                d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                class="origin-center transition-transform duration-500"
                />
                </svg>
                </div>
                <span class="bg-gradient-to-r from-blue-700 to-[#550000] bg-clip-text text-sm font-semibold text-transparent transition-all duration-700 group-hover:from-blue-600 group-hover:to-blue-400 dark:from-blue-600 dark:to-[#00007f] dark:group-hover:from-sky-700 dark:group-hover:to-[#984fff]">
                Export
                </span>
                </div>

                <!-- Gradient border overlay -->
                <div class="absolute inset-0 -z-10 rounded-[12px] bg-gradient-to-br from-blue-400/20 via-purple-400/10 to-blue-400/20 opacity-60 dark:from-blue-400/15 dark:via-purple-400/10 dark:to-blue-400/15"></div>
                </div>

                <!-- Hover enhancement effect -->
                <div class="absolute -inset-2 -z-10 rounded-xl bg-blue-500/10 blur-xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-blue-400/15"></div>
                </div>
                <div class="rounded-lg p-1 cursor-pointer" aria-label="Copy" title="Copy" id="copy-all" onclick="CopyAll('.${MessageUId}');">
                <svg
                class="w-5 md:w-6 h-5 md:h-6 mt-1 transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                >
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

                    <div data-action="export-menu" id="exportOptions-${exportId}" class="hidden absolute z-[10] bottom-12 left-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 z-50 overflow-hidden transition-all duration-300 transform origin-bottom-left">
                        <div class="p-1">
                            <div class="relative">
                                <!-- Header -->
                                <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                                    <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Export Options</p>
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
                </section>`: ""}
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
        document.getElementById('suggestions').classList.add('hidden')
    }
    open_canvas(){
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
                    chat.classList.remove('lg:max-w-5xl')
                    chat.classList.add('w-fit')
                })
            } else {
                if (ai_chats?.length > 0) {
                    chat.classList.remove('lg:max-w-5xl')
                    chat.classList.add('w-fit')
                }
            }
        }
        else {
            if (ai_chats?.length > 0) {
                ai_chats.forEach(chat => {
                    chat.classList.remove('w-fit')
                    chat.classList.add('lg:max-w-5xl')
                })
            } else {
                if (ai_chats?.length > 0) {
                    chat.classList.remove('w-fit')
                    chat.classList.add('lg:max-w-5xl')
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
