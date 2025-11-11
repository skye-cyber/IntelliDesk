import { Mistarlclient, appIsDev, chatutil, canvasutil } from "./shared"; // provides shared objects and imports for mistral models
import { StateManager } from '../../StatesManager';
import { waitForElement } from '../../../Utils/dom_utils';
import { GenerateId } from '../../../../../react-app/components/ConversationRenderer/Renderer';
import { generateTextChunks } from '../../../tests/AiSimulator';
import { handleDevErrors } from '../../../ErrorHandler/ErrorHandler';
import { HandleProcessingEventChanges } from "../../../Utils/chatUtils";
import errorHandler from "../../../../../react-app/components/ErrorHandler/ErrorHandler";


export async function MistraChat({ text, model_name = window.currentModel }) {
    try {
        if (!text.trim()) return console.log("Message is empty")
        // Create Timer object
        const _Timer = new window.Timer();

        //console.log("Reached Mistral chat", text)
        chatutil.hide_suggestions()

        const message_id = GenerateId('ai-msg');
        const export_id = GenerateId('export')
        const fold_id = GenerateId('fold')

        const user_message_portal = window.reactPortalBridge.showComponentInTarget('UserMessage', 'chatArea', { message: text, file_type: null, file_data_url: null, save: true }, 'user_message')

        window.desk.api.addHistory({ role: "user", content: text });

        StateManager.set('user_message_portal', user_message_portal)

        // Add loading animation
        //const { loader, lid } = chatutil.addLoadingAnimation(chatArea);

        const loader_id = window.reactPortalBridge.showComponentInTarget('LoadingAnimation', 'chatArea')

        StateManager.set('loader-element-id', loader_id)

        let message_portal = window.streamingPortalBridge.createStreamingPortal('AiMessage', 'chatArea', undefined, 'ai_message')

        // Scroll to bottom
        chatutil.scrollToBottom(chatArea, true);

        //start timer
        _Timer.trackTime("start");

        HandleProcessingEventChanges('show')
        StateManager.set('processing', true);

        /*
         * const stream = await Mistarlclient.chat.stream({
            model: model_name,
            messages: window.desk.api.getHistory(true),
            max_tokens: 3000
        });
        */


        const stream = generateTextChunks(text)

        let conversationName = null;
        let continued = false;
        let output = ""
        let thinkContent = "";
        let actualResponse = "";
        let isThinking = false;
        let fullResponse = "";
        let hasfinishedThinking = false;

        for await (const chunk of stream) {
            const choice = chunk?.data?.choices?.[0];
            if (!choice?.delta?.content) continue;
            const deltaContent = choice.delta.content;

            // Store raw content before any processing
            const rawDelta = deltaContent;
            output += rawDelta;
            fullResponse += rawDelta;

            // Name extraction with comprehensive handling
            if (output.includes("<name>")) {
                // Case 1: Complete name tag found
                if (output.includes("</name>")) {
                    const nameStart = output.indexOf("<name>") + 6;
                    const nameEnd = output.indexOf("</name>");

                    // Extract name and validate
                    conversationName = output.slice(nameStart, nameEnd).trim();

                    // Only proceed if name is valid
                    if (conversationName && conversationName.length > 0) {
                        // Remove everything up to and including the closing name tag
                        output = output.slice(nameEnd + 7); // 7 = length of "</name>"
                        fullResponse = output; // Reset fullResponse to content after name tag

                        // Reset other accumulators to maintain consistency
                        actualResponse = output;
                        thinkContent = "";

                        console.log("Conversation named:", conversationName);
                    } else {
                        // Invalid name, continue accumulating
                        console.warn("Empty name tag detected");
                    }
                }
                // Case 2: Incomplete name tag - continue accumulating
                else {
                    // If no closing tag after long stream assume all content is actual content and not name
                    if (output.length >= 50) {
                        output.replace("<name>", "")
                        actualResponse = output
                    } else {
                        continue;
                    }
                }
            }

            // Safety check: if output was cleared but no valid name was set
            if (!output && !conversationName) {
                console.warn("Output cleared without valid name extraction");
                output = rawDelta; // Restore at least the current delta
                continue;
            }

            // If we have a valid name and output is empty, wait for meaningful content
            if (conversationName && !output.trim()) {
                continue;
            }

            const hasThinkTag = output.includes("<think>");
            const isDeepSeek = model_name === "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B";
            const shouldStartThinking = !isThinking && (hasThinkTag || isDeepSeek);
            const shouldStopThinking = isThinking && output.includes("</think>");

            if (shouldStartThinking && !hasfinishedThinking) {
                isThinking = true;
                hasfinishedThinking = false;
                output = output.replace("<think>", "");
                thinkContent = output;
            } else if (shouldStopThinking) {
                isThinking = false;
                hasfinishedThinking = true;
                thinkContent += deltaContent.replace("</think>", "");
                output = output.replace("</think>", "");
            } else if (isThinking) {
                thinkContent += deltaContent;
            } else {
                actualResponse += deltaContent;
            }

            if (StateManager.get('codeBuffer') && StateManager.get('codeBuffer').code) {
                if (!canvasutil.isCanvasOn() && !canvasutil.isCanvasOpen()) chatutil.open_canvas();

                waitForElement('#code-view', (el) => {
                    el.innerHTML = StateManager.get('codeBuffer').code;
                    window.canvasUpdate();
                });
            }

            if (actualResponse.startsWith('<continued>')) {
                continued = true
            }

            if (continued) {
                let target_message_portal = StateManager.get('prev_ai_message_portal')
                actualResponse = actualResponse
                .replace("<continued>", "")
                .replace("</continued>", "")

                window.streamingPortalBridge.appendToStreamingPortal(target_message_portal, {
                    actual_response: deltaContent,
                    isThinking: isThinking,
                    think_content: thinkContent,
                    message_id: message_id,
                    export_id: export_id,
                    fold_id: fold_id,
                    conversation_name: conversationName
                });
            } else {
                window.streamingPortalBridge.updateStreamingPortal(message_portal, {
                    actual_response: actualResponse,
                    isThinking: isThinking,
                    think_content: thinkContent,
                    message_id: message_id,
                    export_id: export_id,
                    fold_id: fold_id,
                    conversation_name: conversationName
                });
            }

            // Scroll to bottom
            chatutil.scrollToBottom(chatArea, true, 0);

            // Render mathjax immediately
            // chatutil.render_math(`.${aiMessageUId}`, 3000)
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
            // Remove user message from interface
            window.reactPortalBridge.closeComponent(user_message_portal)

            // Reset store user message state
            StateManager.set('user_message_portal', null)

            window.desk.api.updateContinueHistory({
                role: "assistant",
                content: output
                    .replace("<continued>", "")
                    .replace("</continued>", "")
            })
        } else {
            window.desk.api.addHistory({ role: "assistant", content: output });
            StateManager.set('ai_message_portal', message_portal)
            StateManager.set('prev_ai_message_portal', StateManager.get('ai_message_portal'))
        }

        // Render diagrams
        chatutil.render_math()

        window.reactPortalBridge.closeComponent(loader_id)
    } catch (error) {
        window.reactPortalBridge.closeComponent(StateManager.get('loader-element-id'))
        console.log(error)
        appIsDev
            ? handleDevErrors(error, StateManager.get('user_message_portal'), StateManager.get('ai_message_portal'))
            : errorHandler.showError({ title: error?.name, message: error.message || error, retryCallback: MistraChat, callbackArgs: { text: text, model_name: model_name } })
    }
}


