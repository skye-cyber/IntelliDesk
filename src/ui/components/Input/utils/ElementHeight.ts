export const adjustElementHeight = (element: HTMLBaseElement) => {
    if (!element) return;

    // Save current scroll position of the ELEMENT, not the window
    const currentElementScrollTop = element.scrollTop;

    // Save cursor position
    const selection: Selection | null = window.getSelection();
    let range: Range | null = null;
    let startContainer: Node | null = null;
    let startOffset: number = 0;

    if (selection && selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
        if (range) {
            startContainer = range.startContainer;
            startOffset = range.startOffset;
        }
    }

    // Calculate and apply new height
    element.style.height = 'auto';
    const contentHeight = element.scrollHeight;
    const maxHeight = window.innerHeight * 0.28;
    const newHeight = Math.max(48, Math.min(contentHeight, maxHeight));
    element.style.height = newHeight + 'px';
    element.style.overflowY = contentHeight > maxHeight ? 'auto' : 'hidden';

    // ✅ Restore the ELEMENT's scroll position, not the window
    element.scrollTop = currentElementScrollTop;

    // Restore cursor position
    RestoreCursorPosition(selection, range, startContainer, element, startOffset);
};

export const RestoreCursorPosition = (
    selection: Selection | null,
    range: Range | null,
    startContainer: Node | null,
    element: HTMLBaseElement,
    startOffset: number) => {
    // Restore cursor position more reliably
    if (range && startContainer) {
        try {
            const newRange = document.createRange();
            newRange.setStart(startContainer, startOffset);
            newRange.collapse(true);
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        } catch (e) {
            // If restoration fails, place cursor at end as fallback
            const newRange = document.createRange();
            newRange.selectNodeContents(element);
            newRange.collapse(false);
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        }
    }
}
