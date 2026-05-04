"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MistralTokenCounter = void 0;
const llama2_tokenizer_1 = require("@lenml/llama2-tokenizer");
const llama2_tokenizer_vocab_llama2_1 = require("@lenml/llama2-tokenizer-vocab-llama2");
var MODEL_VERSIONS;
(function (MODEL_VERSIONS) {
    MODEL_VERSIONS["v1"] = "v1";
    MODEL_VERSIONS["v2"] = "v2";
    MODEL_VERSIONS["v3"] = "v3";
    MODEL_VERSIONS["v3_tekken"] = "v3-tekken";
})(MODEL_VERSIONS || (MODEL_VERSIONS = {}));
// Pricing estimates (as of 2024)
const pricing = {
    v1: { input: 0.25, output: 0.75 }, // per million tokens
    v2: { input: 0.25, output: 0.75 },
    v3: { input: 0.25, output: 0.75 },
    'v3-tekken': { input: 0.15, output: 0.45 }
};
// Initialize tokenizer for Mistral models
class MistralTokenCounter {
    constructor(model = 'mistral') {
        this.tokenizer = new llama2_tokenizer_1.Llama2Tokenizer();
        const vocab = (0, llama2_tokenizer_vocab_llama2_1.load_vocab)();
        this.tokenizer.install_vocab(vocab);
        // Determine tokenizer version based on model
        if (model.includes('nemo') || model.includes('ministral')) {
            this.modelVersion = MODEL_VERSIONS.v3_tekken;
        }
        else if (model.includes('large') || model.includes('open-mistral-7b')) {
            this.modelVersion = MODEL_VERSIONS.v3;
        }
        else if (model.includes('mixtral-8x22b')) {
            this.modelVersion = MODEL_VERSIONS.v3;
        }
        else {
            this.modelVersion = MODEL_VERSIONS.v1;
        }
    }
    /**
     * Count tokens for a simple text string
     */
    countTextTokens(text) {
        if (!text)
            return 0;
        const tokens = this.tokenizer.encode(text);
        return tokens.length;
    }
    /**
     * Count tokens for a chat conversation
     * Accounts for control tokens like [INST], [/INST]
     */
    countChatTokens(messages) {
        let totalTokens = 0;
        for (const message of messages) {
            // Add control tokens based on role
            if (message.role === 'user') {
                totalTokens += this.countTextTokens('[INST]');
                totalTokens += this.countTextTokens(message.content);
                totalTokens += this.countTextTokens('[/INST]');
            }
            else if (message.role === 'assistant') {
                totalTokens += this.countTextTokens(message.content);
            }
            else if (message.role === 'system') {
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
    countToolTokens(tools) {
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
    countRequestTokens(request) {
        const messageTokens = this.countChatTokens(request.messages);
        const toolTokens = request.tools ? this.countToolTokens(request.tools) : 0;
        const totalTokens = messageTokens + toolTokens;
        const modelPricing = pricing[this.modelVersion] || pricing.v3;
        const estimatedCost = (totalTokens / 1000000) * modelPricing.input;
        return {
            messageTokens,
            toolTokens,
            totalTokens,
            estimatedCost
        };
    }
}
exports.MistralTokenCounter = MistralTokenCounter;
//# sourceMappingURL=tokenCalculator.js.map