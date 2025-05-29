import * as JSC from 'jscharting';
import { createChart, HistogramSeries, ISeriesApi } from 'lightweight-charts';

const chartsModal = document.getElementById('modal-content');


async function chartRenderer(Cname, Exid = 'JSC-chart-', desc = '') {

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
    const diagId = `chart-${Exid}_${Math.random().toString(30).substring(3, 9)}`;

    // Use dataset property to set a custom data attribute
    Export.dataset.value = `${Exid}${Cname}-${diagId}`;

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


    const chartContainer = document.createElement('div');
    chartContainer.id = `${Exid}${Cname}-${diagId}`;
    chartContainer.className = 'h-[400px] max-h-full w-full rounded-lg bg-gray-50 dark:bg-zinc-800 transition-all duration-1000';
    section.appendChild(chartContainer);
    chartsModal.appendChild(section);

    return { chartContainer: chartContainer, Id: diagId };

}

const chartCache = new Map();

/**
 * createChart — render (or return cached) JSC chart
 *
 * @param {string} chartName        an identifier passed to chartRenderer
 * @param {object[]}  points        array of { x: ..., y: ... } objects
 * @param {string}    [type='column']  JSC chart type
 * @returns {JSC.Chart}             the chart instance
 */
async function createLWTCharts(
    chartName,
    points = [
        { x: 'A', y: 50 },
        { x: 'B', y: 30 },
        { x: 'C', y: 50 },
    ],
    chartOptions = { width: 400, height: 300 }
) {
    if (!chartName) {
        throw new Error('createCharts: chartName must be a non-empty string');
    }

    // Return cached chart if already created
    if (chartCache.has(chartName)) {
        return chartCache.get(chartName);
    }

    try {
        // get the container element from your renderer
        const result = await chartRenderer(chartName, 'LWT');
        if (!result || !result.chartContainer) {
            throw new Error(`No chartContainer returned for "${chartName}"`);
        }
        const container = result.chartContainer;

        // create chart and hold mapping of index→category
        const chart = createChart(container, chartOptions);
        const categories = points.map(p => p.x);

        // customize time axis labels to show original categories
        chart.applyOptions({
            timeScale: {
                tickMarkFormatter: (time, tickType, locale) => {
                    const idx = time - now;
                    return categories[idx] ?? '';
                }
            }
        });

        // add a histogram series for column-style data
        const volumeSeries /**: ISeriesApi<"Histogram">*/ = chart.addSeries(
            HistogramSeries,
            {
                priceFormat: { type: 'volume' },
                priceScaleId: '',
                scaleMargins: { top: 0.8, bottom: 0.02 },
            }
        );

        // map categorical x to numeric time indices
        const now = Math.floor(Date.now() / 1000);
        const seriesData = points.map(d => ({
            time: Math.floor(new Date(d.date).getTime() / 1000), // UNIX timestamp in seconds
            value: d.revenue,
        }));

        volumeSeries.setData(seriesData);

        chartCache.set(chartName, chart);
        return chart;
    } catch (err) {
        console.error(`Error creating chart "${chartName}":`, err);
        throw err;
    }
}



/**
 * Render (or return cached) JSCharting column chart with arbitrary X and Y data
 *
 * @param {string} chartName
 * @param {{ x: string|number, y: number }[]} points
 * @param {string} desc
 * @param {object} [options]
 * @returns {JSC.Chart}
 */
async function createJSCCharts(chartName, points, type='column', desc, options = { debug: true }){
    if (!chartName) throw new Error('createCharts: chartName required');
    if (chartCache.has(chartName)) return chartCache.get(chartName);

    // Obtain container id or element
    const element = (await chartRenderer(chartName, 'JSC', desc || null)).chartContainer;
    if (!element) throw new Error(`No id returned for "${chartName}"`);

    // Build JSCharting configuration
    const config = {
        type: type,
        xAxis: {
            // treat X values as categories
            format: { labels: points.map(p => p.x) }
        },
        series: [{ points: points.map(p => ({ x: p.x, y: p.y })) }],
        defaultSeries: {
            // apply any user-supplied overrides
            ...options.seriesDefaults
        },
        title: { label: { text: options.title || chartName } },
        legend: options.showLegend ? { template: '%name' } : { visible: false }
    };

    const chart = JSC.chart(element, config);
    chartCache.set(chartName, chart);
    return chart;
}


/**
 * Extracts chart info from a code block if the language is "json-chart".
 *
 * @param {string} data - The text containing code blocks or code itself.
 * @param {string} type - Code or text with code blocks.
 * @param {string} [trigger='text'] {1} - Defines method of call, render click or function call.
 * @returns {{ name: string, description: string, data: {x: string, y: number}[] } | null}
 */
async function LoopRenderCharts(data, type = 'text', trigger = 'function') {
    try {
        if (type!=='text'){
            data = await getCodeFromBlock(data.id)
        }
        const charts = await ChartDriver(data)

        if (!charts) return;

        for (const item of charts) {
            createJSCCharts(item.name, item.data, item.chartType, item.desc || null)
        }

        // open modal if render trigger===click
        if (trigger === 'click') {
            window.opendiagViewModal();
        }
    } catch (e) {
        console.error("Invalid JSON chart block:", e);
        window.displayStatus(e, 'error');
        return null;
    }
}

/**
 * Extracts the language identifier from a fenced code block (e.g. ```json-chart).
 *
 * @param {string} input - The full string containing the code block.
 * @returns {string|null} - The language (e.g., "json-chart") or null if not found.
 */
function extractCodeBlockLanguage(input) {
    const match = input.match(/^```([a-zA-Z0-9-_]+)\s*$/m);
    return match ? match[1] : null;
}

/**
 * Extracts the content inside a fenced code block.
 *
 * @param {string} input - The full string including the code block.
 * @returns {string|null} - The inner code content or null if not matched.
 */
function extractCodeBlockContent(input) {
    const match = input.match(/```[a-zA-Z0-9-_]+\s*([\s\S]*?)```/m);
    return match ? match[1].trim() : null;
}

async function getCodeFromBlock(id) {
    const codeBlock = document.querySelector(`[data-value^="${id}"]`);
    const codeText = codeBlock.textContent;
    return codeText ? codeText : ''
}

function extractCodeBlocks(input, lang = 'json-chart') {
    const regex = new RegExp(`\`\`\`${lang}\\s*([\\s\\S]*?)\`\`\``, 'g');
    const blocks = [];
    let match;

    while ((match = regex.exec(input)) !== null) {
        blocks.push(match[1].trim());
    }
    return blocks;
}

async function ChartDriver(data, type = 'text') {
    const results = [];
    if (type === 'text') {
        const blocks = extractCodeBlocks(data, 'json-chart');

        if (!blocks) return;

        for (const code of blocks) {
            try {
                const parsed = JSON.parse(code);
                const dataInfo = {
                    name: parsed.chartName,
                    desc: parsed.description,
                    data: parsed.data,
                    chartType: parsed.chartType
                };
                results.push(dataInfo);
            } catch (e) {
                console.warn('Failed to parse block:', e.message);
            }
        }

    } else {
        const parsed = JSON.parse(data);
        results.push(
            {
                name: parsed.chartName,
                desc: parsed.description,
                data: parsed.data
            });
    }

    if (results) return results;
}

window.createLWTCharts = createLWTCharts
window.createJSCCharts = createJSCCharts
window.LoopRenderCharts = LoopRenderCharts
