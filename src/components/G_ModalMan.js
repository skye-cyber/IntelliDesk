class GHandler{
    constructor(){
        this.modals = [
        {
            name: "recording",
            html:`
            <!--Recording modal-->
            <div id="recordingModal" class="hidden fixed inset-0 z-50 bg-blue-400/20 overflow-y-auto">
                <div class="relative flex items-center justify-center min-h-screen">
                    <canvas class="absolute md:max-w-md lg:max-w-lg xl:max-w-xl md:max-h-md lg:max-h-lg xl:max-h-xl z-1 bg-white dark:bg-slate-950 rounded-lg shadow-lg transition-colors duration-1000" id="canvas"></canvas>
                    <section class="absolute z-10">
                        <div class="relative px-4 w-full max-w-md">
                        <div class="bg-opacity-0">
                            <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 border-b-2 border-gray-300 dark:border-sky-400 pb-2 italic transition-colors duration-1000">Recorder</h2>
                            <div class="p-6">
                            <div class="flex items-center justify-center">
                                <span id="recordingTime" class="text-3xl text-blue-500 dark:text-white font-bold transition-colors duration-1000">00:00:00</span>
                            </div>

                            <div class="flex justify-center mt-6 space-x-4">
                                <button id="pauseButton" class="hidden bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-full size-14 transition-colors duration-1000">
                                    <!--pause svg disabled when not recording-->
                                    <svg id="pauseIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                                    </svg>
                                </button>
                                <button id="startButton" class="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-full size-14 transition-colors duration-1000">
                                    <!--start svg -->
                                    <svg class="" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                    </svg>
                                </button>

                                <button id="finishButton" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full size-14 cursor-not-allowed transition-colors duration-1000">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                </button>

                                <button id="cancelButton" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full size-14 transition-colors duration-1000">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="w-6 h-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                </button>
                            </div>
                            </div>
                        </div>
                        </div>
                    </section>
                </div>
            </div>
            `
        },
        {
            name: "dropzone",
            html:`
            <div id="dropZoneModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-40 hidden z-40 transition-colors duration-1000">
                <section id="dropZoneContent" title="Attach files" class="relative p-3 bg-white dark:bg-stone-800 rounded-xl shadow-lg w-full h-full md:mx-auto max-w-[70vw] max-h-[70vh] md:max-h-[80vh] lg:md:max-w-[50vw] mb-16 transition-colors duration-1000" >
                    <button id="closeFileEModal" title="Close" class="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:rotate-90 transition-colors duration-1000">
                        <svg class="fill-current h-5 w-5" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.65-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"></path>
                        </svg>
                    </button>
                    <h2 class="text-2xl font-semibold text-blue-700 dark:text-sky-300 mb-6">Upload File</h2>
                    <div id="dropZone" class="p-4 rounded-xl border-2 border-dashed border-blue-400 dark:border-cyan-400 w-full h-full md:mx-auto max-w-[calc(70vw-30px)] max-h-[calc(70vh-20vh)] md:max-h-[calc(80vh-20vh] cursor-pointer transition-colors duration-1000" onclick="event.stopPropagation()">
                        <div class="flex flex-col items-center justify-center h-full">
                            <div id="dropZoneSVG" class="flex items-center justify-center">
                                <svg class="fill-current h-12 w-12 text-blue-400 dark:text-blue-300 transition-colors duration-1000" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                                    <path d="M14 2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z"></path>
                                </svg>
                            </div>
                            <p id="dropZoneText" class="text-gray-600 dark:text-gray-300 text-lg mb-4 transition-colors duration-1000">Drag & drop files here or <span class="text-cyan-400 dark:text-blue-400">click to select</span></p>
                            <!-- Modal Trigger Button -->
                            <button id="modalTrigger" onclick="document.getElementById('previewModal').classList.remove('hidden')" class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white font-semibold py-2.5 px-6 rounded-full shadow-md transition-colors duration-1000 focus:outline-none focus:ring-2 focus:ring-purple-400">
                                <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                                Preview Files
                            </button>
                        </div>
                    </div>
                    <section class="w-[calc(70vw-30px)] lg:max-w-[calc(50vw-30px)] absolute bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-200 dark:bg-gradient-to-r dark:from-purple-800 dark:via-pink-800 dark:to-indigo-800 flex space-x-2 bottom-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2 transition-colors duration-1000">
                        <textarea type="text" aria-label="prompt input field" title="prompt field" id="imagePrompt" class="w-full pt-2 scrollbar-hide resize-none text-black dark:text-white max-h-[10vh] overflow-wrap rows-2 bg-transparent focus:outline-none" oninput="this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px';" placeholder="Enter your prompt here"></textarea>
                        <div class="flex items-center justify-end">
                            <button id="submitImage" aria-label="submit button" title="submit" class="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg focus:outline-none hover:from-blue-600 hover:to-purple-700 w-fit">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </section>
                </section>
            </div>
            `
        },
        {
            name: "previewModal",
            html:`
            <div id="previewModal" class="hidden fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ease-in-out">
                <div class="relative p-3 bg-white dark:bg-slate-800 rounded-xl shadow-2xl md:mx-auto min-w-[30vw] max-w-[calc(70vw-30px)] max-h-[calc(70vh-20vh)] md:max-h-[calc(80vh-20vh)] overflow-hidden transform transition-transform duration-300 ease-out scale-95 transition-colors duration-1000" id="modalContent">
                    <h2 class="text-2xl font-semibold text-blue-600 dark:text-sky-400 mb-1 transition-colors duration-1000">Preview Files</h2>
                    <div class="overflow-hidden">
                        <div id="uploadedFiles" class="pb-4 mb-2 rounde-lg dark:bg-[#002a3d] p-2 space-y-3 max-h-[calc(60vh-100px)] overflow-y-auto scrollbar-hide transition-colors duration-1000">
                            <p class="font-bold mb-12 px-12 text-cyan-600 dark:text-teal-400 transition-colors duration-1000">No files uploaded yet.</p>
                        </div>
                    </div>
                    <div class="absolute bottom-0 right-0.5 z-60 w-24 p-2 border-t border-gray-200 dark:border-[#4d7339] flex justify-end v">
                        <button id="closeModal" onclick="document.getElementById('previewModal').classList.add('hidden')" class="bg-gradient-to-r from-red-500 to-pink-600 hover:from-pink-600 hover:to-red-500 text-white font-semibold py-2 px-5 rounded-full shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-1000">
                            Close
                        </button>
                    </div>
                </div>
            </div>
            `
        },
        {
            name: "fileInput",
            html:`
            <input multiple class="absolute opacity-0" accept=".txt, .doc, .docx, .rtf, .md, .markdown, .epub, .mobi, .pdf, .png, .jpg, .jpeg, .svg, .gif, .bmp" type="file" id="fileInput" onclick="handleFileInputClick();"/>
            `
        },
        {
            name: "chatOptions",
            html:`
            <!-- Conversation options -->
            <!-- Background Overlay -->
            <div id="chatOptions-overlay" class="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 hidden w-full h-full">

            <!-- Main Modal -->
            <div id="chatOptions" class="fixed flex inset-0 items-center justify-center rounded-lg shadow-xl z-50 animate-exit">
            <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full bg-gradient-to-r from-blue-400 to-sky-400">
            <div class="text-center">
            <h2 class="text-2xl font-semibold text-gray-800 mb-6">Options</h2>
            <section class="grid grid-rows-2 space-y-4">
            <div class="flex flex-row justify-center space-x-4">
            <button id="renameOption" class="bg-blue-800 text-white p-1 rounded-lg w-full shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
            Rename
            </button>
            <button id="DeleteOption" class="bg-red-500 text-white p-2 rounded-lg w-full shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
            Delete
            </button>
            </div>
            <div class="items-center">
            <button id="renameOptionsBt" class="bg-gray-300 text-gray-700 mt-4 p-3 rounded-lg w-fit shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
            Cancel
            </button>
            </div>
            </section>
            </div>
            </div>
            </div>

            <div id="confirm-delete-modal" class="fixed inset-0 w-full h-full bg-black/30 flex items-center justify-center overflow-y-auto z-50 -translate-x-full transition-transform duration-700 ease-in-out transform">
            <div id="confirm-delete-box" class="bg-white text-center p-4 rounded-lg shadow-xl max-w-md">
            <h2 class="text-2xl font-semibold text-gray-800 mb-6">Confirm Deletion</h2>
            <p class="text-gray-700 mb-4">Are you sure you want to delete this item?</p>
            <div class="flex justify-between space-x-4">
            <button id="CancelDeleteBt" class="bg-blue-500 text-white p-3 rounded-lg w-1/2 shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
            Cancel
            </button>
            <button id="ConfirmDelete" class="bg-red-500 text-white p-3 rounded-lg w-1/2 shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
            Delete
            </button>
            </div>
            </div>
            </div>
            </div>
            `
        },
        {
            name: "",
            html:``
        },
        {
            name: "",
            html:``
        },
        {
            name: "",
            html:``
        },
        {
            name: "",
            html:``
        },
        {
            name: "",
            html:``
        },
        {
            name: "",
            html:``
        },
        {
            name: "",
            html:``
        },
        ]
        this.modalSectionContent = `
        <!--Recording modal-->
        <div id="recordingModal" class="hidden fixed inset-0 z-50 bg-blue-400/20 overflow-y-auto">
            <div class="relative flex items-center justify-center min-h-screen">
                <canvas class="absolute md:max-w-md lg:max-w-lg xl:max-w-xl md:max-h-md lg:max-h-lg xl:max-h-xl z-1 bg-white dark:bg-slate-950 rounded-lg shadow-lg transition-colors duration-1000" id="canvas"></canvas>
                <section class="absolute z-10">
                    <div class="relative px-4 w-full max-w-md">
                    <div class="bg-opacity-0">
                        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 border-b-2 border-gray-300 dark:border-sky-400 pb-2 italic transition-colors duration-1000">Recorder</h2>
                        <div class="p-6">
                        <div class="flex items-center justify-center">
                            <span id="recordingTime" class="text-3xl text-blue-500 dark:text-white font-bold transition-colors duration-1000">00:00:00</span>
                        </div>

                        <div class="flex justify-center mt-6 space-x-4">
                            <button id="pauseButton" class="hidden bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-full size-14 transition-colors duration-1000">
                                <!--pause svg disabled when not recording-->
                                <svg id="pauseIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                                </svg>
                            </button>
                            <button id="startButton" class="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-full size-14 transition-colors duration-1000">
                                <!--start svg -->
                                <svg class="" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                </svg>
                            </button>

                            <button id="finishButton" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full size-14 cursor-not-allowed transition-colors duration-1000">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            </button>

                            <button id="cancelButton" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full size-14 transition-colors duration-1000">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            </button>
                        </div>
                        </div>
                    </div>
                    </div>
                </section>
            </div>
        </div>

        <div id="dropZoneModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-40 hidden z-40 transition-colors duration-1000">
            <section id="dropZoneContent" title="Attach files" class="relative p-3 bg-white dark:bg-stone-800 rounded-xl shadow-lg w-full h-full md:mx-auto max-w-[70vw] max-h-[70vh] md:max-h-[80vh] lg:md:max-w-[50vw] mb-16 transition-colors duration-1000" >
                <button id="closeFileEModal" title="Close" class="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:rotate-90 transition-colors duration-1000">
                    <svg class="fill-current h-5 w-5" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.65-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"></path>
                    </svg>
                </button>
                <h2 class="text-2xl font-semibold text-blue-700 dark:text-sky-300 mb-6">Upload File</h2>
                <div id="dropZone" class="p-4 rounded-xl border-2 border-dashed border-blue-400 dark:border-cyan-400 w-full h-full md:mx-auto max-w-[calc(70vw-30px)] max-h-[calc(70vh-20vh)] md:max-h-[calc(80vh-20vh] cursor-pointer transition-colors duration-1000" onclick="event.stopPropagation()">
                    <div class="flex flex-col items-center justify-center h-full">
                        <div id="dropZoneSVG" class="flex items-center justify-center">
                            <svg class="fill-current h-12 w-12 text-blue-400 dark:text-blue-300 transition-colors duration-1000" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                                <path d="M14 2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z"></path>
                            </svg>
                        </div>
                        <p id="dropZoneText" class="text-gray-600 dark:text-gray-300 text-lg mb-4 transition-colors duration-1000">Drag & drop files here or <span class="text-cyan-400 dark:text-blue-400">click to select</span></p>
                        <!-- Modal Trigger Button -->
                        <button id="modalTrigger" onclick="document.getElementById('previewModal').classList.remove('hidden')" class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white font-semibold py-2.5 px-6 rounded-full shadow-md transition-colors duration-1000 focus:outline-none focus:ring-2 focus:ring-purple-400">
                            <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                            Preview Files
                        </button>
                    </div>
                </div>
                <section class="w-[calc(70vw-30px)] lg:max-w-[calc(50vw-30px)] absolute bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-200 dark:bg-gradient-to-r dark:from-purple-800 dark:via-pink-800 dark:to-indigo-800 flex space-x-2 bottom-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2 transition-colors duration-1000">
                    <textarea type="text" aria-label="prompt input field" title="prompt field" id="imagePrompt" class="w-full pt-2 scrollbar-hide resize-none text-black dark:text-white max-h-[10vh] overflow-wrap rows-2 bg-transparent focus:outline-none" oninput="this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px';" placeholder="Enter your prompt here"></textarea>
                    <div class="flex items-center justify-end">
                        <button id="submitImage" aria-label="submit button" title="submit" class="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg focus:outline-none hover:from-blue-600 hover:to-purple-700 w-fit">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </section>
            </section>
        </div>

        <!-- Modal Structure -->
        <div id="previewModal" class="hidden fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ease-in-out">
            <div class="relative p-3 bg-white dark:bg-slate-800 rounded-xl shadow-2xl md:mx-auto min-w-[30vw] max-w-[calc(70vw-30px)] max-h-[calc(70vh-20vh)] md:max-h-[calc(80vh-20vh)] overflow-hidden transform transition-transform duration-300 ease-out scale-95 transition-colors duration-1000" id="modalContent">
                <h2 class="text-2xl font-semibold text-blue-600 dark:text-sky-400 mb-1 transition-colors duration-1000">Preview Files</h2>
                <div class="overflow-hidden">
                    <div id="uploadedFiles" class="pb-4 mb-2 rounde-lg dark:bg-[#002a3d] p-2 space-y-3 max-h-[calc(60vh-100px)] overflow-y-auto scrollbar-hide transition-colors duration-1000">
                        <p class="font-bold mb-12 px-12 text-cyan-600 dark:text-teal-400 transition-colors duration-1000">No files uploaded yet.</p>
                    </div>
                </div>
                <div class="absolute bottom-0 right-0.5 z-60 w-24 p-2 border-t border-gray-200 dark:border-[#4d7339] flex justify-end v">
                    <button id="closeModal" onclick="document.getElementById('previewModal').classList.add('hidden')" class="bg-gradient-to-r from-red-500 to-pink-600 hover:from-pink-600 hover:to-red-500 text-white font-semibold py-2 px-5 rounded-full shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-1000">
                        Close
                    </button>
                </div>
            </div>
        </div>

        <input multiple class="absolute opacity-0" accept=".txt, .doc, .docx, .rtf, .md, .markdown, .epub, .mobi, .pdf, .png, .jpg, .jpeg, .svg, .gif, .bmp" type="file" id="fileInput" onclick="handleFileInputClick();"/>

        <!-- Conversation options -->
        <!-- Background Overlay -->
        <div id="chatOptions-overlay" class="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 hidden w-full h-full">

            <!-- Main Modal -->
            <div id="chatOptions" class="fixed flex inset-0 items-center justify-center rounded-lg shadow-xl z-50 animate-exit">
            <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full bg-gradient-to-r from-blue-400 to-sky-400">
                <div class="text-center">
                <h2 class="text-2xl font-semibold text-gray-800 mb-6">Options</h2>
                <section class="grid grid-rows-2 space-y-4">
                    <div class="flex flex-row justify-center space-x-4">
                        <button id="renameOption" class="bg-blue-800 text-white p-1 rounded-lg w-full shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
                            Rename
                        </button>
                        <button id="DeleteOption" class="bg-red-500 text-white p-2 rounded-lg w-full shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
                            Delete
                        </button>
                    </div>
                    <div class="items-center">
                    <button id="renameOptionsBt" class="bg-gray-300 text-gray-700 mt-4 p-3 rounded-lg w-fit shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
                        Cancel
                    </button>
                    </div>
                </section>
                </div>
            </div>
        </div>

        <div id="confirm-delete-modal" class="fixed inset-0 w-full h-full bg-black/30 flex items-center justify-center overflow-y-auto z-50 -translate-x-full transition-transform duration-700 ease-in-out transform">
            <div id="confirm-delete-box" class="bg-white text-center p-4 rounded-lg shadow-xl max-w-md">
                <h2 class="text-2xl font-semibold text-gray-800 mb-6">Confirm Deletion</h2>
                <p class="text-gray-700 mb-4">Are you sure you want to delete this item?</p>
                <div class="flex justify-between space-x-4">
                <button id="CancelDeleteBt" class="bg-blue-500 text-white p-3 rounded-lg w-1/2 shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
                    Cancel
                </button>
                <button id="ConfirmDelete" class="bg-red-500 text-white p-3 rounded-lg w-1/2 shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
                    Delete
                </button>
                </div>
                </div>
            </div>
        </div>

        <!--Conversation Rename modal-->
        <div id="renameModal" class="fixed inset-0 z-50 flex translate-y-full items-center justify-center bg-black bg-opacity-40 transform transition-transform duration-700 ease-in-out">
            <div class="bg-white p-6 rounded-lg shadow-lg">
            <h3 id="modalTitle" class="text-2xl font-bold text-gray-800 mb-4"></h3>
            <div class="mb-4">
                <label for="newName" class="block text-gray-700 mb-2">New Name:</label>
                <input type="text" id="newName" class="w-full p-2 border rounded" placeholder="Enter new name">
            </div>
            <div class="flex justify-end space-x-4">
                <button id="SubmitRenameButton" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Rename</button>
                <button id="canceRenamelButton" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Cancel</button>
            </div>
            </div>
        </div>

        <!-- Settings Modal Background -->
        <div id="settingsModal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 dark:bg-opacity-40 dark:bg-gray-900 transition-colors duration-1000" onclick="if (event.target.id === 'settingsModal') {this.classList.add('hidden');}">
            <!-- Modal Content -->
            <div class="relative bg-[#ffaa7f] border-2 border-gray-200 dark:bg-[#171f30] dark:border-2 dark:border-[#28636f] dark:shadow-lg dark:shadow-[#22242e] shadow-xl p-6 rounded-lg w-full mx-2 md:mx-auto max-w-md lg:max-w-xl xl:max-w-2xl max-h-full transition-colors duration-1000">

            <!-- Close Button -->
                <button id="closeModal" onclick="document.getElementById('settingsModal').classList.add('hidden')" class="absolute top-2 right-2 text-[#00557f] dark:text-[#00ffff] hover:text-gray-900 hover:rotate-45 transform duration-300 dark:hover:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <!-- Modal Title -->
                <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Settings</h2>

                <!--Scrollable content container-->
                <section class="bg-[#fdfdfd]  dark:bg-zinc-800 overflow-auto max-h-[80vh] shadow-inner-md border-2 border-[#8f45ff] dark:border-[#2b3a59] rounded-md p-2 transition-colors transform duration-600">

                    <section class="mb-4 space-y-1" arial-label="Control Stection" title="Control Section">
                        <section class="grid grid-cols-2 grid-rows-2 md:grid-cols-3 mb-4 space-y-3">
                            <!-- Theme Switching Option -->
                            <div class="flex items-center">
                                <label for="themeSwitch" class="text-gray-700 dark:text-gray-200">Theme</label>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input id="themeSwitch" type="checkbox" class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <!-- AutoScroll option -->
                            <div class="flex items-center" title="scroll on content" aial-label="scroll on content">
                                <label for="AutoScroll" class="text-gray-700 dark:text-gray-200">Auto scroll</label>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input id="AutoScroll" checked type="checkbox" class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <!-- Image Generation model change -->
                            <div class="flex items-center">
                                <label class="relative inline-flex items-center cursor-pointer text-gray-700 dark:text-gray-200">Use Flux</label>
                                <label class="relative inline-flex items-center cursor-pointer" title="Change image generation model to FLUX">
                                    <input id="CModel" type="checkbox" class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <!-- Body/ChatArea Animation Control Option -->
                            <div class="flex items-center" arial-label="Toggle spinning spher balls animation in the ChatArea" title="Toggle spinning spher balls animation in the ChatArea">
                                <label for="themeSwitch" class="text-gray-700 dark:text-gray-200">Animation</label>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input id="animation-toggle" id="themeSwitch" type="checkbox" class="sr-only peer">
                                    <div id="animation-toggle-peer" class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </section>
                    </section>

                    <!--Misceleneous-->

                    <div id="pref-inputSection" class="mb-6">
                        <label for="recommendations" class="block text-lg font-medium mb-2 text-gray-600 dark:text-gray-300 flex items-center transition-colors duration-1000">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m4 0h1M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            Enter Your &nbsp;<i> <span class="text-orange-500">wish</span></i> /<span class="text-pink-500"> infor</span>/<span class="text-purple-500"> preference</span>:
                        </label>
                        <section title="What would you like quickai to know about you? Tell me what you would want me to do for you and in what manner?" class="w-full rounded-lg border-2 border-blue-500 dark:border-blue-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 dark:bg-gray-700 transition-colors duration-1000">
                            <textarea id="pref-input" class="scrollbar-hide resize-none overflow-wrap w-full text-rose-950 dark:text-white pt-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 ring-none outline-none transition-colors duration-1000" placeholder="What would you like quickai to do or know about you?..." oninput="this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 28 * window.innerHeight / 100) + 'px'; this.scrollTop = this.scrollHeight;"></textarea>
                            <div class="flex justify-end">
                                <!-- Checkmark Circle Icon Button -->
                                <button id="pref-submit" class="bg-green-500 hover:bg-yellow-500 text-white p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors duration-1000">
                                    Submit
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                            </div>
                        </section>
                    </div>

                    <div id="pref-section" class="mb-6">
                        <label class="block text-lg font-medium mb-2 text-gray-600 dark:text-gray-300 flex items-center ml-2 transition-colors duration-1000">
                            User &nbsp;<span class="text-sky-500">command</span> &nbsp;/ &nbsp;<span class="text-pink-900 font-semibold">Data</span>
                        </label>
                        <div id="pref-preview" class="relative p-6 bg-blue-200 dark:bg-stone-900 border-none border-blue-300 rounded-lg shadow-md shadow-gray-700 transition-colors duration-1000">
                            <p id="pref-content" class="text-gray-800 dark:text-orange-400 transition-colors duration-1000"></p>
                            <section class="absolute top-0.5 right-1 flex flex-col space-y-2">
                                <button id="pref-delete" aria-label="Delete preference" title="Delete preference" class="rounded-md p-1 bg-slate-600 dark:bg-gray-800 text-red-400 hover:text-red-500 shadow-md transition-colors duration-1000">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.981-1.858L5 7m5 4v6m4-6v6"></path>
                                    </svg>
                                </button>
                                <button id="pref-edit" aria-label="Edit" title="Edit" class="p-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-md transition-colors duration-1000">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white hover:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                            </section>
                        </div>
                    </div>

                    <!-- Additional Settings Options -->
                    <div class="flex justify-center w-full my-4">
                    <button onclick="showApiManModal()" class="px-6 py-3 rounded-lg bg-blue-500 dark:bg-black border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-900 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-colors duration-1000">
                            <span class="bg-gradient-to-r from-[#ffff7f] via-[#550000] to-[#0000ff] text-transparent bg-clip-text font-bold">
                            Manage API Key
                            </span>
                        </button>
                    </div>


                    <div class="mb-4">
                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Language:</label>
                    <select class="form-select w-fit font-bold bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 transition-colors duration-1000">
                        <option value="en" class="text-yellow-400 font-bold">English</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                    </select>
                    </div>

                    <!-- Save Settings Button -->
                    <section class="w-full flex justify-center">
                        <button id="saveSettings" class="w-fit bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-1000">
                        Save Settings
                        </button>
                    </section>
                </section>
            </div>
        </div>


        <!-- API KEY Modal -->
        <div id="apiKeyModal" class="fixed inset-0 bg-blue-900/40 dark:bg-zinc-900/80 flex items-center justify-center z-30 hidden transition-colors duration-1000">
                <div id="apiKeyModalContent" class="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-2xl w-96 fade-in">
                    <h2 class="text-xl font-semibold text-center text-gray-900 dark:text-gray-100 transition-colors duration-1000">
                        Enter Your API Keys
                    </h2>
                    <div class="mt-4 space-y-4">
                        <div class="space-y-2">
                            <label for="mistralKey" class="block text-gray-700 dark:text-gray-300 transition-colors duration-1000">Mistral API Key</label>
                            <div class="relative">
                                <input id="mistralKey" type="password" class="w-full p-2 border border-orange-400 dark:border-blue-300 rounded-md dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-colors duration-1000">
                                <button type="button" class="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-400" onclick="toggleVisibility('mistralKey')">
                                    👁
                                </button>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label for="huggingfaceKey" class="block text-gray-700 dark:text-gray-300 transition-colors duration-1000">Hugging Face API Key</label>
                            <div class="relative">
                                <input id="huggingfaceKey" type="password" class="w-full p-2 border border-pink-400 rounded-md dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-colors duration-1000">
                                <button type="button" class="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-400 transition-colors duration-1000" onclick="toggleVisibility('huggingfaceKey')">
                                    👁
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end mt-6 space-x-3">
                        <button class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition" onclick="closeApiQueryModal()">
                            Cancel
                        </button>
                        <button id="saveKeysBt" class="px-4 py-2 bg-blue-600 text-white rounded-md dark:hover:bg-blue-700 hover:bg-green-600 transition" onclick="saveKeys()">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!--Key management modal-->
        <div id="apiKeyManPage" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 translate-y-full transition-all duration-700">
            <div class="relative w-fit max-w-3xl mx-auto bg-white dark:bg-stone-800 p-6 rounded-lg shadow-lg aimate-fadeIn overflow-hidden">
                <!-- Close Button -->
                <button id="closeModalManPage" class="absolute top-2 right-2 text-black dark:text-blue-400 hover:text-gray-900 hover:rotate-45 duration-300 dark:hover:text-gray-400 transition-colors duration-1000">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 class="text-2xl font-semibold text-gray-800 dark:text-white text-center mb-4 transition-colors duration-1000">Manage API Keys</h2>

                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Mistral API Key</label>
                        <div class="relative">
                            <input id="mistralKeyMan" type="password" value="***************" class="w-full p-2 border rounded-md dark:bg-stone-600 dark:border-gray-400 dark:text-gray-100 transition-colors duration-1000">
                            <button type="button" class="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-400 transition-colors duration-1000" onclick="toggleVisibility('mistralKeyMan')">
                                👁
                            </button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-gray-700 dark:text-gray-300">Hugging Face API Key</label>
                        <div class="relative">
                            <input id="huggingfaceKeyMan" type="password" value="***************" class="w-full p-2 border rounded-md dark:bg-zinc-600 dark:border-gray-400 dark:text-gray-100">
                            <button type="button" class="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-400" onclick="toggleVisibility('huggingfaceKeyMan')">
                                👁
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end mt-6 space-x-3">
                    <button class="px-4 py-2 dark:text-white text-gray-900 bg-gray-300 dark:bg-gray-500 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 cursor-not-allowed pointer-events-none transition-colors duration-1000" onclick="resetKeys()">
                        Reset
                    </button>
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-1000" onclick="saveKeys('update')">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>


        <!-- Warning Modal: No API Key Set -->
        <div id="warningModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 pointer-events-none transition-all duration-700 hidden">
            <div id="warningModalContent" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 transform translate-y-full transition-all duration-300 animate-exit">

                <!-- Warning Title -->
                <h2 class="text-xl font-semibold text-center text-red-500 dark:text-red-400 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <path fill-rule="evenodd" d="M12 2a1 1 0 0 1 .894.553l9 18A1 1 0 0 1 21 22H3a1 1 0 0 1-.894-1.447l9-18A1 1 0 0 1 12 2zm-1 8a1 1 0 0 0 2 0v4a1 1 0 0 0-2 0v-4zm1 8a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 12 18z" clip-rule="evenodd"/>
                    </svg>
                <span class="font-bold text-red-500">Warning:</span> <span class="text-orange-400 font-normal">API Key Not Set</span>
                </h2>

                <!-- Warning Message -->
                <p class="mt-4 text-center text-gray-800 dark:text-gray-200">
                    It looks like you haven't set up your API keys. To proceed, please enter your keys.
                </p>

                <!-- Action Buttons -->
                <div class="mt-6 flex justify-between space-x-4">
                    <button class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-1000"
                        onclick="closeWarningModal(); showApiQueryModal();">
                        Close
                    </button>
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-1000"
                        onclick="closeWarningModal(); showApiQueryModal();">
                        Set API Keys
                    </button>
                </div>
            </div>
        </div>


        <!-- ApiNotSetModal Modal: atleast one API must be set -->
        <div id="ApiNotSetModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden z-50 transition-colors duration-1000">
            <div id="ApiNotSetContent" class="relative bg-white dark:bg-gray-800 p-6 xl:p-8 rounded-lg shadow-lg flex flex-col items-center animate-exit md:min-w-md lg:min-w-lg xl:min-w-2xl transition-colors duration-1000">
                <!-- Close Button -->
                <button id="closeModalApiWarn" onclick="closeApiNotSetWarning(); showApiQueryModal();" class="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-red-500 duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 hover:rotate-45 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <!-- Warning Icon -->
                <div class="flex items-center justify-center w-16 h-16 bg-yellow-500 dark:bg-yellow-500 rounded-full shadow-md transition-colors duration-1000">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path fill-rule="evenodd" d="M12 2a1 1 0 0 1 .894.553l9 18A1 1 0 0 1 21 22H3a1 1 0 0 1-.894-1.447l9-18A1 1 0 0 1 12 2zm-1 8a1 1 0 0 0 2 0v4a1 1 0 0 0-2 0v-4zm1 8a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 12 18z" clip-rule="evenodd"/>
                    </svg>
                </div>

                <!-- Warning Message -->
                <p id="warningMSG" class="mt-4 text-gray-700 dark:text-gray-200 text-center font-medium transition-colors duration-1000">
                    Please set at least one API key:
                </p>
                <div class="flex gap-2 mt-2">
                    <span class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-md transition-colors duration-1000">HF--Huggingface</span>
                    <span class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-md transition-colors duration-1000">Mistral</span>
                </div>
                <p class="mt-2 text-gray-700 dark:text-gray-200 text-center">
                    or <span class="font-semibold text-blue-500 dark:text-blue-400">both</span>.
                </p>

            </div>
        </div>


        <!-- API setting Success Modal -->
        <div id="successModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-none transition-opacity duration-500 hidden">
            <div id="successModalContent" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 transform scale-95 transition-all transform duration-1000">

                <!-- Success Icon & Title -->
                <h2 class="text-xl font-semibold text-center text-green-500 dark:text-green-400 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500 dark:text-green-400" viewBox="0 0 24 24" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 15.172l7.071-7.071a1 1 0 011.415 1.414l-8.486 8.485a1 1 0 01-1.414 0L4.929 13.9a1 1 0 011.415-1.414L10 15.172z" clip-rule="evenodd"/>
                    </svg>
                    Success!
                </h2>

                <!-- Success Message -->
                <p id="success-message" class="mt-4 text-center text-gray-800 dark:text-gray-200">
                    Operation Successful
                </p>
                <p id="restartBt" class="hidden text-center text-black dark:text-gray-200">Need to <span class="text-green-400 font-semibold">Restart</span> the app for changes to take effect!</p>
                <!-- Action Buttons -->
                <div class="hidden mt-6 flex justify-between space-x-4">
                    <button class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-1000 cursor-not-allowed"
                        onclick="closeSuccessModal();">
                        Close
                    </button>
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-orange-400 hover:text-slate-900 transition-colors duration-1000"
                        onclick="closeSuccessModal(); onSuccessAction();">
                        Ok
                    </button>
                </div>
            </div>
        </div>

        <!--DiagView Modal Wrapper -->
        <div id="diagViewModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-all duration-1000 z-40 translate-x-full opacity-0">
            <section class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-[99vw] lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl w-full h-[90vh] overflow-hidden relative transition-all duration-1000">
                <button
                    onclick="closediagViewModal();"
                    class="absolute top-1 right-3 text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded z-30 transition-all duration-1000"
                >Close</button>
                <div class="w-full h-[96%] my-4 overflow-auto">
                    <div id="modal-content" class="p-4 flex flex-col"></div>
                </div>
            </section>
        </div>

        <!-- Loading Modal -->
        <div id="loadingModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden z-41">
            <div id="modalMainBox" class="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center animate-exit transition-all duration-1000">
                <!-- Spinner Animation -->
                <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p id="loadingMSG" class="mt-3 text-gray-700">Processing, please wait...</p>
            </div>
        </div>

        <!-- General Success Modal -->
        <div id="success-modal-GN" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 hidden z-41">
            <div id="successBoxBody-GN" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm text-center animate-exit transition-all duration-1000">
                <!-- Animated Checkmark -->
                <div class="flex items-center justify-center">
                    <div class="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center animate-scale">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 animate-draw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                </div>

                <!-- Success Message -->
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4">Success!</h2>
                <p id="SuccessMsg-GN" class="text-sm text-gray-600 dark:text-gray-300 mt-2">Your action was completed successfully.</p>

                <!-- Close Button -->
                <button id="CloseSucsessModal-GN" onclick="window.hideStatus('success')" class="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                    OK
                </button>
            </div>
        </div>

        <!-- Error Modal -->
        <div id="errorModal-GN" class="hidden fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-41">
            <div id="errorBox-GN" class="bg-white p-6 rounded-lg shadow-lg min-w-80 max-w-[90vw] md:max-w-[70vw] animate-exit transition-all duration-1000">
                <h2 class="text-lg font-semibold text-red-600">Error!</h2>
                <p id="error-message-GN" class="mt-2 text-gray-600" id="errorMessage">Something went wrong.</p></p>
                <section class="flex justify-center">
                    <button onclick="window.hideStatus('error')" class="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                        Close
                    </button>
                </section>
            </div>
        </div>
        `
        this.modalSection = document.getElementById('modals-container');
    }

    add(){
        this.modalSection.innerHTML = this.modalSectionContent
    }
    remove(){
        //
    }

    check(){
        //
    }
}

const _GHandler = new GHandler()
_GHandler.add()
