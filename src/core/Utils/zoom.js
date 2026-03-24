import { waitForElement } from "./dom_utils";

let contentContainer;
const appState = {
    currentScale: 1,  // Changed from 0 to 1 (100% scale)
    initialScale: 1,  // Fixed typo: innitial -> initial
};

waitForElement('#chatArea', (el) => {
    contentContainer = el;
    // Initialize with current scale
    appState.initialScale = 1;
    appState.currentScale = 1;
});

export function changeFontSize(delta) {
    if (!contentContainer) return console.log("contentContainer Not Found in DOM");

    // Apply scale change (typically 0.1 increments for 10% changes)
    appState.currentScale += delta;

    // Ensure scale doesn't go below a reasonable minimum
    if (appState.currentScale < 0.78) {
        appState.currentScale = 0.78;
    }
    if (appState.currentScale > 1.2) {
        appState.currentScale = 1.2;
    }
    // Apply the scale transform
    contentContainer.style.transform = `scale(${appState.currentScale})`;

    console.log('Scale change:', delta, 'Current scale:', appState.currentScale);
}

export function resetFontSize() {
    console.log("reset");
    if (!contentContainer) return;

    contentContainer.style.transform = `scale(${appState.initialScale})`;
    appState.currentScale = appState.initialScale;
}

