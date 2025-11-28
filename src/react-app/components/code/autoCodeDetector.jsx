
export class AutoCodeDetector {
    static LANGUAGE_PATTERNS = {
        python: {
            patterns: [
                /^(def\s+\w+\s*\(|class\s+\w+|import\s+\w+|from\s+\w+|if\s+__name__\s*==|\s+print\s*\(|\s+return\s+|#\s+|#![/a-zA-Z]+python[1-9]*?|@classmethod|@staticmethod|\([a-zA-Z]_?:\s?[a-zA-Z]\))/m,
                /(\:\s*$|\s+for\s+\w+\s+in\s+|\s+while\s+|\s+if\s+|\s+elif\s+|\s+else\s*:)/
            ],
            extensions: ['py'],
            shebang: /^#!.*python/
        },
        javascript: {
            patterns: [
                /^(function\s*\w*|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=|import\s+|export\s+|console\.)/m,
                /(=>|\(\)\s*=>|\{\s*$|\}\s*$|;\s*$|`\$\{)/,
                /(document\.|window\.|require\(|\.then\(|\.catch\()/
            ],
            extensions: ['js', 'jsx', 'ts', 'tsx'],
            shebang: /^#!.*node/
        },
        java: {
            patterns: [
                /^(public|private|protected)\s+(class|interface|static|void)/m,
                /(System\.out\.|import\s+java\.|@Override|throws\s+\w+)/,
                /(\{\s*$|\}\s*$|;\s*$)/
            ],
            extensions: ['java']
        },
        html: {
            patterns: [
                /^<!DOCTYPE\s+html>/i,
                /(<html|<head|body|div|span|p>|<[a-z]+\s+[^>]*>|<\/[a-z]+>)/i,
                /(&[a-z]+;|&#x[0-9a-f]+;)/i
            ],
            extensions: ['html', 'htm']
        },
        css: {
            patterns: [
                /(\.[a-zA-Z][\w-]*\s*\{|#[a-zA-Z][\w-]*\s*\{|@media|@keyframes)/,
                /(margin|padding|color|font-size|width|height)\s*:/,
                /(\{\s*$|\}\s*$|;\s*$)/
            ],
            extensions: ['css']
        },
        sql: {
            patterns: [
                /(SELECT\s+.+?\s+FROM|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)/i,
                /(WHERE\s+|GROUP BY|ORDER BY|INNER JOIN|LEFT JOIN|VALUES\s*\()/i,
                /(CREATE TABLE|ALTER TABLE|DROP TABLE)/i
            ],
            extensions: ['sql']
        },
        bash: {
            patterns: [
                /^(echo\s+|cd\s+|ls\s+|mkdir\s+|cat\s+|grep\s+)/,
                /(if\s+\[|\s+then\s*$|\s+fi\s*$|\s+do\s*$|\s+done\s*$)/,
                /(\$\{|\$\(|\|\s*$|>\s*$|>>\s*$)/
            ],
            extensions: ['sh', 'bash'],
            shebang: /^#!.*(bash|sh)/
        }
    };

    static detectCodeSegments(text) {
        if (!text || text.length < 5) return [];

        const segments = [];
        const lines = text.split('\n');
        let currentSegment = null;

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

    static detectLanguageInLine(line, isFirstLine) {
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
        const langScores = {};

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

    static isContinuationLine(line, currentLanguage) {
        const trimmed = line.trim();
        if (!trimmed) return true; // Empty lines can be part of code

        const config = this.LANGUAGE_PATTERNS[currentLanguage];
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

    static isSubstantialSegment(segment) {
        const lineCount = segment.end - segment.start + 1;
        const totalChars = segment.lines.join('').length;

        // At least 2 lines or 20 characters with high confidence
        return (lineCount >= 2 || totalChars >= 20) && segment.confidence >= 0.3;
    }

    static mergeAdjacentSegments(segments) {
        if (segments.length <= 1) return segments;

        const merged = [];
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

    static autoFormatCodeBlocks(text) {
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

    static extractPlainTextForDisplay(formattedText) {
        // Remove the code block markers but keep the content
        return formattedText.replace(/```(\w+)\n([\s\S]*?)```/g, '$2');
    }
}
