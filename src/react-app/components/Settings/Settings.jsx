import React, { useCallback, useState, useEffect, useRef } from 'react';
import { SettingToggle } from '@components/Settings/toggle.jsx';
import ErrorBoundary from '@components/ErrorBoundary/ErrorBoundary';
import { useTheme } from '@components/Themes/useThemeHeadless.jsx';

export const Settings = ({ isOpen, onToggle }) => {
    const [preferenceChange, setPreferenceChange] = useState(false);
    const [currentPreference, setCurrentPreference] = useState('');

    const { isDark, toggleTheme, setTheme } = useTheme();

    const [settings, setSettings] = useState({
        autoscroll: true,
        theme: 'light',
        animations: true,
        preference: '',
        language: 'en',
        fluxmodel: false
    });

    // Load settings on component mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedSettings = await window.desk.api.getPreferences();
                //console.log('Loaded settings:', savedSettings?.data);
                if (savedSettings?.data) {
                    setSettings(prev => ({ ...prev, ...savedSettings.data }));
                    setCurrentPreference(savedSettings.data.preference || '');
                }
                setTheme(savedSettings.data.theme)
                updateCanvasTheme()
            } catch (error) {
                window.ModalManager.showMessage(`Failed to load settings: ${error}`, 'error');
            }
        };
        loadSettings();
    }, []);

    function updateCanvasTheme(){
        const moon = document.getElementById('icon-moon')
        const sun = document.getElementById('icon-sun')

        if (settings.theme==='dark') {
            sun?.classList.add('hidden')
            moon?.classList.remove('hidden')
        } else {
            moon?.classList.add('hidden')
            sun?.classList.remove('hidden')
        }
    }

    // Update DOM when settings change
    useEffect(() => {
        updateDOMWithSettings();
    }, [settings]);

    const updateDOMWithSettings = useCallback(() => {
        //console.log("Updating DOM with settings:", settings);

        // Update theme
        const themeSwitch = document.getElementById('themeSwitch');
        if (themeSwitch) {
            themeSwitch.checked = settings.theme === 'dark';
        }

        // Update other checkboxes
        const autoScroll = document.getElementById('autoScroll');
        if (autoScroll) autoScroll.checked = settings.autoscroll;

        const animations = document.getElementById('animations');
        if (animations) animations.checked = settings.animations;

        const fluxModel = document.getElementById('fluxModel');
        if (fluxModel) fluxModel.checked = settings.fluxmodel;

        // Update language
        const languagePref = document.getElementById('languagePref');
        if (languagePref) languagePref.value = settings.language;
    }, [settings]);

    const CloseSettings = useCallback(() => {
        const settingsModal = document.getElementById('settingsModal');
        settingsModal.classList.remove('translate-x-0');
        settingsModal.classList.add('translate-x-full');
        setTimeout(() => {
            settingsModal.classList.add('hidden');
        }, 800);
    }, []);

    const shouldClose = useCallback((e) => {
        e.stopPropagation();
        const settingsM = document.getElementById('settingsModal');
        if (settingsM.contains(e.target)) CloseSettings();
    }, [CloseSettings]);

    const handleSettingChange = useCallback((key, value) => {
        //console.log(`Setting ${key} changed to:`, value);
        if (key === "theme") setTheme(value)

        setSettings(prev => {
            const newSettings = { ...prev, [key]: value };

            // Save immediately when settings change
            window.desk.api.savePreference(newSettings).catch(error => {
                console.error('Failed to save settings:', error);
            });

            return newSettings;
        });
    }, []);

    const handlePreferenceInput = useCallback((e) => {
        setPreferenceChange(true);
        const prefInput = e.target;
        prefInput.style.height = 'auto';
        prefInput.style.height = Math.min(prefInput.scrollHeight, 0.28 * window.innerHeight) + 'px';
    }, []);

    const handlePreferenceSubmit = useCallback(async () => {
        const prefInput = document.getElementById('pref-input');
        const prefInputSection = document.getElementById('prefInputSection')
        const prefContent = document.getElementById('pref-content');
        const prefContentSection = document.getElementById('prefContentSection')

        const content = prefInput.value.trim();
        prefContent.innerText = content

        prefInputSection.classList.add('hidden'); //Show input section
        prefContentSection.classList.remove('hidden'); //Hide preference display block

        if (!content) return;

        setCurrentPreference(content);

        const newSettings = { ...settings, preference: content };
        setSettings(newSettings);

        try {
            await window.desk.api.savePreference(newSettings);
            SuccessModal.success('Your preferences have been saved successfully!');
        } catch (error) {
            window.ModalManager.showMessage('Failed to save preferences', 'error');
        }
    }, [settings]);


    const handleEditPreference = useCallback(() => {
        const prefInputSection = document.getElementById('prefInputSection')
        const prefInput = document.getElementById('pref-input');
        const prefContent = document.getElementById('pref-content');
        const prefContentSection = document.getElementById('prefContentSection')

        prefInputSection.classList.remove('hidden'); //Show input section

        prefInput.value = currentPreference ? currentPreference : prefContent.innerText;
        prefInput.focus() //Focus text area for editing

        prefContentSection.classList.add('hidden'); //Hide preference display block
        prefInput.style.height = Math.min(prefInput.scrollHeight, 0.28 * window.innerHeight) + 'px';

        setPreferenceChange(true);

    }, [currentPreference])

    const handleDeletePreference = useCallback(async () => {
        const prefInputSection = document.getElementById('prefInputSection')
        const prefInput = document.getElementById('pref-input');
        const prefContent = document.getElementById('pref-content');
        const prefContentSection = document.getElementById('prefContentSection')

        const confirmed = await window.ModalManager.confirm("This action cannot be undone", "Delete preferences?")

        if (!confirmed) return;

        try {
            setCurrentPreference('');
            const newSettings = { ...settings, preference: '' };
            setSettings(newSettings);

            if (await window.desk.api.savePreference()) {
                prefContent.textContent = '';
                prefContentSection.classList.add('hidden'); //Hide preference display block
                prefInputSection.classList.remove('hidden'); //Show input section
                prefInput.value = "";

                SuccessModal.success('Your preferences have been deleted successfully!');
            } else {
                window.ModalManager.showMessage('Failed to delete preferences', 'error');
            }
        } catch (error) {
            window.ModalManager.showMessage(`Failed to delete preferences: ${error.message}`, 'error');
        }
    }, [settings])

    const handleSaveSettings = useCallback(() => {
        const prefInputSection = document.getElementById('prefInputSection')
        const prefInput = document.getElementById('pref-input');
        const prefContent = document.getElementById('pref-content');
        const prefContentSection = document.getElementById('prefContentSection')

        const inputText = prefInput.value.trim();
        prefInput.value = "";

        // Dispatch Save event
        const saved = saveSettingsAPI()
        if (inputText) {
            prefInputSection.classList.add('hidden'); //hide input section
            prefContent.innerText = inputText; //Update preference content
            prefContentSection.classList.remove('hidden');
        }
        if (saved) {
            window.ModalManager.showMessage("Settings updated successfully", 'success')
        }
    })

    const saveSettingsAPI = (async () => {
        const theme = document.getElementById('themeSwitch')
        const autoScroll = document.getElementById('autoScroll')
        const animations = document.getElementById('animations')
        const language = document.getElementById('languagePref')
        const fluxModel = document.getElementById('fluxModel')
        const prefInput = document.getElementById('pref-input');
        const prefContent = document.getElementById('pref-content');

        const inputText = prefInput.value.trim();
        const data = {
            theme: theme.ckecked ? 'dark' : 'light',
            autoscroll: autoScroll.checked,
            animations: animations.checked,
            preference: inputText ? inputText : prefContent.textContent.trim(),
            language: language.value || 'en',
            fluxmodel: fluxModel.checked
        }
        //console.log(settings, data)
        const saved = await window.desk.api.savePreference(settings)
        return saved
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

    const handleApiManagement = useCallback(() => {
        showApiManModal()
    })

    const handleResetSettings = useCallback(async () => {
        const confirmed = await window.ModalManager.confirm("This action cannot be undone", "Delete preferences?");
        if (!confirmed) return;

        try {
            setCurrentPreference('');
            const newSettings = {
                autoscroll: true,
                theme: 'light',
                animations: true,
                preference: '',
                language: 'en',
                fluxmodel: false,
            };

            setSettings(newSettings);

            await window.desk.api.savePreference(newSettings);
            SuccessModal.success('Your preferences have been deleted successfully!');
        } catch (error) {
            window.ModalManager.showMessage('Failed to delete preferences', 'error');
        }
    }, [settings])

    return (
        <div onClick={shouldClose} id="settingsModal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-700 hidden translate-x-full">
            {/* Modal Content */}
            <div
                className="relative bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl p-0 w-full mx-4 md:mx-auto max-w-2xl max-h-[98vh] overflow-hidden backdrop-blur-lg transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200/50 dark:border-gray-700/50 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                                    Settings
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Customize your experience
                                </p>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={CloseSettings}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
                        >
                            <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar p-6">
                    {/* Quick Settings Grid */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Quick Settings
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Theme Toggle */}
                            <SettingToggle
                                id="themeSwitch"
                                label="Dark Theme"
                                description="Switch between light and dark mode"
                                icon="🌓"
                                checked={settings.theme === 'dark'}
                                onChange={(checked) => handleSettingChange('theme', checked ? 'dark' : 'light')}
                            />

                            {/* Auto Scroll */}
                            <SettingToggle
                                id="autoScroll"
                                label="Auto Scroll"
                                description="Automatically scroll to new content"
                                icon="📜"
                                checked={settings.autoscroll}
                                onChange={(checked) => handleSettingChange('autoscroll', checked)}
                            />

                            {/* Use FLUX Model */}
                            <SettingToggle
                                id="fluxModel"
                                label="FLUX Model"
                                description="Use FLUX for image generation"
                                icon="🖼️"
                                checked={settings.fluxmodel}
                                onChange={(checked) => handleSettingChange('fluxmodel', checked)}
                            />

                            {/* Animations */}
                            <SettingToggle
                                id="animations"
                                label="Animations"
                                description="Enable interface animations"
                                icon="✨"
                                checked={settings.animations}
                                onChange={(checked) => handleSettingChange('animations', checked)}
                            />
                        </div>
                    </div>

                    {/* User Preferences Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Your Preferences
                        </h3>

                        <div className="space-y-4">
                            {/* Preference Input */}
                            <div id="prefInputSection" className={`${currentPreference ? 'hidden' : ''} bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50`}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Tell me about your preferences...
                                </label>
                                <div className="relative">
                                    <textarea
                                        id="pref-input"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 custom-scrollbar"
                                        placeholder="How would you like me to assist you? Share your preferences, communication style, or specific needs..."
                                        rows="3"
                                        onChange={handlePreferenceInput}
                                    />
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            This helps me personalize your experience
                                        </span>
                                        <button
                                            id="pref-submit"
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={handlePreferenceSubmit}
                                        >
                                            <span>Save Preferences</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Current Preference Display */}
                            <ErrorBoundary>
                                <div id="prefContentSection" className={`${!currentPreference ? 'hidden' : ''} bg-blue-50/50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Current Preference</h4>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handleEditPreference}
                                                className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={handleDeletePreference}
                                                className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.981-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <p id="pref-content" className="text-blue-800 dark:text-blue-200 text-sm">{currentPreference}</p>
                                </div>
                            </ErrorBoundary>
                        </div>
                    </div>

                    {/* Additional Settings */}
                    <div className="space-y-6">
                        {/* Language Selection */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                                Language & Region
                            </h3>
                            <select id="languagePref" className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" onChange={(e) => handleSettingChange('language', e.target.value)}>
                                <option value="en">🌐 English</option>
                                <option value="fr">🇫🇷 French</option>
                                <option value="es">🇪🇸 Spanish</option>
                                <option value="de">🇩🇪 German</option>
                                <option value="ja">🇯🇵 Japanese</option>
                            </select>
                        </div>

                        {/* API Management */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">API Configuration</h3>
                            <button
                                onClick={handleApiManagement}
                                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 group"
                            >
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                <span>Manage API Keys</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                        <button
                            onClick={handleResetSettings}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium"
                        >
                            Reset to Defaults
                        </button>
                        <div className="flex space-x-3">
                            <button
                                onClick={CloseSettings}
                                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                id="saveSettings"
                                onClick={handleSaveSettings}
                                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
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

