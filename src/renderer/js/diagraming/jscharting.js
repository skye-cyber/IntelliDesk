import * as JSC from 'jscharting';
import { createChart, HistogramSeries } from 'lightweight-charts';
import { waitForElement } from '../Utils/dom_utils';
import { opendiagViewModal } from './Utils';
//import { exportSvgToPng } from './Utils';

const chartCache = new Map();


export class InterPreter {
    constructor() {
        //
    }

    /**
     * createChart — render (or return cached) JSC chart
     *
     * @param {string} chartName an identifier passed to chartRenderer
     * @param {object[]}  points array of { x: ..., y: ... } objects
     * @param {string}    [type='column'] JSC chart type
     * @returns {JSC.Chart} the chart instance
     */
    async createLWTCharts(
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

            const diagId = `chart-LWT_${Math.random().toString(30).substring(3, 9)}`;

            // Obtain container id or element
            const element_id = window.reactPortalBridge.showComponent('Diagram', { name: chartName, exportId: 'LWT', dgId: diagId, description: desc })

            const id = `LWT-${chartName}-${diagId}`

            const container = document.getElementById(id)

            if (element_id || container) {
                throw new Error(`No chartContainer returned for "${chartName}"`);
            }
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
    async createJSCCharts(chartName, points, type = 'column', desc, options = { debug: true }) {
        if (!chartName) throw new Error('createCharts: chartName required');

        if (chartCache.has(chartName)) return chartCache.get(chartName);

        const diagId = `chart-JSC_${Math.random().toString(30).substring(3, 9)}`;

        // Obtain container id or element
        const element_id = window.reactPortalBridge.showComponentInTarget('Diagram', 'diagram_canvas', { name: chartName, exportId: 'JSC', dgId: diagId, description: desc })

        const id = `JSC-${chartName?.replace(' ','-')}-${diagId}`

        setTimeout(()=>{
            //console.log(id)
            const element = document.getElementById(id)
            return callback(element)
        })
        const callback = (element) => {

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
    }


    /**
     * Extracts chart info from a code block if the language is "json-chart".
     *
     * @param {string} data - The text containing code blocks or code itself.
     * @param {string} type - Code or text with code blocks.
     * @param {string} [trigger='text'] {1} - Defines method of call, render click or function call.
     * @returns {{ name: string, description: string, data: {x: string, y: number}[] } | null}
     */
    async ChartsInterpreter(selector, type = 'text', isCodeBlock = false, trigger = 'function') {
        try {
            let data;
            if (type !== 'text') {
                data = await this.getCodeFromBlock(selector)
            }

            const charts = await this.ChartDriver(data, isCodeBlock ? 'code' : 'text')

            if (!charts) return;

            for (const item of charts) {
                this.createJSCCharts(item.name, item.data, item.chartType, item.desc || null)
            }

            // open modal if render trigger===click
            if (trigger === 'click') {
                opendiagViewModal();
            }

            // Hide placeholder
            waitForElement('#diag-placeholder', (el) => el.classList.add('hidden'))

        } catch (e) {
            console.error("Invalid JSON chart block:", e);
            window.ModalManager.showMessage(e, 'error');
            return null;
        }
    }

    /**
     * Extracts chart info from a code block if the language is "json-chart".
     *
     * @param {string} data - The text containing code blocks or code itself.
     * @param {string} type - Code or text with code blocks.
     * @param {string} [trigger='text'] {1} - Defines method of call, render click or function call.
     * @returns {{ name: string, description: string, data: {x: string, y: number}[] } | null}
     */
    async _render_chart_(data, type = 'text', trigger = 'function') {
        try {
            if (type !== 'text') {
                data = await this.getCodeFromBlock(data.id)
            }
            const charts = await this.ChartDriver(data)

            if (!charts) return;

            for (const item of charts) {
                this.createJSCCharts(item.name, item.data, item.chartType, item.desc || null)
            }

            // open modal if render trigger===click
            if (trigger === 'click') {
                opendiagViewModal();
            }
        } catch (e) {
            console.error("Invalid JSON chart block:", e);
            window.ModalManager.showMessage(e, 'error');
            return null;
        }
    }

    /**
     * Extracts the language identifier from a fenced code block (e.g. ```json-chart).
     *
     * @param {string} input - The full string containing the code block.
     * @returns {string|null} - The language (e.g., "json-chart") or null if not found.
     */
    extractCodeBlockLanguage(input) {
        const match = input.match(/^```([a-zA-Z0-9-_]+)\s*$/m);
        return match ? match[1] : null;
    }

    /**
     * Extracts the content inside a fenced code block.
     *
     * @param {string} input - The full string including the code block.
     * @returns {string|null} - The inner code content or null if not matched.
     */
    extractCodeBlockContent(input) {
        const match = input.match(/```[a-zA-Z0-9-_]+\s*([\s\S]*?)```/m);
        return match ? match[1].trim() : null;
    }


    extractCodeBlocks(input, lang = 'json-chart') {
        const regex = new RegExp(`\`\`\`${lang}\\s*([\\s\\S]*?)\`\`\``, 'g');
        const blocks = [];
        let match;

        while ((match = regex.exec(input)) !== null) {
            blocks.push(match[1].trim());
        }
        return blocks;
    }

    async ChartDriver(data, type = 'text') {
        const results = [];
        if (type === 'text') {
            const blocks = this.extractCodeBlocks(data, 'json-chart');

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

    async getCodeFromBlock(selector) {
        //console.log("ID:", selector)
        const codeBlock = document.querySelector(selector);
        if (!codeBlock) return window.ModalManager.showMessage("Codeblock extraction error", 'error')
        const codeText = codeBlock.textContent;
        return codeText ? codeText : ''
    }
}


export const chart_interpret = new InterPreter()

window.chart_interpret = chart_interpret
