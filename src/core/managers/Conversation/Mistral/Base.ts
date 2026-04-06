import { appIsDev, chatutil, canvasutil } from "./shared"; // provides shared objects and imports for mistral models
import { clientmanager } from "./ClientManager";
import { StateManager } from '../../StatesManager';
import { waitForElement } from '../../../Utils/dom_utils';
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
import { MistralAgents } from "@mistralai/mistralai/sdk/mistralagents";
import { Mistral } from '@mistralai/mistralai';
import { EventStream } from "@mistralai/mistralai/lib/event-streams";
import { CompletionEvent } from "@mistralai/mistralai/models/components/completionevent";

let ai_ms_pid

let SIGINT = false

// set event handlers
globalEventBus.on('sigint', () => SIGINT = true)
globalEventBus.on('model:change', (model: string) => { })

class CompletionBase {
    public modelName: string
    private caller: CallableFunction | undefined
    private ToolsEnabled: boolean
    private messagePortal: StreamController
    private streamingPortal: StreamController
    private output: string
    private fullResponse: string
    private thinkContent: string
    private actualResponse: string
    private isThinking: boolean
    private hasfinishedThinking: boolean
    private first_run: boolean
    private continued: boolean
    private rawDelta: string

    constructor(caller: CallableFunction | undefined = undefined) {
        this.modelName = StateManager.get('currentModel')
        this.caller = caller
        this.ToolsEnabled = false
        this.reset()
    }

    reset() {
        this.rawDelta = ''
        this.output = '';
        this.fullResponse = ''
        this.thinkContent = ''
        this.actualResponse = ''
        this.isThinking = false
        this.hasfinishedThinking = false
        this.first_run = true;
        this.continued = false
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
        ai_ms_pid = this.messagePortal
        StateManager.set('ai_messages_portal', this.messagePortal)

        // change send button appearance to processing status
        globalEventBus.emit('executioncycle:start')

        // Scroll to bottom
        globalEventBus.emit('scroll:bottom', true)
    }

    validateClientManager(callerName: CallableFunction): void {
        if (!clientmanager.MistralClient?.chat) {
            throw {
                origin: 'Mistral Client Call',
                message: 'Mistral client is not fully configured',
                type: 'Initialization',
                errorType: 'RuntimeError',
                stack: `${callerName || this.caller}\n at MistralClient.client.chat.stream`
            }
        }
    }

    checkTools(): boolean {
        // Initialize tools integration
        const availableTools = toolManager.getAvailableToolSchemas();
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
        } catch (error) {
            await BaseErrorHandler(error, this.streamingPortal, this.StartSession)
        }
    }
    async ToolStreamSession() {
        //
    }
    async StreamSession(): Promise<void> {
        // Use regular streaming without tools
        let stream = await mistralClientSimulator.client.chat.stream({ //clientmanager.MistralClient.chat.stream({
            model: this.modelName,
            messages: window.desk.api.getHistory(true),
            maxTokens: 3000,
        })
        await this.processStream(stream)
    }
    private think(contentChunk) {
        // Extract text from thinking array
        if (contentChunk.thinking && Array.isArray(contentChunk.thinking)) {
            for (const thought of contentChunk.thinking) {
                if (thought.type === "text" && thought.text) {
                    this.thinkContent += thought.text;
                }
            }
        }
    }
    private response(contentChunk) {
        // If we were thinking, now we've finished thinking
        if (this.isThinking) {
            this.hasfinishedThinking = true;
            this.isThinking = false;
        }

        this.actualResponse += contentChunk.text;
    }
    private streamArray(deltaContent) {
        // Process each content chunk in the array
        for (const contentChunk of deltaContent) {

            if (contentChunk.type === "thinking") {
                // Start or continue thinking
                this.isThinking = true;
                this.think(contentChunk)
            } else if (contentChunk.type === "text" && contentChunk.text) {
                // This is actual response text
                // Start or continue thinking
                this.isThinking = false;
                this.response(contentChunk)


            }
            // TODO: Handle other chunk types here
        }
    }
    private streamText(deltaContent) {
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
    private continueStream(content) {
        // In first run set <continue> tag as chunk to avoid breaking due to stray chunks that may be part of it. rawDelta cannot be anything except for items in the tag
        if (this.first_run) {
            this.rawDelta = "<continued>"
            // Remove user message from interface
            streamingPortalBridge.closeStreamingPortal(StateManager.get('user_message_portal'))
            this.first_run = false
        }
        this.continued = true

        let target_message_portal = StateManager.get('prev_ai_message_portal')

        // th now created portal and resuse the previous
        if (target_message_portal) {
            this.streamingPortal.close()
        } else {
            target_message_portal = this.streamingPortal
        }

        target_message_portal.append({
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
            });
    }
    async processStream(stream: EventStream<CompletionEvent>) {
        for await (const chunk of stream) {
            if (SIGINT) {
                SIGINT = false
                console.log("SIGINT ...")
                return
            }

            const choice = chunk?.data?.choices?.[0];
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
                this.continueStream(this.actualResponse)
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

            /*
             * Conversation continuation PROTOCOL
             * 1. Pop last user message that triggered continuation
             * 2. Modify the previous ai response and concatenate this response
             * 3. Store conversation history
             */
            if (this.continued) {
                // Reset store user message state
                StateManager.set('user_message_portal', null)

                window.desk.api.updateContinueHistory({
                    role: "assistant",
                    content: [{
                        type: "text",
                        text: this.fullResponse
                            .replace("<continued>", "")
                            .replace("</continued>", "")
                    }]
                })
            } else {
                const content = window.desk.api.getmetadata()?.model === 'multimodal' ?
                    [
                        { type: 'text', text: this.fullResponse }
                    ] :
                    this.fullResponse

                window.desk.api.addHistory({ role: "assistant", content: content });
                StateManager.set('ai_message_portal', this.streamingPortal)
                StateManager.set('prev_ai_message_portal', StateManager.get('ai_message_portal'))
            }
        }
    }
    async completeStream() {
        if (canvasutil.isCanvasOn()) {
            if (!canvasutil.isCanvasOpen()) chatutil.open_canvas();
            // normalize canvas
            canvasutil.NormalizeCanvasCode();
        }


        globalEventBus.emit('executioncycle:end')

        //stop timer
        //timer.trackTime("stop");

        // Reset send button appearance
        globalEventBus.emit('executioncycle:end')

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
    }
}
