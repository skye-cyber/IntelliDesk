import { normaliZeMathDisplay } from "../../MathBase/MathNormalize";
import { debounceRenderKaTeX } from "../../MathBase/mathRenderer";
import { chart_interpret } from "../../diagraming/jscharting";
import { dot_interpreter } from "../../diagraming/vizcharting";
import { waitForElement } from "../../Utils/dom_utils";

export class ChatUtil {
    constructor() {
        this.diagram_interpreter = dot_interpreter
        this.diagram_interpreter = chart_interpret
    }
    scrollToBottom(element = document.getElementById('chatArea'), check = false, timeout = 500) {
        this.updateScrollButtonVisibility();

        if (check && !document.getElementById('autoScroll').checked) {
            return; // Exit early if auto-scroll is disabled
        }

        // Use requestAnimationFrame for smoother animations
        const scroll = () => {
            element.scrollTo({
                top: element.scrollHeight,
                behavior: 'smooth'
            });
        };

        // For streaming responses, use immediate scroll without delay when possible
        if (timeout === 0) {
            requestAnimationFrame(scroll);
        } else {
            setTimeout(() => {
                requestAnimationFrame(scroll);
            }, timeout);
        }
    }

    // Function to update scroll button visibility
    updateScrollButtonVisibility() {
        //console.log("Scrollable")
        const chatArea = document.getElementById('chatArea')
        //const scrollButton = document.getElementById('scroll-bottom')

        const isScrollable = chatArea.scrollHeight > chatArea.clientHeight;
        const isAtBottom = chatArea.scrollTop + chatArea.clientHeight >= chatArea.scrollHeight;

        waitForElement('#scroll-bottom', (el) => el.classList.toggle('hidden', !(isScrollable && !isAtBottom)));
    }

    removeLoadingAnimation() {
        const loader = document.getElementById('loader-parent')?.parentElement
        if (loader?.id.startsWith("loader_")) loader?.remove()
    }

    render_dg(input, scope = 'all') {
        // render diagrams fromthis response
        if (['dg', 'all'].includes(scope)) this.diagram_interpreter(input, scope);
        if (['charts', 'all'].includes(scope)) this.diagram_interpreter(input)
    }

    render_math(container_selector, scope = 'all', delay = null) {
        if (['norm', 'all'].includes(scope)) normaliZeMathDisplay(`.${container_selector}`)

        if (['math', 'all'].includes(scope)) debounceRenderKaTeX(`.${container_selector}`, delay ? delay : null, delay ? false : true);
    }

    get_models() {
        const MSmodels = [
            "open-mistral-7b",
            "open-mixtral-8x7b",
            "open-mixtral-8x22b",
            "mistral-small-latest", //vision && document capabilities
            "mistral-small-2402",
            "mistral-small-2409",
            "mistral-small-2501",
            "mistral-medium",
            "mistral-large-latest",
            "mistral-large-2402",
            "mistral-large-2407",
            "mistral-large-2411",
            "mistral-saba-2502",
            "mistral-embed", //embending
            "codestral-latest",//coding
            "codestral-2405", //coding
            "codestral-2501", //coding
            "codestral-mamba-2407", //coding
            "open-mistral-nemo",
            "pixtral-12b-latest", //MistraVision
            "pixtral-12b-2409", //MistraVision
            "pixtral-large-latest", //MistraVision
            "pixtral-large-2411",         //MistraVision
            "ministral-3b-2410",
            "ministral-8b-2410",
            "mistral-moderation-2411",   //moderation
            "mistral-moderation-latest", //moderation
        ]
        return MSmodels
    }

    get_codestral_endpoint() {
        const codestral = {
            'https://codestral.mistral.ai/v1/fim/completions': 'Completion Endpoint',
            'https://codestral.mistral.ai/v1/chat/completions': 'Chat Endpoint'
        }
        return codestral
    }

    get_vision_modesl() {
        return [
            "mistral-small-latest",
            "pixtral-12b-2409",
            "pixtral-large-2411",
            "Qwen/Qwen2-VL-7B-Instruct",
            "meta-llama/Llama-3.2-11B-Vision-Instruct",
            "Qwen/QVQ-72B-Preview"
        ]
    }

    hide_suggestions() {
        document.getElementById('suggestions')?.classList?.add('hidden')
    }
    open_canvas() {
        document.getElementById('ToggleCanvasBt')?.click()
    }
}

export class ChatDisplay {
    constructor() {
        //
    }
    chats_size_adjust(task = 'scale_down') {
        const user_chats = document.querySelectorAll('#ai_response')
        const ai_chats = document.querySelectorAll('#user_message')
        if (task === "scale_down") {
            if (user_chats?.length > 0) {
                user_chats.forEach(chat => {
                    chat?.classList?.remove('lg:max-w-5xl')
                    chat?.classList?.add('w-fit')
                })
            } else {
                if (ai_chats?.length > 0) {
                    user_chats.forEach(chat => {

                        chat?.classList?.remove('lg:max-w-5xl')
                        chat?.classList?.add('w-fit')
                    })
                }
            }
        }
        else {
            if (ai_chats?.length > 0) {
                ai_chats.forEach(chat => {
                    chat?.classList?.remove('w-fit')
                    chat?.classList?.add('lg:max-w-5xl')
                })
            } else {
                if (ai_chats?.length > 0) {
                    user_chats.forEach(chat => {
                        chat?.classList?.remove('w-fit')
                        chat?.classList?.add('lg:max-w-5xl')
                    })
                }
            }
        }
    }
}
