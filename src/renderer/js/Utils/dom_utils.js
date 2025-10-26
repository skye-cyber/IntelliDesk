export function waitForElement(selector, callback, delay=100) {
    const checkExist = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
            clearInterval(checkExist);
            callback(el);
        }
    }, delay);  // check every xms
}
