const codeViewSec = document.getElementById('code-view');
const hand = document.getElementById('hand-indicator');
const container = document.getElementById('code-block-container');


function updateHandPosition() {
    const sel = window.getSelection();
    if (!sel.rangeCount) {
        hand.style.opacity = '0';
        return;
    }

    const range = sel.getRangeAt(0).cloneRange();
    range.collapse(true);

    if (!codeViewSec.contains(range.startContainer)) {
        hand.style.opacity = '0';
        return;
    }

    const rects = range.getClientRects();
    if (!rects.length) {
        hand.style.opacity = '0';
        return;
    }

    const rect = rects[0];
    const containerRect = codeViewSec.getBoundingClientRect();
    const codeViewRect = codeViewSec.getBoundingClientRect();

    const offsetX = 60;
    const offsetY = 115;

    hand.style.left = `${rect.left - containerRect.left + offsetX - currentScroll}px`;
    hand.style.top = `${rect.top - codeViewRect.top + offsetY - codeScrollWrapper.scrollTop}px`;
    hand.style.opacity = '1';

    // Check if indicator is visually inside container bounds
    autoHideOnXScroll(rect, containerRect, codeViewRect);
}

function autoHideOnXScroll(rect, containerRect, codeViewRect){
    // Ensure indicator target is visible within scrollable container (both axes)
    const visibleTop = codeScrollWrapper.scrollTop;
    const visibleBottom = visibleTop + codeScrollWrapper.clientHeight;
    const visibleLeft = codeScrollWrapper.scrollLeft;
    const visibleRight = visibleLeft + codeScrollWrapper.clientWidth;

    // Get the scroll-wrapper’s viewport rectangle once
    const wrapperRect = codeScrollWrapper.getBoundingClientRect();

    // Compute caret position relative to the wrapper’s content area
    const caretTopRelative = rect.top - wrapperRect.top + codeScrollWrapper.scrollTop;
    const caretBottomRelative = caretTopRelative + rect.height;
    const caretLeftRelative = rect.left - wrapperRect.left + codeScrollWrapper.scrollLeft;
    const caretRightRelative = caretLeftRelative + rect.width;

    // If caret is completely above OR below OR left OR right of visible area, hide it
    if (
        caretBottomRelative < visibleTop || // entirely above
        caretTopRelative > visibleBottom || // entirely below
        caretRightRelative < visibleLeft || // entirely left
        caretLeftRelative > visibleRight    // entirely right
    ) {
        hand.style.opacity = '0';
        return;
    }

    // Otherwise, re-apply the same left/top you computed earlier:
    hand.style.left = `${rect.left - containerRect.left + offsetX - currentScroll}px`;
    hand.style.top = `${rect.top - codeViewRect.top + offsetY - codeScrollWrapper.scrollTop}px`;
    hand.style.opacity = '1';
}

['input', 'keyup', 'click', 'keydown'].forEach(evt =>
    codeViewSec.addEventListener(evt, updateHandPosition)
);

window.addEventListener('resize', updateHandPosition);

document.addEventListener('click', (e) => {
    if (!codeViewSec.contains(e.target)) {
        hand.style.opacity = '0';
    } else {
        updateHandPosition();
    }
});

updateHandPosition();
