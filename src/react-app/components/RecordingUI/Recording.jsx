import React, { useEffect, useState, useRef, useCallback } from 'react';
import { HfInference } from "@huggingface/inference";
import { RecordingAnimator } from '@js/animations/WaveForm.js'
import errorHandler from '@components/ErrorHandler/ErrorHandler.jsx';
import '@js/Utils/chatUtils.js'

export const Recording = ({ isOpen, onToggle }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [startTime, setStartTime] = useState(null);
    //const [Timerimer, setTimer] = useState(null);
    //const [currentLoader, setCurrentLoader] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(null);
    const [currentAudioElement, setCurrentAudioElement] = useState(null);
    //const [LoaderEvent, setLoaderEvent] = useState(null);
    const [hf_API_KEY, setHf_API_KEY] = useState(null);
    const [client, setClient] = useState(null);
    //const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [TimerInterval, setTimerInterval] = useState(null);
    //const [stream, setStream] = useState(null);

    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const isControlledCloseRef = useRef(false); // Track if WE initiated the close

    const refs = useRef({
        recordingModal: null,
        startButton: null,
        finishButton: null,
        cancelButton: null,
        recordingTimeEl: null,
        chatArea: null,
        AutoScroll: null,
        errorContainer: null,
        retry: null,
        closeModal: null,
        errorArea: null,
        microphone: null,
        microphoneSVG: null,
        pauseButton: null,
        cancelRecButton: null,
        canvas: null,
        RecAnimator: null,
        stream: null,
        mediaRecorder: null,
        canSave: true,
        currentLoader: null,
        Timer: null,
        datasize: 0,
    })

    // Add to your existing state
    const [audioMetadata, setAudioMetadata] = useState({
        duration: 0,
        fileSize: 0,
        format: 'WAV',
        bitrate: 128,
        sampleRate: 44100,
        channels: 1,
        startTime: null,
        peaks: [], // For waveform visualization
        pauseDuration: 0
    });


    // Handle opening
    useEffect(() => {
        if (isOpen) {
            //setShouldRender(true);
            // Wait for render then show with animation
            setTimeout(() => setIsVisible(true), 10);
        }
    }, [isOpen]);

    // Handle close animation then notify parent
    const handleClose = useCallback((notifyParent = true) => {
        closeRecording()
        setIsVisible(false);
        // Wait for animation to complete before unmounting
        setTimeout(() => {
            //setShouldRender(false);
            if (notifyParent) {
                onToggle(); // Only notify parent if this was user-initiated
            }
        }, 1000);
    }, [onToggle]);

    // Close when isOpen becomes false (only if WE didn't initiate it)
    useEffect(() => {
        if (!isOpen && isVisible && !isControlledCloseRef.current) {
            // This close was initiated by parent prop change
            handleClose(false); // Don't notify parent to avoid loop
        }
    }, [isOpen, isVisible, handleClose]);

    useEffect(() => {
        if (!isOpen) return;

        const currentRefs = refs.current;
        currentRefs.recordingModal = document.getElementById('recordingModal');
        currentRefs.cancelButton = document.getElementById('cancelButton');
        currentRefs.finishButton = document.getElementById('finishButton');
        currentRefs.startButton = document.getElementById('startButton');
        currentRefs.recordingTimeEl = document.getElementById('recordingTimeEl');
        currentRefs.AutoScroll = document.getElementById("AutoScroll");
        currentRefs.chatArea = document.getElementById("chatArea");
        currentRefs.errorContainer = document.getElementById('errorContainer')
        currentRefs.retry = document.getElementById('retryBt')
        currentRefs.closeModal = document.getElementById('closeEModal')
        currentRefs.errorArea = document.getElementById('errorArea')
        currentRefs.microphone = document.getElementById('microphone');
        currentRefs.microphoneSVG = document.getElementById('microphoneSVG');
        currentRefs.recordingModal = document.getElementById('recordingModal')
        currentRefs.recordingTimeEl = document.getElementById('recordingTimeEl');
        currentRefs.pauseButton = document.getElementById('pauseButton');
        currentRefs.startButton = document.getElementById('startButton');
        currentRefs.finishButton = document.getElementById('finishButton');
        currentRefs.cancelRecButton = document.getElementById('cancelButton');
        currentRefs.microphoneSVG = document.getElementById('microphoneSVG')
        currentRefs.canvas = document.getElementById("canvas")
        currentRefs.RecAnimator = new RecordingAnimator(canvas);

        async function getMedia() {
            currentRefs.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            currentRefs.mediaRecorder = new MediaRecorder(currentRefs.stream)
        }

        getMedia()
        currentRefs.Timer = new window.Timer;
        initialize()
    }, [isOpen])


    const startMetadataTracking = () => {
        //const startTime = Date.now();
        setAudioMetadata(prev => ({
            ...prev,
            fileSize: 0,
            peaks: [],
            pauseDuration: 0
        }));
    };

    const getStreamBitrate = (stream = refs.current.stream) => {
        const audioTrack = stream.getAudioTracks()[0];
        const constraints = audioTrack.getSettings();

        // Bitrate from constraints or estimate
        return constraints.bitrate ||
            constraints.sampleRate * (constraints.sampleSize || 16) / 1000 ||
            128; // fallback to 128kbps
    };

    const handleDataAvailable = (event) => {
        // Push the new chunk from the ongoing stream
        audioChunks.push(event?.data);

        // Calculate current total size by summing the sizes of all chunks so far
        const currentSize = audioChunks.reduce((total, chunk) => total + chunk?.size, 0);
        const sizeInMB = (currentSize / (1024 * 1024))?.toFixed(2);
        return sizeInMB;
    };

    const updateMetadata = useCallback((elapsed) => {
        if (isPaused) return;

        //const currentTime = Date.now();
        //const elapsed = elapsedTime //currentTime - startTime - audioMetadata.pauseDuration;

        const fileSize = handleDataAvailable()
        setAudioMetadata(prev => ({
            ...prev,
            fileSize: fileSize
        }));

        const bitrateElement = document.getElementById('bitrate');
        const fileSizeElement = document.getElementById('fileSize');
        const bitrate = getStreamBitrate()
        if (bitrate) {
            bitrateElement.textContent = `${bitrate}kbps`;
        }
        if (fileSizeElement && fileSize) {
            try {
                fileSizeElement.textContent = `${fileSize?.toFixed(1)} MB`;
            } catch (err) { }
        }
    }, [elapsedTime, audioMetadata]);

    const pauseMetadataTracking = () => {
        if (!audioMetadata.isRecording || audioMetadata.isPaused) return;

        setAudioMetadata(prev => ({
            ...prev,
            isPaused: true,
            pauseStart: Date.now()
        }));
    };

    const resumeMetadataTracking = () => {
        if (!audioMetadata.isRecording || !audioMetadata.isPaused) return;

        const pauseEnd = Date.now();
        const pauseDuration = pauseEnd - audioMetadata.pauseStart;

        setAudioMetadata(prev => ({
            ...prev,
            isPaused: false,
            pauseDuration: prev.pauseDuration + pauseDuration,
            pauseStart: null
        }));
    };

    const stopMetadataTracking = () => {
        const finalMetadata = { ...audioMetadata };
        setAudioMetadata(prev => ({
            ...prev,
            isRecording: false,
            isPaused: false
        }));

        return finalMetadata;
    };

    const initialize = useCallback(() => {
        const { RecAnimator } = refs.current

        // Initialize waveform animation
        RecAnimator.initAnimation()

        async function fetchApiKey() {
            await loadApiKey()
        }

        fetchApiKey()

        setClient(new HfInference(hf_API_KEY));

        openRecording()

    }, [hf_API_KEY])

    const openRecording = useCallback(() => {
        showModal()
    }, [])

    const closeRecording = useCallback(() => {
        hideModal()
    }, [])

    async function loadApiKey() {
        const key = await window.api.getKeys('huggingfacex');
        setHf_API_KEY(key.huggingfaceKey); // Assign to global variable
    }
    async function autoSpeech(data) {
        try {
            const output = await client.automaticSpeechRecognition({
                data,
                model: "openai/whisper-large-v3-turbo",
                provider: "hf-inference",
            });
            console.log(output);
            return output;
        } catch (err) {
            errorHandler.showError({
                title: "Speech Recognition Failed",
                message: "Unable to process audio. Please try again.",
                retryCallback: () => autoSpeech(data),
                onClose: () => console.log("Error modal closed"),
                autoCloseDelay: 5000
            });

        }
    }

    const useEventDispatcher = () => {
        const dispatchCustomEvent = (eventName, detail = {}, target = null) => {
            const event = new CustomEvent(eventName, {
                detail,
                bubbles: true,
                cancelable: true
            });
            target ? target.dispatchEvent(event) : document.dispatchEvent(event);
        };

        return dispatchCustomEvent;
    };

    const displayResponse = useCallback((text) => {
        if (!text) return;

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
        const { chatArea, AutoScroll } = refs.current;

        // Create main container
        const wrapper = document.createElement('div');
        wrapper.className = 'flex justify-end mb-3';

        const container = document.createElement('div');
        container.className = 'group relative flex items-center gap-3 p-3 bg-blue-500/10 dark:bg-blue-400/10 rounded-2xl rounded-br-md border border-blue-200/50 dark:border-blue-400/20 backdrop-blur-sm';

        // Create elegant audio player
        const audioElement = document.createElement('audio');
        audioElement.src = path;
        audioElement.controls = true;
        audioElement.className = 'audio-player w-40 [&::-webkit-media-controls-panel]:bg-blue-500 [&::-webkit-media-controls-panel]:rounded-lg';

        // Sophisticated loading state
        const loaderElement = document.createElement('div');
        loaderElement.className = 'flex items-center gap-2 text-blue-600 dark:text-blue-400';
        loaderElement.innerHTML = `
    <div class="flex space-x-1">
    <div class="w-1 h-4 bg-current rounded-full animate-wave"></div>
    <div class="w-1 h-4 bg-current rounded-full animate-wave" style="animation-delay: 0.1s"></div>
    <div class="w-1 h-4 bg-current rounded-full animate-wave" style="animation-delay: 0.2s"></div>
    </div>
    <span class="text-xs font-medium">Processing audio...</span>
    `;

        // Duration badge
        const durationBadge = document.createElement('div');
        durationBadge.className = 'text-xs text-gray-500 dark:text-gray-400 font-medium hidden';

        // Assemble
        container.appendChild(loaderElement);
        container.appendChild(audioElement);
        container.appendChild(durationBadge);
        wrapper.appendChild(container);
        chatArea.appendChild(wrapper);

        // Auto scroll
        AutoScroll?.checked && scrollToBottom(chatArea);

        // Audio events
        audioElement.addEventListener('loadedmetadata', () => {
            durationBadge.textContent = formatDuration(audioElement.duration);
            durationBadge.classList.remove('hidden');
        });

        audioElement.addEventListener('canplay', () => {
            loaderElement.classList.add('hidden');
            audioElement.classList.remove('hidden');
        });

        audioElement.addEventListener('error', () => {
            loaderElement.innerHTML = '<span class="text-xs text-red-500">Failed to load</span>';
        });

        // Store refs
        refs.current.currentLoader = loaderElement;
        setCurrentAudioElement(container);

    }, [setCurrentAudioElement]);

    // Helper function to format duration
    const formatDuration = (seconds) => {
        if (!seconds || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    function removeLoader(event) {
        event.target.remove();
    }

    const main = useCallback(async (fpath) => {
        try {
            document.getElementById('suggestions') ? document.getElementById('suggestions').classList.add('hidden') : "";

            //start Timerimer
            refs.current.Timer.trackTime("start");

            window.HandleProcessingEventChanges('show')
            // Add audio to user interface
            displayUserAudio(fpath)
            //Read data from file
            const data = await window.desk.apireadFileData(fpath)

            // call automaticSpeechRecognition
            const response = await autoSpeech(data)

            // add ai reponse to the interface
            displayResponse(response)

            window.HandleProcessingEventChanges('hide')
            //stop Timerimer
            refs.current.Timer.trackTime("stop");

            const dispatchEvent = useEventDispatcher();

            dispatchEvent('LoaderHandler', {
                action: 'show',
                message: 'Processing recording...'
            }, refs.current.currentLoader);

            utilityScriptExists()

            return true;
        } catch (err) {
            handleRequestError(err, fpath)
        }
    }, [])

    const handleRequestError = useCallback((error, fpath) => {
        const { currentAudioElement } = refs.current
        const dispatchEvent = useEventDispatcher();

        startMetadataTracking()

        dispatchEvent('LoaderHandler', {
            action: 'show',
            message: 'Processing recording...'
        }, refs.current.currentLoader);

        window.HandleProcessingEventChanges('hide')

        //interrupt Timer
        refs.current.Timer.trackTime("interrupt");

        let errorMS = (error.message === "Failed to fetch") ? "Connection Error: Check your Internet!" : error.message;

        errorHandler.showError({
            title: "Recorder Error",
            message: errorMS,
            retryCallback: () => retryHandler(),
            onClose: () => console.log("Error modal closed"),
            autoCloseDelay: 5000
        });

        async function retryHandler() {
            currentAudioElement?.remove()
            main(fpath)
        }
    }, [currentAudioElement])


    // Function to start recording
    const startRecording = useCallback(async (task = null) => {
        const { microphoneSVG, finishButton, RecAnimator, stream, mediaRecorder } = refs.current;
        try {
            if (task === "release") {

            }

            startMetadataTracking()

            microphoneSVG.classList.add('animate-pulse')

            finishButton.classList.remove('cursor-not-allowed')

            //Start Animation
            RecAnimator.SetAudioAnimation(stream);

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
                console.log("DataAvailable")
            };

            mediaRecorder.onstop = async (event) => {
                if (refs.current.canSave) {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

                    microphoneSVG.classList.remove('animate-pulse')

                    // Save the audioBlob to a temporary file
                    const savePath = await window.desk.apisaveRecording(audioBlob);

                    // Release microphone
                    ReleaseMediaDevice();
                    stopMetadataTracking();

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
            startMetadataTracking()
            console.error('Error accessing microphone:', err);
        }
    }, [audioChunks, setIsRecording])

    const ReleaseMediaDevice = useCallback(() => {
        const { finishButton, stream } = refs.current
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
    }, [])


    // Function to pause/resume recording
    const pauseRecording = useCallback(() => {
        const { microphoneSVG, mediaRecorder } = refs.current

        pauseMetadataTracking();

        if (isRecording) {
            mediaRecorder.pause();
            pauseButton.classList.add('hidden');
            startButton.classList.remove('hidden');
            clearInterval(TimerInterval);
            setIsRecording(false);
            setIsPaused(true);
            microphoneSVG.classList.remove('animate-pulse')
            console.log("paused", isPaused)
        }
    }, [TimerInterval, isPaused, setIsPaused, setIsRecording])

    //Resume Recording
    const ResumeRecording = useCallback(() => {
        const { microphoneSVG, mediaRecorder } = refs.current
        microphoneSVG.classList.add('animate-pulse')
        mediaRecorder.resume();
        pauseButton.classList.remove('hidden');
        startButton.classList.add('hidden');
        startTimer(true);
        setIsRecording(true);
        setIsPaused(false);

        resumeMetadataTracking()
        console.log("Resumed", isPaused)
    }, [TimerInterval, setIsPaused, setIsPaused, setIsRecording])

    // Function to stop recording
    const finishRecording = useCallback(async () => {
        const { microphoneSVG, recordingTimeEl, mediaRecorder } = refs.current
        mediaRecorder.stop();
        clearInterval(TimerInterval);
        recordingTimeEl.textContent = '00:00:00';
        pauseButton.classList.add('hidden');
        startButton.classList.remove('hidden');
        setIsRecording(false);
        refs.current.canSave = true;
        console.log("Finished Recording")
        hideModal();
        ReleaseMediaDevice()

        stopMetadataTracking()
        // Close Recorder
        onToggle()
        microphoneSVG.classList.remove('animate-pulse')
    }, [TimerInterval, setIsRecording])

    // Function to cancel recording
    const cancelRecording = useCallback(async () => {
        const { microphoneSVG, recordingTimeEl, mediaRecorder } = refs.current
        try {
            mediaRecorder.stop();
        } catch (err) {
            console.log(err)
        }

        clearInterval(TimerInterval);
        recordingTimeEl.textContent = '00:00:00';
        pauseButton.classList.add('hidden');
        startButton.classList.remove('hidden');
        setIsRecording(false);
        setIsPaused(false);
        refs.current.canSave = false;
        console.log("Recording Cancelled")
        hideModal();
        ReleaseMediaDevice()
        microphoneSVG.classList.remove('animate-pulse')

        stopMetadataTracking()
        // Close Recorder
        onToggle()
    }, [TimerInterval, setIsPaused, setIsRecording])

    // Function to update the recording time
    const startTimer = useCallback((resume = false) => {
        const { recordingTimeEl } = refs.current;
        const _startTime = resume ? (Date.now() - elapsedTime) : Date.now();
        setStartTime(_startTime);

        const interval = setInterval(() => {
            const newElapsed = Date.now() - _startTime; // Calculate elapsed here, using latest timestamp
            setElapsedTime(newElapsed);

            updateMetadata(newElapsed)

            const formattedTime = formatTime(newElapsed);
            if (recordingTimeEl) {
                recordingTimeEl.textContent = formattedTime;
            }
            console.log("Update Timer", newElapsed, formattedTime, recordingTimeEl?.textContent);
        }, 1000);

        setTimerInterval(interval);
    }, [elapsedTime, setElapsedTime, setStartTime, setTimerInterval, refs]);

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


    const closeOnclick = useCallback((e) => {
        const { canvas } = refs.current
        const recContent = document.getElementById('recorder-content')

        if ((canvas?.contains(e.target)) || (recContent?.contains(e.target))) return;
        onToggle()
    })
    if (!isOpen) return null;

    return (
        <div onClick={closeOnclick} id="recordingModal" className="hidden fixed inset-0 z-50 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-md overflow-y-auto transition-all duration-500">
            <div className="relative flex items-center justify-center min-h-screen p-4">
                {/* Animated Canvas Background */}
                <canvas className="absolute md:max-w-md lg:max-w-lg xl:max-w-xl md:max-h-md lg:max-h-lg xl:max-h-xl z-[1] bg-gradient-to-br from-white to-gray-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-600/50 transition-all duration-700 transform hover:scale-105" id="canvas"></canvas>

                {/* Recording Content */}
                <section id="recorder-content" className="absolute z-10 w-full max-w-md">
                    <div className="bg-white/10 dark:bg-slate-800/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 dark:border-slate-600/30 overflow-hidden transition-all duration-500 hover:shadow-3xl">
                        {/* Header */}
                        <div className="px-6 pt-6 pb-4 border-b border-gray-200/50 dark:border-slate-600/50">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent transition-all duration-500">
                                    Voice Recorder
                                </h2>

                                {/* Recording Status Indicator */}
                                <div className="flex items-center space-x-2">
                                    <div id="recordingStatus" className="flex items-center space-x-1">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse hidden" id="recordingDot"></div>
                                        <span id="statusText" className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Ready</span>
                                    </div>
                                </div>
                            </div>

                            {/* Visualizer Placeholder */}
                            <div className="mt-4 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div id="audioVisualizer" className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-100 transform scale-x-0 origin-left"></div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="p-6">
                            {/* Timer Display */}
                            <div className="flex items-center justify-center mb-8">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-50 animate-pulse"></div>
                                    <span id="recordingTimeEl" className="relative text-4xl font-mono font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent transition-all duration-300">
                                        00:00:00
                                    </span>
                                </div>
                            </div>

                            {/* Control Buttons */}
                            <div className="flex justify-center items-center space-x-3 mb-4">
                                {/* Cancel Button */}
                                <button onClick={cancelRecording} id="cancelButton" className="group flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" title="Cancel recording">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {/* Pause/Resume Button */}
                                <button onClick={pauseRecording} id="pauseButton" className="group  flex items-center justify-center hidden w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">
                                    <svg id="pauseIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                                    </svg>
                                    <svg id="resumeIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 hidden">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                    </svg>
                                </button>

                                {/* Start/Stop Button */}
                                <button onClick={StartPause} id="startButton" className="group flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-green-200/50 dark:ring-emerald-400/20">
                                    <svg id="startIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8 transform group-hover:scale-110 transition-transform duration-300">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.253c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.253z" />
                                    </svg>
                                    <svg id="stopIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8 hidden transform group-hover:scale-110 transition-transform duration-300">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                                    </svg>
                                </button>

                                {/* Finish Button */}
                                <button onClick={finishRecording} id="finishButton" className="group flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" title="Save recording">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-300">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Additional Info */}
                            <div className="text-center mt-4">
                                <p id="recordingHint" className="text-sm text-gray-500 dark:text-gray-400 transition-all duration-300">
                                    Click start to begin recording
                                </p>

                                {/* Recording Quality Info */}
                                <div className="flex items-center justify-center space-x-4 mt-3 text-xs text-gray-400 dark:text-gray-500">
                                    <span>🎤</span>
                                    <span>High Quality</span>
                                    <span>•</span>
                                    <span id="fileSize" className='text-blue-500 font-lightest '>0MB</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50/50 dark:bg-slate-700/50 border-t border-gray-200/50 dark:border-slate-600/50">
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>Press ESC to close</span>
                                <span id="recordingFormat" className='flex gap-2'>MP3 • <span id="bitrate" className=''>128kbps</span></span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
