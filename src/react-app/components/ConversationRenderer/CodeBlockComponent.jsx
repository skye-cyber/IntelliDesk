import React from 'react';
import { dot_interpreter } from '../../../renderer/js/diagraming/vizcharting';
import { chart_interpret } from '../../../renderer/js/diagraming/jscharting';
import { handleCodeCopy } from '../../../renderer/js/Utils/chatUtils';
import { openInCanvas } from '../../../renderer/js/managers/Canvas/CanvasUtils';
import { CanvasUtil } from '../../../renderer/js/managers/Canvas/CanvasUtils';
import { GenerateId } from './Renderer';
import { html_preview } from '../../../renderer/js/managers/Canvas/html_render';
import { exportCodeToFile } from '../../../renderer/js/Utils/exportCodeUtils';

//StateManager.set('processing', false);

const canvasutil = new CanvasUtil()

export const CodeBlockComponent = ({
    highlighted,
    valid_language,
    copy_button_id = GenerateId('copy-button'),
    codeblock_id = GenerateId('code-block'),
    download_button_id = GenerateId('download'),
    open_in_canvas_id = GenerateId('open-canvas'),
    render_button_id = GenerateId('render-button'),
}) => {

    // Move these hooks outside of any conditions - call them unconditionally
    const handle_render = () => {
        if (['dot-draw', 'dot'].includes(valid_language)) dot_interpreter.diagram_interpreter(`#${codeblock_id}`, 'dot', false, 'click')
        if (['json-draw', 'json-chart'].includes(valid_language)) chart_interpret.ChartsInterpreter(`#${codeblock_id}`, 'json', true, 'click')
        if (['html', 'svg'].includes(valid_language)) html_preview(this, `#${codeblock_id}`)
    }

    // Convert this to a regular function, not a hook
    const should_render = () => {
        return ['dot', 'dot-draw', 'json-draw', 'json-chart', 'svg', 'html']
            .includes(valid_language)
    }

    if (canvasutil.isCanvasOn()) {
        //increament code buffer
        StateManager.set('codeBuffer', { lang: valid_language, code: `<code id="${valid_language}" data-value=${codeblock_id} id="${codeblock_id}" class="hljs ${valid_language} block whitespace-pre w-full rounded-md bg-none font-code transition-colors duration-500">${highlighted}</code>` })
    }

    return (
        <div className="block bg-gray-200 dark:bg-gray-400  rounded-md transition-colors duration-100">
            <section className="flex justify-between w-full bg-gray-300 rounded-t-md dark:bg-zinc-600 box-border transition-colors duration-700">
                {/* Language */}
                <p className="code-language p-1 justify-start rounded-md text-slate-950 dark:text-white rounded-lg font-normal text-sm cursor-pointer opacity-80 hover:opacity-50">
                    {valid_language}
                </p>
                <div className="flex justify-between items-center space-x-2">
                    <button id={open_in_canvas_id} onClick={() => openInCanvas(codeblock_id)} className="flex items-center gap-0.5 p-1 hover:bg-zinc-400 rounded-md text-xs text-secondary-900 dark:text-white cursor-pointer transform transition-all duration-700 focus:outline-none" aria-pressed="false" title="Open coding canvas">
                        {/* simple plus icon (SVG) */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5" fill="currentColor" viewBox="0 0 640 640">
                            <path d="M392.8 65.2C375.8 60.3 358.1 70.2 353.2 87.2L225.2 535.2C220.3 552.2 230.2 569.9 247.2 574.8C264.2 579.7 281.9 569.8 286.8 552.8L414.8 104.8C419.7 87.8 409.8 70.1 392.8 65.2zM457.4 201.3C444.9 213.8 444.9 234.1 457.4 246.6L530.8 320L457.4 393.4C444.9 405.9 444.9 426.2 457.4 438.7C469.9 451.2 490.2 451.2 502.7 438.7L598.7 342.7C611.2 330.2 611.2 309.9 598.7 297.4L502.7 201.4C490.2 188.9 469.9 188.9 457.4 201.4zM182.7 201.3C170.2 188.8 149.9 188.8 137.4 201.3L41.4 297.3C28.9 309.8 28.9 330.1 41.4 342.6L137.4 438.6C149.9 451.1 170.2 451.1 182.7 438.6C195.2 426.1 195.2 405.8 182.7 393.3L109.3 320L182.6 246.6C195.1 234.1 195.1 213.8 182.6 201.3z" />
                        </svg>
                        <span>Canvas</span>
                    </button>

                    {/* Copy button */}
                    <button id={copy_button_id} onClick={() => handleCodeCopy(copy_button_id, codeblock_id)} className="copy-button flex items-center gap-0.5 p-1 hover:bg-zinc-400 rounded-md text-xs text-secondary-900 dark:text-white cursor-pointer transform transition-all duration-700 focus:outline-none">
                        <svg className="w-4 h-4 feather feather-copy mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <span id="BtText">copy</span>
                    </button>
                    <button id={download_button_id}
                        onClick={() => exportCodeToFile(codeblock_id)}
                        className="run-button flex items-center gap-0.5 rounded-md text-xs text-secondary-900 dark:text-white cursor-pointer hover:bg-zinc-400 p-1 transform transition-all duration-700 focus:outline-none">
                        {/* Network / Diagram Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 640 640">
                            <path d="M352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 306.7L246.6 265.3C234.1 252.8 213.8 252.8 201.3 265.3C188.8 277.8 188.8 298.1 201.3 310.6L297.3 406.6C309.8 419.1 330.1 419.1 342.6 406.6L438.6 310.6C451.1 298.1 451.1 277.8 438.6 265.3C426.1 252.8 405.8 252.8 393.3 265.3L352 306.7L352 96zM160 384C124.7 384 96 412.7 96 448L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 448C544 412.7 515.3 384 480 384L433.1 384L376.5 440.6C345.3 471.8 294.6 471.8 263.4 440.6L206.9 384L160 384zM464 440C477.3 440 488 450.7 488 464C488 477.3 477.3 488 464 488C450.7 488 440 477.3 440 464C440 450.7 450.7 440 464 440z" />
                        </svg>
                        <p id="BtText">Download</p>
                    </button>
                    {should_render() ?
                        (
                            <button id={render_button_id} onClick={handle_render} className="run-button flex items-center gap-0.5 rounded-md text-xs text-secondary-900 dark:text-white cursor-pointer hover:bg-zinc-400 p-1 transform transition-all duration-700 focus:outline-none">
                                {/* Network / Diagram Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 640 640">
                                    <path d="M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM276.5 211.5C269.1 207 259.8 206.8 252.2 211C244.6 215.2 240 223.3 240 232L240 408C240 416.7 244.7 424.7 252.3 428.9C259.9 433.1 269.1 433 276.6 428.4L420.6 340.4C427.7 336 432.1 328.3 432.1 319.9C432.1 311.5 427.7 303.8 420.6 299.4L276.6 211.4zM362 320L288 365.2L288 274.8L362 320z" /></svg>
                                <p id="BtText">Run</p>
                            </button>
                        ) :
                        ''
                    }
                </div>
            </section>
            <code data-value={codeblock_id} id={codeblock_id} className={`hljs ${valid_language} h-full font-md leading-[1.5] p-4 scrollbar-custom m-0 bg-gray-50 border border-white shadow-inner dark:shadow-outer dark:shadow-balanced block whitespace-pre-wrap font-code text-sm  transition-colors duration-700 overflow-x-auto rounded-md rounded-t-none`} dangerouslySetInnerHTML={{ __html: highlighted }}></code>
        </div>
    )

}
