import { ChatUtil } from './ConversationManager/util';
import { waitForElement } from '../Utils/dom_utils';
import { MistraChat } from './ConversationManager/Mistral/Textual';
import { MistraMultimodal } from './ConversationManager/Mistral/MultiModal';
import { StateManager } from './StatesManager';


const chatutil = new ChatUtil()

StateManager.set('processing', false)


const multimodal = chatutil.get_multimodal_models()
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

    change_model(value = 'mistral-large-latest') {
        try {
            waitForElement('#model-selector', (context) => {
                waitForElement(`[data-value^="${value}"]`, (el) => el.click(), { context: context })
            })
        } catch (err) {
            console.log(err)
            //selector?.classList?.add('hidden')
        }
    }

    async chooseRoute(event) {
        //document.querySelector(`[data-value="mistral-small-latest"]`).click();
        const fileDataUrl = event.detail.fileDataUrl;
        const text = event.detail.text;
        const fileType = event.detail.fileType

        //switch to vision model
        const res = await this.switchToVision()

        const modelName = window.currentModel;

        if (!res === true) {
            console.log('fail')
        }

        if (ms_models.includes(modelName)) {
            MistraMultimodal({ text: text, model_name: modelName });
        } else {
            //window.VisionChat(text, chatArea, fileType, fileDataUrl, null);
        }
    }

    routeToMistral(text, modelName = null, file_type = null, fileDataUrl = null) {
        if (!text) window.ModalManager.showMessage("No text provided", "error")
        if (multimodal.includes(modelName)) {
            return MistraMultimodal({ text: text, model_name: modelName })
        }
        MistraChat({ text: text, model_name: modelName })
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
    requestRouter(text) {
        if (!text) window.ModalManager.showMessage("No text provided", "error")

        // clear buffer initialy
        StateManager.set('codeBuffer', null);

        if (StateManager.get('processing') === true) return;
        const model = window.currentModel;

        //Intercept image generation
        if (StateManager.get('imageGen', true)
        ) {
            //const imageGen = new window.ImageGenerator(chatArea);
            //imageGen.createImage(text)
            return
        }
        else if (ms_models.includes(model) || window.desk.api.getModel() === 'multimodal') {
            this.routeToMistral(text, model);
        }// else {
        // this.routeToHf(text);

        //} else {
        //    console.warn("⚠️Unrecognized dataClass from the selected model!")
        //}
    }

}

StateManager.set('Router', Router)
