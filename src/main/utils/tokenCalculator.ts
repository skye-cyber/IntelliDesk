import { Llama2Tokenizer } from "@lenml/llama2-tokenizer";
import { load_vocab } from "@lenml/llama2-tokenizer-vocab-llama2";

// Initialize tokenizer for Mistral models
class MistralTokenCounter {
    private tokenizer: Llama2Tokenizer;
    private modelVersion: 'v1' | 'v2' | 'v3' | 'v3-tekken';

    constructor(model: string = 'mistral') {
        this.tokenizer = new Llama2Tokenizer();
        const vocab = load_vocab();
        this.tokenizer.install_vocab(vocab);

        // Determine tokenizer version based on model
        if (model.includes('nemo') || model.includes('ministral')) {
            this.modelVersion = 'v3-tekken';
        } else if (model.includes('large') || model.includes('open-mistral-7b')) {
            this.modelVersion = 'v3';
        } else if (model.includes('mixtral-8x22b')) {
            this.modelVersion = 'v3';
        } else {
            this.modelVersion = 'v1';
        }
    }

    /**
     * Count tokens for a simple text string
     */
    countTextTokens(text: string): number {
        if (!text) return 0;
        const tokens = this.tokenizer.encode(text);
        return tokens.length;
    }

    /**
     * Count tokens for a chat conversation
     * Accounts for control tokens like [INST], [/INST]
     */
    countChatTokens(messages: Array<{role: 'user' | 'assistant' | 'system', content: string}>): number {
        let totalTokens = 0;

        for (const message of messages) {
            // Add control tokens based on role
            if (message.role === 'user') {
                totalTokens += this.countTextTokens('[INST]');
                totalTokens += this.countTextTokens(message.content);
                totalTokens += this.countTextTokens('[/INST]');
            } else if (message.role === 'assistant') {
                totalTokens += this.countTextTokens(message.content);
            } else if (message.role === 'system') {
                totalTokens += this.countTextTokens(message.content);
            }
        }

        // Add BOS (Beginning of Sequence) token if present
        totalTokens += 1; // <s> token

        return totalTokens;
    }

    /**
     * Count tokens for tool/function calls
     */
    countToolTokens(tools: any[]): number {
        let totalTokens = 0;

        if (tools && tools.length > 0) {
            totalTokens += this.countTextTokens('[AVAILABLE_TOOLS]');
            totalTokens += this.countTextTokens(JSON.stringify(tools));
            totalTokens += this.countTextTokens('[/AVAILABLE_TOOLS]');
        }

        return totalTokens;
    }

    /**
     * Get complete token count for a Mistral API request
     */
    countRequestTokens(request: {
        messages: Array<{role: string, content: string}>;
        tools?: any[];
        model?: string;
    }): {
        messageTokens: number;
        toolTokens: number;
        totalTokens: number;
        estimatedCost?: number;
    } {
        const messageTokens = this.countChatTokens(request.messages as any);
        const toolTokens = request.tools ? this.countToolTokens(request.tools) : 0;
        const totalTokens = messageTokens + toolTokens;

        // Pricing estimates (as of 2024)
        const pricing = {
            'v1': { input: 0.25, output: 0.75 },    // per million tokens
            'v3': { input: 0.25, output: 0.75 },
            'v3-tekken': { input: 0.15, output: 0.45 }
        };

        const modelPricing = pricing[this.modelVersion] || pricing.v3;
        const estimatedCost = (totalTokens / 1_000_000) * modelPricing.input;

        return {
            messageTokens,
            toolTokens,
            totalTokens,
            estimatedCost
        };
    }
}

// Export for use
export { MistralTokenCounter };
