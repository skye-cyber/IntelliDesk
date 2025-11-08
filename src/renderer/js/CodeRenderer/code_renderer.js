import { marked } from "marked";
import hljs from 'highlight.js';
import { CanvasUtil } from "../managers/Canvas/CanvasUtils.js";

StateManager.set('processing', false);

const canvasutil = new CanvasUtil()

// Initialize highlight.js
hljs.configure({ ignoreUnescapedHTML: true });

// Custom renderer for syntax highlighting
const renderer = new marked.Renderer();
renderer.code = function(code) {
    // Handle case where `code` is an object
    let validLanguage = code.lang || 'plaintext';
    //console.log(`Language: ${validLanguage}`);
    if (typeof code === "object" && code.text !== undefined) {
        code = code.text; // Extract the actual code
    }

    if (typeof code !== "string" || code.trim() === "") {
        console.warn("Empty or invalid code provided:", code);
        code = "// No code provided"; // Default fallback for empty code

    }

    let dgCodeBlock = ['dot-draw', 'json-draw', 'json-chart'].includes(validLanguage) ? true : false;

    let dgLang = dgCodeBlock ? validLanguage : null;

    validLanguage = dgLang ? (['json', 'dot'].includes(dgLang) ? validLanguage.slice(0, -5) : validLanguage.slice(0, -6)) : validLanguage;

    // Highlight the code
    let highlighted;
    try {

        highlighted = hljs.highlight(code, { language: validLanguage }).value;

    } catch (error) {
        if (error.message === "Unknown language") {
            console.log("Undetermined language")
        }
        else {
            console.error("Highlighting error:", error.name);
            highlighted = hljs.highlightAuto(code).value; // Fallback to auto-detection
        }
    }

    // Reset language to json-draw
    validLanguage = dgLang ? dgLang : validLanguage

    // Generate unique ID for the copy button
    const copyButtonId = `copy-button-${Math.random().toString(36).substring(2, 9)}`;
    const renderButtonId = `render-button-${Math.random().toString(36).substring(2, 9)}`;
    const openInCanvasId = `open-canvas-${Math.random().toString(36).substring(2, 9)}`;
    const downloadButtonId = `download-${Math.random().toString(36).substring(2, 9)}`;
    const codeBlockId = `code-block-${Math.random().toString(36).substring(2, 9)}`;

    function get_render_fn() {
        if (['dot-draw', 'dot'].includes(validLanguage)) return `window.dot_interpreter.diagram_interpreter('#${codeBlockId}', 'dot', false, 'click')`

        if (['json-draw', 'json-chart'].includes(validLanguage)) return `chart_interpret.ChartsInterpreter('#${codeBlockId}', 'json', true, 'click')`

        if (['html', 'svg'].includes(validLanguage)) return `window.html_preview(this, '#${codeBlockId}')`
        return null
    }

    if (canvasutil.isCanvasOn()) {
        //increament code buffer
        StateManager.set('codeBuffer', { lang: validLanguage, code: `<code id="${validLanguage}" data-value=${codeBlockId} id="${codeBlockId}" class="hljs ${validLanguage} block whitespace-pre w-full rounded-md bg-none font-code transition-colors duration-500">${highlighted}</code>` })

        /*
         * return `
         *     <section class="flex justify-between top-1 p-1 w-full bg-sky-300 rounded-t-md dark:bg-[#001922] box-border transition-colors duration-700">
         *         <!-- Language -->
         *         <p class="code-language p-1 justify-start rounded-md text-slate-950 dark:text-white rounded-lg font-normal text-sm cursor-pointer opacity-80 hover:opacity-50">${validLanguage}</p>
         *         <div class="flex justify-between space-x-3">
         *             <!-- Copy button -->
         *             <button id="${copyButtonId}" onclick="window.handleCodeCopy(this, '${renderButtonId}');" class="copy-button flex items-center rounded-md p-1 bg-gradient-to-r from-sky-800 to-purple-600 hover:to-green-400 dark:from-[#00a5ce] dark:to-[#5500ff] dark:hover:from-[#00557f] dark:hover:to-[#006ea1] text-sm text-white cursor-pointer transform transition-all duration-700">
         *             <svg class="mt-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-copy mr-1">
         *             <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
         *             <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
         *             </svg>
         *             <p id="BtText">copy</p>
         *             </button>
         *         </div>
         *         </section>
         *         <article class="relative">
         *             <div class="h-full max-h-60 p-2 border border-[#00aaff] dark:border-[#00a5ce] w-full bg-cyan-100 dark:bg-[#001c24] rounded-md rounded-t-none overflow-auto scrollbar-hide transition-colors duration-700">
         *             <div class="absolute flex justify-center items-center left-0 top-0 bg-gray-800/70 flex flex-grow rounded-md rounded-t-none overflow-hidden h-full w-full lg:max-w-[100vw] z-[30] hover:scale-[101%] hover:border hover:border-blue-300 transform transition-all duration-700 ease-in-out">
         *             <button
         *             onclick="setCanvasUpdate(this)"
         *             class="flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:text-blue-200 transition-all duration-300 shadow-lg"
         *             >
         *             <span class="text-sm font-normal text-white hover:text-green-400 transition-colors duration-300">
         *             &lt;/&gt;
         *             </span>
         *             Click to open canvas
         *             </button>
         *             </div>
         *             <code id="${validLanguage}" data-value=${renderButtonId} class="p-2 hljs ${validLanguage} block whitespace-pre rounded-md bg-cyan-100 dark:bg-[#001c24] font-mono overflow-x-auto">${highlighted}</code>
         *             </div>
         *         </article>
         *         `
    } else {
        */
    }
    return `
    <div class="block bg-gray-200 dark:bg-gray-400  rounded-md transition-colors duration-100">
        <section class="flex justify-between w-full bg-gray-300 rounded-t-md dark:bg-zinc-600 box-border transition-colors duration-700">
            <!-- Language -->
            <p class="code-language p-1 justify-start rounded-md text-slate-950 dark:text-white rounded-lg font-normal text-sm cursor-pointer opacity-80 hover:opacity-50">
            ${validLanguage}
            </p>
            <div class="flex justify-between items-center space-x-2">
                <button id="${openInCanvasId}" onclick="window.openInCanvas(this, '${codeBlockId}')" id="openBtn" class="flex items-center gap-0.5 p-1 hover:bg-zinc-400 rounded-md text-xs text-secondary-900 dark:text-white cursor-pointer transform transition-all duration-700" aria-pressed="false" title="Open coding canvas">
                    <!-- simple plus icon (SVG) -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mt-0.5" fill="currentColor" viewBox="0 0 640 640">
                        <path d="M392.8 65.2C375.8 60.3 358.1 70.2 353.2 87.2L225.2 535.2C220.3 552.2 230.2 569.9 247.2 574.8C264.2 579.7 281.9 569.8 286.8 552.8L414.8 104.8C419.7 87.8 409.8 70.1 392.8 65.2zM457.4 201.3C444.9 213.8 444.9 234.1 457.4 246.6L530.8 320L457.4 393.4C444.9 405.9 444.9 426.2 457.4 438.7C469.9 451.2 490.2 451.2 502.7 438.7L598.7 342.7C611.2 330.2 611.2 309.9 598.7 297.4L502.7 201.4C490.2 188.9 469.9 188.9 457.4 201.4zM182.7 201.3C170.2 188.8 149.9 188.8 137.4 201.3L41.4 297.3C28.9 309.8 28.9 330.1 41.4 342.6L137.4 438.6C149.9 451.1 170.2 451.1 182.7 438.6C195.2 426.1 195.2 405.8 182.7 393.3L109.3 320L182.6 246.6C195.1 234.1 195.1 213.8 182.6 201.3z"/>
                    </svg>
                    <span>Canvas</span>
                </button>

                <!-- Copy button -->
                <button id="${copyButtonId}" onclick="window.handleCodeCopy(this, '${renderButtonId}');" class="copy-button flex items-center gap-0.5 p-1 hover:bg-zinc-400 rounded-md text-xs text-secondary-900 dark:text-white cursor-pointer transform transition-all duration-700">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-copy mr-1">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span id="BtText">copy</span>
                </button>
                <button id="${downloadButtonId}" onclick="${get_render_fn()}" class="run-button flex items-center gap-0.5 rounded-md text-xs text-secondary-900 dark:text-white cursor-pointer hover:bg-zinc-400 p-1 transform transition-all duration-700">
                    <!-- Network / Diagram Icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 640 640">
                        <path d="M352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 306.7L246.6 265.3C234.1 252.8 213.8 252.8 201.3 265.3C188.8 277.8 188.8 298.1 201.3 310.6L297.3 406.6C309.8 419.1 330.1 419.1 342.6 406.6L438.6 310.6C451.1 298.1 451.1 277.8 438.6 265.3C426.1 252.8 405.8 252.8 393.3 265.3L352 306.7L352 96zM160 384C124.7 384 96 412.7 96 448L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 448C544 412.7 515.3 384 480 384L433.1 384L376.5 440.6C345.3 471.8 294.6 471.8 263.4 440.6L206.9 384L160 384zM464 440C477.3 440 488 450.7 488 464C488 477.3 477.3 488 464 488C450.7 488 440 477.3 440 464C440 450.7 450.7 440 464 440z"/>
                    </svg>
                    <p id="BtText">Download</p>
                </button>
                ${['dot', 'dot-draw', 'json-draw', 'json-chart', 'svg', 'html'].includes(validLanguage) ? `
                <button id="${renderButtonId}" onclick="${get_render_fn()}" class="run-button flex items-center gap-0.5 rounded-md text-xs text-secondary-900 dark:text-white cursor-pointer hover:bg-zinc-400 p-1 transform transition-all duration-700">
                    <!-- Network / Diagram Icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 640 640">
                        <path d="M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM276.5 211.5C269.1 207 259.8 206.8 252.2 211C244.6 215.2 240 223.3 240 232L240 408C240 416.7 244.7 424.7 252.3 428.9C259.9 433.1 269.1 433 276.6 428.4L420.6 340.4C427.7 336 432.1 328.3 432.1 319.9C432.1 311.5 427.7 303.8 420.6 299.4L276.6 211.4zM362 320L288 365.2L288 274.8L362 320z"/></svg>
                    <p id="BtText">Run</p>
                </button>
                ` : ''}
            </div>
        </section>
        <code data-value=${codeBlockId} id="${codeBlockId}" class="hljs ${validLanguage} h-full font-md leading-[1.5] p-4 scrollbar-custom m-0 bg-[#ffffff] border border-white shadow-balanced block whitespace-pre font-code text-sm  transition-colors duration-700 overflow-x-auto rounded-md rounded-t-none">${highlighted}</code>
    </div>
            `
};

marked.setOptions({
    renderer: renderer,
    breaks: true,
});

window.marked = marked;

export const markitdown = marked
