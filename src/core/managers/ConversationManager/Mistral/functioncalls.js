class MistralFunctionHandler {
    constructor(client) {
        this.client = client;
        this.functions = new Map();
    }

    async processMessage(userMessage, conversationHistory = []) {
        const messages = [
            ...conversationHistory,
            { role: "user", content: userMessage }
        ];

        // Step 1: Detect if functions are needed
        const response = await this.client.chat.complete({
            model: "mistral-large-latest",
            messages: messages,
            tools: this.getToolSchemas(),
            temperature: 0.1, // Lower temp for more consistent function calls
            stream: false
        });

        const assistantMessage = response.choices[0].message;

        // Step 2: Handle function calls
        if (assistantMessage.tool_calls?.length > 0) {
            const toolResults = [];

            for (const toolCall of assistantMessage.tool_calls) {
                const result = await this.executeFunction(
                    toolCall.function.name,
                    JSON.parse(toolCall.function.arguments)
                );

                toolResults.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result)
                });
            }

            // Step 3: Get final streaming response
            const finalMessages = [
                ...messages,
                assistantMessage,
                ...toolResults
            ];

            const stream = await this.client.chat.complete({
                model: "mistral-large-latest",
                messages: finalMessages,
                stream: true
            });

            return {
                type: "stream",
                stream: stream,
                functionCalls: assistantMessage.tool_calls
            };
        } else {
            // Direct streaming response
            const stream = await this.client.chat.complete({
                model: "mistral-large-latest",
                messages: messages,
                stream: true
            });

            return {
                type: "stream",
                stream: stream,
                functionCalls: null
            };
        }
    }

    async *processStream(streamResult) {
        if (streamResult.type === "stream") {
            for await (const chunk of streamResult.stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    yield content;
                }
            }
        }
    }
}
