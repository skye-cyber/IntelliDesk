import { Mistarlclient, mistral, appIsDev, chatutil, canvasutil } from "./shared"; // provides shared objects and imports for mistral models
import { StateManager } from '../../StatesManager';
import { waitForElement } from '../../../Utils/dom_utils';
import { GenerateId } from '../../../../../react-app/components/ConversationRenderer/Renderer';
import { generateTextChunks, generateTextChunksAdvanced } from '../../../tests/AiSimulator';
import { handleDevErrors } from '../../../ErrorHandler/ErrorHandler';
import { HandleProcessingEventChanges } from "../../../Utils/chatUtils";
import errorHandler from "../../../../../react-app/components/ErrorHandler/ErrorHandler";
import { leftalinemath } from "../../../MathBase/mathRenderer";
import { renderAll_aimessages } from "../../../MathBase/mathRenderer";

let ai_ms_pid

export async function MistraChat({ text, model_name = window.currentModel }) {
    try {
        if (!text?.trim()) return console.log("Message is empty")
        console.log(text.replace(/(<br\s*[\d\S*]\/?>\s*){2,}/gi, '<br>'))
        // Create Timer object
        const _Timer = new window.Timer();

        StateManager.set('user-text', text)

        let message_id = GenerateId('ai-msg');
        const export_id = GenerateId('export')
        const fold_id = GenerateId('fold')

        const user_message_portal = window.reactPortalBridge.showComponentInTarget('UserMessage', 'chatArea', { message: text, file_type: null, file_data_url: null, save: true }, 'user_message')

        //window.desk.api.addHistory({ role: "user", content: text });

        StateManager.set('user_message_portal', user_message_portal)

        const loader_id = window.reactPortalBridge.showComponentInTarget('LoadingAnimation', 'chatArea', {}, "loader")

        StateManager.set('loader-element-id', loader_id)

        let message_portal = window.streamingPortalBridge.createStreamingPortal('AiMessage', 'chatArea', undefined, 'ai_message')

        // This shall be for errors
        ai_ms_pid = message_portal

        // Scroll to bottom
        chatutil.scrollToBottom(chatArea, true);

        //start timer
        _Timer.trackTime("start");

        HandleProcessingEventChanges('show')
        StateManager.set('processing', true);

        const stream = generateTextChunks() /*await mistral.client.chat.stream({
            model: model_name,
            messages: window.desk.api.getHistory(true),
            max_tokens: 3000
        });*/


        //const stream = generateTextChunks(text)
        let conversationName = null;
        let continued = false;
        let output = ""
        let thinkContent = "";
        let actualResponse = "";
        let isThinking = false;
        let fullResponse = "";
        let hasfinishedThinking = false;
        let firt_run = true;

        for await (const chunk of stream) {
            const choice = chunk?.data?.choices?.[0];
            if (!choice?.delta?.content) continue;
            const deltaContent = choice.delta.content;

            // Store raw content before any processing
            let rawDelta = deltaContent;
            output += rawDelta;
            fullResponse += rawDelta;

            // === NAME EXTRACTION (Highest Priority) ===
            if (!conversationName && (output.includes("<name>") || output.includes("<name"))) {
                actualResponse = ""; // Hold response during name extraction

                const nameStart = output.indexOf("<name>");
                const nameEnd = output.indexOf("</name>");

                // Case 1: Complete name tag found
                if (nameStart !== -1 && nameEnd !== -1 && nameEnd > nameStart) {
                    conversationName = output.slice(nameStart + 6, nameEnd).trim();

                    if (conversationName.length > 0) {
                        // Remove name tag from output
                        output = output.slice(0, nameStart) + output.slice(nameEnd + 7);

                        // CRITICAL: Clean any stray name tokens from thinkContent
                        const strayNameIndex = thinkContent.indexOf("<name>");
                        if (strayNameIndex !== -1) {
                            thinkContent = thinkContent.slice(0, strayNameIndex);
                        }

                        // Sync accumulators
                        fullResponse = output;
                        actualResponse = output;
                        //console.log("Conversation named:", conversationName);
                    } else {
                        console.warn("Empty name tag detected");
                        output = output.replace("<name></name>", "");
                        actualResponse = output;
                    }
                }
                // Case 2: Incomplete tag timeout (prevent infinite wait)
                else if (output.length >= 200) {
                    console.warn("Name tag incomplete after 200 chars, treating as plain text");
                    output = output
                        .replace(/<name>?/g, "") // Remove both <name> and <name
                        .replace("<name>", "")
                        .replace("</name>", "")

                    actualResponse = output;
                } else {
                    // Continue accumulating for complete tag
                    continue;
                }
            }

            // Safety: Restore delta if output cleared unexpectedly
            if (!output && !conversationName) {
                console.warn("Output cleared without valid name extraction");
                output = deltaContent;
                fullResponse = deltaContent;
                actualResponse = output;
                continue;
            }

            // Wait for content after name extraction
            if (conversationName && !output.trim()) {
                continue;
            }

            if (output.includes("<think>") && !isThinking && !hasfinishedThinking) {
                isThinking = true;
                hasfinishedThinking = false;
                output = output.replace("<think>", "");
                thinkContent = output;
                actualResponse = " "
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

            //console.log("OUT:", output)
            if (StateManager.get('codeBuffer') && StateManager.get('codeBuffer').code) {
                if (!canvasutil.isCanvasOn() && !canvasutil.isCanvasOpen()) chatutil.open_canvas();

                waitForElement('#code-view', (el) => {
                    el.innerHTML = StateManager.get('codeBuffer').code;
                    window.canvasUpdate();
                });
            }

            if (actualResponse?.includes('<continued>') || actualResponse?.includes('<continued')) {
                // In first run set <continue> tag as chunk to avoid breaking due to stary chunks that may be part of it, rawDelta cannot be anything except for items in the tage
                if (firt_run) {
                    rawDelta = "<continued>"
                    // Remove user message from interface
                    window.reactPortalBridge.closeComponent(user_message_portal)
                    firt_run = false
                }
                continued = true

                let target_message_portal = StateManager.get('prev_ai_message_portal')

                // th now created portal and resuse the previous
                if (target_message_portal) {
                    window.streamingPortalBridge.closeStreamingPortal(message_portal)
                } else {
                    target_message_portal = message_portal
                }

                window.streamingPortalBridge.appendToStreamingPortal(target_message_portal, {
                    actual_response: rawDelta,
                    isThinking: isThinking,
                    think_content: thinkContent,
                    message_id: message_id,
                    export_id: export_id,
                    fold_id: fold_id,
                    conversation_name: conversationName
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
                window.streamingPortalBridge.updateStreamingPortal(message_portal, {
                    actual_response: actualResponse,
                    isThinking: isThinking,
                    think_content: thinkContent, //?.replace("<think>",""),
                    message_id: message_id,
                    export_id: export_id,
                    fold_id: fold_id,
                    conversation_name: conversationName
                });
            }

            chatutil.render_math(`${message_id}`, 2000)

            // Scroll to bottom
            chatutil.scrollToBottom(chatArea, true, 1000);

            // Render mathjax immediately
            if (!message_id) message_id = window.StateManager.get("current_message_id", message_id)
        }

        StateManager.set('processing', false);

        if (conversationName && conversationName !== "null") window.desk.api.updateName(conversationName, false)

        if (canvasutil.isCanvasOn()) {
            if (!canvasutil.isCanvasOpen()) chatutil.open_canvas();
            // normalize canvas
            canvasutil.NormalizeCanvasCode();
        }

        //stop timer
        _Timer.trackTime("stop");

        // Reset send button appearance
        HandleProcessingEventChanges("hide")

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
                content: fullResponse
                    .replace("<continued>", "")
                    .replace("</continued>", "")
            })
        } else {
            //window.desk.api.addHistory({ role: "assistant", content: fullResponse });
            StateManager.set('ai_message_portal', message_portal)
            StateManager.set('prev_ai_message_portal', StateManager.get('ai_message_portal'))
        }

        // Render diagrams--last round
        message_id ? chatutil.render_math(`${message_id}`) : renderAll_aimessages()
        setTimeout(() => { leftalinemath() }, 1000)

        window.reactPortalBridge.closeComponent(loader_id)

        if (await appIsDev()) errorHandler.resetRetryCount()
    } catch (error) {
        HandleProcessingEventChanges("hide")
        window.desk.api.popHistory("user")
        window.reactPortalBridge.closeComponent(StateManager.get('user_message_portal'))
        window.streamingPortalBridge.closeStreamingPortal(ai_ms_pid)
        window.reactPortalBridge.closeComponent(StateManager.get('loader-element-id'))
        //console.log(error)
        await appIsDev()
            ? handleDevErrors(error, StateManager.get('user_message_portal'), StateManager.get('ai_message_portal'), text)
            : errorHandler.showError({ title: error?.name, message: error.message || error, retryCallback: MistraChat, callbackArgs: { text: text, model_name: model_name } })
    }
}


