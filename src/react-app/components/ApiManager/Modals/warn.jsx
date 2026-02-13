export const ApiNotSetWarning = ({ close, open }) => {
    return (
        <div id="warningModal" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-500 hidden" >
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
                                <span className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Agent Mode</span>
                                </span>
                                <span className="flex items-center space-x-1 text-purple-600 dark:text-purple-400">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>OCR</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-b-2xl">
                    <div className="flex space-x-3">
                        <button
                            onClick={close}
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            Close
                        </button>
                        <button
                            onClick={open}
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
    )
}
