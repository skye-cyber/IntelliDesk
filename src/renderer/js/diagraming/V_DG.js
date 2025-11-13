const cytoscape = require('cytoscape');
const graphlibDot = require('graphlib-dot');
//const Viz = require('viz.js');
import { Graphviz } from "@hpcc-js/wasm-graphviz";

//import graphlib from 'graphlib';

const diagViewContent = document.getElementById('modal-content');


function fixUnclosedCodeBlocks(text) {
    const codeBlockPattern = /```(dot|json-draw)[ \t]*\r?\n([\s\S]*?)(```)?(?=\n|$)/gi;
    return text.replace(codeBlockPattern, (match, lang, body, closing) => {
        if (!closing) {
            return `\`\`\`${lang}\n${body.trim()}\n\`\`\``;
        }
        return match;
    });
}


//Extracts json-draw, dot or both
async function extractDiagCodesWithNames(aiResponse, type = 'both') {
    //console.log('aiRes:', aiResponse)
    const safeResponse = aiResponse //fixUnclosedCodeBlocks(aiResponse);
    // 1) Decide which languages to look for
    const langs =
        type === 'dot' ? ['dot'] :
            type === 'json' ? ['json-draw'] :
                ['dot', 'json-draw'];

    // 2) Escape and build the alternation pattern
    const langPattern = langs
        .map(l => l.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
        .join('|');

    // 3) Regex that requires a closing ``` (no end‑of‑string fallback)
    //    - ```(dot|json\-draw)[ \t]*\n     → opening fence + optional spaces + newline
    //    - ([\s\S]*?)                     → code block (non‑greedy)
    //    - \n```                          → closing fence on its own line
    const fenceRe = new RegExp(
        '```(' + langPattern + ')[ \\t]*\\r?\\n' +
        '([\\s\\S]*?)' +
        '\\r?\\n```',
        'gi'
    );

    const results = [];
    let match;
    while ((match = fenceRe.exec(safeResponse)) !== null) {
        const [, lang, rawCode] = match;
        const lines = rawCode.trim().split(/\r?\n/);

        // Extract first line as name if it’s a comment
        let name = 'Unnamed Diagram';
        if (/^\s*(\/\/|#)/.test(lines[0])) {
            name = lines[0].replace(/^\s*(?:\/\/|#)\s*/, '').trim();
            lines.shift();
        }

        results.push({
            lang,               // "dot" or "json-draw"
            name,
            code: lines.join('\n').trim()
        });
    }
    return results;
}

async function getCodeFromBlock(id) {
    const codeBlock = document.querySelector(`[data-value^="${id}"]`);
    const codeText = codeBlock.textContent;
    return codeText ? codeText : ''
}

/**
 * Wrap a raw code string in markdown fences for the given language,
 * unless it’s already fenced.
 */
async function wrapInFences(text, lang) {
    const fence = '```' + lang;
    if (text.trim().startsWith(fence)) {
        return text;
    }
    return `${fence}\n${text.trim()}\n\`\`\``;
}

/**
 * Handle either a raw code string (single block) or a full message.
 *
 * @param {string} input   – raw code or full message
 * @param {'dot'|'json'|'both'} mode – what to extract/render
 */
async function handleDiagrams(input, mode = 'both', isPlainCode = false, trigger = 'function') {
    let toParse = input;
    //console.log("Input:", input);
    // If it doesn’t start with a fence, assume it’s raw code
    if (!/^\s*```/.test(input) && isPlainCode) {
        input = await getCodeFromBlock(input.id);
        if (mode === 'dot') {
            toParse = await wrapInFences(input, 'dot');
        } else if (mode === 'json') {
            toParse = await wrapInFences(input, 'json-draw');
        }
        // if mode==='both' but no fences, we could wrap twice or default to one—
        // here we’ll just try parsing both languages from the raw text.
    }

    // Extract all blocks of the requested types
    const blocks = await extractDiagCodesWithNames(
        toParse,
        mode === 'both' ? 'both' : (mode === 'json' ? 'json' : 'dot')
    );

    if (!blocks || blocks.length === 0) {
        console.warn('No diagram blocks found.');
        return;
    }

    // Render each block with the appropriate engine
    blocks.forEach(({ name, code, lang }) => {
        if (lang === 'dot') {
            renderWithViz(code, name);
        } else if (lang === 'json-draw') {
            renderWithCytoscape(code, name);
        }
    });

    // open modal if render trigger===click
    if (trigger === 'click') {
        window.opendiagViewModal();
    }
}

async function renderWithViz(dotCode, Cname, desc = null) {
    try {
        // 1) Load the WASM Graphviz engine
        const graphviz = await Graphviz.load();

        const svgElement = graphviz.dot(dotCode);

        const section = document.createElement('section')
        section.className = 'block p-1 border border-blue-400 rounded-md bg-white dark:bg-zinc-900 transition-all duration-1000';

        const header = document.createElement('div');
        header.className = "flex justify-between";

        //Title
        const title = document.createElement('p');
        title.id = Cname;
        title.className = 'bg-gray-200 dark:bg-zinc-700 rounded-md p-1 my-2 w-fit font-mono text-blue-500 dark:text-blue-400 transition-all duration-1000';
        title.textContent = `Name: ${Cname}`;

        //Export option
        const Export = document.createElement('p');
        const diagId = `diag_${Math.random().toString(30).substring(3, 9)}`;
        // Use dataset property to set a custom data attribute
        Export.dataset.value = `cx-Viz-${Cname}-${diagId}`;

        // Set class names (Tailwind CSS classes)
        Export.className = "bg-blue-300 text-[#003953] rounded-md p-2 hover:scale-95 hover:bg-purple-400 w-fit h-fit transform transition-all duration-700 cursor-pointer";

        // Set the visible text inside the <p> element
        Export.textContent = 'export';

        // Assign a click event handler function properly
        Export.addEventListener('click', (event) => {
            event.stopPropagation();
            window.exportSvgToPng(Export.dataset.value);
        })

        //};
        header.appendChild(title);
        header.appendChild(Export);

        section.appendChild(header);

        //Add description if present
        if (desc) {
            const d = document.createElement('p');
            d.className = 'text-sm text-gray-500 dark:text-gray-300 italic mb-2 transition-all duration-1000';
            d.textContent = desc;
            section.appendChild(d);
        }

        const diagCanvas = document.createElement('div');
        diagCanvas.id = `cx-Viz-${Cname}-${diagId}`;
        diagCanvas.className = 'h-full w-full rounded-lg bg-gray-50 dark:bg-zinc-800 transition-all duration-1000';

        //Add element to the canvas
        diagCanvas.innerHTML = svgElement;
        section.appendChild(diagCanvas);

        //add section to parent daigView
        diagViewContent.appendChild(section);


        //show success message
        window.showCopyModal(null, "Rendered ✅... Open DiagView modal to view", 700);

    } catch (err) {
        console.error(err)
        window.displayStatus(err, 'error');
    }
}

async function renderWithCytoscape(graphJson, Cname, desc = '') {
    let graph;
    try {
        graph = JSON.parse(graphJson);
    } catch (err) {
        console.error("renderDiagramCytoscape: invalid JSON:", err);
        return;
    }

    // 🔁 Convert input format to Cytoscape-compatible format
    // Assuming 'graph' has the correct structure now
    // for (const node of graph.elements){
    try {
        const elements = graph.elements.map(element => ({
            data: element.data // Access the 'data' part of each element (node or edge)
        }));
        // }


        // DOM structure
        const section = document.createElement('section');
        section.className = 'block p-1 border border-blue-400 rounded-md bg-white dark:bg-zinc-900 transition-all duration-1000';

        //header section for the diagram
        const header = document.createElement('div');

        header.className = "flex justify-between";
        // figure title
        const title = document.createElement('p');
        title.id = Cname;
        title.className = 'bg-gray-200 dark:bg-zinc-700 rounded-md p-1 my-2 w-fit font-mono text-blue-500 dark:text-blue-400 transition-all duration-1000';
        title.textContent = `Name: ${Cname}`;

        //export options
        const Export = document.createElement('p');
        const diagId = `diag_${Math.random().toString(30).substring(3, 9)}`;

        // Use dataset property to set a custom data attribute
        Export.dataset.value = `cy-crytoscape-${Cname}-${diagId}`;

        // Set class names (Tailwind CSS classes)
        Export.className = "bg-blue-300 text-[#003953] rounded-md p-2 hover:scale-95 hover:bg-purple-400 w-fit h-fit transform transition-all duration-700 cursor-pointer";

        // Set the visible text inside the <p> element
        Export.textContent = 'export';

        Export.className = "bg-blue-300 text-[#003953] rounded-md p-2 hover:scale-95 hover:bg-purple-400 w-fit h-fit transform transition-all duration-700 cursor-pointer"

        header.appendChild(title);
        header.appendChild(Export);

        section.appendChild(header);

        if (desc) {
            const d = document.createElement('p');
            d.className = 'text-sm text-gray-500 dark:text-gray-300 italic mb-2 transition-all duration-1000';
            d.textContent = desc;
            section.appendChild(d);
        }

        const graphContainer = document.createElement('div');
        graphContainer.id = `cy-crytoscape-${Cname}-${diagId}`;
        graphContainer.className = 'h-[400px] max-h-full w-full rounded-lg bg-gray-50 dark:bg-zinc-800 transition-all duration-1000';
        section.appendChild(graphContainer);
        diagViewContent.appendChild(section);

        // Cytoscape setup

        const lightStyle = [
            {
                selector: 'node',
                style: {
                    'label': 'data(label)',
                    'text-valign': 'center',
                    'color': '#222',
                    'text-wrap': 'wrap',
                    'text-max-width': 100,
                    'font-size': 13,
                    'width': 'data(width)' || 100,               // pixels
                    'height': 'data(height)' || 60,
                    'background-color': '#aaaaff',
                    'shape': 'data(shape)' || 'ellipsis'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#9ca3af',
                    'target-arrow-color': '#aa007f',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'label': 'data(label)',
                    'font-size': 13,
                    'text-rotation': 'autorotate',
                    'text-margin-x': 0,
                    'text-margin-y': -10,
                }
            }
        ]
        const darkStyle = [
            {
                selector: 'node',
                style: {
                    'label': 'data(label)',
                    'text-valign': 'center',
                    'color': '#ff8000',
                    'text-wrap': 'wrap',
                    'text-max-width': 100,
                    'font-size': 13,
                    'width': 'data(width)' || 100,               // pixels
                    'height': 'data(height)' || 60,
                    'background-color': '#c5f5ff',
                    'shape': 'data(shape)' || 'ellipsis'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'color': '#ffaa7f',
                    'line-color': '#00557f',
                    'target-arrow-color': '#ffff7f',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'label': 'data(label)',
                    'font-size': 13,
                    'text-rotation': 'autorotate',
                    'text-margin-x': 0,
                    'text-margin-y': -10,
                }
            }
        ]

        const style = window.isDark === true ? darkStyle : lightStyle;

        const cy = cytoscape({
            container: graphContainer,
            elements,
            style: style,
            layout: { name: 'breadthfirst', orientation: 'horizontal', padding: 10 }
        });

        const cyId = Export.dataset.value;
        // Register it safely
        window.CyManager.register(cyId, cy);

        // Assign a click event handler function properly
        Export.onclick = (event) => {
            event.stopPropagation();
            //const cyId = Export.dataset.value;
            const cy = window.CyManager.get(cyId);
            //console.log(cy)

            if (!cy) {
                return window.displayStatus("Diagram not found", "error");
            }

            const png = cy.png({ scale: 2, bg: "white", full: true });

            const a = document.createElement("a");
            a.href = png;
            a.download = `${cyId}.png`;
            a.click();
            // Use Export.dataset.value to access the data attribute inside the handler
            window.exportCanvasToPng(Export.dataset.value);
        };

        document.addEventListener('ThemeChange', () => {
            console.log('Theme:', window.isDark)
            cy.style(window.isDark ? darkStyle : lightStyle).update();
        });

        //show success message
        window.showCopyModal(null, "Rendered ✅... Open DiagView modal to view", 700);
    } catch (err) {
        console.log("Error rendering diagram :", err)
        window.displayStatus(err, 'error');
    }

}



// cytoscapeManager.js or inline in main script
window.CyManager = (function() {
    const _store = new Map();

    return {
        register(id, cyInstance) {
            if (_store.has(id)) {
                console.warn(`[CyManager] Replacing existing cy instance for: ${id}`);
            }
            _store.set(id, cyInstance);
        },

        get(id) {
            return _store.get(id) || null;
        },

        remove(id) {
            _store.delete(id);
        },

        clearAll() {
            _store.clear();
        },

        has(id) {
            return _store.has(id);
        }
    };
})();


// 2) Main parser: builds nodes & edges arrays, plus captures graph-wide attrs
// 1) DOT → Cytoscape converter via graphlib‑dot
function parseDotToCytoscape(dotCode) {
    // Parse into a graphlib.Graph
    const g = graphlibDot.read(dotCode);

    // Collect graph‑level attributes (e.g. rankdir, bgcolor, etc.)
    const graphAttributes = g.graph() || {};

    // Convert nodes
    const elements = g.nodes().map(id => {
        const attrs = g.node(id) || {};
        return {
            data: {
                id,
                label: attrs.label || id,
                shape: attrs.shape || 'ellipse',
                color: attrs.color || '#999999',
                'border-color': attrs.color || '#000000',
                width: (parseFloat(attrs.width) || 1) * 50,
                height: (parseFloat(attrs.height) || 1) * 50,
                'font-size': parseFloat(attrs.fontsize) || 12,
                'font-color': attrs.fontcolor || '#000000'
            }
        };
    });

    // Convert edges
    g.edges().forEach(e => {
        const attrs = g.edge(e) || {};
        elements.push({
            data: {
                source: e.v,
                target: e.w,
                label: attrs.label || '',
                'line-color': attrs.color || '#888888',
                width: parseFloat(attrs.penwidth) || 2,
                'target-arrow-shape': attrs.arrowhead || 'triangle',
                'line-style': attrs.style || 'solid'
            }
        });
    });

    return { elements, graphAttributes };
}

async function renderHtml(Instance) {
    try {
        const elementId = Instance.id
        const element = document.querySelector(`[data-value^="${elementId}"]`);
        const code = element.textContent;

        if (!code) {
            return
        }

        const container = document.createElement('container');
        const renderId = `html_render-${Math.random().toString(30).substring(3, 9)}`;

        container.id = renderId;
        container.className = 'block p-1 border border-blue-400 rounded-md bg-white dark:bg-zinc-900 transition-all duration-1000';

        const header = document.createElement('div');

        header.className = "flex justify-between";
        const title = document.createElement('p');

        title.className = 'bg-gray-200 dark:bg-zinc-700 rounded-md p-1 my-2 w-fit font-mono text-blue-500 dark:text-blue-400 transition-all duration-1000';

        title.textContent = `Rendered html-${renderId}`

        header.appendChild(title);

        container.appendChild(header);

        const renderSection = document.createElement('div');
        renderSection.className = 'max-h-full w-full rounded-lg bg-gray-50 dark:bg-zinc-800 transition-all duration-1000';
        renderSection.innerHTML = code;

        container.appendChild(renderSection);

        diagViewContent.appendChild(container);

        window.opendiagViewModal();
    } catch (err) {
        console.log("Error rendering html :", err)
        window.displayStatus(err, 'error');
    }
}

window.handleDiagrams = handleDiagrams;
window.renderHtml = renderHtml;
