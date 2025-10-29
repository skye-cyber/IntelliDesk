class GHandler{
    constructor(){
        this.modalSectionContent = `









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
                <p id="error-message-GN" class="mt-2 text-gray-600" id="errorMessage">Something went wrong.</p>
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
