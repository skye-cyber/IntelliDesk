import { LANGUAGE_PATTERNS, Languages } from "./utils/pattern";

interface CodeSegment{
    start: number
    end: number
    language: string
    lines: string[]
    confidence: number
}

type LanguageScores = Record<string, number>


export class CodeDetector {
    static LANGUAGE_PATTERNS: import("./utils/pattern").LanguagePattern = LANGUAGE_PATTERNS

    static detectCodeSegments(text: string) {
        if (!text || text.length < 5) return [];

        const segments: CodeSegment[] = [];
        const lines = text.split('\n');
        let currentSegment:CodeSegment|null = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const detectedLang = this.detectLanguageInLine(line, i === 0);

            if (detectedLang && !currentSegment) {
                // Start a new code segment
                currentSegment = {
                    start: i,
                    end: i,
                    language: detectedLang,
                    lines: [line],
                    confidence: 1
                };
            } else if (currentSegment && this.isContinuationLine(line, currentSegment.language)) {
                // Continue current segment
                currentSegment.end = i;
                currentSegment.lines.push(line);
                currentSegment.confidence = Math.min(currentSegment.confidence + 0.1, 1);
            } else if (currentSegment) {
                // End current segment if it's substantial enough
                if (this.isSubstantialSegment(currentSegment)) {
                    segments.push(currentSegment);
                }
                currentSegment = null;

                // Check if this line starts a new segment
                const newLang = this.detectLanguageInLine(line, false);
                if (newLang) {
                    currentSegment = {
                        start: i,
                        end: i,
                        language: newLang,
                        lines: [line],
                        confidence: 1
                    };
                }
            }
        }

        // Don't forget the last segment
        if (currentSegment && this.isSubstantialSegment(currentSegment)) {
            segments.push(currentSegment);
        }

        return this.mergeAdjacentSegments(segments);
    }

    static detectLanguageInLine(line: string, isFirstLine: boolean) {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Check for shebang in first line
        if (isFirstLine) {
            for (const [lang, config] of Object.entries(this.LANGUAGE_PATTERNS)) {
                if (config.shebang && config.shebang.test(trimmed)) {
                    return lang;
                }
            }
        }

        // Check language patterns
        const langScores: LanguageScores = {};

        for (const [lang, config] of Object.entries(this.LANGUAGE_PATTERNS)) {
            let score = 0;

            for (const pattern of config.patterns) {
                if (pattern.test(trimmed)) {
                    score += 1;
                    // Bonus for matches at start of line
                    if (pattern.test(line) && !pattern.test(trimmed)) {
                        score += 0.5;
                    }
                }
            }

            if (score > 0) {
                langScores[lang] = score;
            }
        }

        // Return the highest scoring language
        const entries = Object.entries(langScores);
        if (entries.length === 0) return null;

        entries.sort((a, b) => b[1] - a[1]);
        return entries[0][0];
    }

    static isContinuationLine(line: string, currentLanguage: string) {
        const trimmed = line.trim();
        if (!trimmed) return true; // Empty lines can be part of code

        const config = this.LANGUAGE_PATTERNS[currentLanguage as Languages];
        if (!config) return false;

        // Check if line continues the code pattern
        for (const pattern of config.patterns) {
            if (pattern.test(trimmed) || pattern.test(line)) {
                return true;
            }
        }

        // For languages with braces/brackets, check for structural continuity
        if (['javascript', 'java', 'css'].includes(currentLanguage)) {
            if (/{|}|;|\(|\)/.test(trimmed)) {
                return true;
            }
        }

        // If line starts with common code continuations (indentation, operators)
        if (/^\s+(if|for|while|def|class|function|\w+\s*=|\.)/.test(line)) {
            return true;
        }

        return false;
    }

    static isSubstantialSegment(segment: CodeSegment) {
        const lineCount = segment.end - segment.start + 1;
        const totalChars = segment.lines.join('').length;

        // At least 2 lines or 20 characters with high confidence
        return (lineCount >= 2 || totalChars >= 20) && segment.confidence >= 0.3;
    }

    static mergeAdjacentSegments(segments: CodeSegment[]) {
        if (segments.length <= 1) return segments;

        const merged: CodeSegment[] = [];
        let current = segments[0];

        for (let i = 1; i < segments.length; i++) {
            const next = segments[i];

            // Merge if segments are close and same language
            if (next.start - current.end <= 3 && next.language === current.language) {
                current.end = next.end;
                current.lines = current.lines.concat(next.lines);
                current.confidence = Math.max(current.confidence, next.confidence);
            } else {
                merged.push(current);
                current = next;
            }
        }

        merged.push(current);
        return merged;
    }

    static autoFormatCodeBlocks(text: string) {
        const segments = this.detectCodeSegments(text);
        if (segments.length === 0) return text;

        let formattedText = '';
        let lastIndex = 0;

        for (const segment of segments) {
            // Add text before segment
            const beforeLines = text.split('\n').slice(lastIndex, segment.start);
            if (beforeLines.length > 0) {
                formattedText += beforeLines.join('\n') + '\n';
            }

            // Add formatted code block
            const codeContent = segment.lines.join('\n');
            formattedText += `\`\`\`${segment.language}\n${codeContent}\n\`\`\`\n`;

            lastIndex = segment.end + 1;
        }

        // Add remaining text after last segment
        const afterLines = text.split('\n').slice(lastIndex);
        if (afterLines.length > 0) {
            formattedText += afterLines.join('\n');
        }

        return formattedText.trim();
    }

    static extractPlainTextForDisplay(formattedText: string) {
        // Remove the code block markers but keep the content
        return formattedText.replace(/```(\w+)\n([\s\S]*?)```/g, '$2');
    }
}
