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
        title: "Multimodal", type: 'multimodal', models: [
            {
                value: "mistral-small-latest", name: "mistral-small-latest", description: "Latest   small iteration for vison model.", icon: "mistral", platform: "mitsral"
            },
            {
                value: "pixtral-large-2411", name: "pixtral-large-2411", description: "Optimized for high-quality image and text processing, suitable for complex visual understanding tasks.", icon: "mistral", platform: "mitsral"
            },
            {
                value: "pixtral-12b-2409", name: "pixtral-12b-2409", description: "Designed for advanced image and text integration tasks, enhancing multimodal applications.", icon: "mistral", platform: "mitsral"
            },
        ]
    },
    {
        title: "Coding", type: 'coding', models: [
            {
                value: "codestral-latest", name: "codestral-latest", description: "Latest coding-focused model.", icon: "mistral", platform: "mitsral", recommended: true
            },
            {
                value: "codestral-2501", name: "codestral-2501", description: "Advanced coding-focused model offering improved performance in programming-related tasks and queries.", icon: "mistral", platform: "mitsral"
            },
            {
                value: "codestral-2505", name: "codestral-2505", description: "Advanced coding-focused model iteration", icon: "mistral", platform: "mitsral"
            }
        ]
    },
    {
        title: "Moderation", type: 'muoderation', models: [
            {
                value: "mistral-moderation-2411", name: "mistral-moderation-2411", description: "Focused on content moderation, designed to identify and filter inappropriate or harmful content in text data.", icon: "mistral", platform: "mitsral"
            }
        ]
    },
    {
        title: "Text Generation", type: 'general', models: [
            {
                value: "mistral-large-latest", name: "mistral-large-latest", description: "The latest iteration of the large LLM.", icon: "mistral", platform: "mistral", recommended: true
            },
            {
                value: "mistral-small-2402", name: "mistral-small-2402", description: "Tailored for efficient processing with a focus on smaller datasets and lower resource consumption.", icon: "mistral", platform: "mitsral"
            },
            {
                value: "open-mixtral-8x22b", name: "open-mixtral-8x22b", description: "Powerful ensemble model optimized for complex language tasks and high accuracy", icon: "mistral", platform: "mitsral"
            },
            {
                value: "open-mixtral-8x7b", name: "open-mixtral-8x7b", description: "For enhanced performance in diverse NLP applications.", icon: "mistral", platform: "mitsral"
            },
            {
                value: "open-mistral-7b", name: "open-mistral-7b", description: "General-purpose natural language understanding and generation tasks", icon: "mistral", platform: "mitsral"
            },
            {
                value: "mistral-large-2407", name: "mistral-large-2407", description: "Enhanced version of the large model", icon: "mistral", platform: "mitsral"
            },
            {
                value: "mistral-large-2402", name: "mistral-large-2402", description: "Optimized for high-performance tasks, offering advanced capabilities in understanding and generating human-like text", icon: "mistral", platform: "mitsral"
            },
            {
                value: "mistral-medium", name: "mistral-medium", description: "Medium-sized model balancing performance and resource efficiency.", icon: "mistral", platform: "mitsral"
            },
            {
                value: "mistral-small-2501", name: "mistral-small-2501", description: "Refined small model designed for rapid inference and deployment in resource-constrained environments while maintaining robust language capabilities.", icon: "mistral", platform: "mitsral"
            },
            {
                value: "mistral-small-2409", name: "mistral-small-2409", description: "Improves upon its predecessor with enhanced training techniques for better performance in lightweight applications.", icon: "mistral", platform: "mitsral"
            },
            {
                value: "ministral-8b-2410", name: "ministral-8b-2410", description: "Provides enhanced capabilities and efficient resource usage", icon: "mistral", platform: "mitsral"
            },
            {
                value: "open-mistral-nemo", name: "open-mistral-nemo", description: "Tailored for conversational AI applications, focusing on generating human-like dialogue and understanding context.", icon: "mistral", platform: "mitsral"
            },
            {
                value: "mistral-saba-2502", name: "mistral-saba-2502", description: "Specialized for specific language tasks, leveraging advanced techniques for improved contextual understanding and response generation.", icon: "mistral", platform: "mitsral"
            },
            {
                value: "mistral-large-2411", name: "mistral-large-2411", description: "Designed to deliver state-of-the-art performance", icon: "mistral", platform: "mitsral"
            }
        ]
    },
    {
        title: "Embending", type: 'embending', models: [
            {
                value: "mistral-embed", name: "mistral-embed", description: "Designed for embedding generation, facilitating the transformation of text into vector representations for downstream machine learning tasks.", icon: "mistral", platform: "mitsral", recommended: true
            },
        ]
    },
    {
        title: "OCR", type: 'ocr', models: [
            { value: "mistral-ocr-latest", icon: 'default', name: "mistral-ocr-latest", description: "OCR model from mistral", platform: "mistral", recommended: true }
        ]
    }

];
