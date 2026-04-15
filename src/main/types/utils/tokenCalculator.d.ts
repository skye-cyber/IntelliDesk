declare class MistralTokenCounter {
    private tokenizer;
    private modelVersion;
    constructor(model?: string);
    /**
     * Count tokens for a simple text string
     */
    countTextTokens(text: string): number;
    /**
     * Count tokens for a chat conversation
     * Accounts for control tokens like [INST], [/INST]
     */
    countChatTokens(messages: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
    }>): number;
    /**
     * Count tokens for tool/function calls
     */
    countToolTokens(tools: any[]): number;
    /**
     * Get complete token count for a Mistral API request
     */
    countRequestTokens(request: {
        messages: Array<{
            role: string;
            content: string;
        }>;
        tools?: any[];
        model?: string;
    }): {
        messageTokens: number;
        toolTokens: number;
        totalTokens: number;
        estimatedCost?: number;
    };
}
export { MistralTokenCounter };
//# sourceMappingURL=tokenCalculator.d.ts.map