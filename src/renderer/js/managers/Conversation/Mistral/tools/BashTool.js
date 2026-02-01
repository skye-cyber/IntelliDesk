/**
 * Bash Tool - Execute bash commands with safety constraints
 */
import { ToolBase } from '../ToolBase';

const execAsync = window.desk.cmd.execute;

export class BashTool extends ToolBase {
    constructor() {
        super('bash', 'Run a one-off bash command and capture its output.');
    }

    defineSchema() {
        return {
            type: "function",
            function: {
                name: "bash",
                description: "Run a one-off bash command and capture its output.",
                parameters: {
                    type: "object",
                    properties: {
                        command: {
                            type: "string",
                            description: "The bash command to execute"
                        },
                        timeout: {
                            anyOf: [
                                {
                                    type: "integer"
                                },
                                {
                                    type: "null"
                                }
                            ],
                            default: null,
                            description: "Override the default command timeout."
                        }
                    },
                    required: ["command"]
                }
            }
        };
    }

    async _execute({ command, timeout = null }, context) {
        // Apply timeout from config if not specified
        const effectiveTimeout = timeout !== null ? timeout : this.config.default_timeout || 30;

        // Validate command against allowlist/denylist
        this.validateCommand(command);

        // Execute command
        const result = await execAsync(command, {
            timeout: effectiveTimeout * 1000, // Convert to milliseconds
            maxBuffer: this.config.max_output_bytes || 16000,
            shell: '/bin/bash'
        });

        return {
            command: command,
            stdout: result.stdout,
            stderr: result.stderr,
            exitCode: result.code,
            timestamp: new Date().toISOString()
        };
    }


    validateCommand(command) {
        const allowlist = this.config.allowlist || [];
        const denylist = this.config.denylist || [];
        const denylistStandalone = this.config.denylist_standalone || [];

        // Security: Validate command doesn't contain dangerous patterns
        const dangerousPatterns = [
            /rm\s+-rf/,
            /:\(\)\{:\|:\}\&:/,  // Fork bomb
            /mkfs/,
            /dd\s+if=.*\s+of=.*/,
            /chmod\s+777/,
            />\s*\/dev\/sda/,
            /mv\s+.*\s+\/dev\/null/
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(command.toLowerCase())) {
                throw new Error('Command contains potentially dangerous patterns');
            }
        }

        // Check denylist (exact matches)
        for (const denied of denylist) {
            if (command.includes(denied)) {
                throw new Error(`Command contains denied pattern: ${denied}`);
            }
        }

        // Check denylist standalone (commands that cannot be used standalone)
        const firstWord = command.trim().split(' ')[0];
        if (denylistStandalone.includes(firstWord)) {
            throw new Error(`Command not allowed as standalone: ${firstWord}`);
        }

        // If allowlist is defined, command must match one of the allowed patterns
        if (allowlist.length > 0) {
            const matchesAllowlist = allowlist.some(pattern => {
                if (pattern.endsWith('*')) {
                    const prefix = pattern.slice(0, -1);
                    return command.startsWith(prefix);
                }
                return command === pattern;
            });

            if (!matchesAllowlist) {
                throw new Error(`Command not in allowlist`);
            }
        }

        return true;
    }

    formatResult(result) {
        return {
            success: true,
            tool: this.name,
            command: result.command,
            output: result.stdout,
            error: result.stderr || null,
            exitCode: result.exitCode,
            timestamp: result.timestamp
        };
    }
}
