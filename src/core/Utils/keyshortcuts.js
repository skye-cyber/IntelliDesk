import { changeFontSize, resetFontSize } from "./zoom";

document.addEventListener("keydown", event => {
    // 1) if it’s F11, do nothing here and let the browser/Electron handle it
    if (event.key === "F11" || event.code === "F11") {
        return;
    }

    // 2) now your other shortcuts, with proper grouping
    if ((event.ctrlKey && (event.key === "S" || event.key === "s"))) {
        event.preventDefault();
        document.dispatchEvent(new CustomEvent('open-settings'));

    } else if (event.key === "Escape") {
        event.preventDefault();
        document.dispatchEvent(new CustomEvent('close-settings'));
        if (!document.getElementById('previewModal')?.classList.contains('hidden')) {
            document.dispatchEvent(new CustomEvent('close-preview'));
        } else {
            document.dispatchEvent(new CustomEvent('close-dropzone'));
        }
        document.dispatchEvent(new CustomEvent("close-tool"))

    } else if ((event.ctrlKey && (event.key === "P" || event.key === "p"))) {
        event.preventDefault();
        document.getElementById("togglePane")?.click();

    } else if ((event.ctrlKey && (event.key === "N" || event.key === "n"))) {
        event.preventDefault();
        //NewConversation(event);

    } else if ((event.ctrlKey && (event.key === "F" || event.key === "f"))) {
        event.preventDefault();
        document.getElementById('AttachFiles')?.click();;

    } else if ((event.altKey && (event.key === "A" || event.key === "a"))) {
        event.preventDefault();
        document.getElementById("autoScroll")?.click();
    } else if (event.ctrlKey && event.key.toLocaleLowerCase() === '=') {
        event.preventDefault();
        changeFontSize(0.1)
        // Decrease Font
    } else if (event.ctrlKey && event.key.toLocaleLowerCase() === '-') {
        event.preventDefault();
        changeFontSize(-0.1)
        // Reset font
    } else if (event.ctrlKey && event.key.toLocaleLowerCase() === '0') {
        event.preventDefault();
        resetFontSize()
    }
});
