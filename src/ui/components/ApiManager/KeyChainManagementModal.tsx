import { ApiKeyRow } from './ApiKeyRow';

interface KeyChainManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    mistralKeyChain: { keys: Array<{ value: string; status: string }> };
    addKeyRef: React.RefObject<HTMLInputElement>;
    onNewKey: (key: string) => void;
    onKeyDelete: (key: { value: string; status: string }) => void;
    onKeyDisable: (key: { value: string; status: string }) => void;
    onReset: () => void;
    onSave: () => void;
    maskFn: (key: string, options?: any) => string;
    onToggleVisibility: (id: string) => void;
}

export const KeyChainManagementModal = ({
    isOpen,
    onClose,
    mistralKeyChain,
    addKeyRef,
    onNewKey,
    onKeyDelete,
    onKeyDisable,
    onReset,
    onSave,
    maskFn,
    onToggleVisibility
}: KeyChainManagementModalProps) => {
    if (!isOpen) return null;

    return (
        <div id="apiKeyManPage" onClick={(e) => {
            if (e.currentTarget === e.target) onClose()
        }} className="fixed inset-0 bg-black/60 backdrop-brightness-50 flex items-center justify-center z-[52] p-4 transition-all duration-100">
            <div id="apiManContent" className="relative w-full max-w-2xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl backdrop-blur-lg transform transition-all duration-300">
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
                            onClick={onClose}
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
                    {/* API keychain Display */}
                    <section className='space-y-3'>
                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span>API Key Chain</span><span><span className='text-orange-400'>(</span><span className='tracking-wider'>{mistralKeyChain.keys.length}</span><span className='text-pink-400'>)</span></span>
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
                                    {mistralKeyChain.keys.map((key, index) => (
                                        <ApiKeyRow
                                            key={index}
                                            apikey={key}
                                            onDelete={onKeyDelete}
                                            onDisable={onKeyDisable}
                                            maskFn={maskFn}
                                        />
                                    ))}
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
                                ref={addKeyRef}
                                id="mistralKeyMan"
                                type="password"
                                defaultValue=''
                                onKeyUp={(e) => {
                                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                                        onNewKey((e.target as HTMLInputElement).value);
                                        (e.target as HTMLInputElement).value = '';
                                    }
                                }}
                                placeholder="Enter your Mistral API key (mk-...)"
                                className="w-full px-4 py-3 text-black dark:text-white bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 rounded-xl focus:border-orange-500 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-none focus:outline-none transition-all duration-500 font-mono text-sm ease-in-out"
                            />
                            <button
                                type="button"
                                onClick={() => onToggleVisibility('mistralKeyMan')}
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
                            onClick={onReset}
                            className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-gray-50 dark:hover:bg-slate-900 hover:border rounded-2xl border-gray-400 dark:border-primary-200 hover:translate-y-2 transition-all duration-500 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!mistralKeyChain}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.981-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Clear Key Chain</span>
                        </button>

                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => onSave()}
                                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center space-x-2"
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
    );
};
