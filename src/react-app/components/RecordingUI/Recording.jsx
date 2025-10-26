import React, { useEffect, useState, useRef, useCallback } from 'react';
import { HfInference } from "@huggingface/inference";

export const Recording = ({ isOpen, onToggleRecording }) => {
    const { isPaused, setIsPaused } = useState(true);
    const { startTime, setStartTime } = useState(true);
    const { timer, setTimer } = useState(null);
    const { currentLoader, setCurrentLoader } = useState(0);
    const { elapsedTime, setElapsedTime } = useState(null);
    const { currentAudioElement, setCurrentAudioElement } = useState(null);
    const { LoaderEvent, setLoaderEvent } = useState(null);
    const { hf_API_KEY, setHf_API_KEY } = useState(null);
    const { client, setClient } = useState(null);
    const { mediaRecorder, setMediaRecorder } = useState(null);
    const { audioChunks, setAudioChunks } = useState([]);
    const { isRecording, setIsRecording } = useState(false);
    const { timerInterval, setTimerInterval } = useState(null);
    const { canSave, setCanSave } = useState(true);
    const { stream, setStream } = useState(null);

    const refs = useRef({
        recordingModal: null,
        startButton: null,
        finishButton: null,
        cancelButton: null,
        recordingTime: null,
        chatArea: null,
        AutoScroll: null,
        errorContainer: null,
        closeModal: null,
        retry: null,
        closeModal: null,
        errorArea: null,
        microphone: null,
        microphoneSVG: null,
        recordingModal: null,
        recordingTime: null,
        pauseButton: null,
        startButton: null,
        finishButton: null,
        cancelRecButton: null,
        microphoneSVG: null
    })

    useEffect(() => {
        if (!isOpen) return;

        const currentRefs = refs.current;
        currentRefs.recordingModal = document.getElementById('recordingModal');
        currentRefs.cancelButton = document.getElementById('cancelButton');
        currentRefs.finishButton = document.getElementById('finishButton');
        currentRefs.startButton = document.getElementById('startButton');
        currentRefs.recordingTime = document.getElementById('recordingTime');
        currentRefs.AutoScroll = document.getElementById("AutoScroll");
        currentRefs.chatArea = document.getElementById("chatArea");
        currentRefs.errorContainer = document.getElementById('errorContainer')
        currentRefs.retry = document.getElementById('retryBt')
        currentRefs.closeModal = document.getElementById('closeEModal')
        currentRefs.errorArea = document.getElementById('errorArea')
        currentRefs.microphone = document.getElementById('microphone');
        currentRefs.microphoneSVG = document.getElementById('microphoneSVG');
        currentRefs.recordingModal = document.getElementById('recordingModal')
        currentRefs.recordingTime = document.getElementById('recordingTime');
        currentRefs.pauseButton = document.getElementById('pauseButton');
        currentRefs.startButton = document.getElementById('startButton');
        currentRefs.finishButton = document.getElementById('finishButton');
        currentRefs.cancelRecButton = document.getElementById('cancelButton');
        currentRefs.microphoneSVG = document.getElementById('microphoneSVG')

        setLoaderEvent(new CustomEvent('LoaderHandler', {detail: {message: 'Loader did its purpose!'}}))
        //setTimer(new window.Timer)

        async function fetchApiKey() {
            await loadApiKey()
        }

        fetchApiKey()

        setClient(new HfInference(hf_API_KEY));
    }, [isOpen, setTimer, setLoaderEvent])


    async function loadApiKey() {
        const key = await window.api.getKeys('huggingfacex');
        setHf_API_KEY(key.huggingfaceKey); // Assign to global variable
    }

    async function autoSpeech(data) {

        const output = await client.automaticSpeechRecognition({
            data,
            model: "openai/whisper-large-v3-turbo",
            provider: "hf-inference",
        });

        console.log(output);
        return output
    }

    const displayResponse = useCallback((text) => {
        const { chatArea, AutoScroll } = refs.current;
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
        window.addCopyListeners();
        // Debounce MathJax rendering to avoid freezing
        window.debounceRenderMathJax(aiMessageUId);
    }, [])

    const displayUserAudio = useCallback((path) => {
        const { chatArea, AutoScroll } = refs.current
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
        setCurrentLoader(loaderElement);
        setCurrentAudioElement(container);
    }, [setCurrentLoader, setCurrentAudioElement])

    function removeLoader(event) {
        event.target.remove();
    }

    async function main(fpath) {
        try {
            const { timer } = refs.current;

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
        } catch (error) {
            handleRequestError(error, fpath)
            console.log(error)
        }
    }

    const handleRequestError = useCallback((error, fpath) => {
        const { errorContainer, currentAudioElement, retry, errorArea, closeModal, timer } = refs.current
        currentLoader.dispatchEvent(LoaderEvent);
        window.HandleProcessingEventChanges('hide')
        //interrupt timer
        timer.trackTime("interrupt");

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

        async function retryHandler() {
            await HideErrorModal()
            currentAudioElement.remove()
            main(fpath)
        }
    }, [currentLoader, currentAudioElement, LoaderEvent])


    // Function to start recording
    const startRecording = useCallback(async (task = null) => {
        const { microphoneSVG, finishButton } = refs.current;
        try {
            if (task === "release") {

            }
            microphoneSVG.classList.add('animate-pulse')

            finishButton.classList.remove('cursor-not-allowed')

            setStream(await navigator.mediaDevices.getUserMedia({ audio: true }));

            //Start Animation
            SetAudioAnim(stream);

            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async (event) => {
                if (canSave) {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

                    microphoneSVG.classList.remove('animate-pulse')

                    // Save the audioBlob to a temporary file
                    const savePath = await window.electron.saveRecording(audioBlob);
                    console.log(savePath)

                    // Release microphone
                    ReleaseMediaDevice();

                    // call main
                    main(savePath)
                }
                setAudioChunks([]);
            };

            mediaRecorder.start();
            setStartTime(Date.now());
            setIsRecording(true);
            startButton.classList.add('hidden');
            pauseButton.classList.remove('hidden');
            startTimer();
        } catch (err) {
            console.error('Error accessing microphone:', err);
        }
    }, [mediaRecorder, stream, audioChunks, setStream, canSave, setCanSave, setIsRecording])

    const ReleaseMediaDevice = useCallback(() => {
        const { finishButton } = refs.current
        finishButton.classList.add('cursor-not-allowed')
        try {
            if (!stream) {
                console.error("Stream is undefined. Cannot stop tracks.");
                return; // Exit the function if stream is undefined
            }
            // Stop all tracks in the MediaStream
            stream.getTracks().forEach(track => track.stop());
            console.log("Media device released.");
        } catch (error) {
            console.log(error);
        }
    }, [stream])


    // Function to pause/resume recording
    const pauseRecording = useCallback(() => {
        const { microphoneSVG } = refs.current

        if (isRecording) {
            mediaRecorder.pause();
            pauseButton.classList.add('hidden');
            startButton.classList.remove('hidden');
            clearInterval(timerInterval);
            setIsRecording(false);
            setIsPaused(true);
            microphoneSVG.classList.remove('animate-pulse')
            console.log("paused", isPaused)
        }
    }, [mediaRecorder, timerInterval, isPaused, setIsPaused, setIsRecording])

    //Resume Recording
    const ResumeRecording = useCallback(() => {
        const { microphoneSVG } = refs.current
        microphoneSVG.classList.add('animate-pulse')
        mediaRecorder.resume();
        pauseButton.classList.remove('hidden');
        startButton.classList.add('hidden');
        startTimer(true);
        setIsRecording(true);
        setIsPaused(false);
        console.log("Resumed", isPaused)
    }, [mediaRecorder, timerInterval, setIsPaused, setIsPaused, setIsRecording])

    // Function to stop recording
    const finishRecording = useCallback(async () => {
        const { microphoneSVG, recordingTime } = refs.current
        mediaRecorder.stop();
        clearInterval(timerInterval);
        recordingTime.textContent = '00:00:00';
        pauseButton.classList.add('hidden');
        startButton.classList.remove('hidden');
        setIsRecording(false);
        setCanSave(true);
        console.log("Finished Recording")
        hideModal();
        await ReleaseMediaDevice()
        microphoneSVG.classList.remove('animate-pulse')
    }, [mediaRecorder, timerInterval, setCanSave, setIsRecording])

    // Function to cancel recording
    const cancelRecording = useCallback(async () => {
        const { microphoneSVG, recordingTime } = refs.current
        try {
            mediaRecorder.stop();
        } catch (err) {
            console.log(err)
        }

        clearInterval(timerInterval);
        recordingTime.textContent = '00:00:00';
        pauseButton.classList.add('hidden');
        startButton.classList.remove('hidden');
        setIsRecording(false);
        setIsPaused(false);
        setCanSave(false);
        console.log("Recording Cancelled")
        hideModal();
        await ReleaseMediaDevice()
        microphoneSVG.classList.remove('animate-pulse')
    }, [mediaRecorder, timerInterval, setCanSave, setIsPaused, setIsRecording])

    // Function to update the recording time
    const startTimer = useCallback((resume = false) => {
        // Store the current time minus any previously elapsed time
        const { recordingTime, startTime, elapsedTime } = refs.current
        startTime = resume === true ? (Date.now() - elapsedTime) : startTime;
        // Start the interval
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            const formattedTime = formatTime(elapsedTime);
            recordingTime.textContent = formattedTime;
        }, 1000);
    }, [])

    // Helper function to pad numbers with leading zeros
    function pad(number) {
        return (number < 10 ? '0' : '') + number;
    }

    // Function to format the time
    function formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 3600);
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    // Function to show the modal
    const showModal = useCallback(() => {
        const { recordingModal } = refs.current;
        recordingModal.classList.remove('hidden');
    }, [])

    // Function to hide the modal
    const hideModal = useCallback(() => {
        const { recordingModal } = refs.current;
        recordingModal.classList.add('hidden');
    }, [])

    // Handle start/Pause
    const StartPause = useCallback(() => {
        if (isPaused) {
            ResumeRecording()
        } else {
            startRecording()
        }
    }, [isPaused])

    // Event Listeners
    useEffect(() => {
        const { pauseButton, finishButton, cancelButton, startButton} = refs.current
        pauseButton?.addEventListener('click', pauseRecording);
        finishButton?.removeEventListener('click', finishRecording);
        cancelButton?.removeEventListener('click', cancelRecording);
        startButton?.addEventListener('click', StartPause);

        // Clear event Listeners
        return () => {
            pauseButton?.removeEventListener('click', pauseRecording);
            finishButton?.removeEventListener('click', finishRecording);
            cancelButton?.removeEventListener('click', cancelRecording);
            startButton?.removeEventListener('click', StartPause);
        }
    }, [pauseRecording, finishRecording, cancelRecording]);

    if (!isOpen) return null;

    return (
        < div id="recordingModal" className="hidden fixed inset-0 z-50 bg-blue-400/20 overflow-y-auto" >
            <div className="relative flex items-center justify-center min-h-screen">
                <canvas className="absolute md:max-w-md lg:max-w-lg xl:max-w-xl md:max-h-md lg:max-h-lg xl:max-h-xl z-1 bg-white dark:bg-slate-950 rounded-lg shadow-lg transition-colors duration-1000" id="canvas"></canvas>
                <section className="absolute z-10">
                    <div className="relative px-4 w-full max-w-md">
                        <div className="bg-opacity-0">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 border-b-2 border-gray-300 dark:border-sky-400 pb-2 italic transition-colors duration-1000">Recorder</h2>
                            <div className="p-6">
                                <div className="flex items-center justify-center">
                                    <span id="recordingTime" className="text-3xl text-blue-500 dark:text-white font-bold transition-colors duration-1000">00:00:00</span>
                                </div>

                                <div className="flex justify-center mt-6 space-x-4">
                                    <button id="pauseButton" className="hidden bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-full size-14 transition-colors duration-1000">
                                        {/*--pause svg disabled when not recording--*/}
                                        <svg id="pauseIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                                        </svg>
                                    </button>
                                    <button id="startButton" className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-full size-14 transition-colors duration-1000">
                                        {/*--start svg --*/}
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                        </svg>
                                    </button>

                                    <button id="finishButton" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full size-14 cursor-not-allowed transition-colors duration-1000">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </button>

                                    <button id="cancelButton" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full size-14 transition-colors duration-1000">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div >
    );
};
