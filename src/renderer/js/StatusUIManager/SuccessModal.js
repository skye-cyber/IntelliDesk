export class SuccessModal {
    constructor() {
        this.modalId = 'global-success-modal';
        this.init();
    }

    init() {
        // Create modal HTML if it doesn't exist
        if (!document.getElementById(this.modalId)) {
            this.createModal();
        }

        this.modal = document.getElementById(this.modalId);
        this.backdrop = document.getElementById(`${this.modalId}-backdrop`);
        this.progressBar = document.getElementById(`${this.modalId}-progress`);
        this.titleElement = document.getElementById(`${this.modalId}-title`);
        this.messageElement = document.getElementById(`${this.modalId}-message`);
        this.iconContainer = document.getElementById(`${this.modalId}-icon`);

        this.isVisible = false;
        this.autoCloseTimer = null;
        this.progressInterval = null;
    }

    createModal() {
        const modalHTML = `
        <div id="${this.modalId}-backdrop" class="success-modal-backdrop">
        <div id="${this.modalId}" class="success-modal">
        <div class="success-modal-progress">
        <div id="${this.modalId}-progress" class="success-modal-progress-bar"></div>
        </div>

        <button class="success-modal-close">
        <svg class="success-modal-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        </button>

        <div class="success-modal-content">
        <div id="${this.modalId}-icon" class="success-modal-icon"></div>

        <h3 id="${this.modalId}-title" class="success-modal-title"></h3>
        <p id="${this.modalId}-message" class="success-modal-message"></p>

        <div class="success-modal-actions">
        <button class="success-modal-button">Got it</button>
        </div>
        </div>
        </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.attachEventListeners();
    }

    attachEventListeners() {
        const closeBtn = this.modal?.querySelector('.success-modal-close');
        const actionBtn = this.modal?.querySelector('.success-modal-button');
        const backdrop = this.backdrop;

        closeBtn?.addEventListener('click', () => this.hide());
        actionBtn?.addEventListener('click', () => this.hide());
        backdrop?.addEventListener('click', (e) => {
            if (e.target === backdrop) this.hide();
        });
    }

    show(options = {}) {
        const {
            title = 'Success!',
            message = 'Operation completed successfully',
            type = 'success',
            duration = 3000,
            autoClose = true
        } = options;

        this.clearTimers();

        // Set content
        this.titleElement.textContent = title;
        this.messageElement.textContent = message;
        this.setIcon(type);
        this.setStyles(type);

        // Show modal
        this.isVisible = true;
        this.backdrop.classList.add('visible');
        this.modal.classList.add('visible');

        // Auto close
        if (autoClose && duration > 0) {
            this.startAutoClose(duration);
        }
    }

    setIcon(type) {
        const icons = {
            success: `
            <div class="success-modal-icon-circle success">
            <svg class="success-modal-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            </div>
            `,
            error: `
            <div class="success-modal-icon-circle error">
            <svg class="success-modal-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            </div>
            `,
            warning: `
            <div class="success-modal-icon-circle warning">
            <svg class="success-modal-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            </div>
            `,
            info: `
            <div class="success-modal-icon-circle info">
            <svg class="success-modal-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            </div>
            `
        };

        this.iconContainer.innerHTML = icons[type] || icons.success;
    }

    setStyles(type) {
        const styles = {
            success: {
                progress: 'success-progress',
                button: 'success-button',
                border: 'success-border'
            },
            error: {
                progress: 'error-progress',
                button: 'error-button',
                border: 'error-border'
            },
            warning: {
                progress: 'warning-progress',
                button: 'warning-button',
                border: 'warning-border'
            },
            info: {
                progress: 'info-progress',
                button: 'info-button',
                border: 'info-border'
            }
        };

        const style = styles[type] || styles.success;

        // Remove previous styles
        this.modal.classList.remove('success-border', 'error-border', 'warning-border', 'info-border');
        this.progressBar.classList.remove('success-progress', 'error-progress', 'warning-progress', 'info-progress');

        const button = this.modal.querySelector('.success-modal-button');
        button.classList.remove('success-button', 'error-button', 'warning-button', 'info-button');

        // Add new styles
        this.modal.classList.add(style.border);
        this.progressBar.classList.add(style.progress);
        button.classList.add(style.button);
    }

    startAutoClose(duration) {
        this.progressBar.style.width = '100%';

        const startTime = Date.now();
        const endTime = startTime + duration;

        this.progressInterval = setInterval(() => {
            const now = Date.now();
            const progress = Math.max(0, ((endTime - now) / duration) * 100);

            this.progressBar.style.width = `${progress}%`;

            if (progress <= 0) {
                this.hide();
            }
        }, 50);

        this.autoCloseTimer = setTimeout(() => {
            this.hide();
        }, duration);
    }

    hide() {
        this.clearTimers();

        this.isVisible = false;
        this.backdrop.classList.remove('visible');
        this.modal.classList.remove('visible');

        // Reset progress
        this.progressBar.style.width = '0%';
    }

    clearTimers() {
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
        }
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    // Convenience methods
    success(message, title = 'Success!', duration = 3000) {
        this.show({ title, message, type: 'success', duration });
    }

    error(message, title = 'Error!', duration = 0) {
        this.show({ title, message, type: 'error', duration, autoClose: duration > 0 });
    }

    warning(message, title = 'Warning!', duration = 4000) {
        this.show({ title, message, type: 'warning', duration });
    }

    info(message, title = 'Information', duration = 3000) {
        this.show({ title, message, type: 'info', duration });
    }
}

/* Add styles to document
 * if (!document.querySelector('#success-modal-styles')) {
 *    const styleElement = document.createElement('style');
 *    styleElement.id = 'success-modal-styles';
 *    styleElement.textContent = modalStyles;
 *    document.head.appendChild(styleElement);
 * }
 */
// Create global instance
window.SuccessModal = new SuccessModal();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SuccessModal;
}
