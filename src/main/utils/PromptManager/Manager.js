"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemPrompt = void 0;
class SystemPrompt {
    /**
     * Generate a system prompt from configuration.
     */
    static generate(config) {
        const sections = [];
        // --- Core behaviour (always included) ---
        sections.push(this.coreProtocol(config.verbosity));
        if (config.userProfile) {
            sections.push(this.userPersonalization(config.userProfile));
        }
        // --- Capability‑specific blocks ---
        if (config.capabilities.reasoning) {
            sections.push(this.reasoningBlock());
        }
        if (config.capabilities.multimodal) {
            sections.push(this.multimodalBlock());
        }
        if (config.capabilities.tools) {
            sections.push(this.toolsBlock());
        }
        // --- Output formatting (always included) ---
        sections.push(this.outputFormatting());
        return sections.join("\n\n---\n\n").trim();
    }
    static coreProtocol(verbosity = "normal") {
        return `# Response Protocol
        - Answer only the immediate request. Do not repeat previous content unless asked.
        - Use Markdown for readability.
        - Verbosity: ${verbosity}.
        - minimal: code/output only.
        - normal: concise explanations when useful.
        - high: include rationale and context.`;
    }
    static userPersonalization(profile) {
        return `# User Context
        Use the following preferences naturally:
        ${profile}`;
    }
    static reasoningBlock() {
        return `# Reasoning
        Before final answer, structure your thinking in <thinking> tags.
        Keep reasoning concise and directly relevant.`;
    }
    static multimodalBlock() {
        return `# Multimodal Input
        - Images/audio may be provided. Analyze them directly.
        - For OCR, extract text verbatim.
        - Describe visual content only when relevant to the request.`;
    }
    static toolsBlock() {
        return `# Tool Use
        **Rules:**
        - Use tools when they help fulfill the request.
        - Provide EXACT parameter values from user input; do not invent.
        - If a required parameter is missing, ask the user for it.
        - Prefer dedicated tools over generic shell commands for file/search/edit operations.
        - For multi‑step tasks, break down and execute sequentially.`;
    }
    static outputFormatting() {
        return `# Output Formatting
        - Code: use triple backticks with language identifier.
        - Inline math: $E=mc^2$ (no spaces inside delimiters).
        - Display math: $$\\int_0^1 x^2 dx$$.
        - Diagrams (DOT): \`\`\`dot … \`\`\` with \`rankdir=TB;\`.
        - Charts (JSON): \`\`\`json-chart … \`\`\`.
        - Never fence math expressions or non‑code content.`;
    }
}
exports.SystemPrompt = SystemPrompt;
//# sourceMappingURL=Manager.js.map