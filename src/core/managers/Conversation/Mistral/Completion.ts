import { appIsDev, chatutil, canvasutil } from "./shared"; // provides shared objects and imports for mistral models
import { clientmanager } from "./ClientManager.ts";
import { StateManager } from '../../StatesManager';
// import { waitForElement } from '../../../Utils/dom_utils';
import errorHandler from "../../../../ui/components/ErrorHandler/ErrorHandler";
import { leftalinemath } from "../../../MathBase/mathRenderer";
import { renderAll_aimessages } from "../../../MathBase/mathRenderer";
import { staticPortalBridge, StreamController, streamingPortalBridge } from "../../../PortalBridge.ts";
import { BaseErrorHandler } from "../../../ErrorHandler/BaseHandler";
// import { timer } from "../../../Timer/timer";
import toolExecutor from "../../../Tools/ToolCallHandler.ts";
import toolManager from "../../../Tools/ToolManager.ts";
import mistralClientSimulator from "../../../tests/MistralClientSimulator";
import { globalEventBus } from "../../../Globals/eventBus.ts";
// import { Mistral } from '@mistralai/mistralai';
import { EventStream } from "@mistralai/mistralai/lib/event-streams";
import { CompletionEvent } from "@mistralai/mistralai/models/components/completionevent";
import { ToolCall, ToolResults, ToolSchema } from "../../../Tools/types";
import { Tool } from "@mistralai/mistralai/models/components/tool";
import { ContentChunk } from "@mistralai/mistralai/models/components/contentchunk";

let SIGINT = false
export enum MessageRole {
    system = 'system',
    user = 'user',
    assistant = 'assistant',
    tool = 'tool'
}

// set event handlers
globalEventBus.on('sigint', () => SIGINT = true)

interface ToolSessionState {
    iterationCount: number,
    toolCallsMade: number,
    lastToolCall: ToolCall | null,
    pendingToolResults: Array<any>,
    conversationContext: Map<any, any>
}

interface ToolCallHistory {
    iterations: number
    toolCalls: ToolCall[]
    results: ToolResults
    timestamp: string
}

class CompletionBase {
    private clientmanager: typeof clientmanager
    public modelName: string
    public isMultimodalModel: boolean
    private ErrorCallback: CallableFunction | undefined
    private ToolsEnabled: boolean
    private messagePortal: StreamController
    private streamingPortal: StreamController
    private availableTools: Array<ToolSchema>
    // Stream var
    private output: string
    private fullResponse: string
    private thinkContent: string
    private actualResponse: string
    private isThinking: boolean
    private hasfinishedThinking: boolean
    private first_run: boolean
    private continued: boolean
    private rawDelta: string
    // Tool session
    private TOOL_CALLS: Array<ToolCall>
    // Tool stream
    private TOOLCALL_ITERATIONS: number
    private MAX_TOOLITERATIONS: number
    private TOOL_SIGINT: boolean
    private ToolCallHistory: ToolCallHistory[]
    private ToolSessionState: ToolSessionState

    constructor(ErrorCallback: CallableFunction | undefined = undefined) {
        this.modelName = StateManager.get('currentModel')
        this.ErrorCallback = ErrorCallback
        this.ToolsEnabled = false
        this.MAX_TOOLITERATIONS = 30
        this.clientmanager = clientmanager
        this.reset()
    }

    reset() {
        // Stream options
        this.rawDelta = ''
        this.output = '';
        this.fullResponse = ''
        this.thinkContent = ''
        this.actualResponse = ''
        this.isThinking = false
        this.hasfinishedThinking = false
        this.first_run = true;
        this.continued = false
        // Routing options
        this.isMultimodalModel = false
        // Tool stream options
        this.TOOLCALL_ITERATIONS = 0
        this.TOOL_SIGINT = false
        this.ToolCallHistory = []
        this.ToolSessionState = {
            iterationCount: 0,
            toolCallsMade: 0,
            lastToolCall: null,
            pendingToolResults: [],
            conversationContext: new Map()
        }
    }

    route(callback: CallableFunction) {
        const multimodal = chatutil.get_multimodal_models()
        if (this.modelName && multimodal.includes(this.modelName)) this.isMultimodalModel = true
        // set error callback
        this.ErrorCallback = callback ? callback : this.route
        return this
    }
    complete(input: string) {
        this.processInput(input)
        return this.StartSession()
    }
    processInput(input: string, processor: CallableFunction | undefined = undefined): void {
        if (processor) {
            const { user_message_portal } = processor(input);
            StateManager.set('user_message_portal', user_message_portal);
        } else {
            // Default user message handling
            const user_message_portal = staticPortalBridge.showComponentInTarget('UserMessage', 'chatArea', {
                message: input,
                file_type: null,
                file_data_url: null,
                save: true
            }, 'user_message');

            window.desk.api.addHistory({ role: "user", content: input });

            StateManager.set('user_message_portal', user_message_portal);
        }
        this.messagePortal = streamingPortalBridge.createStreamingPortal('AiMessage', 'chatArea', undefined, 'ai_message')

        // This shall be for errors
        StateManager.set('ai_messages_portal', this.messagePortal)

        // change send button appearance to processing status
        globalEventBus.emit('executioncycle:start')

        // Scroll to bottom
        globalEventBus.emit('scroll:bottom', true)
    }

    validateClientManager(ErrorCallback: CallableFunction): void {
        if (!clientmanager.MistralClient?.chat) {
            throw {
                origin: 'Mistral Client Call',
                message: 'Mistral client is not fully configured',
                type: 'Initialization',
                errorType: 'RuntimeError',
                stack: `${ErrorCallback || ErrorCallback}\n at MistralClient.client.chat.stream`
            }
        }
    }

    checkTools(): boolean {
        // Initialize tools integration
        const availableTools = toolManager.getAvailableToolSchemas();
        this.availableTools = availableTools
        this.ToolsEnabled = availableTools.length > 0
        return this.ToolsEnabled
    }

    closeMessaPortal() {
        this.messagePortal.close()
    }

    async StartSession() {
        try {
            this.closeMessaPortal()
            this.streamingPortal = streamingPortalBridge.createStreamingPortal(
                'StreamingAiMessage', 'chatArea', undefined, 'ai_message'
            )
            this.messagePortal = this.streamingPortal

            // Reset stream variables
            this.reset()

            if (this.ToolsEnabled || this.checkTools()) {
                await this.ToolStreamSession()
            } else {
                await this.StreamSession()
            }
            this.reset()
        } catch (error) {
            this.reset()
            await BaseErrorHandler(error, this.streamingPortal, this.ErrorCallback || this.StartSession)
        }
    }
    async StreamSession(): Promise<void> {
        // Use regular streaming without tools
        let stream = await mistralClientSimulator.client.chat.stream({ //clientmanager.MistralClient.chat.stream({
            model: this.modelName,
            messages: window.desk.api.getHistory(true),
            maxTokens: 3000,
        })
        await this.stream(stream)
    }
    async ToolStreamSession() {
        try {
            // SIGINT when a tool permission is denied
            globalEventBus.once('permission:denied', () => this.TOOL_SIGINT = true)
            let HAS_FINAL_RESPONSE = false

            while (this.TOOLCALL_ITERATIONS < this.MAX_TOOLITERATIONS && !HAS_FINAL_RESPONSE) {
                this.TOOLCALL_ITERATIONS++;
                this.ToolSessionState.iterationCount = this.TOOLCALL_ITERATIONS;

                if (SIGINT || this.TOOL_SIGINT) break

                const stream = await this.clientmanager.client.chat.stream({
                    model: this.modelName,
                    messages: window.desk.api.getHistory(true) as any, //conversationHistory,
                    maxTokens: 3000,
                    tools: this.availableTools as Array<Tool>,
                    toolChoice: 'any',
                    parallelToolCalls: false,
                });

                await this.stream(stream)

                // Check if tool_calls were requested and dispatch/execute them
                if (this.TOOL_CALLS && this.TOOL_CALLS.length > 0) {
                    console.log(`[Tool Session] Iteration ${this.TOOLCALL_ITERATIONS}: Processing ${this.TOOL_CALLS.length} tool calls`);

                    // Process all tool calls in this iteration
                    const toolResults = await toolExecutor.processToolCalls(
                        this.TOOL_CALLS
                    );
                    // Store tool call information
                    this.ToolCallHistory.push({
                        iterations: this.TOOLCALL_ITERATIONS,
                        toolCalls: this.TOOL_CALLS,
                        results: toolResults,
                        timestamp: new Date().toISOString()
                    });

                    // History was update in UpdateHistory so skip

                    for (const call of toolResults) {
                        const tool_result = {
                            role: MessageRole.tool,
                            content: JSON.stringify(call.result),
                            name: call.toolName,
                            tool_call_id: call.toolCallId
                        }
                        window.desk.api.addHistory(tool_result);
                        streamingPortalBridge.appendComponentAsChild(this.streamingPortal.id, 'ToolCallDisplay', {
                            toolCall: call
                        })
                    }
                    // Update session state
                    this.ToolSessionState.toolCallsMade += this.TOOL_CALLS.length;
                    this.ToolSessionState.lastToolCall = this.TOOL_CALLS[this.TOOL_CALLS.length - 1];
                    this.ToolSessionState.pendingToolResults = toolResults;
                } else {
                    // No tool calls, this is the final response
                    HAS_FINAL_RESPONSE = true;
                    console.log(`[Tool Session] Final response received in iteration ${this.TOOLCALL_ITERATIONS}`);
                    SIGINT = true
                    break
                }
            }
            SIGINT = false
        } catch (error) {
            console.error(`[Tool Session] Error in iteration ${this.TOOLCALL_ITERATIONS}:`, error);
            this.TOOL_SIGINT = true
        }
    }
    private streamArray(deltaContent: ContentChunk[]) {
        // Process each content chunk in the array
        for (const contentChunk of deltaContent) {

            if (contentChunk.type === "thinking") {
                // Start or continue thinking
                this.isThinking = true;

                // Extract text from thinking array
                if (contentChunk.thinking && Array.isArray(contentChunk.thinking)) {
                    for (const thought of contentChunk.thinking) {
                        if (thought.type === "text" && thought.text) {
                            this.thinkContent += thought.text;
                        }
                    }
                }
            } else if (contentChunk.type === "text" && contentChunk.text) {
                // This is actual response text

                // If we were thinking, now we've finished thinking
                if (this.isThinking) {
                    this.hasfinishedThinking = true;
                    this.isThinking = false;
                }

                this.actualResponse += contentChunk.text;


            }
            // TODO: Handle other chunk types here
        }
    }
    private streamText(deltaContent: string) {
        // Fallback to tag-based parsing for string content
        if (this.output.includes("<think>") && !this.isThinking && !this.hasfinishedThinking) {
            this.isThinking = true;
            this.hasfinishedThinking = false;
            this.output = this.output.replace("<think>", "");
            this.thinkContent = this.output;
            this.actualResponse = " ";
        } else if (this.isThinking && this.output.includes("</think>")) {
            this.isThinking = false;
            this.hasfinishedThinking = true;
            this.thinkContent += deltaContent.replace("</think>", "");
            this.output = this.output.replace("</think>", "");
        } else if (this.isThinking) {
            this.thinkContent += deltaContent;
        } else {
            this.actualResponse += deltaContent;
        }
    }
    /**
     * Continuation PROTOCOL\
     * **PROTOCOL**
     * 1. Pop last user message that triggered continuation
     * 2. Modify the previous ai response and concatenate this response
     * 3. Store conversation history
     */
    private continueStream() {
        // In first run set <continue> tag as chunk to avoid breaking due to stray chunks that may be part of it. rawDelta cannot be anything except for items in the tag
        if (this.first_run) {
            this.rawDelta = "<continued>"
            // Remove user message from interface
            streamingPortalBridge.closeStreamingPortal(StateManager.get('user_message_portal'))
            this.first_run = false
        }
        this.continued = true

        let target_message_portal = StateManager.get('prevStreamingPortal')

        // close newly created portal and reuse the previous
        if (target_message_portal) {
            this.streamingPortal.close()
            this.streamingPortal = target_message_portal
        }

        this.streamingPortal.append({
            actualContent: this.rawDelta,
            isThinking: this.isThinking,
            thinkContent: this.thinkContent,
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
            }
        );
    }
    async updateHistory() {
        if (this.continued) {
            // Reset store user message state
            StateManager.set('user_message_portal', null)

            const historyItem = {
                role: MessageRole.assistant,
                content: [{
                    type: "text",
                    text: this.fullResponse
                        .replace("<continued>", "")
                        .replace("</continued>", "")
                }]
            }
            if (this.TOOL_CALLS) {
                historyItem['tool_calls'] = this.TOOL_CALLS
            }
            window.desk.api.updateContinueHistory(historyItem)
        } else {
            let content = window.desk.api.getmetadata()?.model === 'multimodal' ?
                [
                    { type: 'text', text: this.fullResponse }
                ] :
                this.fullResponse

            const historyItem = { role: MessageRole.assistant, content: content }
            if (this.TOOL_CALLS) {
                historyItem['tool_calls'] = this.TOOL_CALLS
            }
            window.desk.api.addHistory(historyItem);
            StateManager.set('ai_message_portal', this.streamingPortal)
            StateManager.set('prev_ai_message_portal', StateManager.get('ai_message_portal'))
        }
    }
    private processToolContent(toolCalls: Array<ToolCall> | null | undefined): void {
        if (!toolCalls) return
        this.TOOL_CALLS = toolCalls
    }
    async stream(stream: EventStream<CompletionEvent>) {
        for await (const chunk of stream) {
            if (SIGINT) {
                SIGINT = false
                console.log("SIGINT ...")
                return
            }

            const choice = chunk?.data?.choices?.[0];

            if (this.ToolsEnabled) this.processToolContent(choice?.delta?.toolCalls as any)

            if (!choice?.delta?.content) continue;

            const deltaContent = choice.delta.content;

            // Store raw content
            let rawDelta = deltaContent;
            this.output += rawDelta;
            this.fullResponse += rawDelta;

            // Process based on content type
            if (Array.isArray(deltaContent)) {
                this.streamArray(deltaContent)
            }
            else if (typeof deltaContent === 'string') {
                this.streamText(deltaContent)
            }

            if (this.actualResponse.includes('<continued>') || this.actualResponse.includes('<continued')) {
                this.continueStream()
            } else {
                // console.log(thinkContent)
                this.streamingPortal.update({
                    actualContent: this.actualResponse,
                    isThinking: this.isThinking,
                    thinkContent: this.thinkContent,
                });
            }

            let message_id = StateManager.get("current_message_id")

            // Scroll to bottom
            globalEventBus.emit('scroll:bottom', true)

            // Render mathjax immediately
            chatutil.render_math(`${message_id}`, 'all', 2000 as any)

            this.updateHistory()
        }
    }
    async completeStream() {
        if (canvasutil.isCanvasOn()) {
            if (!canvasutil.isCanvasOpen()) globalEventBus.emit('canvas:open');
            // normalize canvas
            canvasutil.NormalizeCanvasCode();
        }


        globalEventBus.emit('executioncycle:end')

        // Reset send button appearance
        globalEventBus.emit('executioncycle:end')

        chatutil.render_math()
        renderAll_aimessages()
        // }
        setTimeout(() => { leftalinemath() }, 1000)

        if (await appIsDev()) errorHandler.resetRetryCount()
    }
}

export const completion = new CompletionBase()

globalEventBus.on('model:change', ((model: string) => {
    completion.modelName = model
}))
