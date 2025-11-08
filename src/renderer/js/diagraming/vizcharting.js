import 'cytoscape';
import 'graphlib-dot';
import { Graphviz } from "@hpcc-js/wasm-graphviz";
import { waitForElement } from '../Utils/dom_utils';
import { opendiagViewModal } from './Utils';
import { displayStatus } from '../StatusUIManager/SimpleManager';


waitForElement('#diag-modal-content', (el) => {
    window.reactPortalBridge.registerContainer('diagram_canvas', el);
})

export class DotInterPreter {
    constructor() {

    }

    fixUnclosedCodeBlocks(text) {
        const codeBlockPattern = /```(dot|json-draw)[ \t]*\r?\n([\s\S]*?)(```)?(?=\n|$)/gi;
        return text.replace(codeBlockPattern, (match, lang, body, closing) => {
            if (!closing) {
                return `\`\`\`${lang}\n${body.trim()}\n\`\`\``;
            }
            return match;
        });
    }

    //Extracts json-draw, dot or both
    async extractDiagCodesWithNames(input, type = 'both') {
        //console.log('aiRes:', aiResponse)
        const safeInput = input //fixUnclosedCodeBlocks(input);
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
        while ((match = fenceRe.exec(safeInput)) !== null) {
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

    async getCodeBlock(selector) {
        try {
            //console.log("ID:", selector)
            const codeBlock = document.querySelector(selector);
            if (!codeBlock) window.ModalManager.showMessage("Codeblock extraction error", 'error')
            const codeText = codeBlock.textContent;
            return codeText ? codeText : ''
        } catch (err) {
            window.ModalManager.showMessage(err, 'error')
        }
    }

    /**
    * Wrap a raw code string in markdown fences for the given language,
    * unless it’s already fenced.
    */
    async wrapInFences(text, lang) {
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
    async diagram_interpreter(input, lang = 'all', isPlainCode = false, trigger = 'function') {
        let toParse;

        if (!input) return window.ModalManager.showMessage("Missing input", 'error')

        const code = await this.getCodeBlock(input);

        //console.log("Input:", input);
        // If it doesn’t start with a fence, assume it’s raw code
        if (isPlainCode && !/^\s*```/.test(input)) {
            if (lang === 'dot') {
                toParse = await this.wrapInFences(code, 'dot');
            } else if (lang === 'json') {
                toParse = await this.wrapInFences(code, 'json-draw');
            }
            const blocks = await this.extractDiagCodesWithNames(
                toParse,
                lang === 'all' ? 'all' : (lang === 'json' ? 'json' : 'dot')
            );

            if (!blocks || blocks.length === 0) {
                console.warn('No diagram blocks found.');
                return;
            }

            this.loop_render(blocks)

            // if lang==='all' but no fences, we could wrap twice or default to one—
            // here we’ll just try parsing both languages from the raw text.
        } else {

            if (lang === 'dot') {
                this.renderWithViz(code, 'dot-dg');
            } else if (lang === 'json-draw') {
                this.renderWithCytoscape(code, 'json-drawing');
            }
        }

        // Hide placeholder
        waitForElement('#diag-placeholder', (el) => {
            el.classList.add('hidden')
        })
        // open modal if render trigger===click
        if (trigger === 'click') {
            opendiagViewModal();
        }

        waitForElement('#diag-placeholder', (el) => el.classList.add('hidden'))
    }

    loop_render(blocks) {
        // Render each block with the appropriate engine
        blocks.forEach(({ name, code, lang }) => {
            if (lang === 'dot') {
                this.renderWithViz(code, name);
            } else if (lang === 'json-draw') {
                this.renderWithCytoscape(code, name);
            }
        });
    }

    // 2) Main parser: builds nodes & edges arrays, plus captures graph-wide attrs
    // 1) DOT → Cytoscape converter via graphlib‑dot
    parseDotToCytoscape(dotCode) {
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

    async renderWithCytoscape(graphJson, chartName, desc = '') {
        let graph;
        try {
            graph = JSON.parse(graphJson);
        } catch (err) {
            window.ModalManager.showMessag(`renderDiagramCytoscape: invalid JSON: ${err}`, 'error', 5000);
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

            const diagId = `Cytoscape_${Math.random().toString(30).substring(3, 9)}`;

            // Obtain container id or element
            const element_id = window.reactPortalBridge.showComponentInTarget("Diagram", 'diagram_canvas', { name: chartName, exportId: 'Cytoscape', dgId: diagId, description: desc })

            const id = `Cytoscape-${chartName}-${diagId}`

            const graphContainer = document.getElementById(id)

            if (!graphContainer) window.ModalManager.showMessage('Missing diagram container', 'error')

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

    async renderWithViz(dotCode, chartName, desc = null) {
        try {
            // 1) Load the WASM Graphviz engine
            const graphviz = await Graphviz.load();
            const svgElement = graphviz.dot(dotCode);

            const diagId = `diag-VIZ-${Math.random().toString(30).substring(3, 9)}`;

            // Obtain container id or element
            const portal_id = window.reactPortalBridge.showComponentInTarget("Diagram", 'diagram_canvas', { name: chartName, exportId: 'JSC', dgId: diagId, description: desc, content: svgElement })

            const id = `JSC-${chartName}-${diagId}`

            console.log("Created dot diagram with id:", id, "using portal:", portal_id)
            //show success message
            window.ModalManager.showMessage("RDiagram render succeeded", 'success');

        } catch (err) {
            console.error(err)
            displayStatus(err, 'error');
        }
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


export const dot_interpreter = new DotInterPreter()

window.dot_interpreter = dot_interpreter
