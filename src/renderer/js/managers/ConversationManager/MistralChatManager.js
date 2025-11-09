import { Mistral } from '@mistralai/mistralai';
import { HandleProcessingEventChanges } from "../../Utils/chatUtils";
import { CanvasUtil } from '../Canvas/CanvasUtils';
import { ChatUtil, ChatDisplay } from './util';
import { generateTextChunks } from '../../tests/AiSimulator';
import { handleRequestError } from '../../ErrorHandler/ErrorHandler';
import { StateManager } from '../StatesManager';
import { waitForElement } from '../../Utils/dom_utils';

const chatdisplay = new ChatDisplay()
const chatutil = new ChatUtil()
const canvasutil = new CanvasUtil()

const AutoScroll = document.getElementById("AutoScroll");

let MISTRAL_API_KEY = null

StateManager.set('codeBuffer', {})

/*
Object.defineProperty(window, "codeBuffer", {
    get() {
        return codeBuffer;
    },
    set(value) {
        codeBuffer = value;
    }
});
*/

StateManager.set('userMessage', null)
StateManager.set('aiMessage', null)
/*
Object.defineProperty(window, "userMessage", {
    get() {
        return userMessage;
    },
    set(value) {
        userMessage = value;
    }
});

Object.defineProperty(window, "aiMessage", {
    get() {
        return aiMessage;
    },
    set(value) {
        aiMessage = value;
    }
});
*/
async function loadApiKey() {
    const key = await window.desk.api2.getKeys('mistral');
    MISTRAL_API_KEY = key.mistralKey; // Assign to global variable
    //console.log("Loaded API:", MISTRAL_API_KEY)
}

await loadApiKey()
const Mistarlclient = new Mistral({ apiKey: MISTRAL_API_KEY });


export async function MistraChat(text, modelName) {
    try {
        console.log("Reached Mistral chat", text)
        chatutil.hide_suggestions()

        // Add user message to the chat interface
        //const userMesage = chatutil.addUserMessage(text, chatArea)

        const user_message_pid = window.reactPortalBridge.showComponentInTarget('UserMessage', 'chatArea', { message: text, fil_type: null, file_data_url: null, save: true })

        StateManager.set('user_message_pid', user_message_pid)

        // Add loading animation
        //const { loader, lid } = chatutil.addLoadingAnimation(chatArea);

        const loader_id = window.reactPortalBridge.showComponentInTarget('LoadingAnimation', 'chatArea')

        StateManager.set('loader-element-id', loader_id)

        StateManager.set('prev_ai_message_pid', StateManager.get('ai_message_pid'))

        let message_pid = window.streamingPortalBridge.createStreamingPortal('AiMessage', 'chatArea')


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
            model: modelName,
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
            const isDeepSeek = modelName === "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B";
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
                    console.log(StateManager.get('codeBuffer'))
                    window.canvasUpdate();
                });

            }

            if (actualResponse.startsWith('<continued>')) {
                message_pid = StateManager.get('prev_ai_message_pid')
                StateManager.set('ai_message_pid', message_pid)
            }

            window.streamingPortalBridge.updateStreamingPortal(message_pid, { actual_response: actualResponse, isThinking: isThinking, think_content: thinkContent });


            // Scroll to bottom
            chatutil.scrollToBottom(chatArea, true);

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
        //chatutil.render_math(`.${aiMessageUId}`)

        window.reactPortalBridge.closeComponent(loader_id)
    } catch (err) {
        window.reactPortalBridge.closeComponent(StateManager.get('loader-element-id'))
        handleRequestError(err, StateManager.get('user_message_pid'), StateManager.get('ai_message_pid'))
    }
}


export async function MistraMultimodal(text, fileType, fileDataUrl = null, modelName) {
    const _Timer = new window.Timer;
    chatutil.hide_suggestions()
    console.log('vision')
    StateManager.set('processing', true);

    console.log("Reached Mistral vision")

    let message_pid = window.streamingPortalBridge.createStreamingPortal('AiMessage', 'chatArea')
    StateManager.set("ai_message_pid", message_pid)

    // Add user message to the chat interface
    //chatutil.addUserMessage(text, chatArea, fileType, fileDataUrl, fileContainerId)

    const user_message_pid = window.reactPortalBridge.showComponentInTarget('UserMessage', 'chatArea', { message: text, fil_type: fileType, file_data_url: fileDataUrl, save: true })

    StateManager.set('user_message_pid', user_message_pid)

    const loader_id = window.reactPortalBridge.showComponentInTarget('LoadingAnimation', 'chatArea')

    StateManager.set('loader-element-id', loader_id)

    StateManager.set('prev_ai_message_pid', StateManager.get('ai_message_pid'))

    //Add Timestamp
    text = `${text} [${window.desk.api.getDateTime()} UTC]`

    //console.log(text)
    // Determine the content based on fileDataUrl
    let userContent;

    if (fileDataUrl) {
        //console.log("Image url present");
        if (fileType == "image") {
            const imageContent = fileDataUrl.map(_url => ({
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

        else if (fileType == "document") {
            const documentContent = fileDataUrl.map(_url => ({
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
        role: "user",
        content: userContent,
    });*/

    try {
        const visionstream = generateTextChunks(text)
        /* await Mistarlclient.chat.stream({
            model: modelName,
            messages: window.desk.api.clearImages(window.desk.api.getHistory()),
            max_tokens: 2000,
        });
        */
        // change send button appearance to processing status
        HandleProcessingEventChanges('show')

        //start timer
        _Timer.trackTime("start");

        let output = ""
        //const stream = window.generateTextChunks();

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
                    console.log(StateManager.get('codeBuffer'))
                    window.canvasUpdate();
                });
            }

            // Render diagrams
            //chatutil.render_math(`.${aiMessageUId}`)


            if (actualResponse.startsWith('<continued>')) {
                message_pid = StateManager.get('prev_ai_message_pid')
                StateManager.set('ai_message_pid', message_pid)
            }

            window.streamingPortalBridge.updateStreamingPortal(message_pid, { actual_response: actualResponse, isThinking: isThinking, think_content: thinkContent });

            // Scroll to bottom
            chatutil.scrollToBottom(chatArea, true);
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
        //chatutil.render_math(`.${aiMessageUId}`)

        window.reactPortalBridge.closeComponent(loader_id)

    } catch (error) {
        window.reactPortalBridge.closeComponent(StateManager.get('loader-element-id'))
        handleRequestError(err, StateManager.get('user_message_pid'), StateManager.get('ai_message_pid'), ["VS", fileType, fileDataUrl])
    }
}
