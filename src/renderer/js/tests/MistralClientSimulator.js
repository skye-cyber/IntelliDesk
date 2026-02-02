/**
 * Mistral Client Simulator for IntelliDesk
 * Replaces actual Mistral API calls with simulated responses
 * Supports both tool calling and regular streaming endpoints
 */

import { StateManager } from '../managers/StatesManager.js';
import toolManager from '../managers/Conversation/Mistral/ToolManager.js';

/**
 * Mistral Client Simulator
 * Mimics the actual Mistral client interface
 */
export class MistralClientSimulator {
    constructor() {
        this.toolManager = toolManager;
        this.conversationHistory = [];
        this.toolCallCounter = 0;
        this.scenarioCounter = 0;
        this.currentScenario = null;

        // Available tools
        this.availableTools = this.toolManager.getAvailableToolSchemas();

        // Simulator state
        this.testMode = true;
        this.toolCallingEnabled = true;
    }

    /**
     * Enable/disable test mode
     */
    setTestMode(enabled) {
        this.testMode = enabled;
        StateManager.set('enable_tools', enabled);
    }

    /**
     * Reset simulator state
     */
    reset() {
        this.conversationHistory = [];
        this.toolCallCounter = 0;
        this.scenarioCounter = 0;
        this.currentScenario = null;
    }

    /**
     * Reset current scenario (call this between different conversations)
     */
    resetCurrentScenario() {
        this.currentScenario = null;
        console.log('🔄 Scenario reset - ready for new conversation');
    }

    /**
     * Get conversation history
     */
    getHistory() {
        return [...this.conversationHistory];
    }

    /**
     * Generate unique tool call ID
     */
    generateToolCallId() {
        this.toolCallCounter++;
        return `sim_${Date.now()}_${this.toolCallCounter}`;
    }

    /**
     * Generate scenario ID
     */
    generateScenarioId() {
        this.scenarioCounter++;
        return `scenario_${Date.now()}_${this.scenarioCounter}`;
    }

    /**
     * Main client interface - mimics actual Mistral client
     */
    get client() {
        return {
            chat: {
                stream: this.stream.bind(this),
                complete: {
                    create: this.createCompletion.bind(this)
                }
            }
        };
    }

    /**
     * Simulate chat.stream() - for regular (non-tooling) conversations
     * Returns an async generator that yields chunks like the real API
     */
    async *stream({ model, messages }) {
        console.log('🎭 Simulating chat.stream() for model:', model);

        // Store conversation history
        this.conversationHistory = messages || [];

        // Generate a realistic AI response
        const responseText = this.generateAIResponse(messages);
        console.log(responseText)
        // Simulate streaming by yielding chunks
        const chunkSize = 50;
        for (let i = 0; i < responseText.length; i += chunkSize) {
            const chunk = responseText.substring(i, i + chunkSize);

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 50));

            // Yield chunk in Mistral format
            yield {
                data: {
                    choices: [{
                        delta: {
                            content: chunk
                        }
                    }]
                }
            };
        }

        // Final chunk
        yield {
            data: {
                choices: [{
                    finish_reason: 'stop'
                }]
            }
        };
    }

    /**
     * Simulate chat.completions.create() - for tool calling sessions
     * Returns a complete response with potential tool calls
     */
    async createCompletion({ model, messages, tools, tool_choice }) {
        console.log('🎭 Simulating chat.completions.create() for model:', model);
        console.log('   Tools available:', tools ? tools.length : 0);
        console.log('   Tool choice:', tool_choice);

        // Store conversation history
        this.conversationHistory = messages || [];

        // Track conversation state to prevent infinite loops
        if (!this.currentScenario) {
            this.currentScenario = {
                iteration: 0,
                maxIterations: 3, // Prevent infinite loops
                toolCallsMade: 0,
                hasFinalResponse: false
            };
        }

        // Determine if we should use tools
        const shouldUseTools = this.toolCallingEnabled &&
            tools && tools.length > 0 &&
            tool_choice !== 'none';

        // Intelligent decision: mix of tool calls and final responses
        if (shouldUseTools && !this.currentScenario.hasFinalResponse) {
            // Decide based on iteration count and conversation context
            if (this.shouldMakeToolCall()) {
                // Generate response with tool calls
                const response = this.generateResponseWithToolCalls(messages, tools);
                this.currentScenario.toolCallsMade++;
                this.currentScenario.iteration++;
                return response;
            } else {
                // Time to provide a final response
                const response = this.generateFinalResponseWithToolResults(messages, tools);
                this.currentScenario.hasFinalResponse = true;
                return response;
            }
        } else {
            // Generate regular response
            return this.generateRegularResponse(messages);
        }
    }

    /**
     * Determine if we should make a tool call or provide final response
     * This prevents infinite loops and creates realistic conversation flows
     */
    shouldMakeToolCall() {
        const scenario = this.currentScenario;

        // Stop after max iterations
        if (scenario.iteration >= scenario.maxIterations) {
            console.log('🛑 Max iterations reached, providing final response');
            return false;
        }

        // Analyze conversation context to decide
        const lastMessage = this.conversationHistory[this.conversationHistory.length - 1];
        const userMessage = lastMessage?.content || "";

        // If this is the first iteration, likely need tools
        if (scenario.iteration === 0) {
            return true;
        }

        // If we've already made 2 tool calls, time for final response
        if (scenario.toolCallsMade >= 2) {
            return false;
        }

        // Content-based decision making
        const lowerCaseMsg = userMessage.toLowerCase();

        // Questions that typically require multiple tool calls
        if (lowerCaseMsg.includes('analyze') ||
            lowerCaseMsg.includes('comprehensive') ||
            lowerCaseMsg.includes('detailed') ||
            lowerCaseMsg.includes('complete')) {
            return scenario.toolCallsMade < 2; // Allow up to 2 tool calls
        }

        // Simple questions might only need one tool call
        if (lowerCaseMsg.includes('quick') ||
            lowerCaseMsg.includes('simple') ||
            lowerCaseMsg.includes('just')) {
            return scenario.toolCallsMade < 1; // Only one tool call
        }

        // Default: allow one more tool call
        return scenario.toolCallsMade < 1;
    }

    /**
     * Generate a final response that incorporates tool results
     */
    generateFinalResponseWithToolResults(messages, tools) {
        const userMessage = messages[messages.length - 1].content || "";
        const lowerCaseMsg = userMessage.toLowerCase();

        // Generate appropriate final responses based on the conversation context
        let finalResponse = "I have completed the analysis and here are the results:";

        if (lowerCaseMsg.includes('file') || lowerCaseMsg.includes('document')) {
            finalResponse = "I have analyzed the files and here's what I found:";
        } else if (lowerCaseMsg.includes('system') || lowerCaseMsg.includes('performance')) {
            finalResponse = "System analysis complete. Here are the findings:";
        } else if (lowerCaseMsg.includes('calculate') || lowerCaseMsg.includes('math')) {
            finalResponse = "Calculation complete. The result is:";
        } else if (lowerCaseMsg.includes('search') || lowerCaseMsg.includes('find')) {
            finalResponse = "Search complete. Here are the results:";
        }

        // Add some realistic content based on tools used
        if (tools.some(t => t.function.name.includes('read_file'))) {
            finalResponse += "\n\nFile Analysis: Found 3 files totaling 12MB.";
        }

        if (tools.some(t => t.function.name.includes('bash'))) {
            finalResponse += "\n\nSystem Status: Disk usage at 45%, memory usage at 60%.";
        }

        if (tools.some(t => t.function.name.includes('calculate'))) {
            finalResponse += "\n\nCalculation: (100 + 200) * 1.5 = 450";
        }

        if (tools.some(t => t.function.name.includes('search'))) {
            finalResponse += "\n\nSearch Results: Found 5 relevant items.";
        }

        // Build the response
        return {
            id: this.generateScenarioId(),
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: "mistral-simulator",
            choices: [{
                index: 0,
                message: {
                    role: "assistant",
                    content: finalResponse
                },
                finish_reason: "stop"
            }],
            usage: {
                prompt_tokens: 50,
                completion_tokens: finalResponse.length,
                total_tokens: 50 + finalResponse.length
            }
        };
    }

    /**
     * Generate AI response based on conversation history
     */
    generateAIResponse(messages) {
        if (!messages || messages.length === 0) {
            return "Hello! How can I assist you today?";
        }

        // Get the last user message
        const lastMessage = messages[messages.length - 1];

        const userMessage = lastMessage.content.filter(item=> item.type==='text')[0]?.content || "";
        // Simple response generation based on user input
        const responses = {
            'hello': "Hello! How can I assist you today?",
            'help': "I can help with various tasks. What do you need assistance with?",
            'file': "I can help with file operations. Would you like me to read, write, or analyze files?",
            'system': "I can analyze your system. Would you like me to check disk usage, memory, or other system information?",
            'calculate': "I can perform calculations. What would you like me to calculate?",
            'search': "I can search for information. What are you looking for?"
        };

        // Try to match keywords
        const lowerCaseMsg = userMessage.toLowerCase().split(' ');
        for (const [keyword, response] of Object.entries(responses)) {
            if (lowerCaseMsg.includes(keyword)) {
                return response;
            }
        }

        // Default response
        return "I understand your request. Let me process it and provide the information you need.";
    }

    /**
     * Generate regular response (no tools)
     */
    generateRegularResponse(messages) {
        const responseText = this.generateAIResponse(messages);

        return {
            id: this.generateScenarioId(),
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: "mistral-simulator",
            choices: [{
                index: 0,
                message: {
                    role: "assistant",
                    content: responseText
                },
                finish_reason: "stop"
            }],
            usage: {
                prompt_tokens: 50,
                completion_tokens: responseText.length,
                total_tokens: 50 + responseText.length
            }
        };
    }

    /**
     * Generate response with tool calls
     */
    generateResponseWithToolCalls(messages, tools) {
        const messageAtIndex = messages[messages.length - 1]
        const userMessage = messageAtIndex.role === 'user' ? messageAtIndex.content || null : '';
        const textContent = userMessage ? userMessage.filter(ms => ms.type === 'text')[0] : null
        const lowerCaseMsgArray = textContent ? textContent?.text?.toLowerCase().split(' ') : [];

        // Determine which tools to use based on user request
        let toolCalls = [];
        let aiResponse = "Let me gather the information you requested.";

        // File operations
        if (lowerCaseMsgArray.includes('file') || lowerCaseMsgArray.includes('document')) {
            const fileTool = tools.find(t => t.function.name.includes('read_file'));
            if (fileTool) {
                toolCalls.push(this.createToolCall(fileTool.function.name, {
                    path: '/Documents/playground'
                }));
                aiResponse = "Let me check your documents folder...";
            }
        }

        // System operations
        if (lowerCaseMsgArray.includes('system') || lowerCaseMsgArray.includes('disk') || lowerCaseMsgArray.includes('memory')) {
            const bashTool = tools.find(t => t.function.name.includes('bash'));
            if (bashTool) {
                toolCalls.push(this.createToolCall(bashTool.function.name, {
                    command: 'df -h'
                }));

                // Add memory check if mentioned
                if (lowerCaseMsgArray.includes('memory')) {
                    toolCalls.push(this.createToolCall(bashTool.function.name, {
                        command: 'free -m'
                    }));
                }

                aiResponse = "Analyzing your system...";
            }
        }

        // Calculations
        if (lowerCaseMsgArray.includes('calculate') || lowerCaseMsgArray.includes('math') || lowerCaseMsgArray.includes('+') || lowerCaseMsgArray.includes('-')) {
            const calcTool = tools.find(t => t.function.name.includes('calculate'));
            if (calcTool) {
                // Extract simple calculation
                const calcMatch = userMessage.match(/\d+\s*[+\-*/]\s*\d+/);
                const expression = calcMatch ? calcMatch[0] : '100 + 200';

                toolCalls.push(this.createToolCall(calcTool.function.name, {
                    expression: expression,
                    precision: 2
                }));

                aiResponse = "Performing the calculation...";
            }
        }

        // Search operations
        if (lowerCaseMsgArray.includes('search') || lowerCaseMsgArray.includes('find') || lowerCaseMsgArray.includes('look for')) {
            const searchTool = tools.find(t => t.function.name.includes('search'));
            if (searchTool) {
                toolCalls.push(this.createToolCall(searchTool.function.name, {
                    query: this.extractSearchQuery(userMessage),
                    limit: 5
                }));

                aiResponse = "Searching for the information...";
            }
        }

        // If no specific tools matched, use a generic approach
        if (toolCalls.length === 0 && tools.length > 0) {
            // Use the first available tool
            const firstTool = tools[0];
            toolCalls.push(this.createToolCall(firstTool.function.name, {
                // Generic parameters based on tool type
                ...this.getDefaultParamsForTool(firstTool.function.name)
            }));
            aiResponse = "Processing your request with the appropriate tool...";
        }

        // Build the response
        const response = {
            id: this.generateScenarioId(),
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: "mistral-simulator",
            choices: [{
                index: 0,
                message: {
                    role: "assistant",
                    content: aiResponse,
                    ...(toolCalls.length > 0 && { tool_calls: toolCalls })
                },
                finish_reason: toolCalls.length > 0 ? "tool_calls" : "stop"
            }],
            usage: {
                prompt_tokens: 50,
                completion_tokens: aiResponse.length + (toolCalls.length * 20),
                total_tokens: 50 + aiResponse.length + (toolCalls.length * 20)
            }
        };

        return response;
    }

    /**
     * Create a tool call object
     */
    createToolCall(toolName, params) {
        return {
            id: this.generateToolCallId(),
            type: "function",
            function: {
                name: toolName,
                arguments: JSON.stringify(params)
            }
        };
    }

    /**
     * Get default parameters for a tool based on its name
     */
    getDefaultParamsForTool(toolName) {
        const defaults = {
            'read_file': { path: '/home/skye/Documents/playground' },
            'write_file': { path: '/home/skye/Documents/playground/output.txt', content: 'sample content' },
            'bash': { command: 'echo "Hello from simulator"' },
            'search': { query: 'sample search', limit: 5 },
            'calculate': { expression: '100 + 200', precision: 2 },
            'grep': { pattern: 'sample', path: '/home/skye/Documents/playground' },
            'database': { query: 'SELECT * FROM sample_table LIMIT 10' }
        };

        return defaults[toolName] || { input: 'default' };
    }

    /**
     * Extract search query from user message
     */
    extractSearchQuery(message) {
        const keywords = ['search', 'find', 'look for', 'query'];

        for (const keyword of keywords) {
            const index = message.toLowerCase().indexOf(keyword);
            if (index !== -1) {
                const afterKeyword = message.substring(index + keyword.length);
                // Simple extraction - get text after keyword
                return afterKeyword.trim().split('\n')[0].split('.')[0].trim();
            }
        }

        return 'sample search query';
    }

    /**
     * Simulate tool execution (for testing tool responses)
     */
    async simulateToolExecution(toolCall) {
        const toolName = toolCall.function.name;
        const params = JSON.parse(toolCall.function.arguments);

        console.log(`🔧 Simulating tool execution: ${toolName}`);

        // Simulate different tool responses
        const toolResponses = {
            'read_file': {
                success: true,
                files: ['file1.txt', 'file2.txt', 'document.pdf'],
                size: 3,
                path: params.path
            },
            'write_file': {
                success: true,
                written: true,
                path: params.path,
                bytes: params.content.length
            },
            'bash': {
                success: true,
                output: `Command executed: ${params.command}\nStandard output: Sample output\nExit code: 0`,
                exit_code: 0
            },
            'search': {
                success: true,
                results: [
                    { title: 'Result 1', url: 'https://example.com/1', summary: 'First result' },
                    { title: 'Result 2', url: 'https://example.com/2', summary: 'Second result' }
                ],
                count: 2
            },
            'calculate': {
                success: true,
                result: eval(params.expression), // Simple evaluation for demo
                calculation: `${params.expression} = ${eval(params.expression)}`
            }
        };

        // Return simulated response or execute real tool
        if (this.testMode) {
            return toolResponses[toolName] || { success: true, message: `Simulated ${toolName} execution` };
        } else {
            // In real mode, execute the actual tool
            try {
                const result = await this.toolManager.executeTool(toolName, params, {
                    toolCallId: toolCall.id,
                    context: 'simulation'
                });
                return result;
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
    }

    /**
     * Get simulator statistics
     */
    getStats() {
        return {
            totalScenarios: this.scenarioCounter,
            totalToolCalls: this.toolCallCounter,
            availableTools: this.availableTools.length,
            conversationHistoryLength: this.conversationHistory.length
        };
    }

    /**
     * Export conversation history
     */
    exportConversation() {
        return JSON.stringify(this.conversationHistory, null, 2);
    }
};

// Create singleton instance
export const mistralClientSimulator = new MistralClientSimulator();

// Default export for compatibility
export default mistralClientSimulator;
