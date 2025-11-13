import React, { useCallback, useEffect, useRef } from 'react';
//import { createPortal } from 'react-dom';
import { ModelCategory } from '@components/ModelCategory/ModelCategory';


export const ModelSelector = ({ selectedModel = 'mistral-medium-latest', onModelSelect, onClose }) => {
    const hfmodelCategories = [

        {
            title: "Basic Models",
            models: [
                {
                    value: "Qwen/Qwen2.5-72B-Instruct", name: "Basic mode", description: "Default conversation model", icon: "default", platform: "hf"
                },
                {
                    value: "deepseek-ai/DeepSeek-R1", name: "DeepSeek-R1", description: "The first reasoning model from DeepSeek.", icon: "deepseek"
                },
                {
                    value: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B", name: "DeepSeek-R1-Distill-Qwen-32B", icon: 'deepseek', description: "The first reasoning model from DeepSeek, distilled into a 32B dense model."
                }
            ]
        },
        {
            title: "Pro Models",
            models: [
                {
                    value: "meta-llama/Llama-3.3-70B-Instruct", name: "Llama-3.3-70B-Instruct", description: "Fast and extremely capable model", icon: "meta", provider: "meta", platform: "hf"
                },
                {
                    value: "nvidia/Llama-3.1-Nemotron-70B-Instruct-HF", name: "Llama-3.1-Nemotron-70B-Instruct-HF", description: "Llama fine-tune, topping alignment benchmarks and optimized for instruction following.", icon: "nvidia", platform: "hf"
                },
                {
                    value: "CohereForAI/c4ai-command-r-plus-08-2024", name: "c4ai-command-r-plus-08-2024", description: "Optimized for conversational interaction and tool use.", icon: "cohere", platform: "hf"
                },
            ]
        },
        {
            title: "Math Models",
            models: [
                { value: "Qwen/Qwen2.5-Math-1.5B", name: "Qwen2.5-Math-1.5B", icon: "default", description: "Math model" },
            ]
        },
        {
            title: "Coding Models",
            models: [
                { value: "Qwen/Qwen2.5-Coder-32B-Instruct", name: "Qwen2.5-Coder-32B-Instruct", description: "Supports advanced coding tasks", icon: "code", platform: "hf" },
            ]
        },
        {
            title: "Vision Models",
            models: [
                {
                    value: "Qwen/wen2.5-Math-1.5B", name: "Qwen2.5-Math-1.5B", description: "Mathematical Model by qwen Team.", icon: "qwen", platform: "hf"
                },
            ]
        },
        {
            title: "General Models",
            models: [
                {
                    value: "microsoft/Phi-3.5-mini-instruct", name: "Phi-3.5-mini-instruct", description: "One of the best small models (3.8B parameters), super fast for simple tasks.", icon: "microsoft", platform: "hf"

                },
                {
                    value: "Qwen/QwQ-32B-Preview", name: "QwQ-32B-Preview", description: "QwQ is an experiment model from the Qwen Team with advanced reasoning capabilities.", icon: "qwen", platform: "hf"

                },
                {
                    value: "mistralai/Mistral-Nemo-Instruct-2407", name: "Mistral-Nemo-Instruct-2407", description: "A small model with good capabilities in language understanding and commonsense reasoning.", icon: "mistral", platform: "hf"
                },
                {
                    value: "NousResearch/Hermes-3-Llama-3.1-8B", name: "Hermes-3-Llama-3.1-8B", description: "Nous Research's latest Hermes 3 release in 8B size. Follows instruction closely.", icon: "nous", platform: "hf"
                },
                {
                    value: "Qwen/Qwen2.5-Coder-7B-Instruct", name: "Qwen2.5-Coder-7B-Instruct", description: "latest series of Code-Specific Qwen large language models (formerly known as CodeQwen).", icon: "qwen", platform: "hf"
                },
            ]
        },
        {
            title: "Multi-modal models",
            models: [
                {
                    value: "meta-llama/Llama-3.2-11B-Vision-Instruct", name: "Llama-3.2-11B-Vision-Instruct", description: "The latest multimodal model from Meta! Supports image inputs natively.", icon: "llama", platform: "hf"
                },
                {
                    value: "Qwen/Qwen2-VL-7B-Instruct", name: "Qwen2-VL-7B-Instruct", description: "Latest iteration of Qwen-VL model.", icon: "qwen", platform: "hf"
                },
            ]
        }

    ];

    const MistralmodelCategories = [
        {
            title: "Vision Models", models: [
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
            title: "Coding Models", models: [
                {
                    value: "codestral-latest", name: "codestral-latest", description: "Latest coding-focused model.", icon: "mistral", platform: "mitsral", recommended: true
                },
                {
                    value: "codestral-mamba-2407", name: "codestral-mamba-2407", description: "High-performance coding model designed for rapid code generation and debugging, optimized for software development environments.", icon: "mistral", platform: "mitsral"
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
            title: "Moderation Models", models: [
                {
                    value: "mistral-moderation-2411", name: "mistral-moderation-2411", description: "Focused on content moderation, designed to identify and filter inappropriate or harmful content in text data.", icon: "mistral", platform: "mitsral"
                }
            ]
        },
        {
            title: "General Models", models: [
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
            title: "Embending Models", models: [
                {
                    value: "mistral-embed", name: "mistral-embed", description: "Designed for embedding generation, facilitating the transformation of text into vector representations for downstream machine learning tasks.", icon: "mistral", platform: "mitsral", recommended: true
                },
            ]
        },
        {
            title: "OCR Models", models: [
                {value:"mistral-ocr-latest", name:"mistral-ocr-lates", description:"OCR model from mistral",platform:"mistral", recommended:true}
            ]
        }

    ];


    return (
        <div id="model-selector" className="fixed z-[55] mt-1 -ml-2 w-fit max-h-[88vh] overflow-y-auto py-1 max-w-md bg-white border border-blue-300 dark:border-[#242470] dark:bg-[#050511] text-gray-800 dark:text-gray-300 rounded-lg shadow-lg overflow-x-hidden whitespace-wrap text-truncate animation transition-colors duration-1000 transform-gpu scrollbar-custom scroll-smooth -translate-x-[100vw] opacity-0 transition-translate transition-all duration-500" value={selectedModel}>
            <div role="menu" aria-orientation="vertical">
                {/*hfmodelCategories.map((category, index) => (
                    <ModelCategory
                        key={index}
                        category={category}
                        selectedModel={selectedModel}
                        onModelSelect={onModelSelect}
                    />
                ))*/}
                {/*--Mistral Models Seperator*/}
                <div role="separator" aria-orientation="horizontal" className="mx-5 my-1 flex items-center justify-center">
                    <div className="flex-1 h-px bg-gradient-to-r from-[#ffaa00] to-[#00ff00]"></div>
                    <div className="px-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-purple-500 stroke-[#00aaff]" fill="b" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm12-8v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" />
                        </svg>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#55ff7f] to-[#0055ff]"></div>
                </div>
                {MistralmodelCategories.map((category, index) => (
                    <ModelCategory
                        key={index}
                        category={category}
                        selectedModel={selectedModel}
                        onModelSelect={onModelSelect}
                    />
                ))}
            </div>
        </div>
    );
};
