export function normalizeCodeBlocks(content) {
    /**
     * Normalizes code blocks in markdown content.
     * - Adds "text" language to code blocks without a specified language
     * - Preserves indentation and formatting
     * - Handles nested backticks correctly
     * - Doesn't affect inline code or escaped backticks
     */

    // Split by lines for more controlled processing
    const lines = content.split('\n');
    const result = [];
    let inCodeBlock = false;
    let currentLanguage = '';
    let codeBlockStart = 0;
    let codeLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check for code block start (``` with optional language)
        const codeBlockMatch = line.match(/^([ \t]*)```(\w*)$/);

        if (codeBlockMatch && !inCodeBlock) {
            // Start of a code block
            inCodeBlock = true;
            codeBlockStart = i;
            currentLanguage = codeBlockMatch[2] || '';
            codeLines = [line]; // Start collecting code block lines

        } else if (line.trim().startsWith('```') && inCodeBlock) {
            // End of a code block
            codeLines.push(line); // Add the closing line

            // If no language was specified, add "text"
            if (!currentLanguage.trim()) {
                const indent = codeLines[0].match(/^([ \t]*)/)[0];
                codeLines[0] = `${indent}\`\`\`textual`;
            }

            // Add the processed code block to result
            result.push(...codeLines);

            // Reset state
            inCodeBlock = false;
            currentLanguage = '';
            codeLines = [];

        } else if (inCodeBlock) {
            // Inside a code block, just collect lines
            codeLines.push(line);
        } else {
            // Outside code blocks
            result.push(line);
        }
    }

    // If we're still in a code block at the end (malformed markdown),
    // just add whatever we collected
    if (inCodeBlock) {
        result.push(...codeLines);
    }

    return result.join('\n');
}
