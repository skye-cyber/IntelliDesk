export interface Model {
    value: string
    name: string
    description: string
    icon: string
    platform: string
    recommended?: boolean
}

export interface ModelCategoryType {
    title: string
    type: string
    models: Array<Model>
}

export type ModelCategoryList = Array<ModelCategoryType>

export const ModelCategory: ModelCategoryList = [
    {
        title: "Multimodal",
        type: 'multimodal',
        models: [
            {
                value: "mistral-small-latest",
                name: "mistral-small-latest",
                description: "Latest small model with vision and document capabilities. 128k context, supports text and image inputs.",
                icon: "mistral",
                platform: "mistral"
            },
            {
                value: "pixtral-large-latest",
                name: "pixtral-large-latest",
                description: "Advanced vision-language model for complex visual understanding and reasoning tasks.",
                icon: "mistral",
                platform: "mistral"
            },
            {
                value: "pixtral-12b-latest",
                name: "pixtral-12b-latest",
                description: "Lightweight multimodal model (12B) for efficient image-text processing at the edge.",
                icon: "mistral",
                platform: "mistral"
            },
        ]
    },
    {
        title: "Coding",
        type: 'coding',
        models: [
            {
                value: "codestral-latest",
                name: "codestral-latest",
                description: "State-of-the-art coding model supporting 80+ languages and fill-in-the-middle capabilities.",
                icon: "mistral",
                platform: "mistral",
                recommended: true
            },
            {
                value: "codestral-mamba-2407",
                name: "codestral-mamba-2407",
                description: "Mamba architecture variant for linear-time inference and long-context code generation.",
                icon: "mistral",
                platform: "mistral"
            }
        ]
    },
    {
        title: "Moderation",
        type: 'moderation',
        models: [
            {
                value: "mistral-moderation-latest",
                name: "mistral-moderation-latest",
                description: "Self-reflection based content moderation for classification of harmful text across multiple languages.",
                icon: "mistral",
                platform: "mistral"
            }
        ]
    },
    {
        title: "Text Generation",
        type: 'general',
        models: [
            {
                value: "mistral-large-latest",
                name: "mistral-large-latest",
                description: "Flagship large language model with 123B parameters, advanced reasoning, and function calling.",
                icon: "mistral",
                platform: "mistral",
                recommended: true
            },
            {
                value: "mistral-saba-2502",
                name: "mistral-saba-2502",
                description: "Specialized model for Arabic and South Asian languages (Hindi, Tamil, etc.) trained on regional data.",
                icon: "mistral",
                platform: "mistral"
            },
            {
                value: "open-mistral-nemo",
                name: "open-mistral-nemo",
                description: "12B Apache 2.0 licensed model optimized for edge deployment and fine-tuning.",
                icon: "mistral",
                platform: "mistral"
            },
            {
                value: "ministral-8b-2410",
                name: "ministral-8b-2410",
                description: "8B parameter edge model with high performance per watt for on-device inference.",
                icon: "mistral",
                platform: "mistral"
            },
            {
                value: "ministral-3b-2410",
                name: "ministral-3b-2410",
                description: "Ultra-lightweight 3B model for resource-constrained environments and low-latency applications.",
                icon: "mistral",
                platform: "mistral"
            }
        ]
    },
    {
        title: "Embedding",
        type: 'embedding',
        models: [
            {
                value: "mistral-embed",
                name: "mistral-embed",
                description: "1024-dimensional text embeddings for semantic search, clustering, and RAG applications.",
                icon: "mistral",
                platform: "mistral",
                recommended: true
            },
        ]
    },
    {
        title: "OCR",
        type: 'ocr',
        models: [
            {
                value: "mistral-ocr-latest",
                name: "mistral-ocr-latest",
                description: "Advanced OCR model for structured document understanding and text extraction from images/PDFs.",
                icon: "mistral",
                platform: "mistral",
                recommended: true
            }
        ]
    }
];
