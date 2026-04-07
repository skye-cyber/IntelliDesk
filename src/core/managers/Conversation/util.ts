import { normaliZeMathDisplay } from "../../MathBase/MathNormalize";
import { debounceRenderKaTeX } from "../../MathBase/mathRenderer";
import { chart_interpret } from "../../diagraming/jscharting";
import { dot_interpreter } from "../../diagraming/vizcharting";
import { globalEventBus } from "../../Globals/eventBus";

// Model type definitions
export type ModelCategory = 'multimodal' | 'coding' | 'moderation' | 'text-generation' | 'embedding' | 'ocr' | 'unknown';

export interface ModelInfo {
    id: string;
    category: ModelCategory;
    supportsToolCalling: boolean;
    supportsVision: boolean;
    description: string;
    isLatest: boolean;
}

// Model registry - single source of truth
const MODEL_REGISTRY: Record<string, ModelInfo> = {
    // Multimodal
    "mistral-small-latest": {
        id: "mistral-small-latest",
        category: "multimodal",
        supportsToolCalling: true,
        supportsVision: true,
        description: "Latest small model with vision and document capabilities",
        isLatest: true
    },
    "pixtral-large-latest": {
        id: "pixtral-large-latest",
        category: "multimodal",
        supportsToolCalling: true,
        supportsVision: true,
        description: "Advanced vision-language model for complex visual understanding",
        isLatest: true
    },
    "pixtral-12b-latest": {
        id: "pixtral-12b-latest",
        category: "multimodal",
        supportsToolCalling: true,
        supportsVision: true,
        description: "Lightweight 12B multimodal model for edge deployment",
        isLatest: true
    },

    // Coding
    "codestral-latest": {
        id: "codestral-latest",
        category: "coding",
        supportsToolCalling: true,
        supportsVision: false,
        description: "State-of-the-art coding model supporting 80+ languages",
        isLatest: true
    },
    "codestral-mamba-2407": {
        id: "codestral-mamba-2407",
        category: "coding",
        supportsToolCalling: true,
        supportsVision: false,
        description: "Mamba architecture variant for linear-time inference",
        isLatest: false
    },

    // Moderation
    "mistral-moderation-latest": {
        id: "mistral-moderation-latest",
        category: "moderation",
        supportsToolCalling: false,
        supportsVision: false,
        description: "Self-reflection based content moderation",
        isLatest: true
    },

    // Text Generation
    "mistral-large-latest": {
        id: "mistral-large-latest",
        category: "text-generation",
        supportsToolCalling: true,
        supportsVision: false,
        description: "Flagship large language model with advanced reasoning",
        isLatest: true
    },
    "mistral-saba-2502": {
        id: "mistral-saba-2502",
        category: "text-generation",
        supportsToolCalling: true,
        supportsVision: false,
        description: "Specialized for Arabic and South Asian languages",
        isLatest: false
    },
    "open-mistral-nemo": {
        id: "open-mistral-nemo",
        category: "text-generation",
        supportsToolCalling: true,
        supportsVision: false,
        description: "12B Apache 2.0 model optimized for edge deployment",
        isLatest: false
    },
    "ministral-8b-2410": {
        id: "ministral-8b-2410",
        category: "text-generation",
        supportsToolCalling: true,
        supportsVision: false,
        description: "8B parameter edge model with high efficiency",
        isLatest: false
    },
    "ministral-3b-2410": {
        id: "ministral-3b-2410",
        category: "text-generation",
        supportsToolCalling: true,
        supportsVision: false,
        description: "Ultra-lightweight 3B model for resource-constrained environments",
        isLatest: false
    },

    // Embedding
    "mistral-embed": {
        id: "mistral-embed",
        category: "embedding",
        supportsToolCalling: false,
        supportsVision: false,
        description: "1024-dimensional text embeddings for RAG and search",
        isLatest: true
    },

    // OCR
    "mistral-ocr-latest": {
        id: "mistral-ocr-latest",
        category: "ocr",
        supportsToolCalling: false,
        supportsVision: true,
        description: "Advanced OCR for structured document understanding",
        isLatest: true
    }
};

// Category model lists derived from registry
const CATEGORY_MODELS: Record<ModelCategory, string[]> = {
    multimodal: [],
    coding: [],
    moderation: [],
    'text-generation': [],
    embedding: [],
    ocr: [],
    unknown: []
};

// Populate category lists
Object.values(MODEL_REGISTRY).forEach(model => {
    CATEGORY_MODELS[model.category].push(model.id);
});

export class ChatUtil {
    private diagramInterpreter: typeof dot_interpreter | typeof chart_interpret;

    constructor() {
        // Fix: Support both diagram interpreters properly
        this.diagramInterpreter = dot_interpreter;
        // If you need both, store them separately:
        // this.chartInterpreter = chart_interpret;
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
            dot_interpreter(input, scope);
        }
        if (['charts', 'all'].includes(scope)) {
            chart_interpret(input);
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

    // ==================== Model Category Methods ====================

    /**
     * Get all supported model IDs
     */
    getModels(): string[] {
        return Object.keys(MODEL_REGISTRY);
    }

    /**
     * Get detailed info for a specific model
     */
    getModelInfo(modelId: string): ModelInfo | undefined {
        return MODEL_REGISTRY[modelId];
    }

    /**
     * Check if a model is multimodal (supports vision)
     */
    isMultimodal(modelId: string): boolean {
        return this.getModelCategory(modelId) === 'multimodal' ||
        MODEL_REGISTRY[modelId]?.supportsVision === true;
    }

    /**
     * Check if a model is specialized for coding
     */
    isCodeModel(modelId: string): boolean {
        return this.getModelCategory(modelId) === 'coding';
    }

    /**
     * Check if a model is for content moderation
     */
    isModerationModel(modelId: string): boolean {
        return this.getModelCategory(modelId) === 'moderation';
    }

    /**
     * Check if a model is for text generation (general purpose)
     */
    isTextGenerationModel(modelId: string): boolean {
        return this.getModelCategory(modelId) === 'text-generation';
    }

    /**
     * Check if a model is an embedding model
     */
    isEmbeddingModel(modelId: string): boolean {
        return this.getModelCategory(modelId) === 'embedding';
    }

    /**
     * Check if a model is for OCR
     */
    isOCRModel(modelId: string): boolean {
        return this.getModelCategory(modelId) === 'ocr';
    }

    /**
     * Check if a model supports tool calling/function calling
     */
    supportsToolCalling(modelId: string): boolean {
        return MODEL_REGISTRY[modelId]?.supportsToolCalling ?? false;
    }

    /**
     * Check if a model supports vision (image inputs)
     */
    supportsVision(modelId: string): boolean {
        return MODEL_REGISTRY[modelId]?.supportsVision ?? false;
    }

    /**
     * Get the category of a model
     */
    getModelCategory(modelId: string): ModelCategory {
        return MODEL_REGISTRY[modelId]?.category ?? 'unknown';
    }

    /**
     * Get all models in a specific category
     */
    getModelsByCategory(category: ModelCategory): string[] {
        return CATEGORY_MODELS[category] || [];
    }

    /**
     * Get multimodal models (legacy method for backward compatibility)
     */
    getMultimodalModels(): string[] {
        return this.getModelsByCategory('multimodal');
    }

    /**
     * Get code models (legacy method for backward compatibility)
     */
    getCodeModels(): string[] {
        return this.getModelsByCategory('coding');
    }

    /**
     * Get all model categories
     */
    getCategories(): ModelCategory[] {
        return ['multimodal', 'coding', 'moderation', 'text-generation', 'embedding', 'ocr'];
    }

    /**
     * Get models that support tool calling across all categories
     */
    getToolCallingModels(): string[] {
        return Object.values(MODEL_REGISTRY)
        .filter(m => m.supportsToolCalling)
        .map(m => m.id);
    }

    /**
     * Get Codestral endpoints
     */
    getCodestralEndpoint(listify: boolean = false): Record<string, string> | string[] {
        const endpoints = {
            'https://codestral.mistral.ai/v1/fim/completions': 'Completion Endpoint',
            'https://codestral.mistral.ai/v1/chat/completions': 'Chat Endpoint'
        };

        return listify ? Object.keys(endpoints) : endpoints;
    }

    // ==================== Event Helpers ====================

    hideSuggestions(): void {
        globalEventBus.emit('suggestions:hide');
    }

    openCanvas(): void {
        globalEventBus.emit('canvas:open');
    }
}

export class ChatDisplay {
    /**
     * Adjust chat sizing for responsive layout
     */
    static adjustChatSize(task: 'scale_down' | 'scale_up' = 'scale_down'): void {
        const userChats = document.querySelectorAll<HTMLElement>('#ai_response');
        const aiChats = document.querySelectorAll<HTMLElement>('#user_message');

        if (task === "scale_down") {
            const targets = userChats.length > 0 ? userChats : aiChats;
            targets.forEach(chat => {
                chat?.classList?.remove('lg:max-w-5xl');
                chat?.classList?.add('w-fit');
            });
        } else {
            // Fixed: was checking ai_chats twice in original code
            const targets = userChats.length > 0 ? userChats : aiChats;
            targets.forEach(chat => {
                chat?.classList?.remove('w-fit');
                chat?.classList?.add('lg:max-w-5xl');
            });
        }
    }
}

export const chatUtil = new ChatUtil();
export const chatutil = chatUtil
