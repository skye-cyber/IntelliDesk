const htmlMath = `
"To calculate the area of Earth divided by the area of the Sun, multiplied by the distance between Earth and Proxima Centauri B raised to the power of 12, we need to use the following values:\n\n- Radius of Earth ($R_E$): approximately $6.371 \\times 10^6$ meters\n- Radius of the Sun ($R_S$): approximately $6.957 \\times 10^8$ meters\n- Distance between Earth and Proxima Centauri B ($d$): approximately $4.244$ light-years, which is about $4.014 \\times 10^{16}$ meters\n\nThe area of a sphere is given by $4\\pi r^2$. Therefore, the areas of Earth and the Sun are:\n\n- Area of Earth ($A_E$): $4\\pi R_E^2$\n- Area of the Sun ($A_S$): $4\\pi R_S^2$\n\nThe calculation is as follows:\n\n1. Calculate the area of Earth:\n   \\[\n   A_E = 4\\pi (6.371 \\times 10^6)^2\n   \\]\n\n2. Calculate the area of the Sun:\n   \\[\n   A_S = 4\\pi (6.957 \\times 10^8)^2\n   \\]\n\n3. Divide the area of Earth by the area of the Sun:\n   \\[\n   \\frac{A_E}{A_S} = \\frac{4\\pi (6.371 \\times 10^6)^2}{4\\pi (6.957 \\times 10^8)^2}\n   \\]\n\n4. Multiply by the distance raised to the power of 12:\n   \\[\n   \\left( \\frac{A_E}{A_S} \\right) \\times (4.014 \\times 10^{16})^{12}\n   \\]\n\nPutting it all together:\n\n\\[\n\\left( \\frac{4\\pi (6.371 \\times 10^6)^2}{4\\pi (6.957 \\times 10^8)^2} \\right) \\times (4.014 \\times 10^{16})^{12}\n\\]\n\nSimplifying the expression:\n\n\\[\n\\left( \\frac{(6.371 \\times 10^6)^2}{(6.957 \\times 10^8)^2} \\right) \\times (4.014 \\times 10^{16})^{12}\n\\]\n\n\\[\n\\left( \\frac{6.371^2 \\times 10^{12}}{6.957^2 \\times 10^{16}} \\right) \\times (4.014 \\times 10^{16})^{12}\n\\]\n\n\\[\n\\left( \\frac{6.371^2}{6.957^2} \\times 10^{-4} \\right) \\times (4.014^{12} \\times 10^{192})\n\\]\n\n\\[\n\\left( \\frac{6.371^2}{6.957^2} \\right) \\times 10^{-4} \\times 4.014^{12} \\times 10^{192}\n\\]\n\n\\[\n\\left( \\frac{6.371^2}{6.957^2} \\right) \\times 4.014^{12} \\times 10^{188}\n\\]\n\nCalculating the numerical values:\n\n\\[\n\\frac{6.371^2}{6.957^2} \\approx \\frac{40.59}{48.39} \\approx 0.839\n\\]\n\n\\[\n4.014^{12} \\approx 1.68 \\times 10^{15}\n\\]\n\n\\[\n0.839 \\times 1.68 \\times 10^{15} \\times 10^{188} \\approx 1.41 \\times 10^{203}\n\\]\n\nTherefore, the final result is:\n\n\\[\n1.41 \\times 10^{203}\n\\]"
`;

function KatexAddUserTestMs() {
    //console.log("Date time + text:", text)
    const userMessageId = `msg_${Math.random().toString(34).substring(3, 9)}`;
    const copyButtonId = `copy-button-${Math.random().toString(36).substring(5, 9)}`;
    const userMessage = document.createElement("div");

    userMessage.innerHTML = `
    <div data-id="${userMessageId}" class="${userMessageId} relative bg-[#566fdb] dark:bg-[#142384] text-black dark:text-white rounded-lg rounded-br-none p-2 md:p-3 shadow-md w-fit max-w-full lg:max-w-5xl">
    <p class="whitespace-pre-wrap break-words max-w-xl md:max-w-2xl lg:max-w-3xl">${htmlMath}</p>
    <button id="${copyButtonId}" class="user-copy-button absolute rounded-md px-2 py-2 right-1 bottom-0.5 bg-gradient-to-r from-indigo-400 to-pink-400 dark:from-gray-700 dark:to-gray-900 hover:bg-indigo-200 dark:hover:bg-gray-600 text-white dark:text-gray-100 rounded-lg font-semibold border border-2 cursor-pointer opacity-40 hover:opacity-80 " onclick="CopyMessage('.${userMessageId}', this)">
    Copy
    </button>
    </div>
    `;

    userMessage.classList.add("flex", "justify-end", "mb-4", "overflow-wrap");
    chatArea.appendChild(userMessage);
    chatArea.appendChild(userMessage);
    window.debounceRenderKaTeX(null, null, true)
}


function katexAddAiMs() {
    const aiMessageUId = `msg_${Math.random().toString(30).substring(3, 9)}`;
    const aiMessage = document.createElement("div");
    const exportId = `export-${Math.random().toString(33).substring(3, 9)}`;

    aiMessage.innerHTML = `
    <section class="relative w-fit max-w-full lg:max-w-6xl mb-8 p-2">
            <div class="${aiMessageUId} bg-blue-200 py-4 text-gray-800 dark:bg-[#002f42] dark:text-white rounded-lg rounded-bl-none px-4 mb-6 pb-4 transition-colors duration-1000">
            <p style="color: #333;">${window.marked(window.normalizeMathDelimiters(htmlMath))}</p>
            <section class="options absolute bottom-2 flex mt-6 space-x-4 cursor-pointer">
            <div class="group relative max-w-fit transition-all duration-300 hover:z-50">
            <div
            role="button"
            id="${exportId}"
            aria-expanded="false"
            onclick="window.toggleExportOptions(this);"
            aria-label="Export"
            class="relative overflow-hidden bg-white/80 backdrop-blur-md transition-all duration-700 hover:bg-white hover:shadow-lg hover:shadow-blue-500/10 dark:bg-[#5500ff]/80 dark:hover:bg-[#00aa00]/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/50 rounded-full"
            style="border: 2px solid rgba(255,85,0,0); background-clip: padding-box, border-box; background-origin: border-box; background-image: linear-gradient(to bottom right, hsl(0 0% 100% / 0.8), hsl(0 0% 100% / 0.8)), linear-gradient(135deg, rgba(255,0,255,170) 0%, rgba(0,0,255,85) 50%, rgba(0,255,255,170) 100%);"
            >
            <div class="flex items-center space-x-2 px-4 py-1">
            <div class="relative h-6 w-6">
            <svg
            class="absolute inset-0 h-full w-full fill-current text-blue-600 transition-all duration-700 group-hover:rotate-90 group-hover:scale-110 group-hover:text-blue-500 dark:text-[#00aaff] dark:group-hover:text-sky-800"
            viewBox="0 0 24 24"
            style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            >
            <path
            d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
            class="origin-center transition-transform duration-300"
            />
            </svg>
            </div>
            <span class="bg-gradient-to-r from-blue-700 to-[#550000] bg-clip-text text-sm font-semibold text-transparent transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-400 dark:from-blue-600 dark:to-[#00007f] dark:group-hover:from-sky-700 dark:group-hover:to-[#984fff]">
            Export
            </span>
            </div>

            <!-- Gradient border overlay -->
            <div class="absolute inset-0 -z-10 rounded-[12px] bg-gradient-to-br from-blue-400/20 via-purple-400/10 to-blue-400/20 opacity-60 dark:from-blue-400/15 dark:via-purple-400/10 dark:to-blue-400/15"></div>
            </div>

            <!-- Hover enhancement effect -->
            <div class="absolute -inset-2 -z-10 rounded-xl bg-blue-500/10 blur-xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-blue-400/15"></div>
            </div>
            <div class="rounded-lg p-1 cursor-pointer" aria-label="Copy" title="Copy" id="copy-all" onclick="CopyMessage('.${aiMessageUId}');">
            <svg
            class="w-5 md:w-6 h-5 md:h-6 mt-1 transition-transform duration-200 ease-in-out hover:scale-110 cursor-pointer"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            >
            <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: #FF4081; stop-opacity: 100" />
            <stop offset="100%" style="stop-color: #4a1dff; stop-opacity: 1" />
            </linearGradient>
            </defs>
            <g clip-path="url(#clip0)">
            <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z"
            fill="url(#gradient1)"
            />
            </g>
            </svg>
            </div>
            </section>
            </div>
            <div id="exportOptions-${exportId}" class="hidden block absolute bottom-10 left-0 bg-[radial-gradient(closest-side,var(--tw-gradient-stops))] from-[#009393] dark:from-[#002f42] via-[#45cece] dark:via-[#002f42] to-blue-400 dark:to-[#002f42] dark:bg-gray-800 p-2 rounded shadow-md z-50 border border-[#0055ff] dark:border-[#009fe8] transition-colors duration-1000">
            <ul class="list-none p-0">
            <li class="mb-2">
            <p class="text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-colors duration-1000 cursor-pointer" onclick="HTML2Pdf(event, '.${aiMessageUId}')">Export to PDF</p>
            </li>
            <li class="mb-2">
            <p class="text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-colors duration-1000 cursor-pointer" onclick="HTML2Jpg(event, '.${aiMessageUId}')">Export to JPG</p>
            </li>
            <li>
            <p class="text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-all duration-1000 cursor-pointer" onclick="HTML2Word(event, '.${aiMessageUId}')">Export to DOCX</p>
            </li>
            <li>
            <p class="cursor-not-allowed text-[#222] dark:text-blue-300 hover:text-[#8900ce] dark:hover:text-[#aaaa00] border border-blue-400/0 hover:border-[#a1a100] dark:hover:border-[#00aeff] transition-all duration-1000 decoration-underline" onclick="">Word Export Advance</p>
            </li>
            </ul>
            </div>
            </section>
            `;
    chatArea.appendChild(aiMessage)
    window.debounceRenderKaTeX(null, null, true)

}
setTimeout(() => {
    KatexAddUserTestMs();
    katexAddAiMs();
}, 10)

`, 'tests/katexTest', 'tests/katexStyling'`
