import { normaliZeMathDisplay } from "../../MathBase/MathNormalize";
import { debounceRenderKaTeX } from "../../MathBase/mathRenderer";
import { chart_interpret } from "../../diagraming/jscharting";
import { dot_interpreter } from "../../diagraming/vizcharting";
import { globalEventBus } from "../../Globals/eventBus";

export class ChatUtil {
    private diagramInterpreter: typeof dot_interpreter;
    private chartInterpreter: typeof chart_interpret;

    constructor() {
        this.diagramInterpreter = dot_interpreter;
        this.chartInterpreter = chart_interpret
    }

    /**
     * Scroll chat to bottom with optional check for auto-scroll setting
     */
    scrollToBottom(
        element: HTMLElement | null = document.getElementById('chatArea'),
        check: boolean = false,
        timeout: number = 500
    ): void {
        this.updateScrollButtonVisibility();

        if (check && !(document.getElementById('autoScroll') as any)?.checked) {
            return;
        }

        if (!element) return;

        const scroll = () => {
            element.scrollTo({
                top: element.scrollHeight,
                behavior: 'smooth'
            });
        };

        if (timeout === 0) {
            requestAnimationFrame(scroll);
        } else {
            setTimeout(() => requestAnimationFrame(scroll), timeout);
        }
    }

    /**
     * Update visibility of scroll-to-bottom button based on scroll position
     */
    updateScrollButtonVisibility(): void {
        const chatArea = document.getElementById('chatArea');
        if (!chatArea) return;

        const scrollButton = document.getElementById('scroll-bottom');
        const isScrollable = chatArea.scrollHeight > chatArea.clientHeight;
        const isAtBottom = chatArea.scrollTop + chatArea.clientHeight >= chatArea.scrollHeight - 10; // 10px threshold

        if (scrollButton) {
            scrollButton.classList.toggle('hidden', !(isScrollable && !isAtBottom));
        }
    }

    /**
     * Remove loading animation element
     */
    removeLoadingAnimation(): void {
        const loader = document.getElementById('loader-parent')?.parentElement;
        if (loader?.id.startsWith("loader_")) {
            loader.remove();
        }
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

    // ==================== Event Helpers ====================

    hideSuggestions(): void {
        globalEventBus.emit('suggestions:hide');
    }

    openCanvas(): void {
        globalEventBus.emit('canvas:open');
    }
}

export const chatUtil = new ChatUtil();
export const chatutil = chatUtil
