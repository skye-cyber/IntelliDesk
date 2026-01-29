import { CanvasUtil } from '../../Canvas/CanvasUtils';
import { ChatUtil, ChatDisplay } from '../util';
import { StateManager } from '../../StatesManager';

export const chatdisplay = new ChatDisplay()
export const chatutil = new ChatUtil()
export const canvasutil = new CanvasUtil()

StateManager.set('uploaded_files', [])

// export let MISTRAL_API_KEY = null
export let MISTRAL_API_KEY_CHAIN = [] // Allow key rotation incase of hitting quota limit

let globalIsDev = false;

export const appIsDev = async () => {
    try {
        globalIsDev = await window.desk.api2.appIsDev();
        return globalIsDev || false;
    } catch (error) {
        console.error('Error checking dev mode:', error);
        return false;
    }
};

StateManager.set('codeBuffer', {})

StateManager.set('user_message_pid', null)
StateManager.set('ai_message_pid', null)

/*
 * async function loadApiKey() {
 *    const key = await window.desk.api2.getKeys('mistral');
 *    MISTRAL_API_KEY = key.mistralKey; // Assign to global variable
 *    console.log("Loaded API:", MISTRAL_API_KEY)
 * }
 */

async function loadApiKeyChain() {
    const MISTRAL_API_KEY_CHAIN = await window.desk.api2.getKeyChain('mistral');
    console.log("Loaded KEYCHAIN:", MISTRAL_API_KEY_CHAIN)
}

await loadApiKeyChain()
// await loadApiKey()
// export const Mistarlclient = new Mistral({ apiKey: MISTRAL_API_KEY });
