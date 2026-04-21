import { normaliZeMathDisplay } from "../../MathBase/MathNormalize";
import { debounceRenderKaTeX } from "../../MathBase/mathRenderer";
import { chart_interpret } from "../../diagraming/jscharting";
import { dot_interpreter } from "../../diagraming/vizcharting";

export class ChatUtil {
    private diagramInterpreter: typeof dot_interpreter;
    private chartInterpreter: typeof chart_interpret;

    constructor() {
        this.diagramInterpreter = dot_interpreter;
        this.chartInterpreter = chart_interpret
    }

    /**
     * Render diagrams from input
     */
    renderDiagrams(input: string, scope: 'dg' | 'charts' | 'all' = 'all'): void {
        if (['dg', 'all'].includes(scope)) {
            this.diagramInterpreter.diagram_interpreter(input, scope);
        }
        if (['charts', 'all'].includes(scope)) {
            this.chartInterpreter.ChartsInterpreter(input);
        }
    }

    /**
     * Render math expressions using KaTeX
     */
    renderMath(
        containerSelector?: string,
        scope: 'norm' | 'math' | 'all' = 'all',
        delay: number | null = null
    ): void {
        try {
            if (['norm', 'all'].includes(scope)) {
                if (containerSelector) {
                    normaliZeMathDisplay(`.${containerSelector}`);
                } else {
                    debounceRenderKaTeX();
                }
            }

            if (['math', 'all'].includes(scope)) {
                if (containerSelector) {
                    debounceRenderKaTeX(`.${containerSelector}`, delay ?? null, !delay);
                } else {
                    debounceRenderKaTeX();
                }
            }
        } catch (err) {
            console.error('Math rendering error:', err);
        }
    }
}

export const chatUtil = new ChatUtil();
export const chatutil = chatUtil
