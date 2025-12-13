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
            //console.log('KaTeX rendering complete for', contain- Calculate $P(Edible=Yes | Color=Red, Flavor=Grape)$:\n     $$\n     P(Edible=Yes | Color=Red, Flavor=Grape) = \\frac{P(Color=Red, Flavor=Grape | Edible=Yes) \\cdot P(Edible=Yes)}{P(Color=Red, Flavor=Grape)}\n     $$\n     Using the dataset:\n     $$\n     P(Edible=Yes | Color=Red, Flavor=Grape) = \\frac{1/6 \\cdot 6/10}{3/10} = \\frac{1}{3}\n     $$\nerSelector);
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
    /**
     * Standardizes math expressions by removing unnecessary linebreaks in $$ blocks.
     * Preserves all code blocks (fenced and inline) and handles edge cases.
     */

    let result = '';
    let i = 0;
    const len = content.length;

    while (i < len) {
        // Check for code blocks first (they have highest priority)
        if (content[i] === '`') {
            // Count consecutive backticks
            let backtickCount = 1;
            while (i + backtickCount < len && content[i + backtickCount] === '`') {
                backtickCount++;
            }

            // If we have at least 3 backticks, it's a fenced code block
            if (backtickCount >= 3) {
                // Find the closing fence
                let j = i + backtickCount;
                let foundClosing = false;

                while (j <= len - backtickCount) {
                    if (content.substring(j, j + backtickCount) === '`'.repeat(backtickCount)) {
                        // Found closing fence, copy everything as-is
                        result += content.substring(i, j + backtickCount);
                        i = j + backtickCount;
                        foundClosing = true;
                        break;
                    }
                    j++;
                }

                if (!foundClosing) {
                    // Unclosed code block, copy remaining
                    result += content.substring(i);
                    i = len;
                }
                continue;
            }
            // Single backtick - inline code
            else if (backtickCount === 1) {
                // Find closing backtick
                let j = i + 1;
                while (j < len && content[j] !== '`') {
                    j++;
                }

                if (j < len) {
                    // Found closing backtick
                    result += content.substring(i, j + 1);
                    i = j + 1;
                    continue;
                }
            }
        }

        // Check for math blocks ($$)
        if (content.substring(i, i + 2) === '$$') {
            // Find closing $$
            let j = i + 2;
            let foundClosing = false;

            while (j <= len - 2) {
                if (content.substring(j, j + 2) === '$$') {
                    // Extract math content
                    let mathContent = content.substring(i + 2, j);

                    // Clean up linebreaks
                    mathContent = mathContent
                    .replace(/^\s*\n/, '')  // Remove leading linebreak
                    .replace(/\n\s*$/, ''); // Remove trailing linebreak

                    result += `$$${mathContent}$$`;
                    i = j + 2;
                    foundClosing = true;
                    break;
                }
                j++;
            }

            if (!foundClosing) {
                // Unclosed math block, copy as-is
                result += content.substring(i);
                i = len;
            }
            continue;
        }

        // Regular character
        result += content[i];
        i++;
    }

    return result;
}

window.debounceRenderKaTeX = debounceRenderKaTeX
window.NormalizeCode = NormalizeCode
