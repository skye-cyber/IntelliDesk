import DOMPurify from 'dompurify'; // If using modules
import { waitForElement } from './dom_utils.js';
import { StateManager } from '../managers/StatesManager.js';

export function addCopyListeners() {
    document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', async function() {
            const codeBlock = this.parentNode.parentNode.nextElementSibling.querySelector('code');
            const textToCopy = codeBlock.innerText;
            const button = document.getElementById(this.id);
            try {
                await navigator.clipboard.writeText(textToCopy);
                button.children[1].textContent = 'copied!';
                setTimeout(() => {
                    button.children[1].textContent = 'copy';
                }, 2000);
                showCopyModal();
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        });
    });
}

export async function handleCodeCopy(b_id, id = null) {
    const codeBlock = document.querySelector(`[data-value="${id}"]`);
    const textToCopy = codeBlock.innerText;
    const button = document.getElementById(b_id);
    try {
        await navigator.clipboard.writeText(textToCopy);
        const BtText = button?.querySelector('#BtText')
        BtText.textContent = 'copied!';
        setTimeout(() => {
            BtText.textContent = 'copy';
        }, 2000);
        showCopyModal();
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

export function implementUserCopy() {
    document.querySelectorAll('.user-copy-button').forEach(button => {
        const buttonParent = button.parentElement;
        const textBlock = buttonParent.querySelector('p');

        if (textBlock && textBlock.innerHTML.length < 50) {
            button.style.display = 'none';
        }

        button.addEventListener('click', async function() {
            const textToCopy = textBlock.innerText;

            if (textToCopy.length >= 50) {
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    this.textContent = 'Copied!';
                    setTimeout(() => {
                        this.textContent = 'Copy';
                    }, 3000);
                } catch (err) {
                    console.error('Failed to copy: ', err);
                }
            }
        });
    });
}

// Copy function for the whole text block/aiMessage
export function CopyMessage(UId, bt = null, html = false) {
    //console.log(UId)
    const textBlock = document.querySelector(UId);
    //console.log(textBlock)
    if (!textBlock) {
        console.error('Element not found: ', UId);
        return;
    }

    const textToCopy = html === true ? textBlock.innerHTML : textBlock.textContent;
    //console.log(textToCopy)

    if (textToCopy.length >= 50) {
        try {
            navigator.clipboard.writeText(textToCopy);
            if (bt) {
                bt.textContent = 'Copied!';
                setTimeout(() => {
                    bt.textContent = 'Copy';
                }, 3000)
            }
            showCopyModal()
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    } else {
        console.log('Text is too short to copy: ', textToCopy);
    }
}

// Function to show the modal
export function showCopyModal(_color = null, text = "Text copied") {
    const modal = document.getElementById('copyModal');
    const txtSpace = document.getElementById("text-space")

    //txtSpace.textContent = text;
    //addRmColor();
    function addRmColor(task = "add") {
        if (_color) {
            if (task === "add") {
                txtSpace.classList.add(_color);
                console.log("Added", _color)
            }
            else {
                txtSpace.classList.remove(_color);
                console.log("Removed", _color)
            }
        }
    }
    // Slide modal to 20% height and make it visible after 1 second
    setTimeout(() => {
        modal.classList.add('top-1/5', 'opacity-100', 'pointer-events-auto');
    }, 500); // 1 second delay

    // Slide modal to the left and fade out after 5 seconds
    setTimeout(() => {
        modal.classList.remove('top-1/5', 'left-1/2', '-translate-x-1/2');
        modal.classList.add('left-0', '-translate-x-[100vw]', 'opacity-0', 'pointer-events-none');

    }, 4000); // 5 seconds for staying in the middle plus 1 second delay

    // Reset transform after fully fading out and moving off-screen
    setTimeout(() => {
        modal.classList.remove('left-0', '-translate-x-[100vw]', 'opacity-0', 'pointer-events-none');
        modal.classList.add('top-0', 'left-1/2', '-translate-x-1/2', 'pointer-events-none');
    }, 1000); // 1s for fade out
    //addRmColor("rm")
}

// Function to remove the first conversation pairs to maintain conversation size limit
export function removeFirstConversationPairs(conversationHistory, count = 2) {
    let removed = 0;
    while (removed < count && conversationHistory.length > 0) {
        const firstPair = conversationHistory[0];
        if (firstPair.role !== "system") {
            conversationHistory.shift();
            removed++;
            console.log("New conversation:", conversationHistory)
        } else {
            // Skip system instructions
            break;
        }
    }
}

export function copyBMan() {
    document.querySelectorAll(".Vision-user-copy-button").forEach(button => {
        //console.log("Adding copy control")
        // Get the next sibling of the current element
        const nextSibling = button.nextElementSibling;

        // Check if the next sibling exists
        if (nextSibling) {
            // Get the first child of the next sibling
            const userTextChild = nextSibling.firstElementChild;

            if (userTextChild.innerHTML.length < 50) {
                button.classList.toggle('hidden');
            } else {
                console.log("userTextChild not found")
            }
        }
    });
}

export function InputPurify(unsafe) {
    const cleanHTML = DOMPurify.sanitize(unsafe, {
        ALLOWED_TAGS: ['br', 'strong', 'em'], // Allow paragraphs, line breaks, bold, italic, links
        //ALLOWED_ATTR: ['href'], // Only allow the 'href' attribute (useful for 'a' tags)
        //ADD_TAGS: ['img'], // Add the image tag
        //ADD_ATTR: ['src', 'alt', 'data-id'] // Add these attributes (src/alt for img, data-id for any relevant tag)
    });
    return cleanHTML
        // 2. Format: Collapse multiple <br> tags using regex
        // This regex finds a <br> tag (with optional self-closing slash and whitespace)
        // followed by one or more similar <br> tags (again with optional whitespace between them).
        // It replaces the entire matched sequence with a single <br> tag.
        .replace(/(<br\s*\/?>\s*){2,}/gi, '<br>')
        // 3. Apply formatting: Collapse sequences of &nbsp; entities
        // This regex finds a sequence of two or more consecutive &nbsp; entities,
        // potentially separated by optional whitespace characters (\s*), and replaces
        // the entire sequence with a single regular space (' ').
        .replace(/(&nbsp;\s*){2,}/gi, ' ')
        // Optional: Collapse sequences of regular spaces as well if they weren't handled by white-space: pre-wrap
        // (white-space: pre-wrap should handle regular spaces, but this is a fallback)
        .replace(/ {2,}/g, ' ')
    /*if (typeof unsafe !== 'string') {
        return '';
    }
    return unsafe
    .replace(/&/g, "&amp;")
    .replace(/\n+/g, '\n')  // 1+ newlines → 1 newline
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
    */

}

export function HandleProcessingEventChanges(status) {
    const sendBtn = document.getElementById("sendBtn");
    const normalSend = document.getElementById("normalSend"); //initially displayed
    const spinningSquares = document.getElementById("spinningSquares"); //inirially hidden

    if (status === 'show') {
        StateManager.set('processing', true);

        normalSend.classList.add('hidden')
        spinningSquares.classList.remove('hidden')
        //Disable the send button
        sendBtn.disabled = true;
        // Add Cursor prohibited/disabled cursor class
        sendBtn.classList.add('cursor-disable');
    } else if (status === 'hide') {
        StateManager.set('processing', false);

        spinningSquares.classList.add('hidden')
        normalSend.classList.remove('hidden')
        //re-enable the send button
        sendBtn.disabled = false;
        // Remove Cursor prohibited/disabled cursor class
        sendBtn.classList.remove('cursor-disable');
    }
}

// Grab the button element
waitForElement('#previewBtn', addPreviewClickListener)

export function addPreviewClickListener(el) {
    el.addEventListener('click', function() {
        // Determine current state from the aria-pressed attribute
        const isActive = this.getAttribute('aria-pressed');

        // Toggle the state
        this.setAttribute('aria-pressed', (isActive === 'false') ? "true" : "false");
        //console.log(this.getAttribute('aria-pressed'))

        //update system instructions
        window.desk.api.updateSysInit()

        if (isActive !== "true") {
            // When activated: switch to vibrant green theme
            this.classList.remove('border-sky-900', 'bg-blue-100', 'hover:bg-sky-300', 'dark:bg-[#171717]', 'dark:border-[#aa55ff]');
            this.classList.add('border-green-500', 'bg-green-300', 'hover:bg-green-400', 'dark:border-green-950', 'dark:bg-green-800');
        } else {
            // When deactivated: revert to vibrant red theme
            this.classList.remove('border-green-500', 'bg-green-300', 'hover:bg-green-400', 'dark:border-green-950', 'dark:bg-green-800', 'dark:hover:bg-green-600');
            this.classList.add('border-sky-900', 'bg-blue-100', 'hover:bg-sky-300', 'dark:bg-[#171717]', 'dark:border-[#aa55ff]');
        }
    });
}

StateManager.set('imageGen', false)

waitForElement('#image-gen', addImageGenClickListener)

export function addImageGenClickListener(el) {
    el.addEventListener('click', function() {

        // Determine current state from the aria-pressed attribute
        const isActive = this.getAttribute('aria-pressed');

        // Toggle the state
        this.setAttribute('aria-pressed', (isActive === 'false') ? "true" : "false");

        console.log(this.getAttribute('aria-pressed'))
        if (isActive !== "true") {
            // When activated: switch to vibrant blue gradient with shadow
            this.classList.remove('dark:bg-orange-400', 'bg-[#ffaa7f]', 'dark:text-white'); // Remove inactive gradient
            this.classList.add('bg-[#00ff00]', 'shadow-lg', 'dark:text-blue-950');
            window.imageGen = true;
        } else {
            // When deactivated: revert to original gradient without shadow
            this.classList.remove('bg-[#00ff00]', 'shadow-lg', 'dark:text-blue-950');
            this.classList.add('bg-[#ffaa7f]', 'dark:text-white', 'dark:bg-orange-400'); // Restore inactive gradient
            window.imageGen = false;
        }
    });
}

window.CopyMessage = CopyMessage
window.copyBMan = copyBMan
window.InputPurify = InputPurify
window.showCopyModal = showCopyModal
window.handleCodeCopy = handleCodeCopy;
window.showDeletionStatus = showCopyModal
window.implementUserCopy = implementUserCopy
window.removeFirstConversationPairs = removeFirstConversationPairs
window.HandleProcessingEventChanges = HandleProcessingEventChanges;
