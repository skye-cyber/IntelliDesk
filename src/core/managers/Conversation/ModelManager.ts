import { globalEventBus } from "../../Globals/eventBus";

// Model type definitions
export type ModelCategory = 'multimodal' | 'coding' | 'moderation' | 'text-generation' | 'embedding' | 'ocr' | 'unknown' | 'reasoning' | 'vision';

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
    },
    // Reasoning
    "magistral-small-latest": {
        id: "magistral-small-latest",
        category: "reasoning",
        supportsToolCalling: true,
        supportsVision: true,
        description: "Advanced Reasoning model",
        isLatest: true
    },
    "magistral-medium-latest": {
        id: "magistral-medium-latest",
        category: "reasoning",
        supportsToolCalling: true,
        supportsVision: true,
        description: "Advanced Reasoning model",
        isLatest: true
    },
    "mistral-large-2512": {
        id: "mistral-large-2512",
        category: "vision",
        supportsToolCalling: false,
        supportsVision: true,
        description: "Handles image related tasks",
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
    unknown: [],
    reasoning: [],
    vision: []
};

// Populate category lists
Object.values(MODEL_REGISTRY).forEach(model => {
    CATEGORY_MODELS[model.category].push(model.id);
});



class ModelManager {
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
    isVision(modelId: string): boolean {
        return ['vision', 'ocr'].includes(this.getModelCategory(modelId)) ||
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
     * Check if a model has reasoning capability
     */
    isReasoningModel(modelId: string): boolean {
        return MODEL_REGISTRY[modelId]?.category === 'reasoning';
    }
    /**
     * Check if Model use array for content
     */
    usesArrayStructure(modelId: string): boolean {
        return (this.isMultimodal(modelId) ||
            this.isVision(modelId) ||
            this.isReasoningModel(modelId) ||
            this.isOCRModel(modelId))
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
        return ['multimodal', 'coding', 'vision', 'reasoning', 'moderation', 'text-generation', 'embedding', 'ocr'];
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
     * Get models that support reasoning
     */
    getReasoningModels(): string[] {
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
    changeModel(model:string){
        globalEventBus.emit('model:change:request', model)
    }
}

export const modelManager = new ModelManager()
