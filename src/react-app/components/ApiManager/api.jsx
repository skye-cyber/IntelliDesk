import React, { useEffect, useCallback, useState } from 'react';
import { StateManager } from '../../../renderer/js/managers/StatesManager';

StateManager.set('api_key_ok', false)

export const APIKeysManager = ({ isOpen, onToggle }) => {

    const [huggingfaceKey, sethuggingfaceKey] = useState('');
    const [mistralKey, setmistralKey] = useState('')

    useEffect(() => {
        loadKeys()
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
            content.classList.remove('translate-y-8', 'opacity-0');
            content.classList.add('translate-y-0', 'opacity-100');
        }, 10);
    })


    const hideApiManModal = useCallback(() => {
        const modal = document.getElementById('apiKeyManPage')
        const content = document.getElementById('apiManContent');

        content.classList.remove('translate-y-0', 'opacity-100');
        content.classList.add('translate-y-8', 'opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 510);
    })

    // Save keys using keytar via the preload API
    const HandleKeysave= useCallback(async (task = 'create') => {
        let mistralKey;
        let huggingfaceKey
        if (task === 'create') {
            mistralKey = document.getElementById('mistralKey').value
            huggingfaceKey = document.getElementById('huggingfaceKey').value
        } else {
            mistralKey = document.getElementById('mistralKeyMan').value
            huggingfaceKey = document.getElementById('huggingfaceKeyMan').value
        }

        // Only update changed/edited fields, marked by mask *
        mistralKey = mistralKey.includes('*') ? null : mistralKey;
        huggingfaceKey = huggingfaceKey.includes('*') ? null : huggingfaceKey;
        saveKeys({mistralKey, huggingfaceKey}, task)
    })

    const saveKeys = useCallback(async(keyStore, task='create') => {
        const { mistralKey, huggingfaceKey } = keyStore

        // Exit if no changes were made
        if (!keyStore) {
            return
        }

        if (mistralKey || huggingfaceKey) {
            const result = await window.desk.api2.saveKeys(keyStore);
            if (result.success) {
                //Load keys after saving
                loadKeys();

                //Close warning modals
                closeWarningModal();
                closeApiNotSetWarning();

                //Close Api query modal
                closeApiQueryModal();

                // if taskis update, close manpage modal
                (task === "update") ? hideApiManModal() : '';

                window.ModalManager.showMessage(`API Keys ${ (task==='updated')? 'updated' : 'saved'} successfully.`, 'success');
            }
        } else {
            console.log('No keys set')
            showApiNotSetWarning();
        }
    })
    // Load keys from keytar via the preload API and mask them
    const loadKeys = useCallback(async () => {
        const mistralApiField = document.getElementById('mistralKeyMan');
        const hfApiField = document.getElementById('huggingfaceKeyMan');

        const { mistralKey, huggingfaceKey } = await window.desk.api2.getKeys() || {};

        sethuggingfaceKey(huggingfaceKey)
        setmistralKey(mistralKey)

        if (huggingfaceKey, mistralKey) StateManager.set('api_key_ok', true)


        if (!mistralKey && !huggingfaceKey) {
            mistralApiField.value = "";
            hfApiField.value = "";
            showWarningModal();
            //showApiQueryModal();
        } else {
            mistralApiField.value = mistralKey ? maskKey(mistralKey) : '';
            hfApiField.value = huggingfaceKey ? maskKey(huggingfaceKey) : '';
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
    const resetKeys = useCallback(async() => {
        document.getElementById('mistralKey').value = '';
        document.getElementById('huggingfaceKey').value = '';
        document.getElementById('mistralKeyMan').value = '';
        document.getElementById('huggingfaceKeyMan').value = '';

        const result = await window.desk.api2.resetKeys(['mistral', 'huggingface']);

        if(result) window.ModalManager.showMessage('API Keys reset successfully.', 'success');
        StateManager.set('api_key_ok', false)
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

    const SuccessModal = useCallback((action = "close", message = null, timeout = null, restart = false) => {
        const msgSection = document.getElementById('success-message');
        const sucessModal = document.getElementById('successModal');
        const modalBox = document.getElementById('successModalContent');

        //Deactivate restart button if restart not required
        (restart === true) ? document.getElementById('restartBt').classList.remove('hidden') : '';

        if (action === "show") {
            if (message) {
                msgSection.textContent = message;
            }
            sucessModal.classList.remove('hidden', 'animate-exit');
            modalBox.classList.remove('hidden', 'pointer-events-none');
            modalBox.classList.add('animate-enter');

            //Close modal after timeout if provided
            if (timeout) {
                setTimeout(() => SuccessModal('close'), timeout);
            }
        } else {
            msgSection.textContent = 'Operation Succeeded';
            modalBox.classList.remove('animate-enter');
            modalBox.classList.add('animate-exit');
            setTimeout(() => sucessModal.classList.add('hidden', 'pointer-events-none'), 300);
        }
    })

    function closeWarningQuery() {
        closeWarningModal()
        //showApiQueryModal()
    }

    function closeNotSetQuery() {
        closeApiNotSetWarning()
        //showApiQueryModal()
    }

    const setMistralKey = useCallback((value) => {
        //document.getElementById('mistralKey').value = value;
    })

    const setHuggingfaceKey = useCallback((value) => {
        //document.getElementById('huggingfaceKey').value = value;
    })

    return (
        <section>
            <div id="apiKeyModal" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 hidden">
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
                                    id="mistralKey"
                                    type="password"
                                    defaultValue=''
                                    onChange={(e) => setMistralKey(e.target.value)}
                                    placeholder="mk-..."
                                    className="w-full px-4 py-3 text-black dark:text-white bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 font-mono text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={()=>toggleVisibility('mistralKey')}
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

                        {/* Hugging Face API Key */}
                        <div className="space-y-3">
                            <label htmlFor="huggingfaceKey" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                <span>Hugging Face API Key</span>
                            </label>
                            <div className="relative group">
                                <input
                                    id="huggingfaceKey"
                                    type="password"
                                    defaultValue=''
                                    onChange={(e) => setHuggingfaceKey(e.target.value)}
                                    placeholder="hf_..."
                                    className="w-full px-4 py-3 text-black dark:text-white bg-white dark:bg-gray-800 border-2 border-pink-200 dark:border-pink-800 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200 font-mono text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={()=>toggleVisibility('huggingfaceKey')}
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
                                <span>Required for model access and inference</span>
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
                                onClick={() => HandleKeysave('create')}
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

            {/* Key Management Modal */}
            <div id="apiKeyManPage" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-500 hidden">
                <div id="apiManContent" className="relative w-full max-w-2xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl backdrop-blur-lg transform transition-all duration-500 translate-y-8 opacity-0">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200/50 dark:border-gray-700/50 p-6 rounded-t-2xl">
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
                    <div className="p-6 space-y-6">
                        {/* Mistral API Key */}
                        <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span>Mistral API Key</span>
                            </label>
                            <div className="relative group">
                                <input
                                    id="mistralKeyMan"
                                    type="password"
                                    defaultValue=''
                                    onChange={(e) => setMistralKey(e.target.value)}
                                    placeholder="Enter your Mistral API key (mk-...)"
                                    className="w-full px-4 py-3 text-black dark:text-white bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 font-mono text-sm"
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

                        {/* Hugging Face API Key */}
                        <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                <span>Hugging Face API Key</span>
                            </label>
                            <div className="relative group">
                                <input
                                    id="huggingfaceKeyMan"
                                    type="password"
                                    defaultValue=''
                                    onChange={(e) => setHuggingfaceKey(e.target.value)}
                                    placeholder="Enter your Hugging Face API key (hf_...)"
                                    className="w-full px-4 py-3 text-black dark:text-white bg-white dark:bg-gray-800 border-2 border-pink-200 dark:border-pink-800 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200 font-mono text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleVisibility('huggingfaceKeyMan')}
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
                    <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-b-2xl">
                        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                            <button
                                onClick={resetKeys}
                                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!mistralKey && !huggingfaceKey}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.981-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Clear All Keys</span>
                            </button>

                            <div className="flex space-x-3">
                                <button
                                    onClick={hideApiManModal}
                                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => HandleKeysave('update')}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center space-x-2"
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

            {/* Warning Modal: No API Key Set */}
            <div id="warningModal" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-500 hidden">
                <div id="warningModalContent" className="bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-500 scale-95 opacity-0 backdrop-blur-lg">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-900/20 dark:to-red-900/20 border-b border-gray-200/50 dark:border-gray-700/50 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-center space-x-3">
                            <div className="p-2 bg-orange-500/10 rounded-xl">
                                <svg className="w-6 h-6 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                                    API Key Required
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Configuration needed to continue
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="text-center">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                It looks like you haven't set up your API keys yet. To access all features and continue, please configure your API credentials.
                            </p>

                            {/* Feature Highlights */}
                            <div className="mt-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">What you'll get:</p>
                                <div className="flex justify-center space-x-4 text-xs">
                                    <span className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>AI Chat</span>
                                    </span>
                                    <span className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Code Generation</span>
                                    </span>
                                    <span className="flex items-center space-x-1 text-purple-600 dark:text-purple-400">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Image Creation</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-b-2xl">
                        <div className="flex space-x-3">
                            <button
                                onClick={closeWarningQuery}
                                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                                Close
                            </button>
                            <button
                                onClick={showApiQueryModal}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                <span>Set API Keys</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* API Not Set Modal: At Least One API Required */}
            <div id="ApiNotSetModal" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-500 hidden">
                <div id="ApiNotSetContent" className="bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-500 scale-95 opacity-0 backdrop-blur-lg">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 dark:from-yellow-900/20 dark:to-amber-900/20 border-b border-gray-200/50 dark:border-gray-700/50 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-yellow-500/10 rounded-xl">
                                    <svg className="w-6 h-6 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400 bg-clip-text text-transparent">
                                        Configuration Required
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Set up your API keys to continue
                                    </p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={closeNotSetQuery}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
                            >
                                <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="text-center">
                            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                Please set up at least one API provider to unlock all features:
                            </p>

                            {/* API Provider Options */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-xl p-4 text-center group hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-200">
                                    <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                        <span className="text-white font-bold text-sm">HF</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Hugging Face</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Models & Inference</p>
                                </div>

                                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-4 text-center group hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200">
                                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                        <span className="text-white font-bold text-sm">M</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Mistral AI</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Chat & Completion</p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Or <span className="font-semibold text-blue-500 dark:text-blue-400">set up both</span> for the best experience!
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-b-2xl">
                        <div className="flex space-x-3">
                            <button
                                onClick={closeNotSetQuery}
                                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                                Maybe Later
                            </button>
                            <button
                                onClick={showApiQueryModal}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Configure Now</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    );
};
