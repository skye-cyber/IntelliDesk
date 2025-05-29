import { HfInference } from "@huggingface/inference";
import SetAudioAnim from '../animations/WaveFormAnim.js';

let hf_API_KEY = null

async function loadApiKey() {
	const key = await window.api.getKeys('huggingfacex');
	hf_API_KEY = key.huggingfaceKey; // Assign to global variable
}

await loadApiKey()

const client = new HfInference(hf_API_KEY);

let timer = null
//define var to hold current loader
let currentLoader = null;

let currentAudioElement = null;
document.addEventListener('DOMContentLoaded', ()=>{
	timer = new window.Timer;
});

const LoaderEvent = new CustomEvent('LoaderHandler', {
	detail: {
		message: 'Loader outdid its purpose!',
	}
});

async function autoSpeech(data){

	const output = await client.automaticSpeechRecognition({
		data,
		model: "openai/whisper-large-v3-turbo",
		provider: "hf-inference",
	});

	console.log(output);
	return output
}

const chatArea = document.getElementById("chatArea");
//const userInput = document.getElementById("userInput");
//const sendBtn = document.getElementById("sendBtn");
const AutoScroll = document.getElementById("AutoScroll");

function displayResponse(text){
	const aiMessage = document.createElement("div");

	const aiMessageUId = `msg_${Math.random().toString(30).substring(3, 9)}`;
	aiMessage.classList.add("flex", "justify-start", "mb-12", "overflow-wrap");
	chatArea.appendChild(aiMessage);

	aiMessage.innerHTML = `
	<section class="relative w-fit max-w-full lg:max-w-6xl mb-8 p-2">
	<div class="${aiMessageUId} bg-gray-200 py-4 text-gray-800 dark:bg-[#28185a] dark:text-white rounded-lg px-4 mb-6 pb-4">
	<p style="color: #333;">${window.marked(text)}</p>
	</div>
	<section class="options flex absolute bottom-2 left-0 space-x-4 cursor-pointer">
	<div class="p-1 border-none" id="exportButton" onclick="toggleExportOptions(this);" title="Export">
	<svg class="fill-black dark:fill-gray-700 text-gray-600 bg-[#5555ff] dark:bg-white w-6 h-6 rounded-full" viewBox="0 0 24 24">
	<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
	</svg>
	</div>
	<div class="rounded-lg p-1 cursor-pointer" aria-label="Copy" title="Copy" id="copy-all" onclick="CopyAll('.${aiMessageUId}');">
	<svg class="w-5 md:w-6 h-5 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path class="fill-black dark:fill-pink-300" fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z"/></path>
	</svg>
	</div>
	</section>
	<div id="exportOptions" class="hidden block absolute bottom-10 left-0 bg-white dark:bg-gray-800 p-2 rounded shadow-md z-50 transition-300">
	<ul class="list-none p-0">
	<li class="mb-2">
	<a href="" class="text-blue-500 dark:text-blue-400" onclick="HTML2Pdf(event, '.${aiMessageUId}')">Export to PDF</a>
	</li>
	<li class="mb-2">
	<a href="" class="text-blue-500 dark:text-blue-400" onclick="HTML2Jpg(event, '.${aiMessageUId}')">Export to JPG</a>
	</li>
	<li>
	<a href="" class="text-blue-500 dark:text-blue-400" onclick="HTML2Word(event, '.${aiMessageUId}')">Export to DOCX</a>
	</li>
	<li>
	<a href="" class="cursor-not-allowed text-blue-500 dark:text-blue-400 decoration-underline" onclick="SuperHTML2Word(event, '.${aiMessageUId}')">Word Export Advance</a>
	</li>
	</ul>
	</div>
	</section>
	`;
	AutoScroll.checked ? scrollToBottom(chatArea) : null;
	window.addCopyListeners(); // Assuming this function adds copy functionality to code blocks
	// Debounce MathJax rendering to avoid freezing
	window.debounceRenderMathJax(aiMessageUId);
}

function displayUserAudio(path) {
	const container = document.createElement('section');
	const audioElement = document.createElement('audio');
	const loaderElement = document.createElement('div');
	const wrapper = document.createElement('div');
	wrapper.classList.add('flex', 'justify-end');

	// Add classes for styling (using Tailwind CSS)
	container.classList.add(
		'flex', 'justify-end', 'items-center', 'p-2', 'w-fit', 'rounded-lg', 'bg-blue-300', 'dark:bg-gray-700', 'my-2'
	);
	loaderElement.classList.add(
		'animate-spin', 'rounded-full', 'h-12', 'w-12', 'border-t-2', 'border-blue-500', 'ml-2'
	);

	// Set audio source
	audioElement.src = path;
	audioElement.controls = true; // Add controls for playback

	// Add loading animation
	loaderElement.innerHTML = ''; // You can leave this empty for a simple spinner

	// Append elements to the container
	container.appendChild(audioElement);
	container.appendChild(loaderElement);
	wrapper.appendChild(container);

	// Add container to main chat area
	chatArea.appendChild(wrapper);
	AutoScroll.checked ? scrollToBottom(chatArea) : null;
	loaderElement.addEventListener('LoaderHandler', removeLoader)
	// update current loader
	currentLoader = loaderElement
	currentAudioElement = container;
}

function removeLoader(event){
	event.target.remove();
}

async function main(fpath){
	try{
		document.getElementById('suggestions') ? document.getElementById('suggestions').classList.add('hidden') : "";

		//start timer
		timer.trackTime("start");

		window.HandleProcessingEventChanges('show')
		// Add audio to user interface
		displayUserAudio(fpath)
		//Read data from file
		const data = await window.electron.readFileData(fpath)

		// call automaticSpeechRecognition
		const response = await autoSpeech(data)

		// add ai reponse to the interface
		displayResponse(response)

		window.HandleProcessingEventChanges('hide')
		//stop timer
		timer.trackTime("stop");

		currentLoader.dispatchEvent(LoaderEvent);

		utilityScriptExists()

		return true;
	}catch(error){
		handleRequestError(error, fpath)
		console.log(error)
	}
}

function handleRequestError(error, fpath) {
	currentLoader.dispatchEvent(LoaderEvent);
	window.HandleProcessingEventChanges('hide')
	//interrupt timer
	timer.trackTime("interrupt");

	const errorContainer = document.getElementById('errorContainer');
	const errorArea = document.getElementById('errorArea');
	const closeModal = document.getElementById('closeEModal');
	const retry = document.getElementById('retryBt');

	closeModal.addEventListener('click', (event) => {
		event.stopPropagation();
		HideErrorModal();
	});

	function showError() {
		setTimeout(() => {
			errorContainer.classList.remove("hidden");
			errorContainer.classList.add('left-1/2', 'opacity-100', 'pointer-events-auto');
		}, 200); // 0.3 second delay
		let ErrorMs = (error.message === "Failed to fetch") ? "Connection Error: Check your Internet!" : error.message;
		errorArea.textContent = ErrorMs;
	}

	// Display error
	showError()

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

	async function retryHandler(){
		await HideErrorModal()
		currentAudioElement.remove()
		main(fpath)
	}
}

function utilityScriptExists(){
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
	// add export utility script
	// Sending a message to the main process if script does not exist already
	window.electron.send('toMain', { message: 'set-Utitility-Script' })
	return exists
}

const microphone = document.getElementById('microphone');
const microphoneSVG = document.getElementById('microphoneSVG');
const recordingModal = document.getElementById('recordingModal');
const recordingTime = document.getElementById('recordingTime');
const pauseButton = document.getElementById('pauseButton');
const startButton = document.getElementById('startButton');
const finishButton = document.getElementById('finishButton');
const cancelRecButton = document.getElementById('cancelButton');

let mediaRecorder;
let startTime;
let audioChunks = [];
let isRecording = false;
let timerInterval;
let elapsedTime = 0; // To track the elapsed time when paused
let isPaused = false;
let canSave = true;
let stream = null;


// Function to start recording
async function startRecording(task=null) {
	try {
		if (task === "release"){

		}
		microphoneSVG.classList.add('animate-pulse')

		finishButton.classList.remove('cursor-not-allowed')

		stream = await navigator.mediaDevices.getUserMedia({ audio: true });

		//Start Animation
		SetAudioAnim(stream);

		mediaRecorder = new MediaRecorder(stream);

		mediaRecorder.ondataavailable = event => {
			audioChunks.push(event.data);
		};

		mediaRecorder.onstop = async (event) => {
			if (canSave){
			const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

			microphoneSVG.classList.remove('animate-pulse')

			// Save the audioBlob to a temporary file
			const savePath = await window.electron.saveRecording(audioBlob);
			console.log(savePath)

			// Release microphone
			await ReleaseMediaDevice();

			// call main
			main(savePath)
			}
			audioChunks = [];
		};

		mediaRecorder.start();
		startTime = Date.now();
		isRecording = true;
		startButton.classList.add('hidden');
		pauseButton.classList.remove('hidden');
		startTimer();
	} catch (err) {
		console.error('Error accessing microphone:', err);
	}
}

async function ReleaseMediaDevice(){
	finishButton.classList.add('cursor-not-allowed')
	try{
		if (!stream) {
			console.error("Stream is undefined. Cannot stop tracks.");
			return; // Exit the function if stream is undefined
		}
		// Stop all tracks in the MediaStream
		stream.getTracks().forEach(track => track.stop());
		console.log("Media device released.");
	}catch(error){
		console.log(error);
	}
}


// Function to pause/resume recording
function pauseRecording() {
	if (isRecording) {
		mediaRecorder.pause();
		pauseButton.classList.add('hidden');
		startButton.classList.remove('hidden');
		clearInterval(timerInterval);
		isRecording = false;
		isPaused = true;
		microphoneSVG.classList.remove('animate-pulse')
		console.log("paused", isPaused)
	}
}

//Resume Recording
function ResumeRecording() {
	microphoneSVG.classList.add('animate-pulse')
	mediaRecorder.resume();
	pauseButton.classList.remove('hidden');
	startButton.classList.add('hidden');
	startTimer(true);
	isRecording = true;
	isPaused = false;
	console.log("Resumed", isPaused)
}
// Function to stop recording
async function finishRecording() {
	mediaRecorder.stop();
	clearInterval(timerInterval);
	recordingTime.textContent = '00:00:00';
	pauseButton.classList.add('hidden');
	startButton.classList.remove('hidden');
	isRecording = false;
	canSave = true;
	console.log("Finished Recording")
	hideModal();
	await ReleaseMediaDevice()
	microphoneSVG.classList.remove('animate-pulse')
}

// Function to cancel recording
async function cancelRecording() {
	try{
		mediaRecorder.stop();
	}catch(err){
		console.log(err)
	}

	clearInterval(timerInterval);
	recordingTime.textContent = '00:00:00';
	pauseButton.classList.add('hidden');
	startButton.classList.remove('hidden');
	isRecording = false;
	isPaused = false;
	canSave = false;
	console.log("Recording Cancelled")
	hideModal();
	await ReleaseMediaDevice()
	microphoneSVG.classList.remove('animate-pulse')
}

// Function to update the recording time
function startTimer(resume=false) {
	// Store the current time minus any previously elapsed time
	startTime = resume===true ? (Date.now() - elapsedTime) : startTime;
	// Start the interval
	timerInterval = setInterval(() => {
		elapsedTime = Date.now() - startTime;
		const formattedTime = formatTime(elapsedTime);
		recordingTime.textContent = formattedTime;
	}, 1000);
}

// Function to format the time
function formatTime(milliseconds) {
	const totalSeconds = Math.floor(milliseconds / 1000);
	const seconds = totalSeconds % 60;
	const minutes = Math.floor(totalSeconds / 60) % 60;
	const hours = Math.floor(totalSeconds / 3600);
	return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// Helper function to pad numbers with leading zeros
function pad(number) {
	return (number < 10 ? '0' : '') + number;
}

// Function to show the modal
function showModal() {
	recordingModal.classList.remove('hidden');
}

// Function to hide the modal
function hideModal() {
	recordingModal.classList.add('hidden');
}

// Event listeners for the buttons
startButton.addEventListener('click', ()=>{
	if (isPaused){
		ResumeRecording()
	}else{
		startRecording()
	}
});
pauseButton.addEventListener('click', pauseRecording);
finishButton.addEventListener('click', finishRecording);
cancelRecButton.addEventListener('click', cancelRecording);

//Add event listener to the microphone button to call showModal() and startRecording()
microphone.addEventListener('click', function (){
	showModal();
})
