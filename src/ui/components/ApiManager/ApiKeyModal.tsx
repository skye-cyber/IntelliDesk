import { forwardRef } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  newKeyRef: React.RefObject<HTMLInputElement>;
  onNewKey: (key: string) => void;
  onToggleVisibility: (id: string) => void;
}

export const ApiKeyModal = forwardRef<HTMLDivElement, ApiKeyModalProps>(({
  isOpen,
  onClose,
  newKeyRef,
  onNewKey,
  onToggleVisibility
}, ref) => {
  if (!isOpen) return null;

  return (
    <div ref={ref} id="apiKeyModal" className="fixed inset-0 bg-black/60 backdrop-brightness-50 flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div id="apiKeyModalContent" className="bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-lg backdrop-blur-lg">
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
                ref={newKeyRef}
                id="mistralKey"
                type="password"
                defaultValue=''
                onKeyUp={(e) => {
                  if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                    onNewKey((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                placeholder="mk-..."
                className="w-full px-4 py-3 text-black dark:text-white bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => onToggleVisibility('mistralKey')}
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
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
            <button
              id="HandleKeysaveBt"
              onClick={() => {
                if (newKeyRef.current?.value) {
                  onNewKey(newKeyRef.current.value);
                  newKeyRef.current.value = '';
                }
              }}
              className="flex-1 px-4 py-3 bg-green-700 hover:bg-green-600 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
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
  );
});

ApiKeyModal.displayName = 'ApiKeyModal';
