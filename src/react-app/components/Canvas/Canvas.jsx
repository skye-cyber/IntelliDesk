import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Caret } from '@js/Utils/caret.js'
import { ResizeClassToggler } from '@js/managers/Canvas/CanvasUtils.js';
import { useTheme } from '@components/Themes/useThemeHeadless.jsx';
import { StateManager } from '@js/managers/StatesManager';
//import { ChatDisplay } from '@js/managers/ConversationManager/util';
import { Editor } from './editor';
import { waitForElement } from '../../../renderer/js/Utils/dom_utils';

//const chatdisplay = new ChatDisplay()

window.openCanvas = null;
window.canvasUpdate = null

StateManager.set('isCanvasActive', false)

export const Canvas = ({ isOpen, onToggle }) => {
    const [isCanvasActive, setIsCanvasActive] = useState(false);
    const [codeViewVisible, setCodeViewVisible] = useState(true);
    const [isCanvasOpen, setIsCanvasOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const isControlledCloseRef = useRef(false); // Track if WE initiated the close
    const { isDark } = useTheme();

    // Use refs for values that change during animation
    const scrollState = useRef({
        targetScroll: 0,
        currentScroll: 0,
        isScrolling: false,
        animationId: null
    });

    // Single ref object for all DOM elements
    const refs = useRef({
        chatArea: null,
        canvas: null,
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

        // Set initial active state
        setIsCanvasActive(currentRefs.ToggleCanvasBt?.checked);
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
        new Caret(codeView, handIndicator, codeScrollWrapper, scrollState.current.currentScroll).updateHandPosition()

        openCanvas()
        new ResizeClassToggler(userInput, ToggleCanvasBt, 430, 'sm:flex');
        new ResizeClassToggler(userInput, imageGen, 400, 'sm:flex');

        new Editor(codeView, [updateHandIndicator, updateLineNumbers])
    }, []);

    function canvasUpdate() {
        updateLineNumbers();
        updatePreview();
    }

    window.canvasUpdate = canvasUpdate

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

    const updateLineNumbers = useCallback((e = null) => {
        const { codeView, lineNumbers, lineCounter } = refs.current;
        if (!codeView || !lineNumbers) return;

        // For contenteditable, we need to handle both text and HTML content
        let lineCount;

        if (codeView.textContent) {
            // Count lines based on text content and <div> elements
            const textLines = codeView.textContent.split('\n').length;

            // Also count div elements as they represent lines in contenteditable
            const divElements = codeView.querySelectorAll('div').length;

            // Use the larger count to handle both text and structural lines
            lineCount = Math.max(textLines, divElements || 1);
        } else {
            // Fallback: count div elements or use 1 for empty editor
            const divElements = codeView.querySelectorAll('div').length;
            lineCount = divElements || 1;
        }

        // Ensure we have at least 1 line
        lineCount = Math.max(lineCount, 1);

        let numbers = '';
        for (let i = 1; i <= lineCount; i++) {
            numbers += i + '\n';
        }

        lineNumbers.textContent = numbers;
        if (lineCounter) lineCounter.textContent = lineCount;
    }, []);

    const SuperupdateLineNumbers = useCallback((e = null) => {
        const { codeView, lineNumbers, lineCounter } = refs.current;
        if (!codeView || !lineNumbers) return;

        const getLineCount = () => {
            // Method 1: Count by div elements (structural lines)
            const divCount = codeView.querySelectorAll('div').length;

            // Method 2: Count by text lines
            const text = codeView.textContent || '';
            const textLineCount = text.split('\n').length;

            // Method 3: Count by actual visible lines (for wrapped text)
            const computedStyle = window.getComputedStyle(codeView);
            const lineHeight = parseInt(computedStyle.lineHeight) || 20;
            const paddingTop = parseInt(computedStyle.paddingTop) || 0;
            const paddingBottom = parseInt(computedStyle.paddingBottom) || 0;

            const contentHeight = codeView.scrollHeight - paddingTop - paddingBottom;
            const visibleLines = Math.max(1, Math.round(contentHeight / lineHeight));

            // Return the maximum count to ensure all lines are numbered
            return Math.max(divCount, textLineCount, visibleLines, 1);
        };

        const lineCount = getLineCount();

        let numbers = '';
        for (let i = 1; i <= lineCount; i++) {
            numbers += i + '\n';
        }

        lineNumbers.textContent = numbers;
        if (lineCounter) lineCounter.textContent = lineCount;
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


    // Single source of truth for scroll values
    const animateScroll = useCallback(() => {
        const { codeView } = refs.current;

        if (!codeView || !scrollState.current.isScrolling) return;

        const { targetScroll, currentScroll } = scrollState.current;

        // Smooth interpolation
        const newScroll = currentScroll + (targetScroll - currentScroll) * 0.15;
        scrollState.current.currentScroll = newScroll;

        // Apply transform
        codeView.style.transform = `translateX(${-newScroll}px)`;

        // Check if we need to continue animating
        const distance = Math.abs(targetScroll - newScroll);

        if (distance < 0.5) {
            // Snap to final position
            scrollState.current.currentScroll = targetScroll;
            scrollState.current.isScrolling = false;
            codeView.style.transform = `translateX(${-targetScroll}px)`;

            // Update React state for UI consistency
            scrollState.current.currentScroll = targetScroll;
        } else {
            // Continue animation
            scrollState.current.animationId = requestAnimationFrame(animateScroll);
        }
    }, []);

    // Start/stop animation helper
    const startScrollAnimation = useCallback((newTargetScroll) => {
        const { codeView } = refs.current;
        const maxScroll = codeView.scrollWidth + 50

        // Clamp target scroll
        const clampedScroll = Math.max(0, Math.min(newTargetScroll, maxScroll));

        // Update ref state
        scrollState.current.targetScroll = clampedScroll;
        scrollState.current.isScrolling = true;

        // Update React state
        //settargetScroll(clampedScroll);

        // Cancel any existing animation
        if (scrollState.current.animationId) {
            cancelAnimationFrame(scrollState.current.animationId);
        }

        // Start new animation
        scrollState.current.animationId = requestAnimationFrame(animateScroll);
    }, [animateScroll]);

    // Improved wheel handler
    const handleWheelScroll = useCallback((e) => {
        const { codeView, codeScrollWrapper, handIndicator } = refs.current;

        if (!codeView) return;

        // Update typing indicator
        if (handIndicator && Caret) {
            new Caret(codeView, handIndicator, codeScrollWrapper, scrollState.current.currentScroll)
                .updateHandPosition();
        }

    }, [startScrollAnimation, Caret]);

    const clampBounce = useCallback((value, min, max, bounce = 20) => {
        if (value < min) return min - Math.min(bounce, Math.abs(value - min));
        if (value > max) return max + Math.min(bounce, Math.abs(value - max));
        return value;
    }, []);

    // Sync scroll (make sure this is properly attached)
    const syncScroll = useCallback((e) => {
        const { codeView, lineNumbers } = refs.current;
        if (!codeView || !lineNumbers) return;

        requestAnimationFrame(() => {
            if (e.target === lineNumbers) {
                codeView.scrollTop = lineNumbers.scrollTop;
            } else {
                lineNumbers.scrollTop = codeView.scrollTop;
            }
        });
    }, []);


    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scrollState.current.animationId) {
                cancelAnimationFrame(scrollState.current.animationId);
            }
        };
    }, []);

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
        return
        /*
         * if (task === "scale") {
            mainLayoutA.classList.remove('w-[40vw]');
            mainLayoutA.classList.add('w-full');
        } else {
            mainLayoutA.classList.remove('w-full');
            mainLayoutA.classList.add('w-[40vw]');
        }
        */
    }, [])

    const AiMessagesWfitAdjust = useCallback((task = 'add') => {
        //if (!isCanvasOpen) return;
        const { chatArea } = refs.current;
        const Rlist = chatArea.querySelectorAll('#ai_response');
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


    // Open canvas
    const openCanvas = useCallback(() => {
        // Avoid double trigger as trigger has been dispatched by InputSection
        //onToggle()

        let { canvas } = refs.current

        canvas?.classList.remove('hidden');
        setTimeout(() => {
            canvas?.classList.remove('translate-x-[100vw]');
            setIsCanvasOpen(true);
            StateManager.set('isCanvasActive', true)
            //AiMessagesWfitAdjust('remove');
            //UserMessagesWfitAdjust("remove")
            InputSectionWfitAdjust('add')
            //mainLayoutAWfitAdjust('retract')
        }, 400)
        waitForElement('#main-container-center', (container) => {
            if (container.classList.contains('md:w-[96vw]')) {
                container.classList.remove('w-[calc(100vw-40px)]', 'md:w-[96vw]')
                container.classList.add('w-[50vw]')
            }
        });

        //Adjust main interface width for max space usage
        waitForElement('#chatArea-wrapper', (container) => {
            container.classList.remove('md:w-[80%]', 'lg:w-[70%]', 'xl:w-[60%]')
            //container.classList.add('w-[100%]')
        });
    }, [setIsCanvasOpen])


    useEffect(() => {
        document.addEventListener('open-canvas', openCanvas)

        return () => {
            document.removeEventListener('open-canvas', openCanvas)
        }
    })
    window.openCanvas = openCanvas

    // Hide canvas
    const hideCanvas = useCallback(() => {
        const { canvas } = refs.current;

        setTimeout(() => {
            canvas.classList.add('hidden');
            setIsCanvasOpen(false);
            //AiMessagesWfitAdjust('add');
            //UserMessagesWfitAdjust("remove")
            InputSectionWfitAdjust('remove')
            //mainLayoutAWfitAdjust('scale')
        }, 400)

        waitForElement('#main-container-center', (container) => {
            if (container.classList.contains('w-[50vw]')) {
                container.classList.remove('w-[50vw]')
                container.classList.add('w-[calc(100vw-40px)]', 'md:w-[96vw]')
            }
        });

        // Re-Adjust main interface width to normal
        waitForElement('#chatArea-wrapper', (container) => {
            //container.classList.remove('w-[100%]')
            container.classList.add('md:w-[80%]', 'lg:w-[70%]', 'xl:w-[60%]')
        });
    }, [setIsCanvasOpen, onToggle])


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
            new Caret(codeView, handIndicator, codeScrollWrapper, scrollState.current.currentScroll).updateHandPosition();
        }
    }, [Caret])

    if (!isOpen) return null;

    return (
        <section id="canvas-wrapper" className="hidden flex-shrink -right-3 translate-x-[100vw] w-[60vw] bg-gradient-to-tr from-purple-100 via-purple-200 to-pink-100 dark:from-secondary-900 dark:via-blend-900 dark:to-accent-900 h-[100vh] flex items-center justify-center font-sans text-gray-800 dark:text-purple-200 border-x border-y border-t-0 border-r-0 border-blue-500 dark:border-cyan-500/0 rounded-xl rounded-b-none transform transition-transform transition-all duration-700 ease-in-out p-0.5">

            <div aria-label="AI code canvas container" className="mt-0! w-full max-w-5xl bg-white dark:bg-primary-800 rounded-xl shadow-xl rounded-b-none flex flex-col h-full overflow-hidden ring-1 ring-purple-200 dark:ring-purple-700">
                {/* Header with title and theme toggle */}
                <header className="flex items-center justify-between px-0.5 xl:px-2 py-1 border-b border-purple-200 dark:border-purple-700 select-none transition-colors duration-500">

                    <div className='group relative'>
                        <button onClick={handleClose} className="flex justify-center items-center py-[0px] px-[2px] cursor-w-resize group">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" data-rtl-flip="" className="icon max-md:hidden">
                                <path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z">
                                </path>
                            </svg>
                        </button>
                        <span data-action='arial-title' className='absolute -bottom-10 -left-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-xs font-semibold text-primary-950 dark:text-white bg-primary-100 dark:bg-zinc-700 rounded-xl p-1 w-fit max-18 whitespace-pre font-handwriting'>Close Canvas</span>
                    </div>

                    <h2 className="hidden xl:flex text-xl font-semibold text-purple-900 dark:text-purple-200">Canvas</h2>

                    <p className="h-full flex justify-center items-center mx-[2vw] text-sm font-normal text-black dark:text-white">Lines:&nbsp;<span id="line-counter" className="text-slate-900 dark:text-gray-100"></span></p>

                    {/* Buttons row */}
                    <div className="flex justify-end gap-1 lg:gap-2 xl:gap-4 mr-1 select-none transform transition-transform transition-all duration-500 ease-in-out transition-colors duration-500">
                        <button
                            onClick={handleCodeView}
                            id="btn-code"
                            className="flex items-center gap-1 px-0 xs:p-0.5 md:px-3 py-1 rounded-full bg-purple-600 text-white hover:bg-purple-700 shadow-md transition duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400 font-normal text-md text-sm" title="Show Code">
                            &lt;/&gt; Code
                        </button>

                        <button
                            onClick={handlePreviewView}
                            id="btn-preview"
                            className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-700 shadow-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm" title="Show Preview">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4h12v12H4z" /></svg>
                            Preview
                        </button>
                        <button
                            onClick={handleCopy}
                            id="btn-copy"
                            className="hidden sm:flex items-center gap-2 px-0 xs:p-0.5 md:px-3 xs:py-1 rounded-full bg-green-500 text-white hover:bg-green-600 shadow-md transition duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 transform transition-transform transition-all duration-500 ease-in-out text-sm" title="Copy Code">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h6a2 2 0 012 2v2" /><rect x="8" y="8" width="8" height="8" rx="2" /></svg>
                            Copy
                        </button>
                    </div>

                    <button onClick={() => themeSwitch.click()} id="canvas-theme-toggle" aria-label="Toggle dark mode" className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-purple-400" title="Toggle theme">
                        <svg id="icon-moon" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-700 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
                        </svg>
                        <svg id="icon-sun" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-600 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                    </button>
                </header>

                {/* Main AI canvas content */}
                <section className="flex-1 overflow-hidden w-full p-0 space-y-0 h-full overflow-hiden">
                    {/* Code block with line numbers and code content side by side */}
                    <div id="code-block-container" className="flex flex-row h-full overflow-hidden ring-2 ring-purple-300 dark:ring-purple-700 shadow-inner bg-white dark:bg-zinc-950 select-text text-sm max-w-full">
                        {/* Line numbers gutter */}
                        <pre id="line-numbers"
                            onScroll={syncScroll}
                            className="line-numbers font-mon text-xs leading-loose text-[#a07add] text-right select-[1.5rem] p-2 block h-full max-h-[92vh] min-w-fit max-w-12 bg-purple-100 dark:bg-primary-950 px-4 pt-0 border-r border-purple-200 dark:border-purple-700 transition-colors duration-500 text-sm font-mono flex-shrink-0 bg-opacity-100 overflow-auto scrollbar-hide"></pre>

                        {/* Code content scrollable container */}
                        <div id="code-scroll-wrapper" className="flex flex-row flex-1 pl-2 overflow-hidden">
                            {/* Code Content */}
                            <pre id="code-view"
                                tabIndex="0"
                                aria-label="Code editor view"
                                className="relative flex-1 h-auto h-full whitespace-pre-wrap leading-[1.5rem] text-sm font-mono transform transition-tranform duration-100 focus:ring-none focus:outline-none cursor-pen overflow-auto scrollbar-custom border-l border-primary-400"
                                contentEditable="true"
                                spellCheck="false"
                                data-portal-container="code_canvas"
                                onScroll={syncScroll}
                                onClick={(e) => { updateHandIndicator(e); updateLineNumbers(e); }}
                                onWheel={handleWheelScroll}
                            >
                            </pre>
                            {/* Enhanced Pen Indicator with Multiple Visual States */}
                            <div
                                id="hand-indicator"
                                className="absolute z-[30] pointer-events-none transition-all duration-700 ease-out"
                                style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))' }}
                            >
                                {/* Main Pen Container */}
                                <div className="relative w-8 h-8 transform transition-transform duration-500 group-hover:scale-110">

                                    {/* Glow Effect */}
                                    <div className="absolute inset-0 bg-blue-400/20 dark:bg-green-400/20 rounded-full blur-md animate-pulse-slow transform scale-150"></div>

                                    {/* Floating Animation Container */}
                                    <div className="relative w-full h-full animate-float">

                                        {/* Pen Icon with Gradient */}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 64 64"
                                            className="w-full h-full drop-shadow-lg transform transition-all duration-300 hover:rotate-12"
                                        >
                                            {/* Gradient Definition */}
                                            <defs>
                                                <linearGradient id="penGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#00557f" stopOpacity="1" />
                                                    <stop offset="50%" stopColor="#0088cc" stopOpacity="1" />
                                                    <stop offset="100%" stopColor="#00557f" stopOpacity="1" />
                                                </linearGradient>
                                                <linearGradient id="penGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                                                    <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
                                                </linearGradient>
                                            </defs>

                                            {/* Pen Body */}
                                            <path
                                                fill="url(#penGradient)"
                                                className="dark:fill-[url(#penGradientDark)]"
                                                d="M52.5 11.5c-1.5-1.5-4-1.5-5.5 0L38 20.5l-4.6-4.6c-1.2-1.2-3.1-1.2-4.2 0s-1.2 3.1 0 4.2l4.6 4.6-16.1 16.1c-0.5 0.5-0.8 1.1-0.9 1.8L15 52c-0.1 0.8 0.2 1.7 0.9 2.3 0.6 0.6 1.5 0.9 2.3 0.9h0.3l8.4-1.7c0.7-0.1 1.3-0.4 1.8-0.9L45.1 35l4.6 4.6c1.2 1.2 3.1 1.2 4.2 0s1.2-3.1 0-4.2l-4.6-4.6 9-9c1.4-1.5 1.4-4 0-5.5L52.5 11.5zM22 48.5l-5.6 1.1 1.1-5.6L36.5 25 39 27.5 22 44.5v4z"
                                            />

                                            {/* Pen Tip Highlight */}
                                            <path
                                                fill="#ffffff"
                                                fillOpacity="0.3"
                                                d="M52.5 11.5L45.1 35l4.6 4.6 9-9c1.4-1.5 1.4-4 0-5.5L52.5 11.5z"
                                            />
                                        </svg>

                                        {/* Ink Drip Effect */}
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                                            <div className="w-1 h-2 bg-blue-500 dark:bg-green-400 rounded-full opacity-70">
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 dark:bg-green-400 rounded-full animate-drip"></div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Sparkle Particles */}
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-sparkle-1"></div>
                                    <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-sparkle-2"></div>

                                    {/* Pulse Ring */}
                                    <div className="absolute inset-0 border-2 border-blue-400/30 dark:border-green-400/30 rounded-full animate-ping-slow"></div>

                                </div>

                                {/* Tooltip */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    Draw on canvas
                                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview block */}
                    <div id="preview-view" tabIndex="0" aria-label="Preview output" className="hidden bg-white dark:bg-primary-800 h-full p-6 ring-2 ring-purple-300 dark:ring-purple-700 shadow-inner h-[88vh] overflow-auto text-purple-900 dark:text-purple-200 font-sans text-base whitespace-pre-wrap transition-colors duration-500">
                        Hello, IntelliDesk Canvas!
                    </div>
                </section>
            </div>
        </section>
    );
};
