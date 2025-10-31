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

    function getdgFunction() {
        const mapper = {
            'dot-draw': `window.handleDiagrams(this, 'dot', isPlainCode=true, trigger='click')`,
            'dot': `window.handleDiagrams(this, 'dot', isPlainCode=true, trigger='click')`,
            'json-draw': `window.handleDiagrams(this, 'json'}', isPlainCode=true, trigger='click')`,
            'json-chart': `window.LoopRenderCharts(this, type='code', trigger='click')`
        }
        return dgLang ? mapper[dgLang] : validLanguage === 'dot' ? mapper[validLanguage] : ''
    }
    if (canvasutil.isCanvasOn()) {
        //increament code buffer
        StateManager.set('codeBuffer', { lang: validLanguage, code: `<code id="${validLanguage}" data-value=${renderButtonId} class="hljs ${validLanguage} block whitespace-pre w-full rounded-md bg-none font-mono transition-colors duration-500">${highlighted}</code>` })

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
    <div class="my-2 block bg-blue-300 dark:bg-[#004c6a]  rounded-md transition-colors duration-100">
    <section class="flex justify-between top-1 p-1 w-full bg-sky-300 rounded-t-md dark:bg-[#001922] box-border transition-colors duration-700">
    <!-- Language -->
    <p class="code-language p-1 justify-start rounded-md text-slate-950 dark:text-white rounded-lg font-normal text-sm cursor-pointer opacity-80 hover:opacity-50">
    ${validLanguage}
    </p>
    <div class="flex justify-between space-x-3">
    ${(dgCodeBlock || validLanguage === 'dot') ? `
        <!-- Render Button -->
        <button
        id="${renderButtonId}"
        onclick="${getdgFunction()}"
        class="render-button flex items-center gap-1 rounded-md p-1 bg-gradient-to-r from-[#00aaff] to-purple-700 hover:to-[#55ff00] text-sm text-white cursor-pointer transform transition-all duration-700"
        >
        <!-- Network / Diagram Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="5" r="2" />
        <circle cx="5" cy="19" r="2" />
        <circle cx="19" cy="19" r="2" />
        <line x1="12" y1="7" x2="5" y2="17" />
        <line x1="12" y1="7" x2="19" y2="17" />
        </svg>
        <p id="BtText">Render</p>
        </button>
        ` : ''}
        <button id="openBtn" class="w-fit h-fit inline-flex items-center  gap-1 p-1 text-sm rounded-md border border-[rgba(0,0,0,0.06)] bg-white dark:bg-[#00779f] cursor-pointer shadow-md shadow-[rgba(16,24,40,0.06)] font-semibold text-[#0f172a] dark:text-white hover:scale-[1.1] transition-transform transition-all duration-300" aria-pressed="false" title="Open coding canvas">
        <!-- simple plus icon (SVG) -->
        <svg class="inline-block w-5 h-6 mt-0.5 text-[#0f172a] dark:text-white stroke-[#0f172a] dark:stroke-white fill-[#0f172a]" dark:fill-[#5b8cff]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10.5" y="4" width="3" height="16" rx="1.5" class="fill-[#0f172a]" dark:fill-[#5b8cff]"></rect>
        <rect x="4" y="10.5" width="16" height="3" rx="1.5" class="fill-[#0f172a]" dark:fill-[#5b8cff]"></rect>
        </svg>
        <span>Canvas</span>
        </button>

        <div class="flex justify-between space-x-3"
        ${(['html', 'svg'].includes(validLanguage)) ? `
            <!-- Render html+svg -->
            <button
            id="${renderButtonId}"
            onclick="window.renderHtml(this);"
            class="render-button flex items-center gap-1 rounded-md p-1 bg-gradient-to-r from-[#00aaff] to-purple-700 hover:to-[#55ff00] text-sm text-white cursor-pointer transform transition-all duration-700"
            >
            <!-- Network / Diagram Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="5" r="2" />
            <circle cx="5" cy="19" r="2" />
            <circle cx="19" cy="19" r="2" />
            <line x1="12" y1="7" x2="5" y2="17" />
            <line x1="12" y1="7" x2="19" y2="17" />
            </svg>
            <p id="BtText">Render</p>
            </button>
            ` : ''}

            <!-- Copy button -->
            <button id="${copyButtonId}" onclick="window.handleCodeCopy(this, '${renderButtonId}');" class="copy-button flex items-center rounded-md p-1 bg-gradient-to-r from-sky-800 to-purple-600 hover:to-green-400 dark:from-[#00a5ce] dark:to-[#5500ff] dark:hover:from-[#00557f] dark:hover:to-[#006ea1] text-sm text-white cursor-pointer transform transition-all duration-700">
            <svg class="mt-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-copy mr-1">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <p id="BtText">copy</p>
            </button>
            </div>
            </section>
            <div class="p-2 border border-[#00aaff] dark:border-[#00a5ce] w-full bg-cyan-100 dark:bg-[#001c24] rounded-md rounded-t-none overflow-auto scrollbar-hide transition-colors duration-700">
            <code data-value=${renderButtonId} class="p-2 hljs ${validLanguage} block whitespace-pre rounded-md bg-cyan-100 dark:bg-[#001c24] font-mono transition-colors duration-700 overflow-x-auto">${highlighted}</code>
            </div>
            </div>
            `
};

marked.setOptions({
    renderer: renderer,
    breaks: true,
});

window.marked = marked;

export const markitdown = marked
