export function scrollToBottom(element) {
    // Use setTimeout to ensure the scroll happens after the DOM has updated
    setTimeout(() => {
        element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
    }, 100);
}

// Function to update scroll button visibility
export function updateScrollButtonVisibility() {
    //console.log("Scrollable")
    const chatArea = document.getElementById('chatArea')
    const scrollButton = document.getElementById('scroll-bottom')

    const isScrollable = chatArea.scrollHeight > chatArea.clientHeight;
    const isAtBottom = chatArea.scrollTop + chatArea.clientHeight >= chatArea.scrollHeight;

    scrollButton.classList.toggle('hidden', !(isScrollable && !isAtBottom));
}
