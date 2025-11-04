//import { CanvasUtil } from '../../Canvas/CanvasUtils';
import { ChatUtil } from './ConversationManager/util';
import { waitForElement } from '../Utils/dom_utils';
import { MistraChat, MistraMultimodal } from './ConversationManager/MistralChatManager';
import { StateManager } from './StatesManager';


const chatutil = new ChatUtil()
//const canvasutil = new CanvasUtil()

StateManager.set('processing', false)

/*
 * Object.defineProperty(window, "processing", {
    get() {
        return processing;
    },
    set(value) {
        processing = value;
    }
});
*/

const AllVisionModels = chatutil.get_vision_modesl()
const ms_models = chatutil.get_models()

export class Router {
    constructor() {
        //
    }

    async switchToVision() {
        // switch to vision model
        if (AllVisionModels.length > 0) {
            if (!AllVisionModels.includes(modelSelection.value)) {
                const res = this.change_model('mistral-small-latest')
                return res
            }
        } else {
            console.warn("No vision models detected");
        }
    }
    getModelValue() {
        return window.currentModel
    }

    change_model(value = 'mistral-large-latest') {
        try {
            document.getElementById('modelButton').click()
            const selector = document.getElementById('model-selector')
            selector.classList.add('hidden')
            waitForElement(`[data-value="${value}"]`, (el) => el.click())
            selector?.classList?.remove('hidden')

        } catch (err) {
            selector?.classList?.remove('hidden')
        }
    }

    async chooseRoute(event, chatArea=document.getElementById('chatArea')) {
        //document.querySelector(`[data-value="mistral-small-latest"]`).click();
        const fileDataUrl = event.detail.fileDataUrl;
        const text = event.detail.text;
        const fileType = event.detail.fileType

        //switch to vision model
        const res = await this.switchToVision()

        const modelName = this.getModelValue();

        if (!res === true) {
            console.log('fail')
        }

        if (ms_models.includes(modelName)) {
            MistraMultimodal(text, chatArea, fileType, fileDataUrl, modelName);
        } else {
            //window.VisionChat(text, chatArea, fileType, fileDataUrl, null);
        }
    }

    routeToMistral(text, chatArea, modelName = null, VS_url = null, fileDataUrl = null) {
        if(!text) window.ModalManager.showMessage("No text provided", "error")

        if (["pixtral-12b-2409", "pixtral-large-2411", "mistral-small-latest"].includes(modelName) || VS_url) {
            return MistraMultimodal(text, chatArea, VS_url, fileDataUrl, modelName)
        }
        MistraChat(text, chatArea, modelName)
    }

    /**
     * NOT YET INTEGRATED
    */
    routeToHf() {
        return
    }

    /**
     * Classify the input text by checking the current model category and
     * then route to the appropriate function.
     */
    requestRouter(text, chatArea=document.getElementById('chatArea')) {
        if(!text) window.ModalManager.showMessage("No text provided", "error")
        // clear buffer initialy
        StateManager.set('codeBuffer', null);

        if (StateManager.get('processing') === true) return;
        const model = this.getModelValue();

        // console.log("✅Reached Target requestRouter:")

        //Intercept image generation
        if (StateManager.get('imageGen', true)
        ) {
            //const imageGen = new window.ImageGenerator(chatArea);
            //imageGen.createImage(text)
            return
        }
        //console.log("DataClass:", dataClass); // This will log the value of the data-avalue attribute
        else if (ms_models.includes(model) || window.desk.api.getModel()==='multimodal') {
            this.routeToMistral(text, chatArea, model);
        } else {
            this.routeToHf(text, chatArea);

        }// else {
        //    console.warn("⚠️Unrecognized dataClass from the selected model!")
        //}
    }

}

StateManager.set('Router', Router)
