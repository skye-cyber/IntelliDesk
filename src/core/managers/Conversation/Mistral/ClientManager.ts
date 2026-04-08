import { Mistral } from '@mistralai/mistralai';
import { globalEventBus } from '../../../Globals/eventBus';

interface KEY {
    value: string
    status: 'active' | 'enabled' | 'disabled'
}

type keys = Array<KEY>

interface KeyChainType {
    keys: keys
}

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

/**
 * Handles:
 * - Mistral client creation and update
 * - API keychain rotation
 */
export class ClientManager {
    private keychain: KeyChainType | undefined
    private keychainLength: number
    private CurrentKeyIndex: number
    private key: string
    public client: Mistral

    constructor(keychain: KeyChainType | undefined = undefined) {
        this.keychain = keychain
        this.CurrentKeyIndex = 0
        this.client
        this.init()
    }
    async init() {
        if (!this.keychain) {
            const chain = await loadApiKeyChain()
            if (!this.keychain && chain && chain?.keys.length > 0) {
                this.keychain = chain
            } else {
                return globalEventBus.emit('keychain:error', 'Not usable keys found')
            }
        }

        if (!this.keychain?.keys || this.keychain?.keys.length === 0) return

        this.keychainLength = this.keychain?.keys?.length || 0
        this.CurrentKeyIndex = 0
        this.key = this.keychain.keys[this.CurrentKeyIndex].value
        this.client = this.create_client() as any
    }
    validateChain(): boolean {
        let message: string | undefined = undefined
        if (!this.keychain) {
            message = 'Missing keychain'
        }
        else if (!this.keychain.keys) {
            message = 'Empty keychain'
        }
        else if (this.keychain.keys.length === 0) {
            message = 'No valid/working key found!'
        }
        if (message) {
            globalEventBus.emit('keychain:error', message)
            return false
        }
        return true
    }
    /**
     * Moves to the next key in the key chain
     * @param {Number} steps
     */
    async rotate_keychain(steps = 1): Promise<boolean | void> {
        if (!this.validateChain()) return

        const current_key = this.key
        this.CurrentKeyIndex += steps

        if (this.CurrentKeyIndex > this.keychainLength) {
            this.CurrentKeyIndex = 0
        }
        console.log(this.CurrentKeyIndex, this.keychain?.keys[this.CurrentKeyIndex])
        this.key = this.keychain?.keys[this.CurrentKeyIndex]?.value as string

        let keys: keys = []

        this.keychain?.keys.map(api => {
            if (api.value == current_key) api.status = 'disabled'
            if (api.value == this.key) api.status = 'active'
            keys.push(api)
        })

        if (keys.length > 0 && this.keychain) this.keychain.keys = keys

        console.log(this.keychain)

        //Saved chain state
        this.save_chain()
        this.keychain = await loadApiKeyChain()

        this.client = this.create_client()
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
