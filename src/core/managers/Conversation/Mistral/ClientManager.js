import { Mistral } from '@mistralai/mistralai';
import { loadApiKeyChain } from "./shared"

/**
 * Handles:
 * - Mistral client creation and update
 * - API keychain rotation
 */
export class ClientManager {
    constructor(keychain) {
        this.keychain = keychain
        this.keychainLength
        this.CurrentKeyIndex = 0
        this.key
        this.MistralClient
        this.init()
    }
    async init() {
        if (!this.keychain) {
            const chain = await loadApiKeyChain()
            this.keychain = chain
        }
        if(!this.keychain?.keys) return

        this.keychainLength = this.keychain?.keys?.length || 0
        this.CurrentKeyIndex = 0
        this.key = this.keychain.keys[this.CurrentKeyIndex].value
        this.MistralClient = this.create_client()
    }

    /**
     * Moves to the next key in the key chain
     * @param {Number} steps
     */
    async rotate_keychain(steps = 1) {
        if(!this.keychain.keys || !this.keychain.length > 0) return 'All keys in the keychain have been tried. No valid/working key found!'

        const current_key = this.key
        this.CurrentKeyIndex += steps

        if (this.CurrentKeyIndex > this.keychainLength) {
            this.CurrentKeyIndex = 0
        }
        this.key = this.keychain.keys[this.CurrentKeyIndex].value

        this.keychain = this.keychain.keys.map(api => {
            if (api.value == current_key) api.status = 'disabled'
            if (api.value == this.key) api.status = 'active'
            return api
        })

        console.log(this.keychain)

        //Saved chain state
        this.save_chain()
        this.keychain = await loadApiKeyChain()

        this.MistralClient = this.create_client()
        console.log(this.keychain)
        return true
    }
    async save_chain() {
        const result = await window.desk.api2.saveKeyChain(JSON.stringify(this.keychain));
        if (result.success) return true
        return false
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

export let clientmanager = new ClientManager()


/*
uKcW35ywfRZVzWgT6Btih7kIolIKCnEQ
uKcW35ywfRZVzWgT6Btih7kIolIKCnEQ
 * */
