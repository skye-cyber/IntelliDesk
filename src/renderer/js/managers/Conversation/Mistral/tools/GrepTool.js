/**
 * Grep Tool - Search files for patterns
 */
import { ToolBase } from '../ToolBase';

const cmd = window.desk.cmd

export class GrepTool extends ToolBase {
    constructor() {
        super('grep', 'Recursively search files for a regex pattern using ripgrep (rg) or grep.');
    }

    defineSchema() {
        return {
            type: "function",
            function: {
                name: "grep",
                description: "Recursively search files for a regex pattern using ripgrep (rg) or grep. Respects .gitignore and .codeignore files by default when using ripgrep.",
                parameters: {
                    type: "object",
                    properties: {
                        pattern: {
                            type: "string",
                            description: "The regex pattern to search for"
                        },
                        path: {
                            type: "string",
                            default: ".",
                            description: "The path to search in"
                        },
                        max_matches: {
                            type: "integer",
                            default: null,
                            description: "Override the default maximum number of matches."
                        },
                        use_default_ignore: {
                            type: "boolean",
                            default: true,
                            description: "Whether to respect .gitignore and .ignore files."
                        }
                    },
                    required: ["pattern"]
                }
            }
        };
    }

    async _execute({ pattern, path = ".", max_matches = null, use_default_ignore = true }, context) {
        // Build grep command
        const maxMatches = max_matches !== null ? max_matches : this.config.default_max_matches || 100;
        const ignoreFlag = use_default_ignore ? '--hidden --glob "!.git"' : '';

        const command = `grep -r --color=never -n "${pattern}" ${path} ${ignoreFlag} | head -n ${maxMatches}`;

        try {
            const result = await cmd.execute(command, {
                timeout: (this.config.default_timeout || 60) * 1000,
                maxBuffer: this.config.max_output_bytes || 64000
            });

            return {
                pattern: pattern,
                path: path,
                matches: result.stdout,
                matchCount: result.stdout.split('\n').filter(line => line.trim()).length,
                maxMatches: maxMatches
            };
        } catch (error) {
            // If grep fails, try with rg (ripgrep) if available
            try {
                const rgCommand = `rg --color=never --line-number "${pattern}" ${path} ${ignoreFlag} | head -n ${maxMatches}`;
                const result = await cmd.execute(rgCommand, {
                    timeout: (this.config.default_timeout || 60) * 1000,
                    maxBuffer: this.config.max_output_bytes || 64000
                });

                return {
                    pattern: pattern,
                    path: path,
                    matches: result.stdout,
                    matchCount: result.stdout.split('\n').filter(line => line.trim()).length,
                    maxMatches: maxMatches,
                    toolUsed: 'ripgrep'
                };
            } catch (rgError) {
                throw new Error(`Both grep and rg failed: ${rgError.message}`);
            }
        }
    }

    formatResult(result) {
        return {
            success: true,
            tool: this.name,
            pattern: result.pattern,
            path: result.path,
            matches: result.matches,
            matchCount: result.matchCount,
            maxMatches: result.maxMatches,
            toolUsed: result.toolUsed || 'grep'
        };
    }
}
