export function GenerateId(prefix = '', postfix = '', length = 6) {
    // Generate a random alphanumeric string (letters + digits) for valid class/ID characters
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let randomStr = '';
    for (let i = 0; i < length; i++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Build id ensuring no extra hyphens when prefix or postfix are empty
    let id = '';
    if (prefix) {
        id += prefix;
    }
    if (prefix && randomStr) {
        id += '-';
    }
    id += randomStr;
    if (postfix) {
        id += '-' + postfix;
    }

    return id;
}

export function CopyMessage(element, html = false) {
    const textToCopy = (html === true) ?
        element.innerHTML :
        element.textContent;

    if (textToCopy.length >= 0) {
        try {
            navigator.clipboard.writeText(textToCopy);
            html ?
                StateManager.get('showCopyFeedback')("Clone successfull!") :
                showCopyModal()
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    } else {
        console.log('Text is too short to copy: ', textToCopy);
    }
}
