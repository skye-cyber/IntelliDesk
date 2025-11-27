import '@math/katex/katex.min.css';
//import katex from 'katex';
import renderMathInElement from '@math/katex/contrib/auto-render';

// Make renderMathInElement globally available if needed
window.renderMathInElement = renderMathInElement;

// Function to ensure Katex renders dynamically injected content
//let renderTimeout;

const renderTimeouts = new Map();

export const renderAll_aimessages = () => {
    setTimeout(() => {
        const targets = document.querySelectorAll('#ai_response')
        targets.forEach(res => {
            debounceRenderKaTeX(res, null, null, true, true)
        })
    }, 150)
}

export function debounceRenderKaTeX(containerSelector, delay = 1000, noDelay = false, is_element = false) {

    if (!containerSelector && !is_element) {
        //console.log("containerSelector missing")
        return renderAll_aimessages()
    }
    let element = is_element ? containerSelector : document.querySelector(containerSelector);

    if (!element) return;

    const render = () => {
        renderTimeouts.delete(containerSelector);  // Clear from the map once rendered

        if (window.renderMathInElement) {
            renderMathInElement(element, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '\\[', right: '\\]', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                ],
                throwOnError: false,
            });
            //console.log('KaTeX rendering complete for', containerSelector);
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

export function leftalinemath() {
    const roots = document.querySelectorAll('.katex-display')
    roots?.forEach(root => {
        root?.querySelectorAll('.katex-html').forEach(el => {
            el?.classList.add('text-left')
            console.log(el)
        })
    })
}

export function NormalizeCode(element) {
    const targetList = element ? element.querySelectorAll('code') : document.querySelectorAll('code');
    for (const x in targetList) {
        x
            .replace(`$`, `\[`)
            .replace(`$`, `\]`)
    }
}
window.debounceRenderKaTeX = debounceRenderKaTeX
window.NormalizeCode = NormalizeCode
