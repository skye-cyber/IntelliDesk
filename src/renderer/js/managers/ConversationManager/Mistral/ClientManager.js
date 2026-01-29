import { Mistral } from '@mistralai/mistralai';
import { MISTRAL_API_KEY_CHAIN } from "./shared"

/**
 * Handles:
 * - Mistral client creation and update
 * - API keychain rotation
 */
export class ClientManager {
    constructor(keychain = MISTRAL_API_KEY_CHAIN) {
        this.keychain = keychain
        this.keychainLength = keychain.length
        this.CurrentKeyIndex = 0
        this.key = this.keychain[this.CurrentKeyIndex]
        this.MistralClient = this.create_client()
    }
    /**
     * Moves to the next key in the key chain
     * @param {Number} steps
     */
    rotate_keychain(steps = 1) {
        this.CurrentKeyIndex += steps

        if (this.CurrentKeyIndex > this.keychainLength) {
            this.CurrentKeyIndex = 0
        }
        this.key = this.keychain[this.CurrentKeyIndex]
    }
    /**
     * Create mistral client
     * @param {API_KEY} key
     * @returns {Object} Mistral
     */
    create_client(key = null) {
        return new Mistral({ apiKey: key ? key : this.key });
    }
}

export const clientmanager = new ClientManager()

/*
[
"rX65a7DkIdH0G3Vt0Os68ZVxifS0OAwH",
"QCpiwocfNZGtUbBZPiOaVqokimsxGwyt"
]
*/
