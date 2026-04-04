import { globalEventBus } from "../Globals/eventBus";
import { changeFontSize, resetFontSize } from "./zoom";

document.addEventListener("keydown", event => {

    // globalEventBus.emit('key:down', event)

    // 1) if it’s F11, do nothing here and let the browser/Electron handle it
    if (event.key === "F11" || event.code === "F11") {
        return;
    }

    // 2) now your other shortcuts, with proper grouping
    if ((event.ctrlKey && (event.key === "S" || event.key === "s"))) {
        event.preventDefault();
        globalEventBus.emit('setting:open')

    } else if (event.key === "Escape") {
        event.preventDefault();
        globalEventBus.emit('setting:close');
        if (!document.getElementById('previewModal')?.classList.contains('hidden')) {
            globalEventBus.emit('fileupload:preview:close')
        } else {
            globalEventBus.emit('dropzone:close')
        }
        globalEventBus.emit('tool:result:close')

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
        globalEventBus.emit('scroll:bottom')
        console.log('emit')
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
