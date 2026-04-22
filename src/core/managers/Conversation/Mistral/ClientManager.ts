/// <reference path="../../../../main/preload.type.ts" />
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
    async rotate_keychain(steps = 1): Promise<boolean | void> {
        if (!this.validateChain()) return

        // Deep clone--Store original state for rollback if needed
        const originalKeychain = structuredClone(this.keychain); //{ ...this.keychain! }
        const originalIndex = this.CurrentKeyIndex
        const originalLength = this.keychainLength
        const originalKey = this.key

        this.CurrentKeyIndex = (this.CurrentKeyIndex + steps) % this.keychainLength
        if (this.CurrentKeyIndex < 0) {
            this.CurrentKeyIndex += this.keychainLength
        }

        const newActiveKeyValue = this.keychain!.keys[this.CurrentKeyIndex].value;

        // Create new keys array to avoid mutating original
        // BUG FIX #1: Don't mark rotated keys as 'disabled' — that causes them to be filtered out on reload. Use 'inactive' so keys remain in the pool.
        const keys = this.keychain!.keys.map(api => {
            if (api.value === newActiveKeyValue) {
                return { ...api, status: 'active' };
            }
            // Only deactivate the previously active key, preserve other statuses
            if (api.status === 'active') {
                return { ...api, status: 'inactive' };
            }
            return api;
        }) as keys;

        console.log("Keys:", keys, "Length:", this.keychainLength)

        this.keychain!.keys = keys
        this.key = newActiveKeyValue

        if (this.keychainLength === this.keychain?.keys.length) {
            const saveSuccess = await this.save_chain()
            if (!saveSuccess) {
                console.warn('Failed to save keychain, reverting')
                this.keychain = originalKeychain
                this.CurrentKeyIndex = originalIndex
                this.keychainLength = originalLength
                this.key = this.keychain.keys[this.CurrentKeyIndex].value
                return false
            }
        }

        // Verify the key still exists after reload
        const newKeychain = await loadApiKeyChain()
        if (!newKeychain || !newKeychain.keys.length) {
            globalEventBus.emit('keychain:error', 'Failed to reload keychain')
            this.keychain = originalKeychain
            this.CurrentKeyIndex = originalIndex
            this.keychainLength = originalLength
            if (this.keychain) this.key = this.keychain?.keys[this.CurrentKeyIndex].value
            return false
        }

        // Check if our key still exists
        const keyExists = newKeychain.keys.some((k: KEY) => k.value === this.key)
        if (!keyExists) {
            // Find the first active key, or fallback to first key
            const nextKey = newKeychain.keys.find((k: KEY) => k.status === 'active')
                || newKeychain.keys[0]
            if (!nextKey || !nextKey.value) {
                globalEventBus.emit('keychain:error', 'No usable keys available')
                this.keychain = originalKeychain;
                this.CurrentKeyIndex = originalIndex;
                this.keychainLength = originalLength;
                this.key = originalKey;
                return false;
            }

            this.key = nextKey.value
            this.CurrentKeyIndex = newKeychain.keys.indexOf(nextKey)
        }

        this.keychain = newKeychain
        this.keychainLength = this.keychain.keys.length
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
