import React, { useEffect, useState, useRef, useCallback } from 'react';
import { updateHandPosition } from '@js/Utils/caret.js'
import { ResizeClassToggler } from '@js/managers/Canvas/CanvasUtils.js';
import { useTheme } from '@components/Themes/useThemeHeadless.jsx';

export const Canvas = ({ isOpen, onToggle }) => {
    const [isCanvasActive, setIsCanvasActive] = useState(false);
    const [codeViewVisible, setCodeViewVisible] = useState(true);
    const [targetScroll, settargetScroll] = useState(0);
    const [isScrolling, setisScrolling] = useState(false);
    const [currentScroll, setcurrentScroll] = useState(0);
    const [isCanvasOpen, setIsCanvasOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const isControlledCloseRef = useRef(false); // Track if WE initiated the close
    const { isDark, toggleTheme, setTheme } = useTheme();

    // Single ref object for all DOM elements
    const refs = useRef({
        chatArea: null,
        canvas: null,
        themeToggle: null,
        btnCode: null,
        btnPreview: null,
        btnCopy: null,
        codeView: null,
        previewView: null,
        lineNumbers: null,
        codeBlockContainer: null,
        ToggleCanvasBt: null,
        plusIcon: null,
        closeIcon: null,
        lineCounter: null,
        userInput: null,
        userInputwrapper: null,
        codeScrollWrapper: null,
        handIndicator: null,
        imageGen: null,
        mainLayoutA: null,
        isDark: isDark
    });

    // Handle opening
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            // Wait for render then show with animation
            setTimeout(() => setIsVisible(true), 10);
        }
    }, [isOpen]);

    // Handle close animation then notify parent
    const handleClose = useCallback((notifyParent = true) => {
        hideCanvas()
        setIsVisible(false);
        // Wait for animation to complete before unmounting
        setTimeout(() => {
            setShouldRender(false);
            if (notifyParent) {
                onToggle(); // Only notify parent if this was user-initiated
            }
        }, 1000); // Match your animation duration
    }, [onToggle]);

    // Close when isOpen becomes false (only if WE didn't initiate it)
    useEffect(() => {
        if (!isOpen && isVisible && !isControlledCloseRef.current) {
            // This close was initiated by parent prop change
            handleClose(false); // Don't notify parent to avoid loop
        }
    }, [isOpen, isVisible, handleClose]);


    // Initialize refs once
    useEffect(() => {
        if (!isOpen) return;

        const currentRefs = refs.current;
        currentRefs.chatArea = document.getElementById('chatArea')
        currentRefs.themeToggle = document.getElementById('canvas-theme-toggle');
        currentRefs.canvas = document.getElementById('canvas-wrapper');
        currentRefs.btnCode = document.getElementById('btn-code');
        currentRefs.btnPreview = document.getElementById('btn-preview');
        currentRefs.btnCopy = document.getElementById('btn-copy');
        currentRefs.codeView = document.getElementById('code-view');
        currentRefs.previewView = document.getElementById('preview-view');
        currentRefs.lineNumbers = document.getElementById('line-numbers');
        currentRefs.codeBlockContainer = document.getElementById('code-block-container');
        currentRefs.ToggleCanvasBt = document.getElementById('ToggleCanvasBt');
        currentRefs.plusIcon = document.getElementById('plusIcon');
        currentRefs.closeIcon = document.getElementById('closeIcon');
        currentRefs.lineCounter = document.getElementById('line-counter');
        currentRefs.userInput = document.getElementById('userInput');
        currentRefs.userInputwrapper = document.getElementById('userInput-wrapper');
        currentRefs.codeScrollWrapper = document.getElementById("code-scroll-wrapper");
        currentRefs.handIndicator = document.getElementById('hand-indicator');
        currentRefs.imageGen = document.getElementById('image-gen');
        currentRefs.mainLayoutA = document.getElementById('mainLayoutA');
        //console.log('DOM refs initialized:', currentRefs.previewView);
        // Set initial active state
        setIsCanvasActive(currentRefs.ToggleCanvasBt?.getAttribute('aria-pressed') === 'true');
        initialize()
    }, [isOpen]);

    const initialize = useCallback(() => {
        const { userInput, imageGen, ToggleCanvasBt, lineNumbers, codeView, handIndicator, codeScrollWrapper } = refs.current;
        const resizeObserver = new ResizeObserver(() => {
            lineNumbers.style.height = codeView.scrollHeight + 5 + 'px';
        });
        resizeObserver.observe(codeView);
        // Update line numbers initially and whenever content changes
        canvasUpdate();
        updateHandPosition(codeView, handIndicator, codeScrollWrapper)

        openCanvas()
        new ResizeClassToggler(userInput, ToggleCanvasBt, 430, 'sm:flex');
        new ResizeClassToggler(userInput, imageGen, 400, 'sm:flex');

    }, []);

    function canvasUpdate() {
        updateLineNumbers();
        updatePreview();
    }

    // set canvas for update
    const setCanvas4Update = useCallback((e) => {
        const { codeView } = refs.current;

        openCanvas();
        const codeBlock = e.parentElement.parentElement.querySelector('code');
        const html = codeBlock.innerHTML;
        const validLanguage = codeBlock.id
        codeView.innerHTML = `<code id="${validLanguage}" class="hljs ${validLanguage} block whitespace-pre w-full rounded-md bg-none font-mono transition-colors duration-500">${html}</code>`;
        canvasUpdate()
    }, []);

    const updateLineNumbers = useCallback(() => {
        const { codeView, lineNumbers, lineCounter } = refs.current;
        if (!codeView || !lineNumbers) return;

        const code = codeView.textContent;
        const visualLines = code.split('\n').length;

        let numbers = '';
        for (let i = 1; i <= visualLines; i++) {
            numbers += i + '\n';
        }

        lineNumbers.textContent = numbers;
        if (lineCounter) lineCounter.textContent = visualLines;

        // wrapFoldableBlocks(); // You'll need to convert this too
    }, []);

    const syncScroll = useCallback(() => {
        const { codeView, lineNumbers } = refs.current;
        if (!codeView || !lineNumbers) return;

        requestAnimationFrame(() => {
            lineNumbers.scrollTop = codeView.scrollTop;
        });
    }, []);

    const setActiveButton = useCallback((activeBtn) => {
        const { btnCode, btnPreview } = refs.current;
        if (!btnCode || !btnPreview) return;

        [btnCode, btnPreview].forEach(btn => {
            btn.classList.remove('bg-purple-600', 'text-white', 'shadow-md', 'hover:bg-purple-700');
            btn.classList.add('bg-purple-100', 'dark:bg-purple-800', 'text-purple-800', 'dark:text-purple-300', 'hover:bg-purple-200', 'dark:hover:bg-purple-700', 'shadow-sm');
        });

        activeBtn.classList.remove('bg-purple-100', 'dark:bg-purple-800', 'text-purple-800', 'dark:text-purple-300', 'hover:bg-purple-200', 'dark:hover:bg-purple-700', 'shadow-sm');
        activeBtn.classList.add('bg-purple-600', 'text-white', 'shadow-md', 'hover:bg-purple-700');
    }, []);

    // Event handlers
    const handleCodeView = useCallback(() => {
        const { codeBlockContainer, previewView, btnCode } = refs.current;
        codeBlockContainer?.classList.remove('hidden');
        previewView?.classList.add('hidden');
        setActiveButton(btnCode);
        setCodeViewVisible(true);
    }, [setActiveButton]);

    const handlePreviewView = useCallback(() => {
        const { codeBlockContainer, previewView, btnPreview } = refs.current;
        codeBlockContainer?.classList.add('hidden');
        previewView?.classList.remove('hidden');
        setActiveButton(btnPreview);
        setCodeViewVisible(false);
        updatePreview();
    }, [setActiveButton]);

    // Update preview content with latest code output
    const updatePreview = useCallback(() => {
        // A very simple preview: if the code contains a console.log with string, extract and show that string.
        const { codeView, previewView } = refs.current;

        // This is a naive demo
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
    }, [])

    const handleCopy = useCallback(async () => {
        const { btnCopy, codeView } = refs.current;
        if (!codeView || !btnCopy) return;

        try {
            const text = codeView.textContent;
            await navigator.clipboard.writeText(text);

            const original = btnCopy.innerHTML;
            btnCopy.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 inline text-green-300" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg> Copied!
                `;
            btnCopy.disabled = true;

            setTimeout(() => {
                btnCopy.innerHTML = original;
                btnCopy.disabled = false;
            }, 1600);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, []);

    // Smooth scrolling loop
    const animateScroll = useCallback(() => {
        const { codeView } = refs.current

        if (!isScrolling) return;

        setcurrentScroll(currentScroll + (targetScroll - currentScroll) * 0.15);

        // Stop animation when close enough
        if (Math.abs(targetScroll - currentScroll) < 0.5) {
            setcurrentScroll(targetScroll);
            setisScrolling(false);
        }

        // Apply smooth scroll transform
        codeView.style.transform = `translateX(${-currentScroll}px)`;

        // If bouncing, snap back to valid range
        const maxScroll = codeView.scrollWidth + 50 - codeScrollWrapper.clientWidth;
        if (targetScroll < 0 || targetScroll > maxScroll) {
            settargetScroll(Math.max(0, Math.min(targetScroll, maxScroll)));
            setisScrolling(true);
        }

        requestAnimationFrame(animateScroll);
    }, [isScrolling, targetScroll, currentScroll])

    // handle whenDependentTypesAreResolved
    const handleWheelScroll = useCallback(async (e) => {
        const { codeScrollWrapper } = refs.current
        const isVertical = Math.abs(e.deltaY) > Math.abs(e.deltaX);
        const maxScroll = (codeView.scrollWidth + 50) - codeScrollWrapper.clientWidth;

        if (isVertical) {
            // Delegate vertical scroll to wrapper
            e.preventDefault();
            codeScrollWrapper.scrollTop += e.deltaY;

        } else {
            // Handle horizontal scroll
            e.preventDefault();
            settargetScroll(clampBounce(targetScroll + e.deltaX, 0, maxScroll));
            setisScrolling(true);
            animateScroll()
        }
        // Update typing indicator position
        updateHandPosition();
    }, [animateScroll, updateHandPosition])

    // Clamp with optional bounce
    function clampBounce(value, min, max, bounce = 20) {
        if (value < min) return min - Math.min(bounce, Math.abs(value - min));
        if (value > max) return max + Math.min(bounce, Math.abs(value - max));
        return value;
    }

    const UserMessagesWfitAdjust = useCallback((task = 'add') => {
        //if (!isCanvasOpen) return;
        const { chatArea } = refs.current;
        const Rlist = chatArea.querySelectorAll('#AIRes');
        if (!Rlist.length) return;

        const method = task === 'add' ? 'add' : 'remove';
        for (const element of Rlist) {
            element.classList[method]('w-fit');
        }
    }, [])

    const mainLayoutAWfitAdjust = useCallback((task = 'scale') => {
        const { mainLayoutA } = refs.current

        if (task === "scale") {
            mainLayoutA.classList.remove('w-[40vw]');
            mainLayoutA.classList.add('w-full');
        } else {
            mainLayoutA.classList.remove('w-full');
            mainLayoutA.classList.add('w-[40vw]');
        }
    }, [])

    const AiMessagesWfitAdjust = useCallback((task = 'add') => {
        //if (!isCanvasOpen) return;
        const { chatArea } = refs.current;
        const Rlist = chatArea.querySelectorAll('#URes');
        if (!Rlist.length) return;

        const method = task === 'add' ? 'add' : 'remove';
        for (const element of Rlist) {
            element.classList[method]('w-fit');
        }
    }, [])

    const InputSectionWfitAdjust = useCallback((task = 'add') => {
        //if (!isCanvasOpen) return;
        const { userInput, userInputwrapper } = refs.current
        if (!userInput) return;

        if (task === "add") {
            userInput.classList.remove('w-full');
            userInput.classList.add('w-[40vw]', 'placeholder-sm');
            userInputwrapper.classList.remove('w-full')
            userInputwrapper.classList.add('w-[40vw]')
        } else {
            userInput.classList.remove('w-[40vw]');
            userInput.classList.add('w-full');
            userInputwrapper.classList.remove('w-[40vw]')
            userInputwrapper.classList.add('w-full')
        }
    }, [])

    // Activate Canvas
    const ActivateCanvas = useCallback(() => {
        const { ToggleCanvasBt, closeIcon, plusIcon } = refs.current;

        // Hide plus icon, show close icon
        plusIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');

        // Remove inactive styles
        ToggleCanvasBt.classList.remove(
            'bg-white',
            'dark:bg-slate-700',
            'text-blue-600',
            'dark:text-teal-300',
            'border-blue-300',
            'shadow-md',
            'dark:border-gray-500'
        );

        // Add active styles
        ToggleCanvasBt.classList.add(
            'bg-[#00ca62]',
            'text-black',
            'border-blue-600',
            'shadow-xl',
            'dark:border-teal-500'
        );

        setIsCanvasActive(true);
        ToggleCanvasBt?.setAttribute('aria-pressed', 'true');
    }, [])

    //Deactivate canvas
    const DeactivateCanvas = useCallback(() => {
        const { ToggleCanvasBt, closeIcon, plusIcon } = refs.current;

        // Show plus icon, hide close icon
        closeIcon?.classList.add('hidden');
        plusIcon?.classList.remove('hidden');

        // Remove active styles
        ToggleCanvasBt?.classList.remove(
            'bg-[#00ca62]',
            'text-black',
            'border-blue-600',
            'shadow-xl',
            'dark:border-teal-500'
        );

        // Add inactive styles
        ToggleCanvasBt?.classList.add(
            'bg-white',
            'dark:bg-slate-700',
            'text-blue-600',
            'dark:text-teal-300',
            'border-blue-300',
            'shadow-md',
            'dark:border-gray-500'
        );
        setIsCanvasActive(false);
        ToggleCanvasBt?.setAttribute('aria-pressed', 'true');
    }, [])

    // Open canvas
    const openCanvas = useCallback(() => {
        const { canvas } = refs.current
        ActivateCanvas()

        canvas.classList.remove('hidden');
        setTimeout(() => {
            canvas.classList.remove('translate-x-[100vw]');
            setIsCanvasOpen(true);
            AiMessagesWfitAdjust('remove');
            UserMessagesWfitAdjust("remove")
            InputSectionWfitAdjust('add')
            mainLayoutAWfitAdjust('retract')
        }, 400)
    }, [setIsCanvasOpen, ActivateCanvas])

    // Hide canvas
    const hideCanvas = useCallback(() => {
        const { canvas } = refs.current;
        DeactivateCanvas()

        console.log('Closing')
        canvas.classList.add('translate-x-[100vw]');

        setTimeout(() => {
            canvas.classList.add('hidden');
            setIsCanvasOpen(false);
            AiMessagesWfitAdjust('add');
            UserMessagesWfitAdjust("remove")
            InputSectionWfitAdjust('remove')
            mainLayoutAWfitAdjust('scale')
        }, 400)
    }, [setIsCanvasOpen, DeactivateCanvas])


    function updateTheme() {
        const { isDark } = refs.current
        const moon = document.getElementById('icon-moon')
        const sun = document.getElementById('icon-sun')

        if (isDark) {
            sun.classList.add('hidden')
            moon.classList.remove('hidden')
        } else {
            moon.classList.add('hidden')
            sun.classList.remove('hidden')
        }
        document.getElementById('themeSwitch').click()
        refs.current.isDark = !isDark
    }

    const updateHandIndicator = useCallback((e) => {
        const { codeView, handIndicator, codeScrollWrapper } = refs.current;

        if (!codeView.contains(e.target)) {
            handIndicator.style.opacity = '0';
        } else {
            updateHandPosition(codeView, handIndicator, codeScrollWrapper);
        }
    }, [updateHandPosition])

    // Add event listeners
    useEffect(() => {
        const { themeToggle, btnCode, btnPreview, btnCopy, codeView, lineNumbers, handIndicator, codeScrollWrapper } = refs.current;

        // Theme toggle
        themeToggle?.addEventListener('click', () => {
            themeSwitch.click()
        });

        // Button events
        btnCode?.addEventListener('click', handleCodeView);
        btnPreview?.addEventListener('click', handlePreviewView);
        btnCopy?.addEventListener('click', handleCopy);

        // Scroll sync
        codeView?.addEventListener('scroll', syncScroll);
        lineNumbers?.addEventListener('scroll', syncScroll);

        // Input events
        codeView?.addEventListener('input', updateLineNumbers);

        // Canvas open/close
        //ToggleCanvasBt?.addEventListener('click', handleCanvasToggle);

        codeView?.addEventListener("wheel", handleWheelScroll, { passive: false });

        // Update handIndicator position
        //document.addEventListener('click', updateHandIndicator);

        // Update hand position
        ['input', 'keyup', 'click', 'keydown'].forEach(evt =>
            codeView?.addEventListener(evt, () => {
                updateHandPosition(codeView, handIndicator, codeScrollWrapper)
            })
        )

        // Cleanup
        return () => {
            btnCode?.removeEventListener('click', handleCodeView);
            btnPreview?.removeEventListener('click', handlePreviewView);
            btnCopy?.removeEventListener('click', handleCopy);
            codeView?.removeEventListener('scroll', syncScroll);
            lineNumbers?.removeEventListener('scroll', syncScroll);
            codeView?.removeEventListener('input', updateLineNumbers);
            //ToggleCanvasBt?.removeEventListener('click', handleCanvasToggle);
            codeView?.removeEventListener('wheel', handleWheelScroll)
            //document.removeEventListener('click', updateHandVisibility)
            ['input', 'keyup', 'click', 'keydown'].forEach(evt =>
                codeView.removeEventListener(evt, updateHandPosition))
        };
    }, [handleCodeView, handlePreviewView, handleCopy, syncScroll, updateLineNumbers]);

    if (!isOpen) return null;

    return (
        <section id="canvas-wrapper" className="relative hidden flex-shrink -right-3 translate-x-[100vw] w-[60vw] bg-gradient-to-tr from-purple-100 via-purple-200 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 min-h-[80vh] flex items-center justify-center p-2 font-sans text-gray-800 dark:text-purple-200 border-x border-y border-t-0 border-r-0 border-blue-500 dark:border-cyan-500 rounded transform transition-transform transition-all duration-500">

            <button onClick={hideCanvas} className="flex justify-center items-center absolute top-2 left-0 text-xl hover:rotate-45 transform transition-transform transition-all duration-500 ease-in-out hover:bg-purple-300 rounded-full py-[0px] px-[6px]">
                <span>{'\u00D7'}</span>
            </button>

            <div aria-label="AI code canvas container" className="ai-canvas-container w-full max-w-5xl bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex flex-col h-[93vh] overflow-hidden ring-1 ring-purple-200 dark:ring-purple-700">
                {/* Header with title and theme toggle */}
                <header className="flex items-center justify-between px-3 py-1 border-b border-purple-200 dark:border-purple-700 select-none transition-colors duration-500">
                    <h2 className="text-xl font-semibold text-purple-900 dark:text-purple-200">Canvas</h2>
                    <button onClick={updateTheme} id="canvas-theme-toggle" aria-label="Toggle dark mode" className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-purple-400" title="Toggle theme">
                        <svg id="icon-moon" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-700 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" /></svg>
                        <svg id="icon-sun" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-600 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                    </button>
                </header>

                {/* Main AI canvas content */}
                <section className="flex-1 overflow-y-auto w-full p-2 space-y-8 scroll-smooth ai-canvas-scrollbar">
                    {/* Code & Preview block */}
                    <article className="bg-purple-50 dark:bg-purple-900 rounded-2xl shadow-inner ring-1 ring-purple-300 dark:ring-purple-600 px-0 py-2 flex flex-col max-h-full">

                        {/* Buttons row */}
                        <div className="flex justify-end gap-4 mb-2 mr-1 select-none transform transition-transform transition-all duration-500 ease-in-out transition-colors duration-500">
                            <p className="h-full flex justify-center items-center mx-[2vw] text-sm font-normal text-black dark:text-white">Lines:&nbsp;<span id="line-counter" className="text-slate-900 dark:text-gray-100"></span></p>
                            <button id="btn-code" className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-600 text-white hover:bg-purple-700 shadow-md transition duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400 font-normal text-md" title="Show Code">
                                &lt;/&gt; Code
                            </button>

                            <button id="btn-preview" className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-700 shadow-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400" title="Show Preview">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4h12v12H4z" /></svg>
                                Preview
                            </button>
                            <button id="btn-copy" className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500 text-white hover:bg-green-600 shadow-md transition duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 transform transition-transform transition-all duration-500 ease-in-out" title="Copy Code">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h6a2 2 0 012 2v2" /><rect x="8" y="8" width="8" height="8" rx="2" /></svg>
                                Copy
                            </button>
                        </div>


                        {/* Code block with line numbers and code content side by side */}
                        <div id="code-block-container" className="flex flex-row h-[93vh] max-h-full overflow-hidden rounded-lg rounded-t-none ring-2 ring-purple-300 dark:ring-purple-700 shadow-inner bg-white dark:bg-zinc-950 select-text text-sm max-w-[56vw]">
                            {/* Code content scrollable container */}
                            <div id="code-scroll-wrapper" className="flex flex-row flex-1 overflow-hidden">
                                {/* Line numbers gutter */}
                                <pre id="line-numbers" className="line-numbers block min-h-full h-[100vh] min-w-fit max-w-12 bg-purple-100 dark:bg-slate-950 p-4 border-r border-purple-200 dark:border-purple-700 transition-colors duration-500 text-sm font-mono flex-shrink-0 bg-opacity-100"></pre>

                                {/* Code Content */}
                                <pre id="code-view"
                                    tabIndex="0"
                                    aria-label="Code editor view"
                                    className="relative flex-1 h-auto p-4 whitespace-pre leading-[1.5rem] text-sm font-mono transform transition-tranform duration-100 focus:ring-none focus:outline-none cursor-pen"
                                    contentEditable="true"
                                    spellCheck="false">
                                </pre>
                                {/* Pen Indicator (Floating Pen) */}
                                <div id="hand-indicator"
                                    className="absolute w-6 h-6 z-[1] pointer-events-none bg-no-repeat bg-contain animate-heartpulse text-[#00557f] dark:text-green-500 transition-colors duration-500"><span className="hidden">✍️</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-full h-full">
                                        <path fill="currentColor" d="M52.5 11.5c-1.5-1.5-4-1.5-5.5 0L38 20.5l-4.6-4.6c-1.2-1.2-3.1-1.2-4.2 0s-1.2 3.1 0 4.2l4.6 4.6-16.1 16.1c-0.5 0.5-0.8 1.1-0.9 1.8L15 52c-0.1 0.8 0.2 1.7 0.9 2.3 0.6 0.6 1.5 0.9 2.3 0.9h0.3l8.4-1.7c0.7-0.1 1.3-0.4 1.8-0.9L45.1 35l4.6 4.6c1.2 1.2 3.1 1.2 4.2 0s1.2-3.1 0-4.2l-4.6-4.6 9-9c1.4-1.5 1.4-4 0-5.5L52.5 11.5zM22 48.5l-5.6 1.1 1.1-5.6L36.5 25 39 27.5 22 44.5v4z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Preview block */}
                        <div id="preview-view" tabIndex="0" aria-label="Preview output" className="hidden bg-white dark:bg-purple-800 rounded-lg p-6 ring-2 ring-purple-300 dark:ring-purple-700 shadow-inner max-h-full overflow-auto text-purple-900 dark:text-purple-200 font-sans text-base whitespace-pre-wrap transition-colors duration-500">
                            Hello, IntelliDesk Canvas!
                        </div>
                    </article>
                </section>
            </div>
        </section>
    );
};
