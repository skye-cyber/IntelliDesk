export function Notify(_color = null, time = null, text = "") {
    const modal = document.getElementById('quickaiNotify');
    const message = document.getElementById('messageContent');
    const timeTaken = document.getElementById('timeTaken');
    if (text) {
        message.innerText = text;
    } else if (time) {
        timeTaken.innerText = time;
    }
    // Slide modal to 20% height and make it visible after 1 second
    setTimeout(() => {
        modal.classList.add('top-1/5', 'opacity-100', 'pointer-events-auto');
    }, 200); // 1 second delay

    // Slide modal to the left and fade out after 5 seconds
    setTimeout(() => {
        modal.classList.remove('top-1/5', 'left-1/2', '-translate-x-1/2');
        modal.classList.add('left-0', '-translate-x-[100vw]', 'opacity-0', 'pointer-events-none');

    }, 5000); // 4 seconds for staying in the middle

    // Reset transform after fully fading out and moving off-screen
    setTimeout(() => {
        modal.classList.remove('left-0', '-translate-x-[100vw]', 'opacity-0', 'pointer-events-none');
        modal.classList.add('top-0', 'left-1/2', '-translate-x-1/2', 'pointer-events-none');
    }, 1000); // 0.5s for fade out
}

window.Notify = Notify;
