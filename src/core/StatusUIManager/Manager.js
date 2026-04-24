import { GenerateId } from "../../ui/components/ConversationRenderer/utils";
import { staticPortalBridge } from "../PortalBridge.ts";

export class ModalManager {
    constructor() {
        this.messagePId = null
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
        this.messagePId = staticPortalBridge.showComponentInTarget('Toast', 'messageContainer', { type: type, messageId: messageId, message: message, duration: duration, autoDismiss: autoDismiss }, "toast")

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
            if (this.messagePId) staticPortalBridge.closeComponent(this.messagePId)
        }, 510);
    }
}

export const modalmanager = new ModalManager()
