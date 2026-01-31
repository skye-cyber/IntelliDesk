export class ToolsIntegration {
    constructor(apiKey) {
        this.client = new Mistral({ apiKey: apiKey });
        this.toolManager = require('./ToolManager').default;
        this.availableFunctions = new Map();
        this.registerCoreFunctions();
    }

    // Register all available functions
    registerCoreFunctions() {
        // Register tools from tool manager
        this.toolManager.tools.forEach((tool, name) => {
            this.registerFunction(name, this.createToolWrapper(tool));
        });
    }

    createToolWrapper(tool) {
        return async (params) => {
            return this.toolManager.executeTool(tool.name, params);
        };
    }

    registerFunction(name, fn, schema) {
        this.availableFunctions.set(name, {
            function: fn,
            schema: schema || this.generateSchema(name, fn)
        });
    }

    generateSchema(name, fn) {
        const baseSchemas = {
            search_web: {
                type: "function",
                function: {
                    name: "search_web",
                    description: "Search the web for current information",
                    parameters: {
                        type: "object",
                        properties: {
                            query: {
                                type: "string",
                                description: "Search query"
                            },
                            max_results: {
                                type: "number",
                                description: "Maximum number of results",
                                default: 5
                            }
                        },
                        required: ["query"]
                    }
                }
            },
            run_command: {
                type: "function",
                function: {
                    name: "bash",
                    description: "Run a one-off bash command and capture its output.",
                    parameters: {
                        type: "object",
                        properties: {
                            command: {
                                type: "string"
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
            },
            get_weather: {
                type: "function",
                function: {
                    name: "get_weather",
                    description: "Get current weather information for a location",
                    parameters: {
                        type: "object",
                        properties: {
                            location: {
                                type: "string",
                                description: "City name or coordinates"
                            },
                            unit: {
                                type: "string",
                                enum: ["celsius", "fahrenheit"],
                                default: "celsius"
                            }
                        },
                        required: ["location"]
                    }
                }
            },
            calculate: {
                type: "function",
                function: {
                    name: "calculate",
                    description: "Perform mathematical calculations",
                    parameters: {
                        type: "object",
                        properties: {
                            expression: {
                                type: "string",
                                description: "Mathematical expression to evaluate"
                            },
                            precision: {
                                type: "number",
                                description: "Decimal precision",
                                default: 2
                            }
                        },
                        required: ["expression"]
                    }
                }
            },
            file_operations: {
                type: "function",
                function: {
                    name: "file_operations",
                    description: "Perform file operations (read, write, list)",
                    parameters: {
                        type: "object",
                        properties: {
                            operation: {
                                type: "string",
                                enum: ["read", "write", "list", "delete"],
                                description: "File operation to perform"
                            },
                            path: {
                                type: "string",
                                description: "File path"
                            },
                            content: {
                                type: "string",
                                description: "Content to write (for write operations)"
                            }
                        },
                        required: ["operation", "path"]
                    }
                }
            },
            grep: {
                type: "function",
                function: {
                    name: "grep",
                    description: "Recursively search files for a regex pattern using ripgrep (rg) or grep. Respects .gitignore and .codeignore files by default when using ripgrep.",
                    parameters: {
                        properties: {
                            type: "object",
                            pattern: {
                                type: "string"
                            },
                            path: {
                                default: ".",
                                type: "string"
                            },
                            max_matches: {
                                anyOf: [
                                    {
                                        type: "integer"
                                    },
                                    {
                                        type: "null"
                                    }
                                ],
                                default: null,
                                description: "Override the default maximum number of matches."
                            },
                            use_default_ignore: {
                                default: true,
                                description: "Whether to respect .gitignore and .ignore files.",
                                type: "boolean"
                            }
                        },
                        required: ["pattern"],
                    }
                }
            },
            search_replace: {
                type: "function",
                function: {
                    name: "search_replace",
                    description: "Replace sections of files using SEARCH/REPLACE blocks. Supports fuzzy matching and detailed error reporting. Format: <<<<<<< SEARCH\\n[text]\\n=======\\n[replacement]\\n>>>>>>> REPLACE",
                    parameters: {
                        properties: {
                            "file_path": {
                                type: "string"
                            },
                            content: {
                                type: "string"
                            }
                        },
                        required: [
                            "file_path",
                            "content"
                        ],
                        type: "object"
                    }
                }
            },
            todo: {
                type: "function",
                function: {
                    name: "todo",
                    description: "Manage todos. Use action='read' to view, action='write' with complete list to update.",
                    parameters: {
                        $defs: {
                            TodoItem: {
                                properties: {
                                    id: {
                                        type: "string"
                                    },
                                    content: {
                                        type: "string"
                                    },
                                    status: {
                                        $ref: "#/$defs/TodoStatus",
                                        default: "pending"
                                    },
                                    priority: {
                                        $ref: "#/$defs/TodoPriority",
                                        default: "medium"
                                    }
                                },
                                required: [
                                    "id",
                                    "content"
                                ],
                                type: "object"
                            },
                            TodoPriority: {
                                enum: [
                                    "low",
                                    "medium",
                                    "high"
                                ],
                                type: "string"
                            },
                            TodoStatus: {
                                enum: [
                                    "pending",
                                    "in_progress",
                                    "completed",
                                    "cancelled"
                                ],
                                type: "string"
                            }
                        },
                        properties: {
                            action: {
                                description: "Either 'read' or 'write'",
                                type: "string"
                            },
                            todos: {
                                anyOf: [
                                    {
                                        "items": {
                                            $ref: "#/$defs/TodoItem"
                                        },
                                        type: "array"
                                    },
                                    {
                                        type: "null"
                                    }
                                ],
                                default: null,
                                description: "Complete list of todos when writing."
                            }
                        },
                        required: [
                            "action"
                        ],
                        type: "object"
                    }
                }
            },
            write_file: {
                type: "function",
                function: {
                    name: "write_file",
                    description: "Create or overwrite a UTF-8 file. Fails if file exists unless 'overwrite=True'.",
                    parameters: {
                        properties: {
                            "path": {
                                type: "string"
                            },
                            content: {
                                type: "string"
                            },
                            "overwrite": {
                                default: false,
                                description: "Must be set to true to overwrite an existing file.",
                                type: "boolean"
                            }
                        },
                        required: [
                            "path",
                            "content"
                        ],
                        type: "object"
                    }
                }
            },
            read_file: {
                type: "function",
                function: {
                    name: "read_file",
                    description: "Read a UTF-8 file, returning content from a specific line range. Reading is capped by a byte limit for safety.",
                    parameters: {
                        properties: {
                            type: "object",
                            "path": { type: "string" },
                            "offset": {
                                default: 0,
                                description: "Line number to start reading from (0-indexed, inclusive).",
                                type: "integer"
                            },
                            "limit": {
                                anyOf: [
                                    {
                                        type: "integer"
                                    },
                                    {
                                        type: "null"
                                    }
                                ],
                                default: null,
                                description: "Maximum number of lines to read."
                            }
                        },
                        required: [
                            "path"
                        ]
                    }
                }
            }
        };

        return baseSchemas[name] || {
            type: "function",
            function: {
                name: name,
                description: `Execute ${name} function`,
                parameters: { type: "object", properties: {} }
            }
        };
    }

    // Tool functions are now handled by individual tool classes
    // through the ToolManager

    getAvailableToolSchemas() {
        return this.toolManager.getAvailableToolSchemas();
    }

    getToolStats() {
        return this.toolManager.getToolStats();
    }

    async executeToolSequence(sequence) {
        return this.toolManager.executeToolSequence(sequence);
    }
}
