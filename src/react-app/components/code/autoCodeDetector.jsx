
export class AutoCodeDetector {
    static LANGUAGE_PATTERNS = {
        python: {
            patterns: [
                /^(def\s+\w+\s*\(|class\s+\w+|import\s+\w+|from\s+\w+|if\s+__name__\s*==|\s+print\s*\(|\s+return\s+|#\s+|#![/a-zA-Z]+python[1-9]*?|@classmethod|@staticmethod|\([a-zA-Z]_?:\s?[a-zA-Z]\))/m,
                /(__init__\(|os|sys|subprocess|__new__|\)\s?->\s?[a-zA-Z]:|\(self\)|None)/,
                /(\:\s*$|\s+for\s+\w+\s+in\s+|\s+while\s+|\s+if\s+|\s+elif\s+|\s+else\s*:|async\s+def|await\s+|@\w+)/,
                /(f"[^"]*"|r"[^"]*"|\"\""\"[\s\S]*?\"\"\"|'''[\s\S]*?''')/
            ],
            extensions: ['py', 'pyw'],
            shebang: /^#!.*python/
        },
        javascript: {
            patterns: [
                /^(function\s*\w*|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=|import\s+|export\s+|console\.|document\.|window\.)/m,
                /(=>|\(\)\s*=>|\{\s*$|\}\s*$|;\s*$|`\$\{)/,
                /(require\(|\.then\(|\.catch\(|\.map\(|\.filter\(|async\s+function|await\s+)/,
                /(\/\/|\/\*[\s\S]*?\*\/|`[^`]*\$\{[^}]*\}[^`]*`)/,
                /(React\.|useState|useEffect|props\.|this\.|=>\s*\{|\]\.map\()/
            ],
            extensions: ['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs'],
            shebang: /^#!.*node/
        },
        java: {
            patterns: [
                /^(public|private|protected)\s+(class|interface|static|void|final)/m,
                /(System\.out\.|import\s+java\.|@Override|throws\s+\w+|extends\s+|implements\s+)/,
                /(\{\s*$|\}\s*$|;\s*$|new\s+\w+\(|this\.)/,
                /(List<|Map<|String\[\]|@Entity|@Service|@Autowired)/
            ],
            extensions: ['java']
        },
        cpp: {
            patterns: [
                /^(#include\s+<[^>]+>|using\s+namespace\s+std;|template\s*<)/m,
                /(std::|cout\s*<<|cin\s*>>|endl|->\s*[a-zA-Z_]|auto\s+)/,
                /(class\s+\w+\s*:\s*(public|private|protected)|virtual\s+|override\b)/,
                /(delete\s+|\bnew\s+|nullptr|#ifndef|#define|#endif)/
            ],
            extensions: ['cpp', 'cc', 'cxx', 'h', 'hpp', 'hxx']
        },
        csharp: {
            patterns: [
                /^(using\s+[A-Z]|namespace\s+\w+|public\s+class|private\s+void)/m,
                /(Console\.Write|List<|Dictionary<|var\s+|=>\s*\{)/,
                /(get;\s*set;|\[[A-Z][^\]]+\]|this\.|base\.)/,
                /(async\s+Task|await\s+|using\s*\()/
            ],
            extensions: ['cs']
        },
        html: {
            patterns: [
                /^<!DOCTYPE\s+html>/i,
                /(<html|<head|body|div|class|article|source|aside|header|h[1-9]|span|footer|p>|<[a-z]+\s+[^>]*>|<\/[a-z]+>)/i,
                /(&[a-z]+;|&#x[0-9a-f]+;|&amp;|&lt;|&gt;)/i,
                /(class=|<br>|src=|href=|alt=)/,
                /(<script\s+|<style\s+|<!--|-->|<!\[CDATA\[)/
            ],
            extensions: ['html', 'htm', 'xhtml']
        },
        css: {
            patterns: [
                /(\.[a-zA-Z][\w-]*\s*\{|#[a-zA-Z][\w-]*\s*\{|@media|@keyframes|@import)/,
                /(margin|padding|color|font-size|width|height|display|position)\s*:/,
                /(\{\s*$|\}\s*$|;\s*$|!important)/,
                /(margin-|padding-|border-|background-|font-|text-)/,
                /(:root|::|:hover|:focus|:active|@font-face)/
            ],
            extensions: ['css', 'scss', 'sass', 'less']
        },
        sql: {
            patterns: [
                /(SELECT\s+.+?\s+FROM|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)/i,
                /(WHERE\s+|GROUP BY|ORDER BY|INNER JOIN|LEFT JOIN|VALUES\s*\()/i,
                /(CREATE TABLE|ALTER TABLE|DROP TABLE|CREATE INDEX)/i,
                /(BEGIN TRANSACTION|COMMIT|ROLLBACK|DECLARE\s+@)/i,
                /(UNION\s+ALL|HAVING\s+|LIMIT\s+\d+|OFFSET\s+\d+)/i
            ],
            extensions: ['sql']
        },
        bash: {
            patterns: [
                /^(echo\s+|cd\s+|ls\s+|mkdir\s+|cat\s+|grep\s+|sudo\s+)/,
                /(if\s+\[|\s+then\s*$|\s+fi\s*$|\s+do\s*$|\s+done\s*$|function\s+\w+)/,
                /(\$\{|\$\(|\|\s*$|>\s*$|>>\s*$|2>\s*&1)/,
                /(echo\s+(-e)?['"a-zA-Z0-9]*?|\$[A-Z_][A-Z0-9_]*)/,
                /(\s+\|\||\s+&&|;;|esac|shift|exit\s*[0-9]*)/,
                /(&>\s*[\/a-zA-Z0-9]*|\[\[.*\]\]|-\w+\s+|--\w+)/,
                /(read\s+|while\s+read|for\s+\w+\s+in|case\s+\w+\s+in)/
            ],
            extensions: ['sh', 'bash', 'zsh'],
            shebang: /^#!.*(bash|sh|zsh)/
        },
        ruby: {
            patterns: [
                /^(def\s+\w+|class\s+\w+|module\s+\w+|require\s+|include\s+)/m,
                /(puts\s+|@\w+|:\w+|\do\s+end|\{\s*\|[^|]*\|\s*)/,
                /(attr_|end\s*$|rescue\s+|raise\s+|yield\s+)/,
                /(\.new\s*\(|\.each\s*\{|\.map\s*\{|\|\s*\w+\s*\|)/
            ],
            extensions: ['rb'],
            shebang: /^#!.*ruby/
        },
        php: {
            patterns: [
                /^(<\?php|<\?=|\$\w+\s*=|function\s+\w+\s*\()/m,
                /(echo\s+|require_once|include_once|->\w+\s*\(|::\w+)/,
                /(\$_GET|\$_POST|\$_SESSION|array\(|\[\s*\])/,
                /(public\s+function|private\s+function|protected\s+function)/
            ],
            extensions: ['php', 'phtml'],
            shebang: /^#!.*php/
        },
        go: {
            patterns: [
                /^(package\s+\w+|import\s*\(|func\s+\w+\s*\(|var\s+\w+)/m,
                /(fmt\.Print|:=|go\s+func|chan\s+[a-zA-Z]|make\(|range\s+)/,
                /(defer\s+|interface\{\}|\.\([a-zA-Z]+\)|err\s+!=)/,
                /(http\.Handle|json\.Marshal|sync\.|atomic\.)/
            ],
            extensions: ['go']
        },
        rust: {
            patterns: [
                /^(fn\s+\w+|let\s+(mut\s+)?\w+|use\s+[a-zA-Z_]+|impl\s+)/m,
                /(->\s+[a-zA-Z_]+|\!\)|\.unwrap\(|\.expect\()/,
                /(match\s+|Some\(|None|Result<|Option<)/,
                /(println!|vec!|#[derive\(|pub\s+fn|unsafe\s+])/
            ],
            extensions: ['rs']
        },
        kotlin: {
            patterns: [
                /^(fun\s+\w+|class\s+\w+|import\s+[a-zA-Z.]+|val\s+\w+|var\s+\w+)/m,
                /(println\(|->\s*[a-zA-Z]|:[\s]*[A-Z][a-zA-Z]*)/,
                /(\.let\{|\.apply\{|\.also\{|\.run\{)/,
                /(data\s+class|object\s+|companion\s+object|@\w+)/
            ],
            extensions: ['kt', 'kts']
        },
        swift: {
            patterns: [
                /^(func\s+\w+|class\s+\w+|import\s+[A-Z]|var\s+\w+|let\s+\w+)/m,
                /(print\(|->\s*[A-Z]|\.\w+\s*\{|guard\s+|defer\s+)/,
                /(if\s+let|switch\s+|case\s+|@IBOutlet|@IBAction)/,
                /(UIViewController|UITableView|\.animation\(|\.transition\()/
            ],
            extensions: ['swift']
        },
        yaml: {
            patterns: [
                /(^---$|^\.\.\.$|^[\w-]+:\s*$|^[\w-]+:\s*[^:\s]|-\s+[\w-]+:)/m,
                /(&\w+|\*\w+|<<:\s*\*|!![a-zA-Z]+|>\s*$|\|\s*$)/,
                /(apiVersion:|kind:|metadata:|spec:|replicas:|image:)/,
                /(environment:|ports:|volumeMounts:|resources:|labels:)/
            ],
            extensions: ['yml', 'yaml']
        },
        markdown: {
            patterns: [
                /(^#+\s+|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/m,
                /(\[[^\]]+\]\([^)]+\)|```[a-z]*\n[\s\S]*?\n```|^- |^\d+\. )/,
                /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]:\s*\S+|> |\|[^|]+\|)/,
                /(<!--[\s\S]*?-->|`[^`]+`|\+\+\+[^+]+\+\+\+|\=\=\=[^=]+\=\=\=)/
            ],
            extensions: ['md', 'markdown']
        },
        dockerfile: {
            patterns: [
                /^(FROM\s+|RUN\s+|COPY\s+|WORKDIR\s+|ENV\s+|EXPOSE\s+)/m,
                /(CMD\s*\[|ENTRYPOINT\s*\[|LABEL\s+|USER\s+|VOLUME\s+)/,
                /(ARG\s+|HEALTHCHECK|STOPSIGNAL|SHELL\s+|ONBUILD\s+)/
            ],
            extensions: ['Dockerfile'],
            filename: /^Dockerfile(\.\w+)?$/
        },
        json: {
            patterns: [
                /^\s*[\{\[]\s*$/m,
                /("\w+"\s*:\s*("[^"]*"|\d+|true|false|null)[,}]?)/,
                /(\[.*\]|\{.*\})/s,
                /("[\w]+":\s*\{|"[\w]+":\s*\[)/
            ],
            extensions: ['json']
        },
        xml: {
            patterns: [
                /(^<\?xml[^?>]*\?>|<!--[\s\S]*?-->|<!DOCTYPE\s+)/m,
                /(<[a-zA-Z][^>]*>|<\/[a-zA-Z][^>]*>|<[a-zA-Z][^>]*\/>)/,
                /(xmlns:|xsi:|schemaLocation=|CDATA\[)/,
                /(<![^>]*>|&\w+;)/i
            ],
            extensions: ['xml', 'xsd', 'xsl', 'xslt']
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

//module.exports = { AutoCodeDetector }
