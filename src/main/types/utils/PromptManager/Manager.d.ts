export interface PromptConfig {
    verbosity?: "minimal" | "normal" | "high";
    userProfile?: string;
    capabilities: {
        reasoning?: boolean;
        multimodal?: boolean;
        tools?: boolean;
        ocr?: boolean;
    };
}
export declare class SystemPrompt {
    /**
     * Generate a system prompt from configuration.
     */
    static generate(config: PromptConfig): string;
    private static coreProtocol;
    private static userPersonalization;
    private static reasoningBlock;
    private static multimodalBlock;
    private static toolsBlock;
    private static outputFormatting;
}
//# sourceMappingURL=Manager.d.ts.map