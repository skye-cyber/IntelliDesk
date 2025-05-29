const settingsModal = document.getElementById("settingsModal");

document.addEventListener("keydown", event => {
    // 1) if it’s F11, do nothing here and let the browser/Electron handle it
    if (event.key === "F11" || event.code === "F11") {
        return;
    }

    // 2) now your other shortcuts, with proper grouping
    if ((event.ctrlKey && (event.key === "S" || event.key === "s"))) {
        event.preventDefault();
        settingsModal.classList.toggle("hidden");

    } else if (event.key === "Escape") {
        event.preventDefault();
        settingsModal.classList.add("hidden");

    } else if ((event.ctrlKey && (event.key === "P" || event.key === "p"))) {
        event.preventDefault();
        document.getElementById("togglePane").click();

    } else if ((event.ctrlKey && (event.key === "N" || event.key === "n"))) {
        event.preventDefault();
        NewConversation(event);

    } else if ((event.ctrlKey && (event.key === "F" || event.key === "f"))) {
        event.preventDefault();
        attachFiles.click();

    } else if ((event.altKey && (event.key === "A" || event.key === "a"))) {
        event.preventDefault();
        document.getElementById("AutoScroll").click();
    }
});
