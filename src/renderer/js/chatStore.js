const storagePath = window.electron.joinPath(window.electron.home_dir(), '.quickai/.quickai.store');
const chatArea = document.getElementById('chatArea');
const conversationsPanel = document.getElementById('conversations');
InputPurify = window.InputPurify;
const modalTitle = document.getElementById('modalTitle');
const newNameInput = document.getElementById('newName');
const renameButton = document.getElementById('renameButton');
const cancelButton = document.getElementById('cancelButton');
const selectedModelText = document.getElementById('selectedModelText');
const modelSelect = document.getElementById('model');
let activeItem;

async function checkAndCreateDirectory() {
    if (storagePath) {
        try {
            // Check if the directory exists
            const exists = await window.electron.mkdir(storagePath);
            if (!exists) {
                console.log("Error creating directory", storagePath)
            } else {
                //console.log('Directory exists');
            }
        } catch (error) {
            console.error('Error checking or creating directory:', error);
        }
    }
}


class ConversationManager {
    constructor(storagePath) {
        this.storagePath = storagePath;
    }

    // Save conversation to a JSON file
    async saveConversation(conversationData, conversationId) {
        const filePath = `${this.storagePath}/${conversationId}.json`;
        //console.log(JSON.stringify(conversationData))
        try {
            //console.log("Saving: " + conversationId + filePath)
            await window.electron.write(filePath, conversationData);
        } catch (err) {
            console.error('Error saving conversation:', err);
        }
    }

    // Load conversation from a JSON file
    async loadConversation(conversationId) {
        const filePath = `${this.storagePath}/${conversationId}.json`;
        try {
            if (window.electron.stat(filePath)) {
                const model = conversationId.startsWith('V') ? "Vision" : "text";
                const data = await window.electron.read(filePath, model);
                return [data, model]
            }
        } catch (err) {
            console.error('Error loading conversation:', err);
        }
        return null;
    }

    // Add a message to the conversation history
    addMessage(role, content, type = "text", fileDataUrl = null, fileType = null) {
        let messageContent = [];
        if (type === "vision") {
            if (fileDataUrl) {
                messageContent = [
                    { type: "text", text: content },
                    { type: fileType, [fileType]: { url: fileDataUrl } }
                ];
            } else {
                messageContent = [
                    { type: "text", text: content }
                ];
            }
            window.electron.addToVisionChat({ role, content: messageContent });
        } else {
            /*const HasThink = (content.indexOf("</think>") && content.indexOf("</think>") != -1) ? true : false;
            if (HasThink){
              content = content.slice(content.indexOf('</think>') + 8, -1)
            }*/
            messageContent = [{ type: "text", text: content }];
            //console.log(messageContent)
            window.electron.addToChat({ role, content: messageContent });
        }
    }

    // Render the conversation in the web interface
    renderConversation(conversationData, model = "text") {
        chatArea.innerHTML = '';
        const value = (model === "Vision") ? 'mistral-small-latest' : 'mistral-large-latest';
        const element = document.querySelector(`[data-value="${value}"]`);
        if (element) {
            element.click();
        } else {
            console.error('Element not found with data-value: ', value);
        }

        conversationData.forEach(message => {
            if (message.role === "user") {
                //console.log(message.content[0]);
                this.renderUserMessage(message.content, model);
            } else if (message.role === "assistant") {
                if (model.toLocaleLowerCase() === "vision") { //this.getMessageType(message.content)
                    this.renderVisionAssistantMessage(message.content);
                } else {
                    this.renderTextAssistantMessage(message.content);
                }
            }
            window.electron.CreateNew(conversationData, model)
            //window.debounceRenderKaTeX(null, null, true);
        });

        window.implementUserCopy();
        window.copyBMan();
        //window.addCopyListeners();

        if (check === false) {
            // Sending a message to the main process
            window.electron.send('toMain', { message: 'set-Utitility-Script' });
            check = true;
        }
    }

    // Get file type from message content
    getFileType(content) {
        try {
            const fileDict = {
                "image_url": "image",
                "file_url": "document"
            };

            // Find the item with type "image_url" or "file_url"
            const fileTypeItem = content.find(item => item.type === "image_url" || item.type === "document_url");

            // Check if the found item exists and has a valid type
            if (fileTypeItem && fileDict[fileTypeItem.type]) {
                //console.log(fileTypeItem?.type);
                return fileDict[fileTypeItem.type];
            }

            // If no valid file type is found, log and return null
            console.log('No file attachment!');
            return null;

        } catch (error) {
            if (error.name === "TypeError") {
                console.log('No file attachment!');
            } else {
                console.error("Error determining file type:", error.name);
            }
            return null;
        }
    }
    getFileUrl(content) {
        try {
            // Find all items with type "image_url"
            const fileMessages = content.filter(item => item.type === "image_url");

            // Extract all URLs from the image_url properties
            return fileMessages.map(fileMessage => fileMessage.imageUrl.url);
        } catch (error) {
            console.error("Error extracting file URL:", error);
            return [];
        }
    }

    // Get message type (text or vision) from message content
    getMessageType(content) {
        const fileMessage = content.find(item => item.type === "image_url" || item.type === "file_url");
        return fileMessage ? "vision" : "text";
    }

    // Render user message
    renderUserMessage(content, model = 'text') {
        const userMessageId = `msg_${Math.random().toString(34).substring(3, 9)}`;
        const copyButtonId = `copy-button-${Math.random().toString(36).substring(5, 9)}`;
        const fileType = this.getFileType(content);
        var fileDataUrl = null;
        var userText = null;
        //console.log(fileType)
        if (fileType) {
            fileDataUrl = this.getFileUrl(content);
        }
        const userMessage = document.createElement("div");
        userMessage.className = "flex justify-end mb-4";

        if (model.toLocaleLowerCase() === 'vision') {

            // Check if content is an array and has at least one element before accessing content[0]
            if (content && content.length > 0 && content[0].text) {
                const lastChar = content[0].text.slice(-1);
                if (lastChar === ']') {
                    userText = content[0].text.substring(0, content[0].text.length - 22);
                } else {
                    userText = content[0].text;
                }
            } else {
                userText = ''; // Set a default if the content is missing
            }
        } else {
            userText = content.slice(-1) === ']' ? content.substring(0, content.length - 22) : content
        }
        const messageHtml = `
            <div data-id="${userMessageId}" class="${userMessageId} relative bg-[#566fdb] dark:bg-[#142384] text-black dark:text-white rounded-lg rounded-br-none p-2 md:p-3 shadow-md w-fit max-w-full lg:max-w-5xl transition-colors duration-1000">
                <p class="whitespace-pre-wrap break-words max-w-xl md:max-w-2xl lg:max-w-3xl">${window.InputPurify(userText)}</p>
                <button id="${copyButtonId}" class="user-copy-button absolute rounded-md px-2 py-2 right-1 bottom-0.5 bg-gradient-to-r from-indigo-400 to-pink-400 dark:from-gray-700 dark:to-gray-900 hover:bg-indigo-200 dark:hover:bg-gray-600 text-white dark:text-gray-100 rounded-lg font-semibold border border-2 cursor-pointer opacity-40 hover:opacity-80" onclick="CopyAll('.${userMessageId}', this, true)">
                Copy
                </button>
            </div>
            `;

        // Create files container if they exist
        if (fileDataUrl) {
            const fileContainerId = `FCont_${Math.random().toString(35).substring(2, 8)}`;
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

        // Append the user text to the page
        userMessage.innerHTML = messageHtml;
        chatArea.appendChild(userMessage);
    }

    // Render text-based assistant message
    async renderTextAssistantMessage(content) {
        const aiMessageId = `msg_${Math.random().toString(30).substring(3, 9)}`;
        const foldId = `think-content-${Math.random().toString(28).substring(3, 9)}`;
        const aiMessage = document.createElement('div');
        aiMessage.classList.add('flex', 'justify-start', 'mb-12', 'overflow-wrap');
        chatArea.appendChild(aiMessage);
        const exportId = `export-${Math.random().toString(33).substring(3, 9)}`;

        let actualResponse = "";
        let thinkContent = "";

        // Check whether it is a thinking model response ie if it has thinking tags.
        const hasThinkTag = content.includes("<think>");

        if (hasThinkTag) {
            const start = (content.indexOf('<think>') !== -1) ? 7 : 0
            thinkContent = content.slice(start, content.indexOf('</think>'));
            actualResponse = content.slice(content.indexOf('</think>') + 8);
        } else {
            actualResponse = content;
        }

        aiMessage.innerHTML = `
                <section class="relative w-fit w-full max-w-full lg:max-w-6xl mb-[2vh] p-2">
					${hasThinkTag || thinkContent ? `
						<div class="think-section bg-blue-200 text-gray-800 dark:bg-[#002f42] dark:text-white rounded-t-lg px-4 pt-2 lg:max-w-6xl transition-colors duration-1000">
						<div class="flex items-center justify-between">
						<strong style="color: #007bff;">Thoughts:</strong>
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
						<p style="color: #333;">${window.marked(window.normalizeMath(thinkContent))}</p>
						</div>
						</div>
						` : ''}
						${thinkContent && actualResponse ? `<p class="rounded-lg border-2 border-blue-400 dark:border-orange-400"></p>` : ""}
						${actualResponse ? `
							<div  id="AIRes" class="${aiMessageId} w-fit max-w-full lg:max-w-6xl bg-blue-200 py-4 text-gray-800 dark:bg-[#002f42] dark:text-white rounded-lg rounded-bl-none px-4 mb-6 pb-4 transition-colors duration-1000">
							${actualResponse && thinkContent ? `<strong class="text-[#28a745]">Response:</strong>` : ''}
							<p class="text-white">${window.marked(window.normalizeMathDelimiters(actualResponse))}</p>
							<section class="options absolute bottom-2 flex mt-6 space-x-4 cursor-pointer">
								<div class="group relative max-w-fit transition-all duration-500 hover:z-50">
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
								<div class="rounded-lg p-1 cursor-pointer" aria-label="Copy" title="Copy" id="copy-all" onclick="CopyAll('.${aiMessageId}');">
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
							</div>
							<div id="exportOptions-${exportId}" class="hidden block absolute bottom-10 left-0 bg-[radial-gradient(closest-side,var(--tw-gradient-stops))] from-[#009393] dark:from-[#002f42] via-[#45cece] dark:via-[#002f42] to-blue-400 dark:to-[#002f42] dark:bg-gray-800 p-2 rounded shadow-md z-50 border border-[#0055ff] dark:border-[#009fe8] transition-colors duration-1000">
							<ul class="list-none p-0">
							<li class="mb-2">
							<p class="text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-colors duration-1000 cursor-pointer" onclick="HTML2Pdf(event, '.${aiMessageId}')">Export to PDF</p>
							</li>
							<li class="mb-2">
							<p class="text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-colors duration-1000 cursor-pointer" onclick="HTML2Jpg(event, '.${aiMessageId}')">Export to JPG</p>
							</li>
							<li>
							<p class="text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-all duration-1000 cursor-pointer" onclick="HTML2Word(event, '.${aiMessageId}')">Export to DOCX</p>
							</li>
							<li>
							<p class="cursor-not-allowed text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-all duration-1000 decoration-underline" onclick="">Word Export Advance</p>
							</li>
							</ul>
							</div>
							</section>`: ""}
                `;
        // render diagrams fromthis response
        window.handleDiagrams(actualResponse, 'both');
        window.LoopRenderCharts(actualResponse)
        window.debounceRenderKaTeX(`.${aiMessageId}`, null, true);
        normaliZeMathDisplay(`.${aiMessageId}`)

    }

    // Render vision-based assistant message
    async renderVisionAssistantMessage(content) {
        const visionMessageId = `msg_${Math.random().toString(30).substring(3, 9)}`;
        const visionMessage = document.createElement('div');
        const exportId = `export-${Math.random().toString(33).substring(3, 9)}`;

        visionMessage.classList.add('flex', 'justify-start', 'mb-12', 'overflow-wrap');
        chatArea.appendChild(visionMessage);
        const textContent = content[0].text
        //const fileType = this.getFileType(content);
        //const fileDataUrl = this.getFileUrl(content);
        visionMessage.innerHTML = `
                <section id="AIRes" class="relative w-fit w-full max-w-full lg:max-w-6xl mb-[2vh] p-2">
					<div id="AIRes" class="${visionMessageId} w-fit max-w-full lg:max-w-6xl bg-blue-200 text-gray-800 dark:bg-[#002f42] dark:text-white rounded-lg px-4 mb-6 pt-2 pb-4 w-fit max-w-full lg:max-w-6xl transition-colors duration-1000">${window.marked(window.normalizeMathDelimiters(textContent))}
					</div>
					<section class="options absolute bottom-2 flex mt-6 space-x-4 cursor-pointer">
						<div class="group relative max-w-fit transition-all duration-500 hover:z-50">
							<div
								role="button"
								id="${exportId}"
								aria-expanded="false"
								onclick="window.toggleExportOptions(this);"
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
							<div class="absolute -inset-2 -z-10 rounded-xl bg-blue-500/10 blur-xl transition-opacity duration-700 group-hover:opacity-100 dark:bg-blue-400/15"></div>
						</div>
						<div class="rounded-lg p-1 cursor-pointer" aria-label="Copy" title="Copy" id="copy-all" onclick="CopyAll('.${visionMessageId}');">
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

					<div id="exportOptions-${exportId}" class="hidden block absolute bottom-10 left-0 bg-[radial-gradient(closest-side,var(--tw-gradient-stops))] from-[#009393] dark:from-[#002f42] via-[#45cece] dark:via-[#002f42] to-blue-400 dark:to-[#002f42] dark:bg-gray-800 p-2 rounded shadow-md z-50 border border-[#0055ff] dark:border-[#009fe8] transition-colors duration-1000">
					<ul class="list-none p-0">
					<li class="mb-2">
					<p class="text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-colors duration-1000 cursor-pointer" onclick="HTML2Pdf(event, '.${visionMessageId}')">Export to PDF</p>
					</li>
					<li class="mb-2">
					<p class="text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-colors duration-1000 cursor-pointer" onclick="HTML2Jpg(event, '.${visionMessageId}')">Export to JPG</p>
					</li>
					<li>
					<p class="text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-all duration-1000 cursor-pointer" onclick="HTML2Word(event, '.${visionMessageId}')">Export to DOCX</p>
					</li>
					<li>
					<p class="cursor-not-allowed text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-all duration-1000 decoration-underline" onclick="">Word Export Advance</p>
					</li>
					</ul>
					</div>
					</section>
					`;

        // render diagrams from this response
        window.handleDiagrams(textContent, 'both');
        window.LoopRenderCharts(textContent);
        window.debounceRenderKaTeX(`.${visionMessageId}`, null, true);
        normaliZeMathDisplay(`.${visionMessageId}`)

    }
}
const conversationManager = new ConversationManager(storagePath);

// Function to fetch conversation files and display their IDs
async function fetchConversations() {
    conversationsPanel.innerHTML = `<div class="justify-center items-center">
  <p class="text-center text-rose-400 dark:text-slate-400 text-md font-semibold h-full w-full">Empty!</p>
  </div>
  `;// Clear previous entries

    try {
        const files = await window.electron.readDir(storagePath);

        if (files.length > 0) {
            conversationsPanel.innerHTML = ''; // Clear the pane if conversations exist
            // Define the colors you want to cycle through
            const colors = ['bg-amber-500', 'bg-rose-900', 'bg-teal-700', 'bg-red-500', 'bg-blue-500', 'bg-green-600', 'bg-yellow-800', 'bg-purple-500', 'bg-fuchsia-500'];
            for (let [index, file] of files.entries()) {
                if (window.electron.getExt(file) === '.json') {
                    const conversationId = window.electron.getBasename(file, '.json');
                    const conversationItem = document.createElement('div');
                    const color = (index <= colors.length - 1) ? colors[index] : colors[Math.floor(Math.random() * colors.length)]
                    conversationItem.classList.add('p-2', color, 'transition-transform', "text-black", 'tranform', 'hover:scale-105', 'transition', 'duration-700', 'ease-in-out', 'scale-100', 'infinite', 'hover:bg-blue-800', 'decoration-underline', 'decoration-pink-400', 'dark:decoration-fuchsia-500', 'dark:hover:bg-cyan-700', 'cursor-pointer', 'rounded-lg', "space-y-2", "w-full", "sm:w-[90%]", "md:w-[80%]", "lg:w-[90%]", "whitespace-nowrap", "max-w-full", "overflow-auto", "scrollbar-hide");
                    conversationItem.setAttribute('data-text', conversationId);

                    conversationItem.textContent = conversationId;
                    conversationItem.onclick = () => renderConversationFromFile(conversationItem, conversationId);
                    conversationsPanel.appendChild(conversationItem);

                    //Chat Options
                    conversationItem.addEventListener('contextmenu', (event) => {
                        // Prevent the default context menu
                        event.preventDefault();
                        ConversationAdmin(conversationId)
                    });
                } else {
                    console.log("No conversations saved!")
                }
            }
        }
    } catch (err) {
        console.error('Error reading conversation files:', err);
    }
}

// Global variable to store current conversationId
let currentConversationId = null;

// Attach event listeners only once after DOM load
const cancelOptsBt = document.getElementById('renameOptionsBt');
const DeleteOption = document.getElementById('DeleteOption');
const cancelDeleteBt = document.getElementById('CancelDeleteBt');
const canceRenamelButton = document.getElementById('canceRenamelButton');
const renameModal = document.getElementById('renameModal');
const renameOption = document.getElementById('renameOption');
const confirmDeleteBt = document.getElementById('ConfirmDelete');
const SubmitRenameButton = document.getElementById('SubmitRenameButton');


cancelOptsBt.addEventListener('click', () => {
    HandleOptions('hide');
});

DeleteOption.addEventListener('click', () => {
    HandleConfirmDelete();
});

confirmDeleteBt.addEventListener('click', () => {
    HandleLoading('show', `Deleting ${currentConversationId}`);
    const _delete = window.electron.deleteChat(storagePath, currentConversationId);
    if (_delete) {
        HandleLoading('hide');
        HandleConfirmDelete();
        HandleOptions('hide');
        window.showDeletionStatus("text-red-400", `Deleted ${currentConversationId}`);
        console.log(`Deleted ${currentConversationId}`);
    } else {
        HandleConfirmDelete();
        HandleOptions('hide');
    }
    // Hide options and refresh
    HandleConfirmDelete();
    HandleOptions('hide');
    fetchConversations();
});

cancelDeleteBt.addEventListener('click', () => {
    HandleConfirmDelete();
});

renameOption.addEventListener('click', () => {
    HandleRenameModal();
    modalTitle.textContent = `Rename ${currentConversationId}`;

    canceRenamelButton.addEventListener('click', () => {
        HandleRenameModal();
    }, { once: true });

    renameModal.addEventListener('click', (event) => {
        if (event.target === renameModal) {
            HandleRenameModal();
        }
    }, { once: true });

    SubmitRenameButton.addEventListener('click', () => {
        HandleLoading('show', `Renaming ${currentConversationId} ...`);
        try {
            const newName = `${currentConversationId[0]}-${newNameInput.value.trim()}`;
            const conversationItem = document.querySelector(`[data-text="${currentConversationId}"]`);
            if (conversationItem && newNameInput.value.trim() !== '') {
                const rename = window.electron.Rename(storagePath, currentConversationId, newName);
                if (rename) {
                    conversationItem.textContent = newName;
                    conversationItem.setAttribute('data-text', newName);
                    HandleRenameModal();
                }
            }
            HandleLoading('hide');
            HandleOptions('hide');
            fetchConversations();
        } catch (err) {
            HandleLoading('hide');
            console.log("Failed to rename file", err);
        }
    });

    newNameInput.addEventListener('keypress', (event) => {
        event.stopPropagation();
        if (event.key === 'Enter') {
            SubmitRenameButton.click();
        }
    }, { once: true });
});

// Function called on context menu event to update currentConversationId
function ConversationAdmin(conversationId) {
    currentConversationId = conversationId;
    HandleOptions('show');
}


function HandleOptions(task) {
    const chatOptionsOverlay = document.getElementById('chatOptions-overlay');
    const chatOptions = document.getElementById('chatOptions');
    if (task === "show") {
        chatOptionsOverlay.classList.remove('hidden');
        chatOptions.classList.remove('animate-exit');
        chatOptions.classList.add('animate-enter')
    } else {
        chatOptions.classList.remove('animate-enter')
        chatOptions.classList.add('animate-exit');
        setTimeout(() => {
            chatOptionsOverlay.classList.add('hidden');
        }, 310)
    }
}

function HandleConfirmDelete() {
    const confirmDeleteModal = document.getElementById('confirm-delete-modal');
    confirmDeleteModal.classList.toggle('-translate-x-full');
    confirmDeleteModal.classList.toggle('-translate-x-1')
}

function HandleRenameModal() {
    const renameModal = document.getElementById('renameModal');
    renameModal.classList.toggle('translate-y-full');
    renameModal.classList.toggle('translate-y-1')
}

function HandleLoading(task, message = null) {

    const loadingModal = document.getElementById('loadingModal');
    const modalMainBox = document.getElementById('modalMainBox');
    if (task === "show") {
        if (message) {
            const msgBox = document.getElementById('loadingMSG');
            msgBox.textContent = message;
        }
        loadingModal.classList.remove('hidden');
        modalMainBox.classList.remove('animate-exit');
        modalMainBox.classList.add('animate-enter')
    } else {
        modalMainBox.classList.remove('animate-enter')
        modalMainBox.classList.add('animate-exit');
        setTimeout(() => {
            loadingModal.classList.add('hidden');
        }, 310)
    }
}

// Function to render a conversation from a file
async function renderConversationFromFile(item, conversationId) {
    // Remove animation from previous item as it active item is changing
    if (activeItem) {
        activeItem.classList.remove('animate-heartpulse');
    }
    activeItem = item;
    item.classList.add('animate-heartpulse');
    const [conversationData, model] = await conversationManager.loadConversation(conversationId);
    //console.log(conversationData, model)
    if (conversationData) {
        window.electron.setSuperCId(conversationId);  //Set global conversation id to the current conversation id
        //console.log(conversationData)
        conversationManager.renderConversation(conversationData, model);
    } else {
        alert(`Conversation ${conversationId} not found.`);
    }
}

// Listen for updates messages from ipc for Chat models and update the history files
window.electron.receive('fromMain-ToChat', (data) => {
    let Chat = data
    try {
        let conversationId = window.electron.getSuperCId() || window.electron.getNewChatUUId();
        console.log('ChatUpdated::');
        if (Chat.length > 1) {
            conversationManager.saveConversation(Chat, conversationId);
            console.log("Saved conversation, size:", Chat.length);
        }
    } catch (err) {
        console.log("Outer loop error:", err);
    }

});


// Listen for updates messages from ipc for Vision models and update the history files
window.electron.receive('fromMain-ToVision', (data) => {
    try {
        let VChat = data
        //console.log(JSON.stringify(VChat));
        let VconversationId = window.electron.getSuperCId() || window.electron.getNewVisionUUId()
        console.log("VChatUpdated::");
        if (VChat && VChat.length > 1) {
            conversationManager.saveConversation(VChat, VconversationId);
            console.log("Saved V conversation, size:", VChat.length);
        } else if (typeof VChat === 'object' && Object.keys(VChat).length > 1) {
            conversationManager.saveConversation(VChat, VconversationId);
            //console.log("Saved V conversation, size length", VChat.length);
        } else {
            console.log("VChat is not an array or object with more than one entry.");
        }
    } catch (err) {
        console.error("Error in VChatUpdated handler:", err);
    }
});

checkAndCreateDirectory();
// Fetch and display conversations on page load
fetchConversations();
//AutoChatHistSync();
document.addEventListener('NewConversationOpened', function() {
    fetchConversations();
})
