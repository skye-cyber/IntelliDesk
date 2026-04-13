interface RequestApiKeyProps {
    onClose: () => void;
    onConfigure: () => void
    isOpen: boolean;
}

export const RequestApiKeyConfig = ({ isOpen, onClose, onConfigure }: RequestApiKeyProps) => {
    if (isOpen) return null;
    return (
        <div id="APIRequest" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-500">
            <div id="ApiRequestContent" className="bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-lg">
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
                <div className="p-6">
                    <div className="text-center">
                        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                            Please set up at least one API key to unlock all features:
                        </p>

                        {/* API Provider Options */}
                        <div className="flex justify-center gap-3 mb-4">
                            <div className="hidden bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-xl p-4 text-center group hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-200">
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
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Chat & Completion & Agent & OCR</p>
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
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            Maybe Later
                        </button>
                        <button
                            onClick={onConfigure}
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
    )
}
