import { Mistral } from '@mistralai/mistralai';
import { CanvasUtil } from '../../Canvas/CanvasUtils';
import { ChatUtil, ChatDisplay } from '../util';
import { MistralIntegration } from './MistralIntegration';

export const chatdisplay = new ChatDisplay()
export const chatutil = new ChatUtil()
export const canvasutil = new CanvasUtil()

export let MISTRAL_API_KEY = null

export const appIsDev = window.desk.api2.appIsDev

StateManager.set('codeBuffer', {})

StateManager.set('user_message_pid', null)
StateManager.set('ai_message_pid', null)

async function loadApiKey() {
    const key = await window.desk.api2.getKeys('mistral');
    MISTRAL_API_KEY = key.mistralKey; // Assign to global variable
    //console.log("Loaded API:", MISTRAL_API_KEY)
}

await loadApiKey()
export const Mistarlclient = new Mistral({ apiKey: MISTRAL_API_KEY });

// Initialize
export const mistral = new MistralIntegration(MISTRAL_API_KEY);


/*
Object.defineProperty(window, "codeBuffer", {
    get() {
        return codeBuffer;
    },
    set(value) {
        codeBuffer = value;
    }
});

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
