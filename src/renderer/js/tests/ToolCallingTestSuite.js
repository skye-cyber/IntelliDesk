/**
 * Advanced Tool Calling Test Suite for Mistral Vibe
 * Simulates AI interactions without requiring actual API calls
 * Tests complex workflows: sequential tools, iterative usage, interleaved responses
 */

import toolManager from '../managers/Conversation/Mistral/ToolManager.js';
import toolsIntegration from '../managers/Conversation/Mistral/ToolIntegration.js';

/**
 * Mistral Vibe Response Simulator
 * Mimics the exact response structure from session logs
 */
class MistralVibeSimulator {
    constructor() {
        this.toolManager = toolManager;
        this.toolIntegration = toolsIntegration;
        this.conversationHistory = [];
        this.toolCallCounter = 0;
    }

    /**
     * Generate unique tool call ID (mimics Mistral Vibe format)
     */
    generateToolCallId() {
        this.toolCallCounter++;
        return `test_${Date.now()}_${this.toolCallCounter}`;
    }

    /**
     * Create user message (mimics session log format)
     */
    addUserMessage(content) {
        const message = {
            role: "user",
            content: content
        };
        this.conversationHistory.push(message);
        return message;
    }

    /**
     * Create assistant message with tool calls (mimics session log format)
     */
    createAssistantMessageWithTools(content, toolCalls) {
        const message = {
            role: "assistant",
            content: content || "",
            tool_calls: toolCalls.map((toolCall, index) => ({
                id: this.generateToolCallId(),
                index: index,
                function: {
                    name: toolCall.name,
                    arguments: JSON.stringify(toolCall.arguments)
                },
                type: "function"
            }))
        };
        this.conversationHistory.push(message);
        return message;
    }

    /**
     * Create tool response (mimics session log format)
     */
    async createToolResponse(toolCallId, toolName, toolResult) {
        const message = {
            role: "tool",
            content: this.formatToolResult(toolResult),
            name: toolName,
            tool_call_id: toolCallId
        };
        this.conversationHistory.push(message);
        return message;
    }

    /**
     * Format tool result to match Mistral Vibe format
     */
    formatToolResult(result) {
        if (typeof result === 'object') {
            return Object.entries(result).map(([key, value]) => 
                `${key}: ${JSON.stringify(value)}`
            ).join('\n');
        }
        return String(result);
    }

    /**
     * Create final assistant response
     */
    createFinalResponse(content) {
        const message = {
            role: "assistant",
            content: content
        };
        this.conversationHistory.push(message);
        return message;
    }

    /**
     * Reset conversation
     */
    reset() {
        this.conversationHistory = [];
        this.toolCallCounter = 0;
        this.toolIntegration.clearHistory();
    }

    /**
     * Get full conversation history
     */
    getHistory() {
        return [...this.conversationHistory];
    }
}

/**
 * Tool Calling Test Suite
 */
class ToolCallingTestSuite {
    constructor() {
        this.simulator = new MistralVibeSimulator();
        this.testResults = [];
    }

    /**
     * Test 1: Single Tool Call
     */
    async testSingleToolCall() {
        const testName = "Single Tool Call";
        console.log(`\n🧪 Running: ${testName}`);

        try {
            // Setup
            this.simulator.reset();
            this.simulator.addUserMessage("What's the weather in Paris?");

            // Simulate AI wanting to use get_weather tool
            const toolCalls = [{
                name: "get_weather",
                arguments: { location: "Paris", unit: "celsius" }
            }];

            const assistantMsg = this.simulator.createAssistantMessageWithTools(
                "Let me check the weather for you.",
                toolCalls
            );

            // Execute the tool call
            const toolCallId = assistantMsg.tool_calls[0].id;
            const toolResult = await this.simulator.toolManager.executeTool(
                "get_weather",
                toolCalls[0].arguments
            );

            // Add tool response
            this.simulator.createToolResponse(toolCallId, "get_weather", toolResult);

            // Final response
            this.simulator.createFinalResponse(
                `The current weather in Paris is ${toolResult.current_weather.temperature}°C with ${toolResult.current_weather.weather_description}.`
            );

            // Verify
            const history = this.simulator.getHistory();
            const hasToolCall = history.some(msg => msg.role === "assistant" && msg.tool_calls);
            const hasToolResponse = history.some(msg => msg.role === "tool");
            const hasFinalResponse = history.some(msg => msg.role === "assistant" && !msg.tool_calls);

            if (hasToolCall && hasToolResponse && hasFinalResponse) {
                this.testResults.push({ name: testName, status: "✅ PASS", details: "Single tool call workflow completed successfully" });
                console.log(`✅ ${testName}: PASS`);
                return true;
            } else {
                throw new Error("Conversation flow incomplete");
            }

        } catch (error) {
            this.testResults.push({ name: testName, status: "❌ FAIL", details: error.message });
            console.error(`❌ ${testName}: FAIL - ${error.message}`);
            return false;
        }
    }

    /**
     * Test 2: Multiple Sequential Tool Calls
     */
    async testMultipleSequentialTools() {
        const testName = "Multiple Sequential Tool Calls";
        console.log(`\n🧪 Running: ${testName}`);

        try {
            this.simulator.reset();
            this.simulator.addUserMessage("Compare weather in Paris and London");

            // First iteration: Get Paris weather
            let toolCalls = [{
                name: "get_weather",
                arguments: { location: "Paris", unit: "celsius" }
            }];

            let assistantMsg = this.simulator.createAssistantMessageWithTools(
                "Let me get weather for both cities.",
                toolCalls
            );

            let toolCallId = assistantMsg.tool_calls[0].id;
            let toolResult = await this.simulator.toolManager.executeTool(
                "get_weather",
                toolCalls[0].arguments
            );

            this.simulator.createToolResponse(toolCallId, "get_weather", toolResult);

            // Second iteration: Get London weather
            toolCalls = [{
                name: "get_weather",
                arguments: { location: "London", unit: "celsius" }
            }];

            assistantMsg = this.simulator.createAssistantMessageWithTools(
                "Now getting London weather.",
                toolCalls
            );

            toolCallId = assistantMsg.tool_calls[0].id;
            const londonResult = await this.simulator.toolManager.executeTool(
                "get_weather",
                toolCalls[0].arguments
            );

            this.simulator.createToolResponse(toolCallId, "get_weather", londonResult);

            // Final comparison
            this.simulator.createFinalResponse(
                `Weather comparison: Paris ${toolResult.current_weather.temperature}°C vs London ${londonResult.current_weather.temperature}°C`
            );

            // Verify multiple tool calls
            const history = this.simulator.getHistory();
            const toolResponses = history.filter(msg => msg.role === "tool");

            if (toolResponses.length === 2) {
                this.testResults.push({ 
                    name: testName, 
                    status: "✅ PASS", 
                    details: "Multiple sequential tool calls completed"
                });
                console.log(`✅ ${testName}: PASS - ${toolResponses.length} tool calls processed`);
                return true;
            } else {
                throw new Error(`Expected 2 tool responses, got ${toolResponses.length}`);
            }

        } catch (error) {
            this.testResults.push({ name: testName, status: "❌ FAIL", details: error.message });
            console.error(`❌ ${testName}: FAIL - ${error.message}`);
            return false;
        }
    }

    /**
     * Test 3: Iterative Tool Usage (Same Tool Multiple Times)
     */
    async testIterativeToolUsage() {
        const testName = "Iterative Tool Usage";
        console.log(`\n🧪 Running: ${testName}`);

        try {
            this.simulator.reset();
            this.simulator.addUserMessage("Find weather for 3 major cities");

            const cities = ["Paris", "London", "Berlin"];
            const results = [];

            // Call same tool multiple times
            for (const city of cities) {
                const toolCalls = [{
                    name: "get_weather",
                    arguments: { location: city, unit: "celsius" }
                }];

                const assistantMsg = this.simulator.createAssistantMessageWithTools(
                    `Getting weather for ${city}...`,
                    toolCalls
                );

                const toolCallId = assistantMsg.tool_calls[0].id;
                const toolResult = await this.simulator.toolManager.executeTool(
                    "get_weather",
                    toolCalls[0].arguments
                );

                this.simulator.createToolResponse(toolCallId, "get_weather", toolResult);
                results.push(toolResult);
            }

            // Final summary
            const summary = results.map((result, index) => 
                `${cities[index]}: ${result.current_weather.temperature}°C`
            ).join(', ');

            this.simulator.createFinalResponse(`Weather summary: ${summary}`);

            // Verify iterative usage
            const history = this.simulator.getHistory();
            const weatherTools = history.filter(msg => msg.role === "tool" && msg.name === "get_weather");

            if (weatherTools.length === 3) {
                this.testResults.push({ 
                    name: testName, 
                    status: "✅ PASS", 
                    details: "Iterative tool usage (3 calls) completed"
                });
                console.log(`✅ ${testName}: PASS - Same tool called ${weatherTools.length} times`);
                return true;
            } else {
                throw new Error(`Expected 3 iterative calls, got ${weatherTools.length}`);
            }

        } catch (error) {
            this.testResults.push({ name: testName, status: "❌ FAIL", details: error.message });
            console.error(`❌ ${testName}: FAIL - ${error.message}`);
            return false;
        }
    }

    /**
     * Test 4: Mixed Tool Types
     */
    async testMixedToolTypes() {
        const testName = "Mixed Tool Types";
        console.log(`\n🧪 Running: ${testName}`);

        try {
            this.simulator.reset();
            this.simulator.addUserMessage("Research AI and save findings");

            // First: Search web
            let toolCalls = [{
                name: "search_web",
                arguments: { query: "AI advancements 2024", max_results: 3 }
            }];

            let assistantMsg = this.simulator.createAssistantMessageWithTools(
                "Searching for recent AI advancements.",
                toolCalls
            );

            let toolCallId = assistantMsg.tool_calls[0].id;
            let toolResult = await this.simulator.toolManager.executeTool(
                "search_web",
                toolCalls[0].arguments
            );

            this.simulator.createToolResponse(toolCallId, "search_web", toolResult);

            // Second: Write file
            toolCalls = [{
                name: "write_file",
                arguments: {
                    path: "ai_research.txt",
                    content: `AI Research Results: ${JSON.stringify(toolResult.results)}`,
                    overwrite: true
                }
            }];

            assistantMsg = this.simulator.createAssistantMessageWithTools(
                "Saving research results to file.",
                toolCalls
            );

            toolCallId = assistantMsg.tool_calls[0].id;
            const fileResult = await this.simulator.toolManager.executeTool(
                "write_file",
                toolCalls[0].arguments
            );

            this.simulator.createToolResponse(toolCallId, "write_file", fileResult);

            // Final response
            this.simulator.createFinalResponse(
                `Research complete! Found ${toolResult.results.length} articles and saved to ${fileResult.path}`
            );

            // Verify mixed tools
            const history = this.simulator.getHistory();
            const searchTools = history.filter(msg => msg.name === "search_web");
            const writeTools = history.filter(msg => msg.name === "write_file");

            if (searchTools.length === 1 && writeTools.length === 1) {
                this.testResults.push({ 
                    name: testName, 
                    status: "✅ PASS", 
                    details: "Mixed tool types (search + write) completed"
                });
                console.log(`✅ ${testName}: PASS - Multiple tool types used`);
                return true;
            } else {
                throw new Error("Mixed tool usage failed");
            }

        } catch (error) {
            this.testResults.push({ name: testName, status: "❌ FAIL", details: error.message });
            console.error(`❌ ${testName}: FAIL - ${error.message}`);
            return false;
        }
    }

    /**
     * Test 5: Error Handling
     */
    async testErrorHandling() {
        const testName = "Error Handling";
        console.log(`\n🧪 Running: ${testName}`);

        try {
            this.simulator.reset();
            this.simulator.addUserMessage("Test error handling");

            // Try to use non-existent tool
            const toolCalls = [{
                name: "non_existent_tool",
                arguments: {}
            }];

            const assistantMsg = this.simulator.createAssistantMessageWithTools(
                "Attempting to use invalid tool.",
                toolCalls
            );

            const toolCallId = assistantMsg.tool_calls[0].id;

            try {
                // This should fail
                await this.simulator.toolManager.executeTool(
                    "non_existent_tool",
                    toolCalls[0].arguments
                );
                throw new Error("Expected tool to fail but it succeeded");
            } catch (toolError) {
                // Expected error - create error response
                this.simulator.createToolResponse(toolCallId, "non_existent_tool", {
                    error: toolError.message
                });

                // Final response with error info
                this.simulator.createFinalResponse(
                    `Sorry, I encountered an error: ${toolError.message}`
                );

                this.testResults.push({ 
                    name: testName, 
                    status: "✅ PASS", 
                    details: "Error handling works correctly"
                });
                console.log(`✅ ${testName}: PASS - Errors handled gracefully`);
                return true;
            }

        } catch (error) {
            this.testResults.push({ name: testName, status: "❌ FAIL", details: error.message });
            console.error(`❌ ${testName}: FAIL - ${error.message}`);
            return false;
        }
    }

    /**
     * Run all tests and generate report
     */
    async runAllTests() {
        console.log("🚀 Starting Mistral Vibe Tool Calling Test Suite");
        console.log("==============================================");

        const tests = [
            this.testSingleToolCall,
            this.testMultipleSequentialTools,
            this.testIterativeToolUsage,
            this.testMixedToolTypes,
            this.testErrorHandling
        ];

        const results = [];
        for (const test of tests) {
            const result = await test.call(this);
            results.push(result);
        }

        // Generate report
        console.log("\n" + "=".repeat(50));
        console.log("📊 TEST REPORT");
        console.log("=".repeat(50));

        const passed = this.testResults.filter(r => r.status === "✅ PASS").length;
        const failed = this.testResults.filter(r => r.status === "❌ FAIL").length;

        this.testResults.forEach(result => {
            console.log(`${result.status} ${result.name}`);
            if (result.details) {
                console.log(`   ${result.details}`);
            }
        });

        console.log("\n" + "=".repeat(50));
        console.log(`🎯 SUMMARY: ${passed} passed, ${failed} failed`);
        console.log(`📈 SUCCESS RATE: ${Math.round((passed / this.testResults.length) * 100)}%`);
        console.log("=".repeat(50));

        return { passed, failed, total: this.testResults.length };
    }

    /**
     * Export conversation history for debugging
     */
    exportConversationHistory() {
        return JSON.stringify(this.simulator.getHistory(), null, 2);
    }
}

const testSuite = new ToolCallingTestSuite()

// Export for use in other test files
export { MistralVibeSimulator, ToolCallingTestSuite, testSuite };

// Run tests if this file is executed directly
if (typeof window !== 'undefined' && window.runToolTests) {
    const testSuite = new ToolCallingTestSuite();
    testSuite.runAllTests().then(results => {
        console.log('Tests completed:', results);
    });
}
