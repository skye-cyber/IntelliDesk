import { useEffect, useCallback, useState, useRef } from 'react';
import { StateManager } from '../../../core/managers/StatesManager.ts';
import { modalmanager } from '../../../core/StatusUIManager/Manager';
import { ApiNotSetWarning } from './warning';
import { RequestApiKeyConfig } from './Request';
import { KeyChainManagementModal } from './KeyChainManagementModal';
import { globalEventBus } from '../../../core/Globals/eventBus';

StateManager.set('keychainValid', false);

interface APIKeysManagerProps {
    isOpen: boolean;
    onToggle: () => void;
}

interface KEY {
    value: string
    status: string
}

interface keychain {
    keys: Array<KEY>
}

export const APIKeysManager = ({ isOpen, onToggle }: APIKeysManagerProps) => {
    // State
    const [mistralKeyChain, setMistralKeyChain] = useState<keychain>({ keys: [] });
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [isApiNotSetModalOpen, setIsApiNotSetModalOpen] = useState(false);
    const [isApiQueryModalOpen, setIsApiQueryModalOpen] = useState(false);
    const [isKeyManModalOpen, setIsKeyManModalOpen] = useState(false);

    // Refs
    const addKeyRef = useRef<HTMLInputElement>(null);
    // const newKeyRef = useRef<HTMLInputElement>(null);

    // Helper: Mask API key
    const maskKey = useCallback((key: string, options = { visibleChars: 4, maskChar: '*', showLastChars: 2 }) => {
        if (!key || typeof key !== 'string') return '';
        const { visibleChars, maskChar, showLastChars } = options;
        if (key.length <= visibleChars + showLastChars) return key;
        const firstVisible = key.slice(0, visibleChars);
        const lastVisible = showLastChars > 0 ? key.slice(-showLastChars) : '';
        const maskedLength = key.length - visibleChars - showLastChars;
        const maskedSection = maskChar.repeat(Math.max(0, maskedLength));
        return firstVisible + maskedSection + lastVisible;
    }, []);

    // Load keys from keytar via preload API
    const loadKeyChain = useCallback(async () => {
        try {
            const raw_chain = await window.desk.api2.getKeyChain() || [];
            if (!raw_chain) return;
            let chain: keychain;
            try {
                chain = JSON.parse(raw_chain);
            } catch (err) {
                // If parsing fails, treat as single key
                if (typeof raw_chain === 'string' && raw_chain.length > 0) {
                    chain = { keys: [{ value: raw_chain, status: 'active' }] };
                } else {
                    chain = { keys: [] };
                }
            }

            if (chain && chain.keys.length > 0) {
                StateManager.set('keychainValid', true);
                setMistralKeyChain({ keys: chain.keys });
            } else {
                setIsWarningModalOpen(true);
            }
        } catch (error) {
            console.error('Failed to load keychain:', error);
            modalmanager.showMessage('Failed to load API keys', 'error');
        }
    }, []);

    // Save key chain
    const saveKeyChain = useCallback(async (chain: keychain) => {
        const KeyChain = chain ? chain : mistralKeyChain
        if (KeyChain?.keys.length > 0) {
            try {
                const result = await window.desk.api2.saveKeyChain(JSON.stringify(KeyChain));
                if (result.success) {
                    await loadKeyChain();
                    setIsWarningModalOpen(false);
                    setIsApiNotSetModalOpen(false);
                    setIsApiQueryModalOpen(false);
                    modalmanager.showMessage('API Key chain saved successfully.', 'success');
                }
            } catch (error) {
                console.error('Failed to save keychain:', error);
                modalmanager.showMessage('Failed to save API keys', 'error');
            }
        } else {
            setIsApiNotSetModalOpen(true);
        }
    }, [mistralKeyChain]);

    // Reset keys
    const resetKeys = useCallback(async () => {
        try {
            const result = await window.desk.api2.resetKeyChain(['mistral']);
            if (result) {
                modalmanager.showMessage('API Keys reset successfully.', 'success');
                StateManager.set('keychainValid', false);
                setMistralKeyChain({ keys: [] });
                setIsApiQueryModalOpen(true);
                setIsKeyManModalOpen(false);
            }
        } catch (error) {
            console.error('Failed to reset keys:', error);
            modalmanager.showMessage('Failed to reset API keys', 'error');
        }
    }, [mistralKeyChain]);

    // Delete a key
    const onKeyDelete = useCallback((key: { value: string; status: string }) => {
        if (mistralKeyChain.keys.length === 1) {
            resetKeys();
            return;
        }
        const chain = { keys: mistralKeyChain.keys.filter(api => api.value !== key.value) };
        setMistralKeyChain(chain);
    }, [mistralKeyChain]);

    // Toggle key status (enable/disable)
    const onKeyDisable = useCallback((key: { value: string; status: string }) => {
        const chain = {
            keys: mistralKeyChain.keys.map(api => {
                if (api.value === key.value) {
                    api.status = (['enabled', 'active'].includes(api.status)) ? 'disabled' : 'enabled';
                }
                return api;
            })
        };
        setMistralKeyChain(chain);
    }, [mistralKeyChain]);

    // Add new key
    const onNewKey = useCallback((new_key: string) => {
        const isValidKey = mistralKeyChain.keys.every((key) => key.value !== new_key);
        if (!isValidKey) {
            modalmanager.showMessage('The key already exists. Ignoring', 'warn');
            return;
        }
        const chain = { keys: [...mistralKeyChain.keys, { value: new_key, status: 'enabled' }] };
        setMistralKeyChain(chain);
        saveKeyChain(chain);
    }, [mistralKeyChain]);

    // Modal control functions
    const showApiQueryModal = useCallback(() => {
        setIsWarningModalOpen(false);
        setIsApiNotSetModalOpen(false);
        setIsKeyManModalOpen(true);
    }, []);

    const closeApiQueryModal = useCallback(() => {
        setIsApiQueryModalOpen(false);
    }, []);


    const hideApiManModal = useCallback(() => {
        setIsKeyManModalOpen(false);
    }, []);

    const closeWarningQuery = useCallback(() => {
        setIsWarningModalOpen(false);
    }, []);

    const closeNotSetQuery = useCallback(() => {
        setIsApiNotSetModalOpen(false);
    }, []);

    // Load keys when component mounts or when API query modal opens
    useEffect(() => {
        if (!mistralKeyChain || mistralKeyChain.keys.length === 0) {
            loadKeyChain();
        }
    }, [isApiQueryModalOpen, mistralKeyChain.keys.length, loadKeyChain]);

    useEffect(() => {
        const apiWarning = globalEventBus.on('apikey:missing:warning:show', () => setIsWarningModalOpen(true))
        const managerOpenListener = globalEventBus.on('keychain:manager:show', () => setIsKeyManModalOpen(true))
        return () => {
            managerOpenListener.unsubscribe()
            apiWarning.unsubscribe()
        }
    })

    return (
        <section>
            {/* Warning and Suggestion Modals */}
            <ApiNotSetWarning
                onOpen={showApiQueryModal}
                onClose={closeWarningQuery}
                isOpen={isWarningModalOpen}
            />

            {/* KeyChain Management Modal */}
            <KeyChainManagementModal
                isOpen={isKeyManModalOpen}
                onClose={hideApiManModal}
                mistralKeyChain={mistralKeyChain}
                addKeyRef={addKeyRef as any}
                onNewKey={onNewKey}
                onKeyDelete={onKeyDelete}
                onKeyDisable={onKeyDisable}
                onReset={resetKeys}
                onSave={saveKeyChain as any }
                maskFn={maskKey}
                onToggleVisibility={(id) => {
                    const input = document.getElementById(id) as HTMLInputElement;
                    if (input) input.type = input.type === 'password' ? 'text' : 'password';
                }}
            />

            <RequestApiKeyConfig
                onClose={closeNotSetQuery}
                isOpen={true}
                onConfigure={closeApiQueryModal}

            />
        </section>
    );
};
