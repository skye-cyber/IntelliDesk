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
