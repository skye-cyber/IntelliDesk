//const container = document.getElementById('code-block-container');


export class Caret {
    constructor(codeView, handIndicator, codeScrollWrapper, currentScroll) {
        this.codeView = codeView
        this.handIndicator = handIndicator
        this.codeScrollWrapper = codeScrollWrapper
        this.currentScroll = currentScroll
        this.codeViewRect
        this.containerRect
        this.offsetX = 58;
        this.offsetY = 100;
        this.rect
    }

    updateHandPosition() {
        const sel = window.getSelection();
        if (!sel.rangeCount) {
            this.handIndicator.style.opacity = '0';
            return;
        }

        const range = sel.getRangeAt(0).cloneRange();
        range.collapse(true);

        if (!this.codeView.contains(range.startContainer)) {
            this.handIndicator.style.opacity = '0';
            return;
        }

        const rects = range.getClientRects();

        if (!rects.length) {
            this.handIndicator.style.opacity = '0';
            return;
        }

        this.rect = rects[0];
        this.containerRect = this.codeView.getBoundingClientRect();
        this.codeViewRect = this.codeView.getBoundingClientRect();

        this.handIndicator.style.left = `${this.rect.left - this.containerRect.left + this.offsetX - this.currentScroll}px`;
        this.handIndicator.style.top = `${this.rect.top - this.codeViewRect.top + this.offsetY - this.codeScrollWrapper.scrollTop}px`;
        this.handIndicator.style.opacity = '1';

        // Check if indicator is visually inside container bounds
        this.autoHideOnXScroll();
    }

    autoHideOnXScroll() {
        // Ensure indicator target is visible within scrollable container (both axes)
        const visibleTop = this.codeScrollWrapper.scrollTop;
        const visibleBottom = visibleTop + this.codeScrollWrapper.clientHeight;
        const visibleLeft = this.codeScrollWrapper.scrollLeft;
        const visibleRight = visibleLeft + this.codeScrollWrapper.clientWidth;

        // Get the scroll-wrapper’s viewport this.rectangle once
        const wrapperRect = this.codeScrollWrapper.getBoundingClientRect();

        // Compute caret position relative to the wrapper’s content area
        const caretTopRelative = this.rect.top - wrapperRect.top + this.codeScrollWrapper.scrollTop;
        const caretBottomRelative = caretTopRelative + this.rect.height;
        const caretLeftRelative = this.rect.left - wrapperRect.left + this.codeScrollWrapper.scrollLeft;
        const caretRightRelative = caretLeftRelative + this.rect.width;

        // If caret is completely above OR below OR left OR right of visible area, hide it
        if (
            caretBottomRelative < visibleTop || // entirely above
            caretTopRelative > visibleBottom || // entirely below
            caretRightRelative < visibleLeft || // entirely left
            caretLeftRelative > visibleRight    // entirely right
        ) {
            this.handIndicator.style.opacity = '0';
            return;
        }

        // Otherwise, re-apply the same left/top you computed earlier:
        this.handIndicator.style.left = `${this.rect.left - this.containerRect.left + this.offsetX - this.currentScroll}px`;
        this.handIndicator.style.top = `${this.rect.top - this.codeViewRect.top + this.offsetY - this.codeScrollWrapper.scrollTop}px`;
        this.handIndicator.style.opacity = '1';
    }
}
