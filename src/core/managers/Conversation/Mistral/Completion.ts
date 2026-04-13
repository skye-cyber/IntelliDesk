import { appIsDev } from "./shared"; // provides shared objects and imports for mistral models
import { canvasutil } from "../../Canvas/CanvasUtils.js";
import { chatutil } from "../util.ts";
import { clientmanager } from "./ClientManager.ts";
import { StateManager } from '../../StatesManager.ts';
import errorHandler from "../../../../ui/components/ErrorHandler/ErrorHandler";
import { leftalinemath } from "../../../MathBase/mathRenderer";
import { renderAll_aimessages } from "../../../MathBase/mathRenderer";
import { staticPortalBridge, StreamController, streamingPortalBridge } from "../../../PortalBridge.ts";
import { BaseErrorHandler } from "../../../ErrorHandler/BaseHandler.js";
import toolExecutor from "../../../Tools/ToolCallHandler.ts";
import toolManager from "../../../Tools/ToolManager.ts";
import { globalEventBus } from "../../../Globals/eventBus.ts";
import { EventStream } from "@mistralai/mistralai/lib/event-streams";
import { CompletionEvent } from "@mistralai/mistralai/models/components/completionevent";
import { ToolCall, ToolResults, ToolSchema, FunctionCall } from "../../../Tools/types";
import { Tool } from "@mistralai/mistralai/models/components/tool";
import { ContentChunk } from "@mistralai/mistralai/models/components/contentchunk";
import { fileInputProcessor } from "./InputProcessor.js";
import { MessageRole } from "./types.ts";
import { modelManager } from "../ModelManager.ts";
import { EventSubscription } from "../../../Globals/types.ts";

let SIGINT = false

/*TODO:
 * Try reasoning_content as reasoning field intead of thinking
 * Try adding devstral-small-latest to models
*/
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
interface ReferenceType {
    referenceIds: Array<number>;
    type?: "reference" | undefined;
}

/**
 * **USAGE**\
 * completion.route().complete(text)
 */
class CompletionBase {
    private clientmanager: typeof clientmanager
    public modelName: string
    public modelUsesArrayContent: boolean
    private ErrorCallback: CallableFunction | undefined
    private ToolsEnabled: boolean
    private userMessagePID: string
    private streamingPortal: StreamController
    private availableTools: Array<ToolSchema>
    // private UserInputHandler: CallableFunction
    // Stream var
    private output: string
    private fullResponse: string
    private thinkContent: string
    private thinkContentRefs: ReferenceType
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
    // Model
    private DEFAULT_ARRAYED_MODEL: string
    private DEFAULT_TEXT_MODEL: string
    private DEFAULT_REASONING_MODEL: string
    public REASONING_ON: boolean
    private REASONING_CHANGE_LISTENER: EventSubscription

    constructor(ErrorCallback: CallableFunction | undefined = undefined) {
        this.modelName = StateManager.get('currentModel') as string
        this.ErrorCallback = ErrorCallback
        this.ToolsEnabled = false
        this.MAX_TOOLITERATIONS = 30
        this.clientmanager = clientmanager
        this.DEFAULT_ARRAYED_MODEL = 'mistral-small-latest'
        this.DEFAULT_TEXT_MODEL = 'mistral-large-latest'
        this.DEFAULT_REASONING_MODEL = 'magistral-small-latest'
        this.REASONING_ON = false
        this.reset()
    }

    simpleReset() {
        this.rawDelta = ''
        this.output = '';
        this.fullResponse = ''
        this.thinkContent = ''
        this.actualResponse = ''
        this.isThinking = false
        this.hasfinishedThinking = false
        this.first_run = true;
        this.continued = false
        this.TOOL_CALLS = []
        if (this.thinkContentRefs) this.thinkContentRefs.referenceIds = []
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
        this.modelUsesArrayContent = false
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
        SIGINT = false
        this.TOOL_CALLS = []
        if (this.thinkContentRefs) this.thinkContentRefs.referenceIds = []
    }

    route(callback: CallableFunction | undefined = undefined) {
        if (this.modelName && modelManager.usesArrayStructure(this.modelName)) this.modelUsesArrayContent = true
        /* set error callback
         * Use `useraction:request:execution` as default callback if none is provided
        */
        this.ErrorCallback = callback ? callback : (text: string) => globalEventBus.emit('useraction:request:execution', (text))
        // If there are files uploaded let use model that supports them say mistral-ocr-latest or mistral-large-2512
        let files = StateManager.get('uploaded_files')
        if (files && files?.length > 0) {
            files = undefined
            this.modelUsesArrayContent = true
            // modelManager.changeModel(this.DEFAULT_ARRAYED_MODEL)
            this.modelName = this.DEFAULT_ARRAYED_MODEL
            // TODO: just use the model, do not change in ui
            // TODO: lock model selection in ui for auto selection
            // Can unlock manual selector by enabling experimentl features
        }
        if (this.REASONING_ON) {
            this.modelName = this.DEFAULT_REASONING_MODEL
            const chats = window.desk.api.getHistory() as any
            if (chats.length > 1 && !Array.isArray(chats.slice(1))) {
                window.desk.api.upgradeToArrayModel(null, false)
            }
        }
        return this
    }
    complete(input: string) {
        this.route()
        if (!this.validateClientManager()) return
        this.processInput(input)

        // start execution cycle -> trigger user ui update
        globalEventBus.emit('executioncycle:start')
        return this.StartSession()
    }
    processInput(input: string): void {
        if (this.modelUsesArrayContent) {
            const { userMessagePID } = fileInputProcessor.process(input);
            this.userMessagePID = userMessagePID
        } else {
            // Default user message handling
            this.userMessagePID = staticPortalBridge.showComponentInTarget('UserMessage', 'chatArea', {
                message: input,
                file_type: null,
                file_data_url: null,
                save: true
            }, 'user_message');

            window.desk.api.addHistory({ role: MessageRole.user, content: input });
        }

        // Scroll to bottom
        globalEventBus.emit('scroll:bottom', true)
    }

    validateClientManager(): boolean {
        try {
            let message: string = ''
            globalEventBus.once('keychain:error', (error: string) => message = error)

            if (!clientmanager.client || !clientmanager.client?.chat) {
                message = message ? message : "Mistral init error"
            }
            if (!clientmanager.validateChain()) {
                message = message ? message : 'KeyChain Error'
            }

            if (message) {
                throw {
                    origin: "Completion endpoint",
                    reason: message,
                    message: `Mistral client is not fully configured: ${message}`,
                    type: 'Initialization Error',
                    errorType: 'RuntimeError',
                    stack: `${this.ErrorCallback}\n at MistralClient.client.chat.stream`
                }
            }
            return true
        } catch (error) {
            this.handleError(error)
            return false
        }
    }

    checkTools(): boolean {
        // Initialize tools integration
        const availableTools = toolManager.getAvailableToolSchemas();
        this.availableTools = availableTools
        this.ToolsEnabled = availableTools.length > 0 && modelManager.supportsToolCalling(this.modelName)
        return this.ToolsEnabled
    }

    closeMessagePortal() {
        this.streamingPortal.close()
    }

    async StartSession() {
        try {
            // Reset stream variables
            this.reset()

            this.streamingPortal = streamingPortalBridge.createStreamingPortal(
                'AiMessage', 'chatArea', undefined, 'ai_message'
            )
            if (this.ToolsEnabled || this.checkTools()) {
                await this.ToolStreamSession()
            } else {
                await this.StreamSession()
            }

            StateManager.set('prevStreamingPortal', this.streamingPortal)

            // Perform final processing logic
            this.completeStream()
        } catch (error) {
            this.handleError(error)
        }
    }
    async StreamSession(): Promise<void> {
        try {
            // Use regular streaming without tools
            let stream = await this.clientmanager.client.chat.stream({
                model: this.modelName,
                messages: window.desk.api.getHistory(true) as any,
                maxTokens: 3000,
            })
            await this.stream(stream)
        } catch (error) {
            this.handleError(error)
        }
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

                // To avoid dirty reads
                this.simpleReset()
                const stream = await this.clientmanager.client.chat.stream({
                    model: this.modelName,
                    messages: window.desk.api.getHistory(true) as any, //conversationHistory,
                    maxTokens: 4000,
                    tools: this.availableTools as Array<Tool>,
                    toolChoice: 'auto',
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
                        if (!call.toolCallId) {
                            console.error('Tool result missing toolCallId:', call);
                            // continue; // Skip this tool result
                        }
                        const tool_result = {
                            role: MessageRole.tool,
                            content: JSON.stringify(call.result || call.error),
                            name: call.toolName,
                            toolCallId: call.toolCallId
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

                    // Clear TOOL_CALLS for next iteration
                    this.TOOL_CALLS = [];
                } else {
                    // No tool calls, this is the final response
                    HAS_FINAL_RESPONSE = true;
                    console.log(`[Tool Session] Final response received in iteration ${this.TOOLCALL_ITERATIONS}`);
                    SIGINT = true
                    break
                }
            }
            return true
        } catch (error) {
            console.debug(`[Tool Session] Error in iteration ${this.TOOLCALL_ITERATIONS}:`, error);
            this.handleError(error)
        }
    }
    private processToolContent(toolCalls: Array<ToolCall> | null | undefined): void {
        if (!toolCalls) return;

        // Accumulate tool calls instead of replacing them
        if (!this.TOOL_CALLS) {
            this.TOOL_CALLS = [];
        }

        // Merge/update existing tool calls
        for (const newToolCall of toolCalls) {
            const existingIndex = this.TOOL_CALLS.findIndex(tc => tc.id === newToolCall.id);

            if (existingIndex !== -1) {
                // Update existing tool call (accumulate arguments)
                const existing = this.TOOL_CALLS[existingIndex];
                if (newToolCall.function?.arguments) {
                    // Append the new argument chunk to existing arguments
                    const existingArgs = existing.function?.arguments || '';

                    let args: { [k: string]: any } | string = ''
                    if (typeof existingArgs === 'string') {
                        args = existingArgs + (newToolCall.function.arguments || '')
                    } else {
                        // existingArgs is an object (already parsed JSON)
                        // When streaming, arguments come as strings, so this shouldn't happen
                        // But if it does, keep the existing object
                        args = existingArgs
                    }

                    existing.function = {
                        ...existing.function,
                        arguments: args
                    } as FunctionCall
                }
                // Update name if provided (usually first chunk)
                if (newToolCall.function?.name) {
                    existing.function = {
                        ...existing.function,
                        name: newToolCall.function.name
                    } as FunctionCall;
                }
                this.TOOL_CALLS[existingIndex] = existing;
            } else {
                // Add new tool call
                this.TOOL_CALLS.push(newToolCall);
            }
        }
    }
    async stream(stream: EventStream<CompletionEvent>) {
        for await (const chunk of stream) {
            if (SIGINT) {
                SIGINT = false
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
                this.isThinking = false
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
            chatutil.renderMath(`${message_id}`, 'all', 2000 as any)
        }
        this.updateHistory()
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
                            // Handle referenceChunks
                        } else if (thought.type === "reference" && thought.referenceIds) {
                            this.thinkContentRefs.referenceIds = [
                                ...this.thinkContentRefs.referenceIds,
                                ...thought.referenceIds
                            ]
                        }
                    }
                }
            } else if (contentChunk.type === "text" && contentChunk.text) {
                // This is actual response text
                // Only process text chunks that have actual string content
                if (contentChunk.text && typeof contentChunk.text === 'string') {
                    // If we were thinking, now we've finished thinking
                    if (this.isThinking) {
                        this.hasfinishedThinking = true;
                        this.isThinking = false;
                    }

                    this.actualResponse += contentChunk.text;
                }

            } else if (contentChunk.type === "image_url" || contentChunk.type === "document_url") {
                // Handle other chunk types if needed
                // These shouldn't appear in thinking models but handle just in case

            } else {
                // Unknown chunk type - log for debugging
                console.warn('Unknown content chunk type:', contentChunk.type, contentChunk);
            }
            // TODO: Handle other chunk types here
        }
    }
    private streamText(deltaContent: string) {
        // String content - safe to append
        this.output += deltaContent;
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
            this.fullResponse += deltaContent;
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
    async completeStream() {
        if (canvasutil.isCanvasOn()) {
            if (!canvasutil.isCanvasOpen()) globalEventBus.emit('canvas:open');
            // normalize canvas
            canvasutil.NormalizeCanvasCode();
        }

        // Correctly render math using katex if any
        chatutil.renderMath()
        renderAll_aimessages()
        setTimeout(() => { leftalinemath() }, 1000)

        // Reset send button appearance
        globalEventBus.emit('executioncycle:end')

        // Rest for the next round
        this.reset()

        if (await appIsDev()) errorHandler.resetRetryCount()
    }
    async updateHistory() {
        if (this.continued) {
            StateManager.set('user_message_portal', null);

            const historyItem: any = {
                role: MessageRole.assistant
            };

            // Build content array for multimodal/thinking models
            const content: string | Array<ContentChunk> | null | undefined = [];

            // TODO: Handle referenceChunks here if present
            // Add thinking content if present (as thinking type or text with think tag)
            if (this.thinkContent && this.thinkContent.trim()) {
                content.push({
                    type: "thinking",
                    thinking: [
                        {
                            type: 'text',
                            text: this.thinkContent
                        },
                        //...this.thinkContentRefs
                    ]
                });
            }

            // Add actual response if present
            if (this.actualResponse && this.actualResponse.trim()) {
                content.push({
                    type: "text",
                    text: this.actualResponse
                        .replace(/<continued>/g, "")
                        .replace(/<\/continued>/g, "")
                });
            }

            // Only add content array if we have items
            if (content.length > 0) {
                historyItem.content = content;
            }

            // Add tool calls if present (use camelCase for SDK)
            if (this.TOOL_CALLS && this.TOOL_CALLS.length > 0) {
                historyItem.toolCalls = this.TOOL_CALLS;
            }

            // Validate before adding
            if (!historyItem.content && !historyItem.toolCalls) {
                console.error('Assistant message must have either content or toolCalls');
                return;
            }

            window.desk.api.updateContinueHistory(historyItem);

        } else {
            const historyItem: any = {
                role: MessageRole.assistant
            };

            // Build content array for modern thinking format
            const content: any[] = [];

            // Add thinking content if present
            if (this.thinkContent && this.thinkContent.trim()) {
                content.push({
                    type: "thinking",
                    thinking: [
                        {
                            type: 'text',
                            text: this.thinkContent
                        }
                    ]
                });
            }

            // Add actual response if present
            if (this.actualResponse && this.actualResponse.trim()) {
                const textContent = this.actualResponse.trim();
                content.push({
                    type: "text",
                    text: textContent
                });
            }

            if (content.length > 0) {
                historyItem.content = content;
            }

            // Add tool calls if present
            if (this.TOOL_CALLS && this.TOOL_CALLS.length > 0) {
                historyItem.toolCalls = this.TOOL_CALLS;
            }

            if (!historyItem.content && !historyItem.toolCalls) {
                console.error('Assistant message must have either content or toolCalls');
                return;
            }

            window.desk.api.addHistory(historyItem);
        }
    }
    private async handleError(error: Error): Promise<void> {
        this.reset()
        globalEventBus.emit('executioncycle:end')
        // Mark all files as unUsed if we are in multiomodal chat and last message is not from assistant, meaning files have not been uploaded/used
        if (window.desk.api.getRoleByIndex(-1) !== MessageRole.assistant) {
            if (this.modelUsesArrayContent) fileInputProcessor.unuseAll()
            window.desk.api.popHistory("user")
            if ((window.desk.api.getHistory() as any).chats.length > 1) {
                window.desk.api.saveConversation()
            } else {
                window.desk.api.deleteChat(window.desk.api.getmetadata()?.id)
            }
        }
        await BaseErrorHandler(error, this.userMessagePID, this.streamingPortal?.id, this.ErrorCallback || this.StartSession)
    }
}

export const completion = new CompletionBase()

globalEventBus.on('model:change', ((model: string) => {
    completion.modelName = model
}))

globalEventBus.on('useraction:request:execution', (text) => {
    completion.complete(text)
})
globalEventBus.on('thinkmode:change', (isOn) => {
    completion.REASONING_ON = isOn
})
