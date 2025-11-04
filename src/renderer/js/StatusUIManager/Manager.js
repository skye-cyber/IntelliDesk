export class ModalManager {
    constructor() {
        this.dialogId = "confirm-dialog-" + Date.now();
    }

    /**
     * Initialize all UI components
     */
    initialize() {
        this.initializeMessages();
        this.setupGlobalEventListeners();
    }

    /**
     * Show a floating message/toast notification
     * @param {string} message - The message to display
     * @param {string} type - Message type: 'success', 'error', 'warning', 'info'
     * @param {boolean} autoDismiss - Whether to auto-dismiss after timeout
     * @param {number} duration - Duration in milliseconds (default: 5000)
     */
    showMessage(
        message,
        type = "info",
        autoDismiss = true,
        duration = 5000,
    ) {
        // Create message container if it doesn't exist
        let container = document.getElementById("message-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "message-container";
            container.className =
                "fixed top-20 right-6 z-50 space-y-3 max-w-sm w-full";
            document.body.appendChild(container);
        }

        const messageId =
            "msg-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);

        //typeConfig
        const typeConfig = {
            success: {
                gradient: 'from-green-500 to-emerald-500',
                glow: 'bg-green-500',
                iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
                textColor: 'text-gray-900 dark:text-white',
                progress: 'bg-gradient-to-r from-green-500 to-emerald-500',
                icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>`
            },
            error: {
                gradient: 'from-red-500 to-rose-500',
                glow: 'bg-red-500',
                iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
                textColor: 'text-gray-900 dark:text-white',
                progress: 'bg-gradient-to-r from-red-500 to-rose-500',
                icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>`
            },
            warning: {
                gradient: 'from-amber-500 to-orange-500',
                glow: 'bg-amber-500',
                iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
                textColor: 'text-gray-900 dark:text-white',
                progress: 'bg-gradient-to-r from-amber-500 to-orange-500',
                icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>`
            },
            info: {
                gradient: 'from-blue-500 to-cyan-500',
                glow: 'bg-blue-500',
                iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
                textColor: 'text-gray-900 dark:text-white',
                progress: 'bg-gradient-to-r from-blue-500 to-cyan-500',
                icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>`
            }
        };

        const messageHtml = `
        <div id="${messageId}"
            class="message-toast transform transition-all duration-500 ease-out opacity-0 translate-x-full backdrop-blur-lg"
            data-message-id="${messageId}"
            data-auto-dismiss="${autoDismiss}">
            <div class="relative bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl p-5 overflow-hidden backdrop-blur-lg">
                <!-- Animated gradient background -->
                <div class="absolute inset-0 bg-gradient-to-br ${typeConfig[type].gradient} opacity-5"></div>

                <!-- Glow effect -->
                <div class="absolute inset-0 ${typeConfig[type].glow} opacity-10 rounded-2xl"></div>

                <!-- Message Content -->
                <div class="flex items-start relative z-10">
                    <!-- Animated Icon Container -->
                    <div class="flex-shrink-0 mr-4">
                        <div class="w-12 h-12 ${typeConfig[type].iconBg} rounded-2xl flex items-center justify-center shadow-lg icon-pulse">
                            <div class="w-6 h-6 text-white">
                                ${typeConfig[type].icon}
                            </div>
                        </div>
                    </div>

                    <!-- Message Text -->
                    <div class="flex-1 min-w-0">
                        <p class="text-base font-semibold ${typeConfig[type].textColor} leading-relaxed tracking-tight">
                            ${this.escapeHtml(message)}
                        </p>
                    </div>

                    <!-- Close Button -->
                    <button type="button"
                            class="ml-4 flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:rotate-90 group"
                            onclick="window.ModalManager.dismissMessage('${messageId}')">
                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <!-- Progress Bar -->
                ${autoDismiss
                ? `
                <div class="absolute bottom-0 left-4 right-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-4">
                    <div class="h-full ${typeConfig[type].progress} progress-bar-smooth rounded-full"
                        style="animation-duration: ${duration}ms"></div>
                </div>
                `
                : ""
            }
            </div>
        </div>
        `;
        container.insertAdjacentHTML("beforeend", messageHtml);
        const newMessage = document.getElementById(messageId);

        // Animate in
        setTimeout(() => {
            newMessage.style.transition =
                "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
            newMessage.classList.remove("opacity-0", "translate-x-full");
            newMessage.classList.add("opacity-100", "translate-x-0");
        }, 10);

        // Auto-dismiss
        if (autoDismiss) {
            newMessage.dismissTimer = setTimeout(() => {
                this.dismissMessage(messageId);
            }, duration);
        }

        return messageId;
    }

    /**
     * Dismiss a specific message
     * @param {string} messageId - The ID of the message to dismiss
     */
    dismissMessage(messageId) {
        const message = document.getElementById(messageId);
        if (!message) return;

        // Clear auto-dismiss timer
        if (message.dismissTimer) {
            clearTimeout(message.dismissTimer);
        }

        // Animate out
        message.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
        message.classList.remove("opacity-100", "translate-x-0");
        message.classList.add("opacity-0", "translate-x-full", "scale-95");

        // Remove from DOM after animation
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);

                // Remove container if no messages left
                const container = document.getElementById("message-container");
                if (container && container.children.length === 0) {
                    container.remove();
                }
            }
        }, 400);
    }


    /**
     * Setup global event listeners
     */
    setupGlobalEventListeners() {
        // Escape key to dismiss messages and modals
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                // Dismiss all messages
                const messages = document.querySelectorAll(".message-alert");
                messages.forEach((msg) => this.dismissMessage(msg.id));

                // Close open modals
                const modals = document.querySelectorAll(
                    '[id^="modal-"], [id^="confirm-dialog-"]',
                );
                modals.forEach((modal) => {
                    const modalId = modal.id;
                    if (modalId.startsWith("confirm-dialog-")) {
                        this.hideConfirmDialog(modalId, false);
                    } else {
                        this.hideModal(modalId);
                    }
                });
            }
        });
    }

    startLoader(message) {
        const loadingModal = document.getElementById('loadingModal')
        const modalMainBox = document.getElementById('modalMainBox')
        const msg = document.getElementById('loadingMSG')
        console.log(loadingModal, modalMainBox, msg)
        loadingModal.classList.remove('hidden')
        modalMainBox.classList.remove('animate-exit')
        modalMainBox.classList.add('animate-enter')

        if (message) msg.textContent = message
    }

    hideLoader() {
        const loadingModal = document.getElementById('loadingModal')
        const modalMainBox = document.getElementById('modalMainBox')
        const msg = document.getElementById('loadingMSG')
        modalMainBox.classList.remove('animate-enter')
        modalMainBox.classList.add('animate-exit')
        setTimeout(() => {
            loadingModal.classList.add('hidden')
        }, 500)
        msg.textContent = 'Processing, please wait...'
    }

    /**
     * Show loading state on an element
     * @param {HTMLElement} element - The element to show loading state on
     * @param {string} loadingText - Optional custom loading text
     * @returns {string} The original innerHTML for restoration
     */
    showLoading(element, loadingText = null) {
        if (!element) return null;

        const originalContent = element.innerHTML;
        const isButton = element.tagName === "BUTTON";

        element.classList.add('fixed', 'z-[99]')
        element.innerHTML = `
        <div class="flex items-center justify-center space-x-2">
        <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin-50"></div>
        <span class="text-current">${loadingText || "Loading..."}</span>
        </div>
        `;

        element.disabled = true;
        element.setAttribute("data-original-content", originalContent);

        // Store original styles for restoration
        element.setAttribute("data-original-cursor", element.style.cursor);
        element.style.cursor = "not-allowed";

        if (isButton) {
            element.setAttribute("data-original-bg", element.style.background);
            element.style.background = "var(--loading-bg, #9ca3af)";
        }

        return originalContent;
    }

    /**
     * Hide loading state and restore element to original state
     * @param {HTMLElement} element - The element to restore
     * @param {string} originalContent - The original innerHTML (optional, will use stored if not provided)
     */
    hideLoading(element, originalContent = null) {
        if (!element) return;

        const storedContent = element.getAttribute("data-original-content");
        const contentToRestore = originalContent || storedContent;

        if (contentToRestore) {
            element.innerHTML = contentToRestore;
        }

        element.disabled = false;

        // Restore original styles
        const originalCursor = element.getAttribute("data-original-cursor");
        element.style.cursor = originalCursor || "";

        if (element.tagName === "BUTTON") {
            const originalBg = element.getAttribute("data-original-bg");
            element.style.background = originalBg || "";
        }

        // Clean up data attributes
        element.removeAttribute("data-original-content");
        element.removeAttribute("data-original-cursor");
        element.removeAttribute("data-original-bg");
        element.classList.remove('fixed', 'z-[99]')

    }

    /**
     * Show a confirmation dialog
     * @param {string} message - The confirmation message
     * @param {string} title - Dialog title
     * @returns {Promise<boolean>} Promise that resolves to true if confirmed, false if cancelled
     */
    confirm(message, title = "Confirm Action") {
        // Clear any pre-existing confirmation dialogs
        //document.querySelector('[id^="confirm-dialog-"')?.remove()

        return new Promise((resolve) => {
            const dialogHtml = `
                <div id="${this.dialogId}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div id='dialog-content' class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-95 opacity-0">
                        <div class="p-6 border-b border-gray-200">
                            <h3 class="text-xl font-bold text-gray-900">${this.escapeHtml(title)}</h3>
                        </div>
                        <div class="p-6">
                            <p class="text-gray-700 mb-6">${this.escapeHtml(message)}</p>
                            <div class="flex space-x-3">
                                <button type="button"
                                        class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                                        onclick="window.ModalManager.hideConfirmDialog('${this.dialogId}', false)">
                                    Cancel
                                </button>
                                <button type="button"
                                        class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                                        onclick="window.ModalManager.hideConfirmDialog('${this.dialogId}', true)">
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML("beforeend", dialogHtml);
            const dialog = document.getElementById(this.dialogId);
            const content = dialog.querySelector("#dialog-content");

            // Animate in
            setTimeout(() => {
                content.classList.remove("scale-95", "opacity-0");
                content.classList.add("scale-100", "opacity-100");
            }, 10);

            // Store resolve function
            dialog.resolveFunction = resolve;

            // Escape key to cancel
            const escapeHandler = (e) => {
                if (e.key === "Escape") {
                    this.hideConfirmDialog(this.dialogId, false);
                }
            };
            document.addEventListener("keydown", escapeHandler);
            dialog.escapeHandler = escapeHandler;
        });
    }


    /**
     * Hide confirmation dialog
     * @param {string} dialogId - The dialog ID
     * @param {boolean} confirmed - Whether action was confirmed
     */
    hideConfirmDialog(dialogId, confirmed) {
        const dialog = document.getElementById(dialogId);
        if (!dialog) return;

        const content = dialog.querySelector("#dialog-content");
        content.classList.remove("scale-100", "opacity-100");
        content.classList.add("scale-95", "opacity-0");

        // Remove event listener
        if (dialog.escapeHandler) {
            document.removeEventListener("keydown", dialog.escapeHandler);
        }

        // Resolve promise and remove dialog
        setTimeout(() => {
            if (dialog.resolveFunction) {
                dialog.resolveFunction(confirmed);
            }
            dialog.remove();
        }, 300);
    }



    /**
     * Show a modal with custom content
     * @param {string} title - Modal title
     * @param {string} content - Modal content HTML
     * @param {Object} options - Modal options
     * @returns {string} Modal ID
     */
    showModal(title, content, options = {}) {
        const modalId = "modal-" + Date.now();
        const { size = "max-w-md", showClose = true } = options;

        const modalHtml = `
        <div id="${modalId}" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl w-full ${size} mx-4 transform transition-all duration-300 scale-95 opacity-0">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-xl font-bold text-gray-900">${this.escapeHtml(title)}</h3>
        ${showClose
                ? `
            <button type="button"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            onclick="window.ModalManager.hideModal('${modalId}')">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            </button>
            `
                : ""
            }
        </div>
        <div class="p-6">
        ${content}
        </div>
        </div>
        </div>
        `;

        document.body.insertAdjacentHTML("beforeend", modalHtml);
        const modal = document.getElementById(modalId);
        const modalContent = modal.querySelector(".bg-white");

        // Animate in
        setTimeout(() => {
            modalContent.classList.remove("scale-95", "opacity-0");
            modalContent.classList.add("scale-100", "opacity-100");
        }, 10);

        // Close on background click
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                this.hideModal(modalId);
            }
        });

        return modalId;
    }


    /**
     * Hide a modal
     * @param {string} modalId - The modal ID
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const modalContent = modal.querySelector(".bg-white");
        modalContent.classList.remove("scale-100", "opacity-100");
        modalContent.classList.add("scale-95", "opacity-0");

        setTimeout(() => {
            modal.remove();
        }, 300);
    }


    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}

window.ModalManager = new ModalManager()
