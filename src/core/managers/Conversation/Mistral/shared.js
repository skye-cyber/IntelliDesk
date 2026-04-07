import { CanvasUtil } from '../../Canvas/CanvasUtils';
import { ChatUtil, ChatDisplay } from '../util';
import { StateManager } from '../../StatesManager';

export const chatdisplay = new ChatDisplay()
export const chatutil = new ChatUtil()
export const canvasutil = new CanvasUtil()

StateManager.set('uploaded_files', [])

// export let MISTRAL_API_KEY = null
export let MISTRAL_API_KEY_CHAIN // Allow key rotation incase of hitting quota limit

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

StateManager.set('user_message_pid', null)
StateManager.set('ai_message_pid', null)

/*
 * async function loadApiKey() {
 *    const key = await window.desk.api2.getKeys('mistral');
 *    MISTRAL_API_KEY = key.mistralKey; // Assign to global variable
 *    console.log("Loaded API:", MISTRAL_API_KEY)
 * }
 */

export async function loadApiKeyChain() {
    try {
        const chain = await window.desk.api2.getKeyChain('mistral');
        const MISTRAL_API_KEY_CHAIN = JSON.parse(chain)
        // Return only the keys that are usable ie not disabled
        const usable_chain = { keys: MISTRAL_API_KEY_CHAIN.keys.filter(key => key.status != 'disabled') }
        return usable_chain
    } catch (err) {
        return undefined
    }
}

await loadApiKeyChain()
// await loadApiKey()
// export const Mistarlclient = new Mistral({ apiKey: MISTRAL_API_KEY });
