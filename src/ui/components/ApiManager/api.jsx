import { useEffect, useCallback, useState, useRef } from 'react';
import { StateManager } from '../../../core/managers/StatesManager';
import { ApiNotSetWarning } from './Modals/warn';
import { SuggestApiKeyConfig } from './Modals/suggestion';
import { modalmanager } from '../../../core/StatusUIManager/Manager';

StateManager.set('keychainValid', false)

export const APIKeysManager = ({ isOpen, onToggle }) => {

    //const [huggingfaceKey, sethuggingfaceKey] = useState('');
    const [MistralKeyChain, setMistralKeyChain] = useState({
        keys: []
    })
    const mistralAddKeyRef = useRef(null)
    const mistralNewKeyRef = useRef(null)

    useEffect(() => {
        if (MistralKeyChain.keys.length > 0) return
        loadKeyChain()
    })

    const toggleVisibility = useCallback((id) => {
        //const id = e.target?.parentElement?.firstChild.id
        //console.log(e.target?.parentElement)
        //if (!['mistralKeyMan', 'huggingfaceKeyMan', 'mistralKey', 'huggingfaceKey'].includes(id)) return
        const input = document.getElementById(id);
        input.type = input.type === 'password' ? 'text' : 'password';
    })


    const showApiQueryModal = useCallback(() => {
        closeWarningModal()
        closeApiNotSetWarning()
        const modal = document.getElementById('apiKeyModal');
        const modalContent = document.getElementById('apiKeyModalContent');
        modal.classList.remove('hidden');
        modalContent.classList.remove('animate-exit');
        modalContent.classList.add('animate-enter');
    })

    const closeApiQueryModal = useCallback(() => {
        /*
         * const mistralApiValue = document.getElementById('mistralKeyMan').value;
        const hfApiValue = document.getElementById('huggingfaceKeyMan').value;
        if (!mistralApiValue && !hfApiValue) {
            showApiNotSetWarning();
        }
        */
        const modal = document.getElementById('apiKeyModal');
        const modalContent = document.getElementById('apiKeyModalContent');

        modalContent.classList.remove('animate-enter');
        modalContent.classList.add('animate-exit');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    })

    const showApiManModal = useCallback(() => {
        const modal = document.getElementById('apiKeyManPage')
        const content = document.getElementById('apiManContent');

        modal.classList.remove('hidden');
        setTimeout(() => {
            content.classList.remove('translate-y-full', 'opacity-0');
            content.classList.add('translate-y-0', 'opacity-100');
        }, 10);
    })


    const hideApiManModal = useCallback(() => {
        const modal = document.getElementById('apiKeyManPage')
        const content = document.getElementById('apiManContent');

        content.classList.remove('translate-y-0', 'opacity-100');
        content.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    })

    const SaveKeyChain = useCallback(async () => {
        // Exit if no changes were made

        if (MistralKeyChain?.keys.length > 0) {
            const result = await window.desk.api2.saveKeyChain(JSON.stringify(MistralKeyChain));
            if (result.success) {
                //Load keys after saving
                loadKeyChain();

                //Close warning modals
                closeWarningModal();
                closeApiNotSetWarning();

                //Close Api query modal
                closeApiQueryModal();

                modalmanager.showMessage('API Key chain saved successfully.', 'success');
            }
        } else {
            showApiNotSetWarning();
        }
    })
    // Load keys from keytar via the preload API and mask them
    const loadKeyChain = useCallback(async () => {
        const raw_chain = await window.desk.api2.getKeyChain() || [];
        if (!raw_chain) return

        let chain
        try {
            chain = JSON.parse(raw_chain)
        } catch (err) {
            /*
            chain = {
                keys: [
                    { value: raw_chain, status: 'active' }
                ]
            }
            */
        }

        if (chain && chain.keys.length > 0) {
            StateManager.set('keychainValid', true)
            setMistralKeyChain({ keys: chain.keys })
        } else {
            showWarningModal();
        }
    })

    // Simple masking function: show only the last 4 characters
    function maskKey(key, options = {}) {
        if (!key || typeof key !== 'string') return '';

        const {
            visibleChars = 4,
            maskChar = '*',
            showLastChars = 2 // Optionally show last characters too
        } = options;

        if (key.length <= visibleChars + showLastChars) return key;

        const firstVisible = key.slice(0, visibleChars);
        const lastVisible = showLastChars > 0 ? key.slice(-showLastChars) : '';
        const maskedLength = key.length - visibleChars - showLastChars;
        const maskedSection = maskChar.repeat(Math.max(0, maskedLength));
        //console.log(firstVisible + maskedSection + lastVisible)
        return firstVisible + maskedSection + lastVisible;
    }

    // Reset keys (clear inputs)
    const resetKeys = useCallback(async () => {
        const result = await window.desk.api2.resetKeyChain(['mistral']);

        if (result) {
            modalmanager.showMessage('API Keys reset successfully.', 'success');
            StateManager.set('keychainValid', false)
            openApiModal()
        }
    })

    const openApiModal = useCallback(() => {
        document.getElementById('apiKeyModal').classList.remove('hidden');
    })


    const showWarningModal = useCallback(() => {
        // Logic to show the warning modal
        const warningModal = document.getElementById('warningModal');
        const warningModalContent = document.getElementById('warningModalContent');

        warningModal.classList.remove('hidden', 'pointer-events-none');

        warningModal.classList.add('pointer-events-auto');

        warningModalContent.classList.remove('animate-exit');
        warningModalContent.classList.add('animate-enter');
    })

    function closeWarningModal() {
        const warningModal = document.getElementById('warningModal');
        const warningModalContent = document.getElementById('warningModalContent');

        warningModalContent.classList.remove('animate-enter', 'pointer-events-auto');

        warningModalContent.classList.add('animate-exit');

        setTimeout(() => {
            warningModal.classList.add('hidden', 'pointer-events-none');
        })
    }

    const showApiNotSetWarning = useCallback(() => {
        const ApiwarnModal = document.getElementById('ApiNotSetModal');
        const ApiWarnContent = document.getElementById('ApiNotSetContent');
        ApiwarnModal.classList.remove('hidden');
        ApiWarnContent.classList.remove('animate-exit');
        ApiWarnContent.classList.add('animate-enter')
    })

    const closeApiNotSetWarning = useCallback(() => {
        const ApiwarnModal = document.getElementById('ApiNotSetModal');
        const ApiWarnContent = document.getElementById('ApiNotSetContent');
        ApiWarnContent.classList.remove('animate-enter');
        ApiWarnContent.classList.add('animate-exit');
        setTimeout(() => {
            ApiwarnModal.classList.add('hidden');
        }, 300)
    })

    function closeWarningQuery() {
        closeWarningModal()
        //showApiQueryModal()
    }

    function closeNotSetQuery() {
        closeApiNotSetWarning()
        //showApiQueryModal()
    }

    const onKeyDelete = useCallback((key) => {
        if (MistralKeyChain.keys.length === 1) resetKeys()

        const chain = { keys: MistralKeyChain.keys.filter(api => api.value != key.value) }
        setMistralKeyChain(chain)
    })

    const onKeyDisable = useCallback((key) => {
        const chain = MistralKeyChain.keys.map(api => {
            if (api.value == key.value) api.status = (['enabled', 'active'].includes(api.status)) ? 'disabled' : 'enabled'
            return api
        })

        setMistralKeyChain({ keys: chain })
    })

    const onNewKey = useCallback((new_key) => {
        const isValidKey = MistralKeyChain.keys.every((key) => key.value != new_key)
        if (!isValidKey) return modalmanager.showMessage('The key already exists. Ignoring', 'warn')

        const chain = MistralKeyChain.keys
        chain.push({ value: new_key, status: 'enabled' })

        setMistralKeyChain({ keys: chain })
        SaveKeyChain()
        //modalmanager.showMessage('Key Chain update with 1 addition', 'info')
    })


    return (
        <section>
            <div id="apiKeyModal" className="fixed inset-0 bg-black/60 backdrop-brightness-50 flex items-center justify-center z-50 p-4 transition-all duration-300 hidden">
                <div id="apiKeyModalContent" className="bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 opacity-0 backdrop-blur-lg">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200/50 dark:border-gray-700/50 p-6 rounded-t-2xl">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                                    API Keys
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Secure your API credentials
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Mistral API Key */}
                        <div className="space-y-3">
                            <label htmlFor="mistralKey" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span>Mistral API Key</span>
                            </label>
                            <div className="relative group">
                                <input
                                    ref={mistralNewKeyRef}
                                    id="mistralKey"
                                    type="password"
                                    defaultValue=''
                                    //onChange={(e) => setMistralKeyChain(e.target.value)}
                                    onKeyUp={(e) => {
                                        if (e.key === 'Enter' && e.target.value) {
                                            onNewKey(e.target.value)
                                            e.target.value = ''
                                        }
                                    }}
                                    placeholder="mk-..."
                                    className="w-full px-4 py-3 text-black dark:text-white bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 font-mono text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleVisibility('mistralKey')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group-hover:scale-110"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Your key is encrypted and stored securely</span>
                            </p>
                        </div>

                        {/* Security Note */}
                        <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Security First</p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                        API keys are stored locally and never shared with third parties.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-b-2xl">
                        <div className="flex space-x-3">
                            <button
                                onClick={closeApiQueryModal}
                                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                id="HandleKeysaveBt"
                                onClick={(e) => {
                                    if (mistralNewKeyRef.current.value) {
                                        onNewKey(mistralNewKeyRef.current.value)
                                        e.target.value = ''
                                    }
                                }}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Save Keys</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* KeyChain Management Modal */}
            <div id="apiKeyManPage" className="fixed inset-0 bg-black/60 backdrop-brightness-50 flex items-center justify-center z-50 p-4 transition-all duration-100 hidden">
                <div id="apiManContent" className="relative w-full max-w-2xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl backdrop-blur-lg transform transition-all duration-300 translate-y-full opacity-0">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200/50 dark:border-gray-700/50 p-4 py-2 lg:py-4 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-500/10 rounded-xl">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                                        Manage API Keys
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Update and secure your API credentials
                                    </p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={hideApiManModal}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
                            >
                                <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 lg:p-6 space-y-4 lg:space-y-6">
                        {/*API keychain Display*/}
                        <section className='space-y-3'>
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span>API Key Chain</span><span><span className='text-orange-400'>(</span><span className='tracking-wider'>{MistralKeyChain.keys.length}</span><span className='text-pink-400'>)</span></span>
                            </label>
                            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-primary-900/80 dark:primary-900/80 backdrop-blur-sm rounded-xl shadow-balanced-lg overflow-hidden border border-gray-500 border-b-2 dark:border-cyber-500/50 dark:border-t-primary-200/50 h-32 overflow-y-auto scroll-smooth scrollbar-custom">
                                <table className='divide-y divide-gray-200 dark:divide-gray-600/50 w-full'>
                                    <thead className="sticky z-30 top-0 left-0 right-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 dark:from-primary-950 dark:to-primary-950">
                                        <tr className='divide-x divide-gray-700/80'>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Key</th>
                                            <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                            <th className="px-2 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600/50 p-2 rounded-lg">
                                        {
                                            MistralKeyChain.keys.map((key, index) => {
                                                return <APIkey key={index} apikey={key} onDelete={onKeyDelete} onDisable={onKeyDisable} maskFn={maskKey} />
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </section>
                        {/* Mistral API Key */}
                        <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span>New API Key</span>
                            </label>
                            <div className="relative group">
                                <input
                                    ref={mistralAddKeyRef}
                                    id="mistralKeyMan"
                                    type="password"
                                    defaultValue=''
                                    //onChange={(e) => setMistralKeyChain(e.target.value)}
                                    onKeyUp={(e) => {
                                        if (e.key === 'Enter' && e.target.value) {
                                            onNewKey(e.target.value)
                                            e.target.value = ''
                                        }
                                    }}
                                    placeholder="Enter your Mistral API key (mk-...)"
                                    className="w-full px-4 py-3 text-black dark:text-white bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 rounded-xl focus:border-orange-500 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-none focus:outline-none transition-all duration-500 font-mono text-sm ease-in-out"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleVisibility('mistralKeyMan')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group-hover:scale-110"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Security Information */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Security Best Practices</p>
                                    <ul className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                                        <li>• API keys are encrypted and stored locally</li>
                                        <li>• Never share your keys with untrusted parties</li>
                                        <li>• Rotate keys regularly for enhanced security</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 p-6 py-2 rounded-b-2xl">
                        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                            <button
                                onClick={resetKeys}
                                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-gray-50 dark:hover:bg-slate-900 hover:border rounded-2xl border-gray-400 dark:border-primary-200 hover:translate-y-2 transition-all duration-500 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!MistralKeyChain}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.981-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Clear Key Chain</span>
                            </button>

                            <div className="flex space-x-3">
                                <button
                                    onClick={hideApiManModal}
                                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => SaveKeyChain()}
                                    className="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 hover:from-purple-600 hover:to-primary-700 text-white rounded-xl font-medium transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ApiNotSetWarning open={showApiQueryModal} close={closeWarningQuery} />

            {/* API Not Set Modal: At Least One API Required */}
            < SuggestApiKeyConfig open={showApiQueryModal} close={closeNotSetQuery} />
        </section>

    );
};

const APIkey = ({ apikey, maskFn, onDelete, onDisable }) => {
    const dotColors = {
        enabled: {
            bg: 'bg-orange-500',
            text: 'text-orange-500',
            animation: ''
        },
        active: {
            bg: 'bg-green-500',
            text: 'text-green-500',
            animation: 'animate-heartpulse-super ease-in-out'
        },
        disabled: {
            bg: 'bg-[#ff0000]',
            text: 'text-red-500',
            animation: ''
        }
    }
    return (
        <tr className='hover:bg-gray-50/50 dark:hover:bg-[#aa55ff]/10 transition-colors'>
            <td className="flex items-center space-x-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className={`ml-2 w-2 h-2 ${dotColors[apikey.status].bg} ${dotColors[apikey.status].animation} rounded-full`}></div>
                <span className='truncate font-mono'>{apikey.value}</span>
            </td>
            {/* Status */}
            <td>
                <span className={`${dotColors[apikey.status].text} text-xs font-handwriting`}>{apikey.status}</span>
            </td>
            {/* Actions */}
            <td className='flex space-x-3'>
                {/*Delete*/}
                <button onClick={() => onDelete(apikey)} className='flex space-x-1 text-red-500 dark:text-red-400 text-[15px]'>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.981-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                </button>
                {/*Disable*/}
                <button onClick={() => onDisable(apikey)} className={`flex text-[15px] space-x-2 ${apikey.status !== 'disabled' ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                    {apikey.status !== 'disabled' ? 'Disable' : 'Enable'}
                </button>
            </td>
        </tr>
    )
}
