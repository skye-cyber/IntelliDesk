export function normalizeCodeBlocks(content) {
    /**
     * Normalizes code blocks in markdown content.
     * - If a code block has no language specified (e.g., ```...```), it replaces it with a default language (e.g., "text").
     * - Otherwise, it leaves the language identifier as-is.
     */
    const codeBlockRegex = /```([\s\S]*?)\n([\s\S]*?)```/g;

    return content.replace(codeBlockRegex, (match, language, codeContent) => {
        // If no language is specified, replace with "plain"
        if (!language.trim()) {
            return `\`\`\`plain\n\n${codeContent}\`\`\``;
        } else {
            return `\`\`\`${language}\n${codeContent}\`\`\``;
        }
    });
}
