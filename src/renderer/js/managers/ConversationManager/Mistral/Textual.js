import { Mistarlclient, appIsDev, chatutil, canvasutil } from "./shared"; // provides shared objects and imports for mistral models
import { StateManager } from '../../StatesManager';
import { waitForElement } from '../../../Utils/dom_utils';
import { GenerateId } from '../../../../../react-app/components/ConversationRenderer/Renderer';
import { generateTextChunks } from '../../../tests/AiSimulator';
import { handleDevErrors } from '../../../ErrorHandler/ErrorHandler';
import { HandleProcessingEventChanges } from "../../../Utils/chatUtils";
import errorHandler from "../../../../../react-app/components/ErrorHandler/ErrorHandler";


export async function MistraChat({ text, model_name }) {
    try {
        console.log("Reached Mistral chat", text)
        chatutil.hide_suggestions()

        const message_id = GenerateId('ai-msg');
        const export_id = GenerateId('export')
        const fold_id = GenerateId('fold')

        const user_message_pid = window.reactPortalBridge.showComponentInTarget('UserMessage', 'chatArea', { message: text, file_type: null, file_data_url: null, save: true }, 'user_message')

        StateManager.set('user_message_pid', user_message_pid)

        // Add loading animation
        //const { loader, lid } = chatutil.addLoadingAnimation(chatArea);

        const loader_id = window.reactPortalBridge.showComponentInTarget('LoadingAnimation', 'chatArea')

        StateManager.set('loader-element-id', loader_id)

        StateManager.set('prev_ai_message_pid', StateManager.get('ai_message_pid'))

        let message_pid = window.streamingPortalBridge.createStreamingPortal('AiMessage', 'chatArea', undefined, 'ai_message')


        StateManager.set('ai_message_pid', message_pid)

        // Scroll to bottom
        chatutil.scrollToBottom(chatArea, true);

        // Create Timer object
        const _Timer = new window.Timer();

        //start timer
        _Timer.trackTime("start");

        HandleProcessingEventChanges('show')
        StateManager.set('processing', true);

        /*const stream = await Mistarlclient.chat.stream({
            model: model_name,
            messages: window.desk.api.getHistory(),
            max_tokens: 3000
        });
        */

        const stream = generateTextChunks()

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
            output += deltaContent;
            fullResponse += deltaContent;

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
                message_pid = StateManager.get('prev_ai_message_pid')
                StateManager.set('ai_message_pid', message_pid)
            }

            window.streamingPortalBridge.updateStreamingPortal(message_pid, { actual_response: actualResponse, isThinking: isThinking, think_content: thinkContent, message_id: message_id, export_id: export_id, fold_id: fold_id });


            // Scroll to bottom
            chatutil.scrollToBottom(chatArea, true, 0);

            // Render mathjax immediately
            // chatutil.render_math(`.${aiMessageUId}`, 3000)
        }

        StateManager.set('processing', false);

        if (canvasutil.isCanvasOn()) {
            if (!canvasutil.isCanvasOpen()) chatutil.open_canvas();
            // normalize canvas
            canvasutil.NormalizeCanvasCode();
        }

        //stop timer
        _Timer.trackTime("stop");

        // Reset send button appearance
        HandleProcessingEventChanges("hide")

        // Store conversation history
        //window.desk.api.addHistory({ role: "assistant", content: output });

        // Render diagrams
        chatutil.render_math()

        window.reactPortalBridge.closeComponent(loader_id)
    } catch (error) {
        window.reactPortalBridge.closeComponent(StateManager.get('loader-element-id'))
        console.log(error)
        !appIsDev
            ? handleDevErrors(error, StateManager.get('user_message_pid'), StateManager.get('ai_message_pid'))
            : errorHandler.showError({ title: error?.name, message: error.message || error, retryCallback: MistraChat, callbackArgs: { text: text, model: model_name } })
    }
}


