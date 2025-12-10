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

    //element.innerHTML = mathStandardize(element.innerHTML)

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
        })
    })
}

export function NormalizeCode(element) {
    const targetList = element ? element.querySelectorAll('code') : document.querySelectorAll('code');
    for (const x in targetList) {
        x
            .replace(/\$\$(?=[\s\S]*?(?:\\|[\d\^+\-*/]))([\s\S]*?)\$\$/g, `\[`)
            .replace(`$`, `\]`)
    }
}

export function mathStandardize(content) {
    // Regex to detect and skip code blocks
    //const codeBlockRegex = /(```[\s\S]*?```)|(    [\s\S]*?\n(?!\s))/g;
    //no greedy ``` match-match `...`
    const codeBlockRegex = /(```(?:[^`]|`(?!``))*```)|(    [\s\S]*?\n(?!\s))|(`[\s\S]*?`)/g;
    //Extend the regex to support custom code block delimiters, if necessary:
    //const codeBlockRegex = /(```[\s\S]*?```)|(    [\s\S]*?\n(?!\s))|(:::code[\s\S]*?:::)/g;


    // Replace code blocks with a placeholder
    const placeholders = [];
    content = content.replace(codeBlockRegex, (match) => {
        placeholders.push(match);
        return `__CODE_BLOCK_${placeholders.length - 1}__`;
    });

    // Remove linebreaks after opening $$ and before closing $$
    content = content.replace(
        /\$\$\s*\n([\s\S]*?)\n\s*\$\$/g,
                              (_, expr) => `$$${expr.trim()}$$`
    );

    // Restore code blocks
    content = content.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => placeholders[index]);

    return content;
}

window.debounceRenderKaTeX = debounceRenderKaTeX
window.NormalizeCode = NormalizeCode
