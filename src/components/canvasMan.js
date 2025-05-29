// Theme toggle logic
const CanvasthemeToggle = document.getElementById('canvas-theme-toggle');
const canvas = document.getElementById('canvas-wrapper');
// Buttons for Code, Preview, Copy
const btnCode = document.getElementById('btn-code');
const btnPreview = document.getElementById('btn-preview');
const btnCopy = document.getElementById('btn-copy');
const codeView = document.getElementById('code-view');
const previewView = document.getElementById('preview-view');
const lineNumbers = document.getElementById('line-numbers');
const codeBlockContainer = document.getElementById('code-block-container');
const CanvasOpen = document.getElementById('CanvasOpen');
const plusIcon = document.getElementById('plusIcon');
const closeIcon = document.getElementById('closeIcon');

let isCanvasOpen = false;
let isCanvasActive = CanvasOpen.getAttribute('aria-pressed') === 'true';
let codeBuffer = null;

CanvasthemeToggle.addEventListener('click', () => {
    themeSwitch.click()
});

// Initialize code content with sample code
const sampleCode = `class ResizeClassToggler {
  constructor(targetId, toggleTarget, breakpoint = 640, className = 'sm:flex') {
    this.target = document.getElementById(targetId);
    this.toggleTarget = document.getElementById(toggleTarget);
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
    console.log(width)
    if (width <= this.breakpoint) {
      this.toggleTarget.classList.remove(this.className);
    } else {
      this.toggleTarget.classList.add(this.className);
    }
  }
}

new ResizeClassToggler('userInput', 'CanvasOpen', 430, 'sm:flex');
new ResizeClassToggler('userInput', 'image-gen', 400, 'sm:flex');
`;

// Set code content editable initially to sample code
//codeView.textContent = sampleCode;

// Function to update line numbers based on codeView content
function updateLineNumbers() {
    const lines = codeView.textContent.split('\n').length;
    let numbers = '';
    for (let i = 1; i <= lines; i++) {
        numbers += i + '\n';
    }
    lineNumbers.textContent = numbers;
}

// Sync vertical scroll of line numbers and code content
function syncScroll() {
    lineNumbers.scrollTop = codeView.scrollTop;
}

// Initialize UI state
function setActiveButton(activeBtn) {
    [btnCode, btnPreview].forEach(btn => {
        btn.classList.remove('bg-purple-600', 'text-white', 'shadow-md', 'hover:bg-purple-700');
        btn.classList.add('bg-purple-100', 'dark:bg-purple-800', 'text-purple-800', 'dark:text-purple-300', 'hover:bg-purple-200', 'dark:hover:bg-purple-700', 'shadow-sm');
    });
    activeBtn.classList.remove('bg-purple-100', 'dark:bg-purple-800', 'text-purple-800', 'dark:text-purple-300', 'hover:bg-purple-200', 'dark:hover:bg-purple-700', 'shadow-sm');
    activeBtn.classList.add('bg-purple-600', 'text-white', 'shadow-md', 'hover:bg-purple-700');
}

btnCode.addEventListener('click', () => {
    codeBlockContainer.classList.remove('hidden');
    previewView.classList.add('hidden');
    setActiveButton(btnCode);
});

btnPreview.addEventListener('click', () => {
    codeBlockContainer.classList.add('hidden');
    previewView.classList.remove('hidden');
    setActiveButton(btnPreview);
    updatePreview();
});

btnCopy.addEventListener('click', () => {
    // Copy code text content
    const text = codeView.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const original = btnCopy.innerHTML;
        btnCopy.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 inline text-green-300" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg> Copied!
      `;
        btnCopy.disabled = true;
        setTimeout(() => {
            btnCopy.innerHTML = original;
            btnCopy.disabled = false;
        }, 1600);
    }).catch(() => {
        console.error('Failed to copy to clipboard');
    });
});

// Update preview content with latest code output
function updatePreview() {
    // A very simple preview: if the code contains a console.log with string, extract and show that string.
    // This is a naive demo just for preview purposes
    try {
        // Simple regex to extract string inside console.log
        //const match = codeView.textContent.match(/console\.log\((["'`])(.+?)\1\)/);
        const code = codeView.querySelector('code') || null;

        const lang = code.id
        if (['html', 'svg', 'xml'].includes(lang)) {
            previewView.innerHTML = code.textContent;
        } else {
            previewView.textContent = 'Preview unavailable for this language';
        }
    } catch {
        previewView.textContent = 'Preview error';
    }
}

// Update line numbers initially and whenever content changes
canvasUpdate();

// Listen to input events on codeView contenteditable div
codeView.addEventListener('input', () => {
    canvasUpdate();
});

function canvasUpdate() {
    updateLineNumbers();
    updatePreview();
}
// Sync scroll
codeView.addEventListener('scroll', syncScroll);
lineNumbers.addEventListener('scroll', syncScroll);

function showCanvas() {
    wfit('remove');

    //show canvas
    canvas.classList.remove('hidden');
    setTimeout(() => {
        canvas.classList.remove('translate-x-[100vw]');
        isCanvasOpen = true;
    }, 400)
}

function hideCanvas() {
    wfit('add');

    //hide canvas
    canvas.classList.add('translate-x-[100vw]');
    setTimeout(() => {
        canvas.classList.add('hidden');
        isCanvasOpen = false;
    }, 400)
}


function canvasDSP(op = null) {
     isCanvasActive = CanvasOpen.getAttribute('aria-pressed') === 'true';

    if (!isCanvasActive) {
        // Activate state

        // Hide plus icon, show close icon
        plusIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');

        // Remove inactive styles
        CanvasOpen.classList.remove(
            'bg-white',
            'dark:bg-slate-700',
            'text-blue-600',
            'dark:text-teal-300',
            'border-blue-300',
            'shadow-md',
            'dark:border-gray-500'
        );

        // Add active styles
        CanvasOpen.classList.add(
            'bg-[#00ca62]',
            'text-black',
            'border-blue-600',
            'shadow-xl',
            'dark:border-teal-500'
        );

        isCanvasActive = true;

        if (op === 'open') showCanvas();
        CanvasOpen.setAttribute('aria-pressed', 'true');

    } else {
        // Deactivate state

        // Show plus icon, hide close icon
        closeIcon.classList.add('hidden');
        plusIcon.classList.remove('hidden');

        // Remove active styles
        CanvasOpen.classList.remove(
            'bg-[#00ca62]',
            'text-black',
            'border-blue-600',
            'shadow-xl',
            'dark:border-teal-500'
        );

        // Add inactive styles
        CanvasOpen.classList.add(
            'bg-white',
            'dark:bg-slate-700',
            'text-blue-600',
            'dark:text-teal-300',
            'border-blue-300',
            'shadow-md',
            'dark:border-gray-500'
        );

        isCanvasActive = false;

        if (op === 'close') hideCanvas();
        CanvasOpen.setAttribute('aria-pressed', 'false');
    }
}

CanvasOpen.addEventListener('click', () => {
    canvasDSP();
});

function setCanvasUpdate(e){
    showCanvas();
    const codeBlock = e.parentElement.parentElement.querySelector('code');
    const html = codeBlock.innerHTML;
    const validLanguage = codeBlock.id
    codeView.innerHTML = `<code id="${validLanguage}" class="hljs ${validLanguage} block whitespace-pre-wrap w-full rounded-md bg-none font-mono transition-colors duration-700 mb-[20vh]">${html}</code>`;
    canvasUpdate()
}

class ResizeClassToggler {
    constructor(targetId, toggleTarget, breakpoint = 640, className = 'sm:flex') {
        this.target = document.getElementById(targetId);
        this.toggleTarget = document.getElementById(toggleTarget);
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

new ResizeClassToggler('userInput', 'CanvasOpen', 430, 'sm:flex');
new ResizeClassToggler('userInput', 'image-gen', 400, 'sm:flex');

function NormalizeCanvasCode() {
    setTimeout(() => {
        const codeNode = codeView.querySelector('code');
        if (!codeNode || !codeNode.innerHTML) return;
        codeNode.innerHTML = codeNode.innerHTML
            .replace(
                /\$\$([\s\S]*?)\$\$/g,
                (_, expr) => `[${expr.trim()}]`
            );

    }, 0)
}

function isCode(actualResponse) {
    // Normalize math first (your existing step)
    const normalized = window.normalizeMathDelimiters(actualResponse);

    // Use a temporary element to parse the marked output
    const html = window.marked(normalized);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const codeBlock = html.codeView;

    if (codeBlock) {
        if (!isCanvasOpen) showCanvas();
        return {
            isCode: true,
            code: codeBlock, // includes <pre><code>...</code></pre>
        };
    } else {

        return {
            isCode: false,
            code: null,
        };
    }
}

function wfit(task = 'add') {
    const Rlist = chatArea.querySelectorAll('#AIRes');
    if (!Rlist.length) return;

    const method = task === 'add' ? 'add' : 'remove';
    for (const element of Rlist) {
        element.classList[method]('w-fit');
    }
}

