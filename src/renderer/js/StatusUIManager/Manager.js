import { GenerateId } from "../../../react-app/components/ConversationRenderer/Renderer";

export class ModalManager {
    constructor() {
        this.messagePId = null
    }

    /**
     * Initialize all UI components
     */
    initialize() {
        //this.initializeMessages();
        //this.setupGlobalEventListeners();
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
        duration = 6000,
    ) {
        // Create message container if it doesn't exist
        const messageId = GenerateId(type)
        this.messagePId = window.reactPortalBridge.showComponentInTarget('Toast', 'messageContainer', { type: type, messageId: messageId, message: message, duration: duration, autoDismiss: autoDismiss }, "toast")

        return this.messagePId;
    }

    /**
     * Dismiss a specific message
     * @param {string} messageId - The ID of the message to dismiss
     */
    dismissMessage(messageId) {
        const message = document.getElementById(messageId);
        this.messagePId = message?.dataset?.pid

        if (!message) return;

        // Clear auto-dismiss timer
        if (message.dismissTimer) {
            clearTimeout(message.dismissTimer);
        }

        // Remove from DOM after animation
        setTimeout(() => {
            if (this.messagePId) window.reactPortalBridge.closeComponent(this.messagePId)
        }, 510);
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

        //element.classList.add('fixed', 'z-[99]')
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
            const dialog_id = GenerateId('confirm-dialog');

            this.messagePId = window.reactPortalBridge.showComponentInTarget('ConfirmationDialog', 'ConfirmdialogContainer', { title: title, message: message, dialog_id: dialog_id, resolve: resolve }, "confirm")

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

        // Resolve promise and remove dialog
        setTimeout(() => {
            if (dialog.resolvefunction) {
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

}

window.ModalManager = new ModalManager()
