function generateSchema(name, fn) {
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
