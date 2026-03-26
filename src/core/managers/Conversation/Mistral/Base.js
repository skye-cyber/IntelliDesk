import { appIsDev, chatutil, canvasutil } from "./shared"; // provides shared objects and imports for mistral models
import { clientmanager } from "./ClientManager";
import { StateManager } from '../../StatesManager';
import { waitForElement } from '../../../Utils/dom_utils';
// import { GenerateId } from "../../../../ui/components/ConversationRenderer/utils";
import { HandleProcessingEventChanges } from "../../../Utils/chatUtils";
import errorHandler from "../../../../ui/components/ErrorHandler/ErrorHandler";
import { leftalinemath } from "../../../MathBase/mathRenderer";
import { renderAll_aimessages } from "../../../MathBase/mathRenderer";
import { staticPortalBridge, streamingPortalBridge } from "../../../PortalBridge.ts";
import { BaseErrorHandler } from "../../../ErrorHandler/BaseHandler";
// import { timer } from "../../../Timer/timer";
import toolsIntegration from "./ToolIntegration";
import toolManager from "./ToolManager";
import mistralClientSimulator from "../../../tests/MistralClientSimulator";
// import { Mistral } from '@mistralai/mistralai';


let ai_ms_pid

/**
 * Base function for Mistral AI interactions
 * Handles common logic for both textual and multimodal conversations
 */
export async function MistralBase({
    text,
    model_name = StateManager.get('currentModel'),
    handleUserInput,
    functionName
}) {
    try {
        if (!text?.trim()) return console.log("Message is empty")

        StateManager.set('user-text', text)

        // Handle user input based on the specific implementation
        if (handleUserInput) {
            const { user_message_portal, userContent } = handleUserInput(text);
            StateManager.set('user_message_portal', user_message_portal);
        } else {
            // Default user message handling
            const user_message_portal = staticPortalBridge.showComponentInTarget('UserMessage', 'chatArea', {
                message: text,
                file_type: null,
                file_data_url: null,
                save: true
            }, 'user_message');

            window.desk.api.addHistory({ role: "user", content: text });

            StateManager.set('user_message_portal', user_message_portal);
        }

        //const loader_id = staticPortalBridge.showComponentInTarget('LoadingAnimation', 'chatArea', {}, "loader")
        //StateManager.set('loader-element-id', loader_id)

        let message_portal = streamingPortalBridge.createStreamingPortal('AiMessage', 'chatArea', undefined, 'ai_message')

        // This shall be for errors
        ai_ms_pid = message_portal
        StateManager.set('ai_messages_portal', message_portal)

        // change send button appearance to processing status
        HandleProcessingEventChanges('show')
        StateManager.set('processing', true);

        // Scroll to bottom
        chatutil.scrollToBottom(chatArea, true);

        //start timer
        //timer.trackTime("start");

        if (!clientmanager.MistralClient?.chat) {
            throw {
                origin: 'Mistral Client Call',
                message: 'Mistral client is not fully configured',
                type: 'Initialization',
                errorType: 'RuntimeError',
                stack: `${functionName}\n at MistralClient.client.chat.stream`
            }
        }

        // Initialize tools integration
        const availableTools = toolManager.getAvailableToolSchemas();

        // Check if we should enable tool calling
        const enableToolCalling = availableTools.length > 0 && StateManager.get('enable_tools');

        if (enableToolCalling) {
            // Start tool calling session with conversation state
            const toolSession = await handleToolCallingSession(
                mistralClientSimulator.client,  //clientmanager.MistralClient,
                model_name,
                availableTools,
                toolsIntegration
            );

            // if (toolSession.finalResponse || !toolSession.hasFinalResponse) {
            //     // Create mock stream for the final response
            //     stream = createMockStream(toolSession.finalResponse);
            // } else {
            // Fallback to regular streaming if tool session failed
            // stream = await mistralClientSimulator.client.chat.stream({ //clientmanager.MistralClient.chat.stream({
            //     model: model_name,
            //     messages: window.desk.api.getHistory(true),
            //     max_tokens: 3000,
            //     });
            //}
        } else {
            // close message portal
            message_portal.close()

            const streaming_message_portal = streamingPortalBridge.createStreamingPortal(
                'StreamingAiMessage', 'chatArea', undefined, 'ai_message'
            )
            message_portal = streaming_message_portal
            ai_ms_pid = message_portal
            StateManager.set('ai_messages_portal', message_portal)

            // Use regular streaming without tools
            let stream = await mistralClientSimulator.client.chat.stream({ //clientmanager.MistralClient.chat.stream({
                model: model_name,
                messages: window.desk.api.getHistory(true),
                maxTokens: 3000,
            })

            let output = "";
            let thinkContent = "";
            let actualResponse = "";
            let isThinking = false;
            let hasfinishedThinking = false;
            let first_run = true;
            let continued = false;

            for await (const chunk of stream) {
                const choice = chunk?.data?.choices?.[0];
                if (!choice?.delta?.content) continue;

                const deltaContent = choice.delta.content;

                // Store raw content
                let rawDelta = deltaContent;
                output += rawDelta;
                fullResponse += rawDelta;

                // Process based on content type
                if (Array.isArray(deltaContent)) {
                    console.log("Is thinking ...")
                    // Process each content chunk in the array
                    for (const contentChunk of deltaContent) {
                        if (contentChunk.type === "thinking") {
                            // Start or continue thinking
                            isThinking = true;

                            // Extract text from thinking array
                            if (contentChunk.thinking && Array.isArray(contentChunk.thinking)) {
                                for (const thought of contentChunk.thinking) {
                                    if (thought.type === "text" && thought.text) {
                                        thinkContent += thought.text;
                                    }
                                }
                            }
                        }
                        else if (contentChunk.type === "text" && contentChunk.text) {
                            // This is actual response text

                            // If we were thinking, now we've finished thinking
                            if (isThinking) {
                                hasfinishedThinking = true;
                                isThinking = false;
                            }

                            actualResponse += contentChunk.text;
                        }
                        // TODO: Handle other chunk types here
                    }
                }
                else if (typeof deltaContent === 'string') {
                    // Fallback to tag-based parsing for string content
                    if (output.includes("<think>") && !isThinking && !hasfinishedThinking) {
                        isThinking = true;
                        hasfinishedThinking = false;
                        output = output.replace("<think>", "");
                        thinkContent = output;
                        actualResponse = " ";
                    } else if (isThinking && output.includes("</think>")) {
                        isThinking = false;
                        hasfinishedThinking = true;
                        thinkContent += deltaContent.replace("</think>", "");
                        output = output.replace("</think>", "");
                    } else if (isThinking) {
                        thinkContent += deltaContent;
                    } else {
                        actualResponse += deltaContent;
                    }
                }

                if (StateManager.get('codeBuffer') && StateManager.get('codeBuffer').code) {
                    if (!canvasutil.isCanvasOn() && !canvasutil.isCanvasOpen()) chatutil.open_canvas();

                    waitForElement('#code-view', (el) => {
                        el.innerHTML = StateManager.get('codeBuffer').code;
                        StateManager.get('canvasUpdate')();
                    });
                }

                if (actualResponse.includes('<continued>') || actualResponse.includes('<continued')) {
                    // In first run set <continue> tag as chunk to avoid breaking due to stray chunks that may be part of it, rawDelta cannot be anything except for items in the tag
                    if (first_run) {
                        rawDelta = "<continued>"
                        // Remove user message from interface
                        streamingPortalBridge.closeStreamingPortal(StateManager.get('user_message_portal'))
                        first_run = false
                    }
                    continued = true

                    let target_message_portal = StateManager.get('prev_ai_message_portal')

                    // th now created portal and resuse the previous
                    if (target_message_portal) {
                        streaming_message_portal.close()
                    } else {
                        target_message_portal = message_portal
                    }

                    target_message_portal.append({
                        actualContent: rawDelta,
                        isThinking: isThinking,
                        thinkContent: thinkContent,
                    },
                        {
                            replace: {
                                target_props: ["actual_response"],
                                repvalues: [
                                    {
                                        pattern: "<continued>",
                                        repl: "\n"

                                    }, {
                                        pattern: "</continued>",
                                        repl: ""
                                    }
                                ]
                            }
                        });
                } else {
                    console.log(thinkContent)
                    streaming_message_portal.update({
                        actualContent: actualResponse,
                        isThinking: isThinking,
                        thinkContent: thinkContent,
                    });
                }

                let message_id = StateManager.get("current_message_id")

                // Scroll to bottom
                chatutil.scrollToBottom(chatArea, true, 1000);

                // Render mathjax immediately
                chatutil.render_math(`${message_id}`, 2000)
            }

            if (canvasutil.isCanvasOn()) {
                if (!canvasutil.isCanvasOpen()) chatutil.open_canvas();
                // normalize canvas
                canvasutil.NormalizeCanvasCode();
            }

            /*
             * Conversation continuation PROTOCOL
             * 1. Pop last user message that triggered continuation
             * 2. Modify the previous ai response and concatenate this response
             * 3. Store conversation history
             */
            if (continued) {
                // Reset store user message state
                StateManager.set('user_message_portal', null)

                window.desk.api.updateContinueHistory({
                    role: "assistant",
                    content: [{
                        type: "text",
                        text: fullResponse
                            .replace("<continued>", "")
                            .replace("</continued>", "")
                    }]
                })
            } else {
                const content = window.desk.api.addHistory().metadata.model === 'multimodal' ?
                    [
                        { type: 'text', text: fullResponse }
                    ] :
                    fullResponse

                window.desk.api.addHistory({ role: "assistant", content: content });
                StateManager.set('ai_message_portal', message_portal)
                StateManager.set('prev_ai_message_portal', StateManager.get('ai_message_portal'))
            }

        }

        StateManager.set('processing', false);

        //stop timer
        //timer.trackTime("stop");

        // Reset send button appearance
        HandleProcessingEventChanges('hide')

        // render diagrams from this response
        // if (StateManager.get('current_message_id')) {
        //     chatutil.render_math(`${StateManager.get('current_message_id')}`)
        // } else {
        chatutil.render_math()
        renderAll_aimessages()
        // }
        setTimeout(() => { leftalinemath() }, 1000)

        //staticPortalBridge.closeComponent(loader_id)

        if (await appIsDev()) errorHandler.resetRetryCount()

    } catch (error) {
        await BaseErrorHandler(error, ai_ms_pid, functionName)
    }
}

/**
 * Handle complex tool calling sessions with multiple iterations
 * Supports: sequential tool calls, iterative tool usage, interleaved responses
 * @param {instance} client {2}
 * @param {String} modelName {2}
 * @param {Array} availableTools {2}
 * @param {instance} toolIntegration {2}
 * @param {number} [maxIterations=5] {1}
 */
async function handleToolCallingSession(client, modelName, availableTools, toolIntegration, maxIterations = 20) {
    let iteration = 0;
    let finalResponse = null;
    let conversationHistory = window.desk.api.getHistory(true);
    let toolCallHistory = [];
    let hasFinalResponse = false;

    // Initialize session state
    const sessionState = {
        iterationCount: 0,
        toolCallsMade: 0,
        lastToolCall: null,
        pendingToolResults: [],
        conversationContext: {}
    };

    while (iteration < maxIterations && !hasFinalResponse) {
        iteration++;
        sessionState.iterationCount = iteration;

        try {
            // Get AI response with potential tool calls
            const response = await client.chat.complete.create({
                model: modelName,
                messages: window.desk.api.getHistory(true), //conversationHistory,
                maxTokens: 3000,
                tools: availableTools,
                toolChoice: 'any',
                parallelToolCalls: false,
            });
            const aiMessage = response.choices[0].message;
            const streaming_portal = StateManager.get('ai_messages_portal')

            // console.log("AIMS:", aiMessage)
            // Update with ai message
            window.desk.api.addHistory({ role: "assistant", content: aiMessage.content || "", tool_calls: aiMessage.tool_calls });

            // streamingPortalBridge.appendToStreamingPortal(streaming_portal, {
            //     actual_response: aiMessage.content,
            // });
            streamingPortalBridge.appendComponentAsChild(streaming_portal.id, 'ResponseWrapper', {
                actualContent: aiMessage.content,
            })

            // Check if AI wants to use tools
            if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
                console.log(`[Tool Session] Iteration ${iteration}: Processing ${aiMessage.tool_calls.length} tool calls`);

                // Process all tool calls in this iteration
                const toolResults = await toolIntegration.processToolCalls(
                    aiMessage.tool_calls
                );

                // Store tool call information
                toolCallHistory.push({
                    iteration,
                    toolCalls: aiMessage.tool_calls,
                    results: toolResults,
                    timestamp: new Date().toISOString()
                });

                // Add AI message with tool calls to history
                // conversationHistory.push({
                //     role: "assistant",
                //     content: aiMessage.content || "",
                //     tool_calls: aiMessage.tool_calls
                // });

                // Update history
                for (const call of toolResults) {
                    window.desk.api.addHistory({
                        role: "tool", content: JSON.stringify(call.result), name: call.toolName, tool_call_id: call.toolCallId
                    });
                    streamingPortalBridge.appendComponentAsChild(streaming_portal.id, 'ToolCallDisplay', {
                        toolCall: call
                    })
                }

                // Update session state
                sessionState.toolCallsMade += aiMessage.tool_calls.length;
                sessionState.lastToolCall = aiMessage.tool_calls[aiMessage.tool_calls.length - 1];
                sessionState.pendingToolResults = toolResults;

            } else {
                // No tool calls, this is the final response
                finalResponse = aiMessage.content;
                hasFinalResponse = true;
                console.log(`[Tool Session] Final response received in iteration ${iteration}`);
                //break
            }

        } catch (error) {
            console.error(`[Tool Session] Error in iteration ${iteration}:`, error);
            // Add tool error
            // streamingPortalBridge.appendComponentAfter(streaming_portal, 'ToolErrorHandler', {
            //     toolCalls: toolResults
            // })
            finalResponse = `Sorry, I encountered an error while processing your request: ${error?.message}`;
            hasFinalResponse = true;

            // Add error to conversation history
            // conversationHistory.push({
            //     role: "assistant",
            //     content: finalResponse
            // });
        }
    }

    // Generate summary of tool usage
    const toolSummary = generateToolUsageSummary(toolCallHistory);

    return {
        finalResponse: finalResponse,
        toolCallHistory: toolCallHistory,
        iterationCount: iteration,
        sessionState: sessionState,
        toolSummary: toolSummary,
        hasFinalResponse: hasFinalResponse
    };
}

/**
 * Generate a summary of tool usage for the conversation
 */
function generateToolUsageSummary(toolCallHistory) {
    if (toolCallHistory.length === 0) {
        return "No tools were used in this conversation.";
    }

    const summary = [];
    const toolStats = {};
    let totalToolsUsed = 0;

    toolCallHistory.forEach(iteration => {
        iteration.toolCalls.forEach(toolCall => {
            const toolName = toolCall.function.name;
            toolStats[toolName] = (toolStats[toolName] || 0) + 1;
            totalToolsUsed++;
        });
    });

    summary.push(`Used ${totalToolsUsed} tool calls across ${toolCallHistory.length} iterations:`);

    for (const [toolName, count] of Object.entries(toolStats)) {
        summary.push(`- ${toolName}: ${count} call(s)`);
    }

    return summary.join('\n');
}


/**
 * Create a mock stream from a string to maintain compatibility with streaming interface
 */
async function* createMockStream(content) {
    console.log("XCreating mock")
    // Split content into chunks for streaming simulation
    const chunkSize = 50;
    for (let i = 0; i < content.length; i += chunkSize) {
        const chunk = content.slice(i, i + chunkSize);
        yield {
            data: {
                choices: [{
                    delta: {
                        content: chunk
                    }
                }]
            }
        };
        // Small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 0));
    }
}

// Add the helper methods to the function
MistralBase.handleToolCallingSession = handleToolCallingSession;
MistralBase.createMockStream = createMockStream
