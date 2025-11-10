import { Mistarlclient, appIsDev, chatutil, canvasutil } from "./shared"; // provides shared objects and imports for mistral models
import { StateManager } from '../../StatesManager';
import { waitForElement } from '../../../Utils/dom_utils';
import { GenerateId } from '../../../../../react-app/components/ConversationRenderer/Renderer';
import { generateTextChunks } from '../../../tests/AiSimulator';
import { handleDevErrors } from '../../../ErrorHandler/ErrorHandler';
import { HandleProcessingEventChanges } from "../../../Utils/chatUtils";
import errorHandler from "../../../../../react-app/components/ErrorHandler/ErrorHandler";

export async function MistraMultimodal({ text, model_name, file_type, file_data_url = null }) {
    const _Timer = new window.Timer;
    chatutil.hide_suggestions()
    //console.log('vision')
    StateManager.set('processing', true);

    const message_id = GenerateId('ai-msg');
    const export_id = GenerateId('export')
    const fold_id = GenerateId('fold')

    // Add user message to the chat interface
    const user_message_pid = window.reactPortalBridge.showComponentInTarget('UserMessage', 'chatArea', { message: text, file_type: file_type, file_data_url: file_data_url, save: true }, 'user_message')

    let message_pid = window.streamingPortalBridge.createStreamingPortal('AiMessage', 'chatArea', undefined, 'ai_message')

    StateManager.set("ai_message_pid", message_pid)

    StateManager.set('user_message_pid', user_message_pid)

    const loader_id = window.reactPortalBridge.showComponentInTarget('LoadingAnimation', 'chatArea')

    StateManager.set('loader-element-id', loader_id)

    StateManager.set('prev_ai_message_pid', StateManager.get('ai_message_pid'))

    //Add Timestamp
    //text = `${text} [${window.desk.api.getDateTime()} UTC]`

    //console.log(text)
    // Determine the content based on file_data_url
    let userContent;

    if (file_data_url) {
        //console.log("Image url present");
        if (file_type == "image") {
            const imageContent = file_data_url.map(_url => ({
                type: "image_url",
                imageUrl: {
                    url: _url,
                }
            }));

            userContent = [
                {
                    type: "text",
                    text: text,
                },
                ...imageContent // Spread the image content objects
            ];
        }

        else if (file_type == "document") {
            const documentContent = file_data_url.map(_url => ({
                type: "document_url",
                documentUrl: {
                    url: _url,
                }
            }));

            userContent = [
                {
                    type: "text",
                    text: text,
                },
                ...documentContent // Spread the document content objects
            ];
        }
    } else {
        //console.log("Url not found");
        userContent = [
            {
                type: "text",
                text: text,
            },
        ];
    }

    // Add user message to VisionHistory
    /*window.desk.api.addHistory({
     *        role: "user",
     *        content: userContent,
    });*/

    try {
        const visionstream = generateTextChunks(text)
        /* await Mistarlclient.chat.stream({
         *            model: model_name,
         *            messages: window.desk.api.clearImages(window.desk.api.getHistory()),
         *            max_tokens: 2000,
        });
        */
        // change send button appearance to processing status
        HandleProcessingEventChanges('show')

        //start timer
        _Timer.trackTime("start");

        let output = ""
        let thinkContent = "";
        let actualResponse = "";
        let isThinking = false;
        let fullResponse = "";
        let hasfinishedThinking = false;

        for await (const chunk of visionstream) {
            const choice = chunk?.data?.choices?.[0];
            if (!choice?.delta?.content) continue;
            const deltaContent = choice?.delta?.content;
            output += deltaContent;
            fullResponse += deltaContent;
            console.log(userContent)

            const hasThinkTag = output.includes("<think>");
            const shouldStartThinking = !isThinking && hasThinkTag;
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

            // Render diagrams
            //chatutil.render_math(`.${aiMessageUId}`)


            if (actualResponse.startsWith('<continued>')) {
                message_pid = StateManager.get('prev_ai_message_pid')
                StateManager.set('ai_message_pid', message_pid)
            }

            console.log(actualResponse)
            window.streamingPortalBridge.updateStreamingPortal(message_pid, { actual_response: actualResponse, isThinking: isThinking, think_content: thinkContent, message_id: message_id, export_id: export_id, fold_id: fold_id });

            // Scroll to bottom
            chatutil.scrollToBottom(chatArea, true, 0);
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
        HandleProcessingEventChanges('hide')

        //window.desk.api.addHistory({ role: "assistant", content: [{ type: "text", text: output }] });

        // render diagrams from this response
        chatutil.render_math()

        window.reactPortalBridge.closeComponent(loader_id)

    } catch (error) {
        window.reactPortalBridge.closeComponent(StateManager.get('loader-element-id'))
        appIsDev
            ? handleDevErrors(err, StateManager.get('user_message_pid'), StateManager.get('ai_message_pid'), file_type, file_data_url)
            : errorHandler.showError({ title: error.name, message: error.message || error, retryCallback: MistraMultimodal, callbackArgs: { text: text, model: model_name } })
    }
}
