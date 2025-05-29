import 'katex/dist/katex.min.css';
//import katex from 'katex';
import renderMathInElement from 'katex/contrib/auto-render';

// Make renderMathInElement globally available if needed
window.renderMathInElement = renderMathInElement;

// Function to ensure Katex renders dynamically injected content
//let renderTimeout;

const renderTimeouts = new Map();

function debounceRenderKaTeX(containerSelector, delay = 1000, noDelay = false) {
    const selector = containerSelector ? containerSelector : 'body'
    let element = document.querySelector(selector);

    if (!element) return;

    const render = () => {
        renderTimeouts.delete(containerSelector);  // Clear from the map once rendered

        if (window.renderMathInElement) {
            window.renderMathInElement(element, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '\\[', right: '\\]', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: true },
                ],
                throwOnError: false,
            });
            console.log('KaTeX rendering complete for', selector);
        } else {
            console.error('KaTeX auto-render extension not loaded.');
        }
    };

    // Avoid scheduling another render if one is already queued for the same container
    if (renderTimeouts.has(containerSelector)) return;

    if (noDelay) {
        render();
    } else {
        const timeout = setTimeout(render, delay);
        renderTimeouts.set(containerSelector, timeout);
    }
}

function NormalizeCode(element) {
    const targetList = element ? element.querySelectorAll('code') : document.querySelectorAll('code');
    for (const x in targetList) {
        x
            .replace(`$`, `\[`)
            .replace(`$`, `\]`)
    }
}
window.debounceRenderKaTeX = debounceRenderKaTeX
window.NormalizeCode = NormalizeCode
