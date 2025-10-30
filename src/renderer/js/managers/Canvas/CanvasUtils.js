import { waitForElement } from "../../Utils/dom_utils";

export class ResizeClassToggler {
    constructor(target, toggleTarget, breakpoint = 640, className = 'sm:flex') {
        this.target = target //document.getElementById(targetId);
        this.toggleTarget = toggleTarget //document.getElementById(toggleTarget);
        this.breakpoint = breakpoint;
        this.className = className;

        if (!this.target || !this.toggleTarget) return;

        this.checkSize = this.checkSize.bind(this);

        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(this.checkSize);
            this.resizeObserver.observe(this.target);
        } else {
            window.addEventListener('resize', this.checkSize);
        }

        // Initial check
        this.checkSize();
    }

    checkSize() {
        const width = this.target.offsetWidth;
        if (width <= this.breakpoint) {
            this.toggleTarget.classList.remove(this.className);
        } else {
            this.toggleTarget.classList.add(this.className);
        }
    }
}

export class CanvasUtil {
    constructor() {
        //
    }

    NormalizeCanvasCode(codeView) {
        codeView = codeView ? codeView : waitForElement('#code-view', (el) => codeView = el)

        setTimeout(() => {
            const codeNode = codeView //.querySelector('code');
            if (!codeNode || !codeNode.innerHTML) return;
            codeNode.innerHTML = codeNode.innerHTML
                .replace(
                    /\$\$([\s\S]*?)\$\$/g,
                    (_, expr) => `[${expr.trim()}]`
                );

        }, 0)
    }

    isCanvasOpen(){
        const check = document.getElementById('aiCanvasToggle')?.checked
        return check
    }

    updateCanvas(){
        //
    }
}
