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


export async function MistraChat(text, chatArea, modelName) {
    try {
        console.log("Reached Mistral chat", text)
        chatutil.hide_suggestions()

        // Add user message to the chat interface
        const userMesage = chatutil.addUserMessage(text, chatArea)

        StateManager.set('userMessage', userMesage)

        // Add loading animation
        const { loader, lid } = chatutil.addLoadingAnimation(chatArea);

        StateManager.set('loader-element-id', lid)

        const foldId = `think-content-${Math.random().toString(33).substring(3, 9)}`;
        const exportId = `export-${Math.random().toString(33).substring(3, 9)}`;
        const aiMessageUId = `msg_${Math.random().toString(30).substring(3, 9)}`;

        const aiMessage = document.createElement("div")
        StateManager.set('PrevaiMessage', StateManager.get('aiMessage')
        )
        StateManager.set('aiMessage', aiMessage)

        aiMessage.classList.add("flex", "justify-start", "mb-12", "overflow-wrap");
        chatArea.appendChild(aiMessage)
        // Scroll to bottom
        chatutil.scrollToBottom(chatArea, true);

        // Create Timer object
        const _Timer = new window.Timer();

        //start timer
        _Timer.trackTime("start");

        HandleProcessingEventChanges('show')
        StateManager.set('processing', true);

        chatutil.removeLoadingAnimation()

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
                if (!canvasutil.isCanvasOn() && !StateManager.get('isCanvasActive')) chatutil.open_canvas();

                waitForElement('#code-view', (el) => {
                    el.innerHTML = StateManager.get('codeBuffer').code;
                    console.log(StateManager.get('codeBuffer'))
                    window.canvasUpdate();
                    chatdisplay.chats_size_adjust()
                });

            }

            if(actualResponse.startsWith('<continue>')){
                StateManager.set('aiMessage', StateManager.set('PrevaiMessage')
                )
            }
            //console.log(actualResponse)
            // Update innerHTML with marked output
            chatutil.addChatMessage(aiMessage, isThinking, thinkContent, actualResponse, aiMessageUId, exportId, foldId)

            // Scroll to bottom
            chatutil.scrollToBottom(chatArea, true);

            // Render mathjax immediately
            debounceRenderKaTeX(`.${aiMessageUId}`, 3000, false);
        }
        StateManager.set('processing', false);
        // solves aiMessage w-full issue
        if (canvasutil.isCanvasOn()) window.openCanvas();

        //stop timer
        _Timer.trackTime("stop");

        // Reset send button appearance
        HandleProcessingEventChanges("hide")

        // normalize canvas
        canvasutil.NormalizeCanvasCode();

        // Store conversation history
        window.desk.api.addHistory({ role: "assistant", content: output });

        // Render diagrams
        chatutil.render_math(aiMessageUId)

        chatutil.removeLoadingAnimation()
        chatdisplay.chats_size_adjust()
    } catch (err) {
        handleRequestError(err, chatArea, StateManager.get('userMessage'), StateManager.get('aiMessage'))
    }
}


export async function MistraMultimodal(text, chatArea, fileType, fileDataUrl = null, modelName) {
    const _Timer = new window.Timer;
    chatutil.hide_suggestions()
    console.log('vision')
    StateManager.set('processing', true);

    console.log("Reached Mistral vision")

    const fileContainerId = `FCont_${Math.random().toString(35).substring(2, 8)}`;

    StateManager.set('aiMessage', null, document.createElement("div"));

    let Message = StateManager.get("aiMessage")

    // Add user message to the chat interface
    chatutil.addUserMessage(text, chatArea, fileType, fileDataUrl, fileContainerId)


    // Add loading animation
    chatutil.addLoadingAnimation(Message);

    // Scroll to bottom
    chatutil.scrollToBottom(chatArea, true);

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

    const exportId = `export-${Math.random().toString(33).substring(3, 9)}`;
    const MessageUId = `msg_${Math.random().toString(30).substring(3, 9)}`;
    VisionMessage.classList.add("flex", "justify-start", "mb-12", "overflow-wrap");
    chatArea.appendChild(MultimodalMessage);
    const foldId = `think-content-${Math.random().toString(33).substring(3, 9)}`;

    // Add loading animation
    chatutil.addLoadingAnimation()

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
                if (!canvasutil.isCanvasOn() && !StateManager.get('isCanvasActive')) chatutil.open_canvas();

                waitForElement('#code-view', (el) => {
                    el.innerHTML = StateManager.get('codeBuffer').code;
                    console.log(StateManager.get('codeBuffer'))
                    window.canvasUpdate();
                    chatdisplay.chats_size_adjust()
                });
            }
        }

        chatutil.addMultimodalMessage(Message, isThinking, thinkContent, actualResponse, MessageUId, exportId, foldId)

        AutoScroll.checked ? chatutil.scrollToBottom(chatArea) : null;

        // Debounce MathJax rendering to avoid freezing
        debounceRenderKaTeX(`.${MessageUId}`, 3000, true);


        StateManager.set('processing', false);

        // solves aiMessage w-full issue
        if (canvasutil.isCanvasOn() && !StateManager.get('isCanvasActive')) window.openCanvas();

        //stop timer
        _Timer.trackTime("stop");

        // Reset send button appearance
        HandleProcessingEventChanges('hide')

        // normalize canvas
        canvasutil.NormalizeCanvasCode(document.getElementById('code-view'));

        //window.desk.api.addHistory({ role: "assistant", content: [{ type: "text", text: output }] });

        // render diagrams from this response
        chatutil.render_math(MessageUId)

        chatdisplay.chats_size_adjust()
    } catch (error) {
        handleRequestError(error, StateManager.get('userMessage'), StateManager.get('aiMessage'), ["VS", fileType, fileContainerId])
    }
}
