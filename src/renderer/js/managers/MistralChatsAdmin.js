import { Mistral } from '@mistralai/mistralai';

const AutoScroll = document.getElementById("AutoScroll");

let MISTRAL_API_KEY = null

async function loadApiKey() {
	const key = await window.api.getKeys('mistral');
	MISTRAL_API_KEY = key.mistralKey; // Assign to global variable
}

await loadApiKey()

//const MISTRAL_CODESTRAL_API_KEY = window.electron.MISTRAL_CODESTRAL_API_KEY();
//const modelSelect = document.getElementById('model');

const Mistarlclient = new Mistral({ apiKey: MISTRAL_API_KEY });

//let Utilitycheck = false

const codestral = {
	'https://codestral.mistral.ai/v1/fim/completions': 'Completion Endpoint',
	'https://codestral.mistral.ai/v1/chat/completions': 'Chat Endpoint'
}

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

let userMessage = null;
let aiMessage = null;

async function MistraChat(text, modelName) {
	try {
		//console.log("Reached Mistral chat", MISTRAL_API_KEY)

		aiMessage = document.createElement("div");
		// Add user message to the chat interface
		addUserMessage(text)

		// Add loading animation
		addLoadingAnimation(aiMessage);

		const aiMessageUId = `msg_${Math.random().toString(30).substring(3, 9)}`;
		aiMessage.classList.add("flex", "justify-start", "mb-12", "overflow-wrap");
		chatArea.appendChild(aiMessage);
		const foldId = `think-content-${Math.random().toString(33).substring(3, 9)}`;
		const exportId = `export-${Math.random().toString(33).substring(3, 9)}`;


		// Scroll to bottom
		AutoScroll.checked ? scrollToBottom(chatArea) : null;

		// Create Timer object
		const _Timer = new window.Timer();

		//start timer
		_Timer.trackTime("start");

		window.HandleProcessingEventChanges('show')
		processing = true

		/*const stream = await Mistarlclient.chat.stream({
			model: modelName,
			messages: window.electron.getChat(),
			max_tokens: 3000
		});*/

		let output = ""
		const stream = window.generateTextChunks();

		let thinkContent = "";
		let actualResponse = "";
		let isThinking = false;
		let fullResponse = "";
		let hasfinishedThinking = false;

		for await (const chunk of stream) {
			const choice = chunk?.data?.choices?.[0];
			if (!choice?.delta?.content) continue;

			const deltaContent = choice.delta.content;
			output += deltaContent;
			fullResponse += deltaContent;

			const hasThinkTag = output.includes("<think>");
			const isDeepSeek = modelName === "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B";
			const shouldStartThinking = !isThinking && (hasThinkTag || isDeepSeek);
			const shouldStopThinking = isThinking && output.includes("</think>");

			if (shouldStartThinking && !hasfinishedThinking) {
				isThinking = true;
				hasfinishedThinking = false;
				output = output.replace("<think>", "");
				thinkContent = output;
			} else if (shouldStopThinking) {
				isThinking = false;
				hasfinishedThinking = true;
				thinkContent += deltaContent.replace("</think>", "");
				output = output.replace("</think>", "");
			} else if (isThinking) {
				thinkContent += deltaContent;
			} else {
				actualResponse += deltaContent;
			}

			if (codeBuffer.code) {
				codeView.innerHTML = codeBuffer.code;
				updateLineNumbers();

				if (!isCanvasOpen) DSP();
			}

			// Update innerHTML with marked output
			aiMessage.innerHTML = `
			<section class="relative w-fit max-w-full lg:max-w-6xl mb-8 p-2">
			${isThinking || thinkContent ? `
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
				<p style="color: #333;">${window.marked(window.normalizeMathDelimiters(thinkContent))}</p>
				</div>
				</div>
				` : ''}
				${thinkContent && actualResponse ? `<p class="rounded-lg border-2 border-blue-400 dark:border-orange-400"></p>` : ""}
				${actualResponse ? `
					<div class="${aiMessageUId} bg-blue-200 py-4 text-gray-800 dark:bg-[#002f42] dark:text-white rounded-lg rounded-bl-none px-4 mb-6 pb-4 transition-colors duration-1000">
					${actualResponse && thinkContent ? `<strong class="text-[#28a745]">Response:</strong>` : ''}
					<p style="color: #333;">${window.marked(window.normalizeMathDelimiters(actualResponse))}</p>
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
						<div class="rounded-lg p-1 cursor-pointer" aria-label="Copy" title="Copy" id="copy-all" onclick="CopyAll('.${aiMessageUId}');">
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
					<div id="exportOptions-${exportId}" class="hidden block absolute bottom-10 left-0 bg-[radial-gradient(closest-side,var(--tw-gradient-stops))] from-[#009393] dark:from-[#002f42] via-[#45cece] dark:via-[#002f42] to-blue-400 dark:to-[#002f42] dark:bg-gray-800 p-2 rounded shadow-md z-50 border border-[#0055ff] dark:border-[#009fe8] transition-colors duration-1000">
					<ul class="list-none p-0">
					<li class="mb-2">
					<p class="text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-colors duration-1000 cursor-pointer" onclick="HTML2Pdf(event, '.${aiMessageUId}')">Export to PDF</p>
					</li>
					<li class="mb-2">
					<p class="text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-colors duration-1000 cursor-pointer" onclick="HTML2Jpg(event, '.${aiMessageUId}')">Export to JPG</p>
					</li>
					<li>
					<p class="text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-all duration-1000 cursor-pointer" onclick="HTML2Word(event, '.${aiMessageUId}')">Export to DOCX</p>
					</li>
					<li>
					<p class="cursor-not-allowed text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-all duration-1000 decoration-underline" onclick="">Word Export Advance</p>
					</li>
					</ul>
					</div>
			</section>`: ""}
						`;


			AutoScroll.checked ? scrollToBottom(chatArea) : null;
			// Render mathjax immediately
			window.debounceRenderKaTeX(`.${aiMessageUId}`, 3000, false);
		}
		//stop timer
		_Timer.trackTime("stop");

		// Reset send button appearance
		window.HandleProcessingEventChanges("hide")

		//window.addCopyListeners();

		// Sending a message to the main process if script does not exist already
		window.setutilityScriptisSet();

		// Render katex immediately
		window.debounceRenderKaTeX(`.${aiMessageUId}`, null, true);
		normaliZeMathDisplay(`.${aiMessageUId}`)

		// Store conversation history
		// window.electron.addToChat({ role: "assistant", content: output });

		//console.log(actualResponse, fullResponse, output)
		// render diagrams fromthis response
		window.handleDiagrams(output, 'both');
		window.LoopRenderCharts(output)


	} catch (err) {
		window.handleRequestError(err, userMessage, aiMessage)
	}
}


async function MistraVision(text, fileType, fileDataUrl = null, modelName) {
	const _Timer = new window.Timer;

	console.log("Reached Mistral vision")

	const fileContainerId = `FCont_${Math.random().toString(35).substring(2, 8)}`;

	const VisionMessage = document.createElement("div");
	aiMessage = VisionMessage
	// Add user message to the chat interface
	addUserMessage(text, fileType, fileDataUrl, fileContainerId)
	// Add loading animation
	addLoadingAnimation(aiMessage);

	//Add Timestamp
	text = `${text} [${window.electron.getDateTime()} UTC]`

	//console.log(text)
	// Determine the content based on fileDataUrl
	let userContent;
	if (fileDataUrl) {
		//console.log("Image url present");
		if (fileType == "image") {
			const imageContent = fileDataUrl.map(_url => ({
				type: "image_url",
				imageUrl: {
					url: _url,
				}
			}));

			userContent = [
				{
					type: "text",
					text: text,
				},
				...imageContent // Spread the image content objects
			];
		}

		else if (fileType == "document") {
			const documentContent = fileDataUrl.map(_url => ({
				type: "document_url",
				documentUrl: {
					url: _url,
				}
			}));

			userContent = [
				{
					type: "text",
					text: text,
				},
				...documentContent // Spread the document content objects
			];
		}
	} else {
		//console.log("Url not found");
		userContent = [
			{
				type: "text",
				text: text,
			},
		];
	}

	// Add user message to VisionHistory
	window.electron.addToVisionChat({
		role: "user",
		content: userContent,
	});

	const exportId = `export-${Math.random().toString(33).substring(3, 9)}`;
	const VisionMessageUId = `msg_${Math.random().toString(30).substring(3, 9)}`;
	VisionMessage.classList.add("flex", "justify-start", "mb-12", "overflow-wrap");
	chatArea.appendChild(VisionMessage);
	const foldId = `think-content-${Math.random().toString(33).substring(3, 9)}`;

	// Add loading animation
	VisionMessage.innerHTML = `
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

	try {
		//console.log(window.electron.clearImages(window.electron.getVisionChat()),)
		//const visionstream = window.generateTextChunks();
		const visionstream = await Mistarlclient.chat.stream({
			model: modelName,
			messages: window.electron.clearImages(window.electron.getVisionChat()),
			max_tokens: 2000,
		});


		//console.log("Final VisionHistory:", JSON.stringify(window.electron.getVisionChat(), null, 2));
		//console.log("Final VisionHistory:", JSON.stringify(window.electron.clearImages(window.electron.getVisionChat(), null, 2)));

		// change send button appearance to processing status
		window.HandleProcessingEventChanges('show')

		//start timer
		_Timer.trackTime("start");

		let output = ""
		//const stream = window.generateTextChunks();

		let thinkContent = "";
		let actualResponse = "";
		let isThinking = false;
		let fullResponse = "";
		let hasfinishedThinking = false;

		for await (const chunk of visionstream) {
			const choice = chunk?.data?.choices?.[0];
			if (!choice?.delta?.content) continue;
			const deltaContent = choice?.delta?.content;
			output += deltaContent;
			fullResponse += deltaContent;

			const hasThinkTag = output.includes("<think>");
			const shouldStartThinking = !isThinking && hasThinkTag;
			const shouldStopThinking = isThinking && output.includes("</think>");

			if (shouldStartThinking && !hasfinishedThinking) {
				isThinking = true;
				hasfinishedThinking = false;
				output = output.replace("<think>", "");
				thinkContent = output;
			} else if (shouldStopThinking) {
				isThinking = false;
				hasfinishedThinking = true;
				thinkContent += deltaContent.replace("</think>", "");
				output = output.replace("</think>", "");
			} else if (isThinking) {
				thinkContent += deltaContent;
			} else {
				actualResponse += deltaContent;
			}
			//console.log(actualResponse)
			VisionMessage.innerHTML = `
				<section class="relative w-fit max-w-full lg:max-w-6xl mb-8">
					${isThinking || thinkContent ? `
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
							<p style="color: #333;">${window.marked(window.normalizeMathDelimiters(thinkContent))}</p>
						</div>
					</div>
					` : ''}
						${thinkContent && actualResponse ? `<p class="rounded-lg border-2 border-blue-400 dark:border-orange-400"></p>` : ""}
						${actualResponse ? `<div class="${VisionMessageUId} bg-blue-200 py-4 text-gray-800 dark:bg-[#002f42] dark:text-white rounded-lg rounded-bl-none px-4 mb-6 pb-4 transition-colors duration-100">${actualResponse && thinkContent ? `<strong class="text-[#28a745]">Response:</strong>` : ''}
							<p style="color: #333;">${window.marked(window.normalizeMathDelimiters(actualResponse))}</p>
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
					<div class="rounded-lg p-1 cursor-pointer" aria-label="Copy" title="Copy" id="copy-all" onclick="CopyAll('.${VisionMessageUId}');">
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
				<p class="text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-colors duration-1000 cursor-pointer" onclick="HTML2Pdf(event, '.${VisionMessageUId}')">Export to PDF</p>
				</li>
				<li class="mb-2">
				<p class="text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-colors duration-1000 cursor-pointer" onclick="HTML2Jpg(event, '.${VisionMessageUId}')">Export to JPG</p>
				</li>
				<li>
				<p class="text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-all duration-1000 cursor-pointer" onclick="HTML2Word(event, '.${VisionMessageUId}')">Export to DOCX</p>
				</li>
				<li>
				<p class="cursor-not-allowed text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-all duration-1000 decoration-underline" onclick="">Word Export Advance</p>
				</li>
				</ul>
				</div>
				</section>`: ""}
				`;

			AutoScroll.checked ? scrollToBottom(chatArea) : null;

			// Debounce MathJax rendering to avoid freezing
			window.debounceRenderKaTeX(`.${VisionMessageUId}`, 3000, true);
		}

		//stop timer
		_Timer.trackTime("stop");

		// Reset send button appearance
		window.HandleProcessingEventChanges('hide')

		window.setutilityScriptisSet()

		// Render katex immediately
		window.debounceRenderKaTeX(`.${VisionMessageUId}`, null, true);
		normaliZeMathDisplay(`.${VisionMessageUId}`)

		window.electron.addToVisionChat({ role: "assistant", content: [{ type: "text", text: output }] });
		//console.log("Final VisionHistory:", JSON.stringify(window.electron.getVisionChat(), null, 2));

		// render diagrams fromthis response
		window.handleDiagrams(output, 'both');
		window.LoopRenderCharts(output)

	} catch (error) {
		window.handleRequestError(error, userMessage, VisionMessage, ["VS", fileType, fileContainerId])
	}
}


function addUserMessage(text, fileType, fileDataUrl, fileContainerId) {
	//console.log("Date time + text:", text)
	const userMessageId = `msg_${Math.random().toString(34).substring(3, 9)}`;
	const copyButtonId = `copy-button-${Math.random().toString(36).substring(5, 9)}`;
	userMessage = document.createElement("div");

	userMessage.innerHTML = `
	<div data-id="${userMessageId}" class="${userMessageId} relative bg-[#566fdb] dark:bg-[#142384] text-black dark:text-white rounded-lg rounded-br-none p-2 md:p-3 shadow-md w-fit max-w-full lg:max-w-5xl">
	<p class="whitespace-pre-wrap break-words max-w-xl md:max-w-2xl lg:max-w-3xl">${window.InputPurify(text)}</p>
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
	chatArea.appendChild(userMessage);

	// Add Timestamp to user prompt
	text = `${text} [${window.electron.getDateTime()} UTC]`
	//window.electron.addToChat({ role: "user", content: text });
}

function addLoadingAnimation(aiMessageDiv) {
	aiMessageDiv.innerHTML = `
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
	window.implementUserCopy()
}


function routeToMistral(text, modelName) {
	console.log("Reached Target: mistralRoute, model:", modelName)
	if (["pixtral-12b-2409", "pixtral-large-2411", "mistral-small-latest"].includes(modelName)) {
		return MistraVision(text, null, null, modelName)
	}
	MistraChat(text, modelName)
}

window.routeToMistral = routeToMistral;
window.MistraVision = MistraVision;
