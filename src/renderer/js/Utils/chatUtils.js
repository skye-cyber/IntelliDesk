import { marked } from "marked";
import hljs from 'highlight.js';
import DOMPurify from 'dompurify'; // If using modules

// Initialize highlight.js
hljs.configure({ ignoreUnescapedHTML: true });

// Custom renderer for syntax highlighting
const renderer = new marked.Renderer();
renderer.code = function(code) {
	// Handle case where `code` is an object
	let validLanguage = code.lang || 'plaintext';
	//console.log(`Language: ${validLanguage}`);
	if (typeof code === "object" && code.text !== undefined) {
		code = code.text; // Extract the actual code
	}

	if (typeof code !== "string" || code.trim() === "") {
		console.warn("Empty or invalid code provided:", code);
		code = "// No code provided"; // Default fallback for empty code

	}

	let dgCodeBlock = ['dot-draw', 'json-draw', 'json-chart'].includes(validLanguage) ? true : false;

	let dgLang = dgCodeBlock ? validLanguage : null;

	validLanguage = dgLang ? (['json', 'dot'].includes(dgLang) ? validLanguage.slice(0, -5) : validLanguage.slice(0, -6)) : validLanguage;

	// Highlight the code
	let highlighted;
	try {

		highlighted = hljs.highlight(code, { language: validLanguage }).value;

	} catch (error) {
		if (error.message === "Unknown language") {
			console.log("Undetermined language")
		}
		else {
			console.error("Highlighting error:", error.name);
			highlighted = hljs.highlightAuto(code).value; // Fallback to auto-detection
		}
	}

	// Reset language to json-draw
	validLanguage = dgLang ? dgLang : validLanguage

	// Generate unique ID for the copy button
	const copyButtonId = `copy-button-${Math.random().toString(36).substring(2, 9)}`;
	const renderButtonId = `render-button-${Math.random().toString(36).substring(2, 9)}`;

	function getdgFunction() {
		const mapper = {
			'dot-draw': `window.handleDiagrams(this, 'dot', isPlainCode=true, trigger='click')`,
			'dot': `window.handleDiagrams(this, 'dot', isPlainCode=true, trigger='click')`,
			'json-draw': `window.handleDiagrams(this, 'json'}', isPlainCode=true, trigger='click')`,
			'json-chart': `window.LoopRenderCharts(this, type='code', trigger='click')`
		}
		return dgLang ? mapper[dgLang] : validLanguage === 'dot' ? mapper[validLanguage] : ''
	}

	if (isCanvasActive) {
		//increament code buffer
		codeBuffer = { lang: validLanguage, code: `<code id="${validLanguage}" data-value=${renderButtonId} class="hljs ${validLanguage} block whitespace-pre-wrap w-full rounded-md bg-none font-mono transition-colors duration-500 mb-[20vh]">${highlighted}</code>` }

		return `
		<section class="flex justify-between top-1 p-1 w-full bg-sky-300 rounded-t-md dark:bg-[#001922] box-border transition-colors duration-700">
			<!-- Language -->
			<p class="code-language p-1 justify-start rounded-md text-slate-950 dark:text-white rounded-lg font-normal text-sm cursor-pointer opacity-80 hover:opacity-50">${validLanguage}</p>
			<div class="flex justify-between space-x-3">
				<!-- Copy button -->
				<button id="${copyButtonId}" onclick="window.handleCodeCopy(this, '${renderButtonId}');" class="copy-button flex items-center rounded-md p-1 bg-gradient-to-r from-sky-800 to-purple-600 hover:to-green-400 dark:from-[#00a5ce] dark:to-[#5500ff] dark:hover:from-[#00557f] dark:hover:to-[#006ea1] text-sm text-white cursor-pointer transform transition-all duration-700">
				<svg class="mt-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-copy mr-1">
				<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
				<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
				</svg>
				<p id="BtText">copy</p>
				</button>
			</div>
			</section>
			<article class="relative">
				<div class="h-full max-h-60 p-2 border border-[#00aaff] dark:border-[#00a5ce] w-full bg-cyan-100 dark:bg-[#001c24] rounded-md rounded-t-none overflow-auto scrollbar-hide transition-colors duration-700">
				<div class="absolute flex justify-center items-center left-0 top-0 bg-gray-800/70 flex flex-grow rounded-md rounded-t-none overflow-hidden h-full w-full lg:max-w-[100vw] z-[30] hover:scale-[101%] hover:border hover:border-blue-300 transform transition-all duration-700 ease-in-out">
				<button
				onclick="setCanvasUpdate(this)"
				class="flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:text-blue-200 transition-all duration-300 shadow-lg"
				>
				<span class="text-sm font-normal text-white hover:text-green-400 transition-colors duration-300">
				&lt;/&gt;
				</span>
				Click to open canvas
				</button>
				</div>
				<code id="${validLanguage}" data-value=${renderButtonId} class="p-2 hljs ${validLanguage} block whitespace-pre rounded-md bg-cyan-100 dark:bg-[#001c24] font-mono overflow-x-auto">${highlighted}</code>
				</div>
			</article>
			`
	} else {
		return `
		<div class="my-2 block bg-blue-300 dark:bg-[#004c6a]  rounded-md transition-colors duration-100">
		<section class="flex justify-between top-1 p-1 w-full bg-sky-300 rounded-t-md dark:bg-[#001922] box-border transition-colors duration-700">
		<!-- Language -->
		<p class="code-language p-1 justify-start rounded-md text-slate-950 dark:text-white rounded-lg font-normal text-sm cursor-pointer opacity-80 hover:opacity-50">
		${validLanguage}
		</p>
		<div class="flex justify-between space-x-3">
		${(dgCodeBlock || validLanguage === 'dot') ? `
			<!-- Render Button -->
			<button
			id="${renderButtonId}"
			onclick="${getdgFunction()}"
			class="render-button flex items-center gap-1 rounded-md p-1 bg-gradient-to-r from-[#00aaff] to-purple-700 hover:to-[#55ff00] text-sm text-white cursor-pointer transform transition-all duration-700"
			>
			<!-- Network / Diagram Icon -->
			<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<circle cx="12" cy="5" r="2" />
			<circle cx="5" cy="19" r="2" />
			<circle cx="19" cy="19" r="2" />
			<line x1="12" y1="7" x2="5" y2="17" />
			<line x1="12" y1="7" x2="19" y2="17" />
			</svg>
			<p id="BtText">Render</p>
			</button>
			` : ''}

			<div class="flex justify-between space-x-3"
			${(['html', 'svg'].includes(validLanguage)) ? `
				<!-- Render html+svg -->
				<button
				id="${renderButtonId}"
				onclick="window.renderHtml(this);"
				class="render-button flex items-center gap-1 rounded-md p-1 bg-gradient-to-r from-[#00aaff] to-purple-700 hover:to-[#55ff00] text-sm text-white cursor-pointer transform transition-all duration-700"
				>
				<!-- Network / Diagram Icon -->
				<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="5" r="2" />
				<circle cx="5" cy="19" r="2" />
				<circle cx="19" cy="19" r="2" />
				<line x1="12" y1="7" x2="5" y2="17" />
				<line x1="12" y1="7" x2="19" y2="17" />
				</svg>
				<p id="BtText">Render</p>
				</button>
				` : ''}

			<!-- Copy button -->
			<button id="${copyButtonId}" onclick="window.handleCodeCopy(this, '${renderButtonId}');" class="copy-button flex items-center rounded-md p-1 bg-gradient-to-r from-sky-800 to-purple-600 hover:to-green-400 dark:from-[#00a5ce] dark:to-[#5500ff] dark:hover:from-[#00557f] dark:hover:to-[#006ea1] text-sm text-white cursor-pointer transform transition-all duration-700">
			<svg class="mt-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-copy mr-1">
			<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
			<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
			</svg>
			<p id="BtText">copy</p>
			</button>
		</div>
		</section>
		<div class="p-2 border border-[#00aaff] dark:border-[#00a5ce] w-full bg-cyan-100 dark:bg-[#001c24] rounded-md rounded-t-none overflow-auto scrollbar-hide transition-colors duration-700">
		<code data-value=${renderButtonId} class="p-2 hljs ${validLanguage} block whitespace-pre rounded-md bg-cyan-100 dark:bg-[#001c24] font-mono transition-colors duration-700 overflow-x-auto">${highlighted}</code>
		</div>
		</div>
		`
	}
};

// Configure marked.js white
marked.setOptions({
	renderer: renderer,
	breaks: true,
});


function addCopyListeners() {
	document.querySelectorAll('.copy-button').forEach(button => {
		button.addEventListener('click', async function() {
			const codeBlock = this.parentNode.parentNode.nextElementSibling.querySelector('code');
			const textToCopy = codeBlock.innerText;
			const button = document.getElementById(this.id);
			try {
				await navigator.clipboard.writeText(textToCopy);
				button.children[1].textContent = 'copied!';
				setTimeout(() => {
					button.children[1].textContent = 'copy';
				}, 2000);
				showCopyModal();
			} catch (err) {
				console.error('Failed to copy: ', err);
			}
		});
	});
}

async function handleCodeCopy(element, id = null) {
	console.log(id)
	const codeBlock = document.querySelector(`[data-value="${id}"]`);
	console.log(codeBlock)
	const textToCopy = codeBlock.innerText;
	const button = document.getElementById(element.id);
	try {
		await navigator.clipboard.writeText(textToCopy);
		button.children[1].textContent = 'copied!';
		setTimeout(() => {
			button.children[1].textContent = 'copy';
		}, 2000);
		showCopyModal();
	} catch (err) {
		console.error('Failed to copy: ', err);
	}
}


function handleRequestError(error, userMessage, aiMessage, VS_url = null) {
	try {
		processing = false;

		//start timer
		const _Timer = new Timer();
		_Timer.trackTime("interrupt");

		// change send button appearance to processing status
		HandleProcessingEventChanges('hide')
		const conversationHistory = VS_url ? window.electron.getVisionChat() : window.electron.getChat()
		if (!error.message === "Failed to fetch" && !error.message === "network error") {
			console.log("History length:", conversationHistory.length);
			console.log('Error:', JSON.stringify(error, null, 2));
		} else {
			if (error.message === "[object Object]") {
				console.log('Error:', error);
				removeFirstConversationPairs(conversationHistory);
			}
			console.log(`Intercepted '${error}'`);
			console.log("History length:", conversationHistory.length);
			const errorContainer = document.getElementById('errorContainer');
			const errorArea = document.getElementById('errorArea');
			const closeModal = document.getElementById('closeEModal');
			const retry = document.getElementById('retryBt');
			let lastMessage = conversationHistory.slice(-1); // Safely access the last message
			//console.log(lastMessage)

			function HideLoaderUserAiMs(all = false) {
				//Remove loading animation if present
				if (aiMessage) {
					if (aiMessage.firstElementChild.id === "loader-parent") {
						if (all) {
							userMessage.remove();
						} else {
							aiMessage.remove();
						}
					}
				}
			}

			HideLoaderUserAiMs();
			// Clone the retry button and replace the original one
			const clonedRetry = retry.cloneNode(true);
			retry.replaceWith(clonedRetry);

			// Remove all event listeners from the cloned button
			const newRetry = document.getElementById('retryBt');
			//console.log(newRetry);
			newRetry.removeEventListener('click', retryHandler);

			// Re-attach the click event listener
			newRetry.addEventListener('click', function() {
				retryHandler();
			});

			closeModal.addEventListener('click', (event) => {
				event.stopPropagation();
				HideErrorModal();
				HideLoaderUserAiMs(true);
				if (VS_url && VS_url[1]) {
					const fileContainer = document.getElementById(VS_url[2])
					fileContainer.remove();
				}
			});

			function showError() {
				setTimeout(() => {
					errorContainer.classList.remove("hidden");
					errorContainer.classList.add('left-1/2', 'opacity-100', 'pointer-events-auto');
				}, 200); // 0.3 second delay
				let ErrorMs = error.message === "Failed to fetch" ? "Connection Error: Check your Internet!" : error.message;
				if (error.message === "[object Object]") {
					ErrorMs = "This model is unreachabble: It might be overloaded!"
				}
				errorArea.textContent = ErrorMs;
				window.electron.popFromChat(); // Remove the last conversation entry
			}

			async function HideErrorModal() {
				// Slide modal to the left and fade out
				setTimeout(() => {
					errorContainer.classList.remove('left-1/2', '-translate-x-1/2');
					errorContainer.classList.add('-translate-x-full', 'opacity-0', 'pointer-events-none');
				}, 0);

				// Reset transform after fully fading out and moving off-screen
				setTimeout(() => {
					errorContainer.classList.remove('opacity-100', '-translate-x-full');
					errorContainer.classList.add('hidden', '-translate-x-1/2');
				}, 0); // 1 second for reset
			}
			// Remove existing event listeners before adding a new one
			async function retryHandler() {
				await HideErrorModal()

				if (VS_url) {

					try {
						var text = lastMessage[0].content[0].text;
						var fileDataUrl = [];

						if (VS_url[1] === "image") {
							const imageItem = lastMessage.find(item => item.type === "image_url");
							if (imageItem && imageItem.images) {
								fileDataUrl.push(...imageItem.images.map(image => image.url));
							}

						} else if (VS_url[1] === "image") {
							const imageItem = lastMessage.find(item => item.type === "file_url");
							if (imageItem && imageItem.images) {
								fileDataUrl.push(...imageItem.files.map(file => file.url));
							}
						}
					} catch (error) {
						if (error.name === "TypeError") {
							console.log('No file attachment!');
						} else {
							console.error("Error determining file type:", error);
						}
					}

					text = text.slice(-1) === ']' ? text.slice(0, text.length - 22) : text;
					fileDataUrl = fileDataUrl.length !== 0 ? fileDataUrl : null;
					window.VisionChat(text, VS_url[1], fileDataUrl);
				} else {

					// Strip date && time from user message
					lastMessage = lastMessage[0].content.slice(-1) === ']' ? lastMessage[0].content.slice(0, lastMessage[0].content.length - 22) : lastMessage[0].content;

					// Retry action
					window.requestRouter(lastMessage.trim());
				}

				if (aiMessage) aiMessage.remove();
				if (userMessage) userMessage.remove();
			};
			showError();
		}
	} catch (err) {
		console.error('Error handling request error:', err);
	}
}

function implementUserCopy() {
	document.querySelectorAll('.user-copy-button').forEach(button => {
		const buttonParent = button.parentElement;
		const textBlock = buttonParent.querySelector('p');

		if (textBlock && textBlock.innerHTML.length < 50) {
			button.style.display = 'none';
		}

		button.addEventListener('click', async function() {
			const textToCopy = textBlock.innerText;

			if (textToCopy.length >= 50) {
				try {
					await navigator.clipboard.writeText(textToCopy);
					this.textContent = 'Copied!';
					setTimeout(() => {
						this.textContent = 'Copy';
					}, 3000);
				} catch (err) {
					console.error('Failed to copy: ', err);
				}
			}
		});
	});
}

// Copy function for the whole text block/aiMessage
function CopyAll(UId, bt = null, html = false) {
	//console.log(UId)
	const textBlock = document.querySelector(UId);
	//console.log(textBlock)
	if (!textBlock) {
		console.error('Element not found: ', UId);
		return;
	}

	const textToCopy = html === true ? textBlock.innerHTML : textBlock.textContent;
	//console.log(textToCopy)

	if (textToCopy.length >= 50) {
		try {
			navigator.clipboard.writeText(textToCopy);
			if (bt) {
				bt.textContent = 'Copied!';
				setTimeout(() => {
					bt.textContent = 'Copy';
				}, 3000)
			}
			showCopyModal()
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
	} else {
		console.log('Text is too short to copy: ', textToCopy);
	}
}

// Function to show the modal
function showCopyModal(_color = null, text = "Text copied") {
	const modal = document.getElementById('copyModal');
	const txtSpace = document.getElementById("text-space")
	txtSpace.textContent = text;
	addRmColor();
	function addRmColor(task = "add") {
		if (_color) {
			if (task === "add") {
				txtSpace.classList.add(_color);
				console.log("Added", _color)
			}
			else {
				txtSpace.classList.remove(_color);
				console.log("Removed", _color)
			}
		}
	}
	// Slide modal to 20% height and make it visible after 1 second
	setTimeout(() => {
		modal.classList.add('top-1/5', 'opacity-100', 'pointer-events-auto');
	}, 500); // 1 second delay

	// Slide modal to the left and fade out after 5 seconds
	setTimeout(() => {
		modal.classList.remove('top-1/5', 'left-1/2', '-translate-x-1/2');
		modal.classList.add('left-0', '-translate-x-[100vw]', 'opacity-0', 'pointer-events-none');

	}, 4000); // 5 seconds for staying in the middle plus 1 second delay

	// Reset transform after fully fading out and moving off-screen
	setTimeout(() => {
		modal.classList.remove('left-0', '-translate-x-[100vw]', 'opacity-0', 'pointer-events-none');
		modal.classList.add('top-0', 'left-1/2', '-translate-x-1/2', 'pointer-events-none');
	}, 1000); // 0.5s for fade out
	addRmColor("rm")
}


// Function to remove the first conversation pairs to maintain conversation size limit
function removeFirstConversationPairs(conversationHistory, count = 2) {
	let removed = 0;
	while (removed < count && conversationHistory.length > 0) {
		const firstPair = conversationHistory[0];
		if (firstPair.role !== "system") {
			conversationHistory.shift();
			removed++;
			console.log("New conversation:", conversationHistory)
		} else {
			// Skip system instructions
			break;
		}
	}
}


function copyBMan() {
	document.querySelectorAll(".Vision-user-copy-button").forEach(button => {
		//console.log("Adding copy control")
		// Get the next sibling of the current element
		const nextSibling = button.nextElementSibling;

		// Check if the next sibling exists
		if (nextSibling) {
			// Get the first child of the next sibling
			const userTextChild = nextSibling.firstElementChild;

			if (userTextChild.innerHTML.length < 50) {
				button.classList.toggle('hidden');
			} else {
				console.log("userTextChild not found")
			}
		}
	});
}


function InputPurify(unsafe) {
	const cleanHTML = DOMPurify.sanitize(unsafe, {
		ALLOWED_TAGS: ['br', 'strong', 'em'], // Allow paragraphs, line breaks, bold, italic, links
		//ALLOWED_ATTR: ['href'], // Only allow the 'href' attribute (useful for 'a' tags)
		//ADD_TAGS: ['img'], // Add the image tag
		//ADD_ATTR: ['src', 'alt', 'data-id'] // Add these attributes (src/alt for img, data-id for any relevant tag)
	});
	return cleanHTML
		// 2. Format: Collapse multiple <br> tags using regex
		// This regex finds a <br> tag (with optional self-closing slash and whitespace)
		// followed by one or more similar <br> tags (again with optional whitespace between them).
		// It replaces the entire matched sequence with a single <br> tag.
		.replace(/(<br\s*\/?>\s*){2,}/gi, '<br>')
		// 3. Apply formatting: Collapse sequences of &nbsp; entities
		// This regex finds a sequence of two or more consecutive &nbsp; entities,
		// potentially separated by optional whitespace characters (\s*), and replaces
		// the entire sequence with a single regular space (' ').
		.replace(/(&nbsp;\s*){2,}/gi, ' ')
		// Optional: Collapse sequences of regular spaces as well if they weren't handled by white-space: pre-wrap
		// (white-space: pre-wrap should handle regular spaces, but this is a fallback)
		.replace(/ {2,}/g, ' ')
	/*if (typeof unsafe !== 'string') {
		return '';
	}
	return unsafe
	.replace(/&/g, "&amp;")
	.replace(/\n+/g, '\n')  // 1+ newlines → 1 newline
	.replace(/</g, "&lt;")
	.replace(/>/g, "&gt;")
	.replace(/"/g, "&quot;")
	.replace(/'/g, "&#039;");
	*/

}



function HandleProcessingEventChanges(status) {
	const sendBtn = document.getElementById("sendBtn");
	const normalSend = document.getElementById("normalSend"); //initially displayed
	const spinningSquares = document.getElementById("spinningSquares"); //inirially hidden
	if (status === 'show') {
		processing = true;

		normalSend.classList.add('hidden')
		spinningSquares.classList.remove('hidden')
		//Disable the send button
		sendBtn.disabled = true;
		// Add Cursor prohibited/disabled cursor class
		sendBtn.classList.add('cursor-disable');
	} else if (status === 'hide') {
		processing = false

		spinningSquares.classList.add('hidden')
		normalSend.classList.remove('hidden')
		//re-enable the send button
		sendBtn.disabled = false;
		// Remove Cursor prohibited/disabled cursor class
		sendBtn.classList.remove('cursor-disable');
	}
}



class Timer {
	constructor() {
		this.startTime = null;
	}

	trackTime(action) {
		// Store the start time
		if (action === 'start') {
			if (this.startTime !== null) {
				//console.log('Timer has already been started. Restarting');
				//return null;
			}
			this.startTime = performance.now();
			//console.log('Timer started at:', this.startTime);
		}
		// Calculate the elapsed time
		else if (action === 'stop') {
			if (this.startTime === null) {
				console.log('Timer was not started.');
				return null;
			}
			const endTime = performance.now();
			const timeTaken = endTime - this.startTime;
			//console.log(`Time taken: ${timeTaken} milliseconds.`);
			//console.log('Stop time:', endTime)
			this.startTime = null; // Clean up

			// Ensure window.Notify is defined before calling it
			if (typeof window.Notify === 'function') {
				const seconds = Math.floor(timeTaken / 1000) % 60;
				const milliseconds = Math.floor(timeTaken % 1000);
				window.Notify(null, `${seconds} seconds and ${milliseconds} ms`);
				// Call app systewide notify
				window.electron.send('Notify', { message: timeTaken });
			} else {
				console.error('window.Notify is not defined.');
			}

			return timeTaken;
		}
		// Interrupt the timer
		else if (action === 'interrupt') {
			//console.log("Timer Interrupted")
			this.startTime = null;
		}
		// Invalid action
		else {
			console.log('Invalid action. Use "start" to start the timer and "stop" to stop the timer.');
			return null;
		}
	}
}


// Grab the button element
const previewBtn = document.getElementById('previewBtn');

previewBtn.addEventListener('click', function() {
	// Determine current state from the aria-pressed attribute
	const isActive = this.getAttribute('aria-pressed');

	// Toggle the state
	this.setAttribute('aria-pressed', (isActive === 'false') ? "true" : "false");
	//console.log(this.getAttribute('aria-pressed'))

	//update system instructions
	window.electron.updateSysInit()

	if (isActive !== "true") {
		// When activated: switch to vibrant green theme
		this.classList.remove('border-sky-900', 'bg-blue-100', 'hover:bg-sky-300', 'dark:bg-[#171717]', 'dark:border-[#aa55ff]');
		this.classList.add('border-green-500', 'bg-green-300', 'hover:bg-green-400', 'dark:border-green-950', 'dark:bg-green-800');
	} else {
		// When deactivated: revert to vibrant red theme
		this.classList.remove('border-green-500', 'bg-green-300', 'hover:bg-green-400', 'dark:border-green-950', 'dark:bg-green-800', 'dark:hover:bg-green-600');
		this.classList.add('border-sky-900', 'bg-blue-100', 'hover:bg-sky-300', 'dark:bg-[#171717]', 'dark:border-[#aa55ff]');
	}
});

window.imageGen = false;

const imageGen = document.getElementById("image-gen");
imageGen.addEventListener('click', function() {

	// Determine current state from the aria-pressed attribute
	const isActive = this.getAttribute('aria-pressed');

	// Toggle the state
	this.setAttribute('aria-pressed', (isActive === 'false') ? "true" : "false");

	console.log(this.getAttribute('aria-pressed'))
	if (isActive !== "true") {
		// When activated: switch to vibrant blue gradient with shadow
		this.classList.remove('dark:bg-orange-400', 'bg-[#ffaa7f]', 'dark:text-white'); // Remove inactive gradient
		this.classList.add('bg-[#00ff00]', 'shadow-lg', 'dark:text-blue-950');
		window.imageGen = true;
	} else {
		// When deactivated: revert to original gradient without shadow
		this.classList.remove('bg-[#00ff00]', 'shadow-lg', 'dark:text-blue-950');
		this.classList.add('bg-[#ffaa7f]', 'dark:text-white', 'dark:bg-orange-400'); // Restore inactive gradient
		window.imageGen = false;
	}
});


function setutilityScriptisSet() {
	const scripts = document.getElementsByTagName('script');
	let exists = false;
	for (let script of scripts) {
		if (script.src.includes('packed_utility.js')) {
			console.log("Utility script already exits. Not adding"); // Logs the matching script element
			exists = true
			return exists
		}
	}
	console.log("Utility missing. Adding");
	// Sending a message to the main process if script does not exist already
	window.electron.send('toMain', { message: 'set-Utitility-Script' })
	return exists
}


//avail marked to the other scripts
window.Timer = Timer
window.marked = marked;
window.CopyAll = CopyAll
window.copyBMan = copyBMan
window.InputPurify = InputPurify
window.showCopyModal = showCopyModal
window.handleCodeCopy = handleCodeCopy;
window.showDeletionStatus = showCopyModal
//window.addCopyListeners = addCopyListeners
window.implementUserCopy = implementUserCopy
window.handleRequestError = handleRequestError
window.setutilityScriptisSet = setutilityScriptisSet
window.removeFirstConversationPairs = removeFirstConversationPairs
window.HandleProcessingEventChanges = HandleProcessingEventChanges;
