import { useCallback, useState, useEffect, useRef } from 'react';
import {
    FiSettings,
    FiMoon,
    FiChevronsDown,
    FiUser,
    FiEdit2,
    FiTrash2,
    FiGlobe,
    FiKey,
    FiX,
    FiCheck,
    FiSave,
    FiRotateCcw,
    FiZap,
    FiTool,
    FiBarChart2
} from 'react-icons/fi';
import { FaFlask } from 'react-icons/fa';
import { SettingToggle } from '../components/Settings/settings_toggle.jsx';
import { modalmanager } from '../../core/StatusUIManager/Manager.js';
import { useTheme } from '../components/Themes/useThemeHeadless.jsx';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary.jsx';
import { globalEventBus } from '../../core/Globals/eventBus.ts';
import { StateManager } from '../../core/managers/StatesManager.ts';

export const Settings = ({ isOpen, onToggle }) => {
    const [profile, setProfile] = useState('');
    const settingContainer = useRef(null);
    const { setTheme } = useTheme();

    // Refs replacing getElementById
    const themeSwitchRef = useRef(null);
    const autoScrollRef = useRef(null);
    const experimentalFeaturesRef = useRef(null);
    const languagePrefRef = useRef(null);
    const profileInputRef = useRef(null);
    const profileInputSectionRef = useRef(null);
    const profileContentRef = useRef(null);
    const profileSectionRef = useRef(null);
    const moonIconRef = useRef(null);
    const sunIconRef = useRef(null);

    const [settings, setSettings] = useState({
        autoscroll: true,
        theme: 'light',
        experimentalFeatures: false,
        profile: '',
        language: 'en',
        modelVerbosity: 'normal'
    });

    // Load settings on component mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedSettings = await window.desk.api.getUserSettings();
                if (savedSettings) {
                    // Migrate old settings if they exist
                    const migratedSettings = {
                        ...savedSettings,
                        experimentalFeatures: savedSettings.experimentalFeatures ?? false,
                        modelVerbosity: savedSettings.modelVerbosity || 'normal'
                    };
                    setSettings(prev => ({ ...prev, ...migratedSettings }));
                    setProfile(migratedSettings.profile || '');
                }
                setTheme(savedSettings.theme);
                updateCanvasTheme();
                StateManager.set('userSettings', savedSettings)
            } catch (error) {
                modalmanager.showMessage(`Failed to load settings: ${error}`, 'error');
            }
        };
        loadSettings();
    }, []);

    function updateCanvasTheme() {
        if (settings.theme === 'dark') {
            sunIconRef.current?.classList.add('hidden');
            moonIconRef.current?.classList.remove('hidden');
        } else {
            moonIconRef.current?.classList.add('hidden');
            sunIconRef.current?.classList.remove('hidden');
        }
    }

    // Update DOM when settings change
    useEffect(() => {
        updateDOMWithSettings();
    }, [settings]);

    const updateDOMWithSettings = useCallback(() => {
        if (themeSwitchRef.current) {
            themeSwitchRef.current.checked = settings.theme === 'dark';
        }
        if (autoScrollRef.current) {
            autoScrollRef.current.checked = settings.autoscroll;
        }
        if (experimentalFeaturesRef.current) {
            experimentalFeaturesRef.current.checked = settings.experimentalFeatures;
        }
        if (languagePrefRef.current) {
            languagePrefRef.current.value = settings.language;
        }
    }, [settings]);

    const OpenSettings = useCallback(() => {
        settingContainer.current?.classList.remove('hidden');
        setTimeout(() => {
            settingContainer.current?.classList.remove('translate-x-full');
            settingContainer.current?.classList.add('translate-x-0');
        }, 10);
    }, []);

    const CloseSettings = useCallback(() => {
        settingContainer.current?.classList.remove('translate-x-0');
        settingContainer.current?.classList.add('translate-x-full');
        setTimeout(() => {
            settingContainer.current?.classList.add('hidden');
        }, 800);
    }, []);

    const shouldClose = useCallback((e) => {
        e.stopPropagation();
        if (settingContainer.current?.contains(e.target)) {
            CloseSettings();
        }
    }, [CloseSettings]);

    const handleSettingChange = useCallback((key, value) => {
        if (key === "theme") setTheme(value);

        setSettings(prev => {
            const newSettings = { ...prev, [key]: value };
            window.desk.api.saveUserSettings(newSettings).catch(error => {
                console.error('Failed to save settings:', error);
            });
            return newSettings;
        });
    }, []);


    const saveSettingsAPI = useCallback(async (settingsToSave = settings) => {
        const saved = await window.desk.api.saveUserSettings(settingsToSave);
        return saved;
    }, [settings]);

    const handleProfileSubmit = useCallback(async () => {
        const profileInput = profileInputRef.current;
        const profileInputSection = profileInputSectionRef.current;
        const profileContent = profileContentRef.current;
        const profileSection = profileSectionRef.current;

        const content = profileInput?.value.trim();

        if (!content) return;

        // Update state first
        setProfile(content);
        const newSettings = { ...settings, profile: content };
        setSettings(newSettings);

        // Update UI immediately for responsiveness
        if (profileContent) profileContent.innerText = content;
        profileInputSection?.classList.add('hidden');
        profileSection?.classList.remove('hidden');

        try {
            await saveSettingsAPI(newSettings); // Pass explicit settings
            modalmanager.showMessage('Your settings have been saved successfully!');
        } catch (error) {
            modalmanager.showMessage('Failed to save settings', 'error');
        }
    }, [settings, saveSettingsAPI]);

    const handleEditProfile = useCallback(() => {
        const profileInputSection = profileInputSectionRef.current;
        const profileInput = profileInputRef.current;
        const profileSection = profileSectionRef.current;

        profileInputSection?.classList.remove('hidden');

        if (profileInput) {
            profileInput.value = profile || profileContentRef.current?.innerText || '';
            profileInput.focus();
        }

        profileSection?.classList.add('hidden');

        if (profileInput) {
            profileInput.style.height = Math.min(profileInput.scrollHeight, 0.28 * window.innerHeight) + 'px';
        }
    }, [profile]);

    const handleDeleteProfile = useCallback(async () => {
        const profileInputSection = profileInputSectionRef.current;
        const profileInput = profileInputRef.current;
        const profileContent = profileContentRef.current;
        const profileSection = profileSectionRef.current;

        const confirmed = await modalmanager.confirm("This action cannot be undone", "Delete profile?");
        if (!confirmed) return;

        try {
            const newSettings = { ...settings, profile: '' };
            setProfile('');
            setSettings(newSettings);

            await saveSettingsAPI(newSettings); // Pass explicit settings

            if (profileContent) profileContent.textContent = '';
            profileSection?.classList.add('hidden');
            profileInputSection?.classList.remove('hidden');
            if (profileInput) profileInput.value = "";

            modalmanager.showMessage('Your profile has been deleted successfully!');
        } catch (error) {
            modalmanager.showMessage(`Failed to delete profile: ${error.message}`, 'error');
        }
    }, [settings, saveSettingsAPI]);

    const handleSaveSettings = useCallback(async () => {
        const profileInput = profileInputRef.current;
        const profileInputSection = profileInputSectionRef.current;
        const profileContent = profileContentRef.current;
        const profileSection = profileSectionRef.current;

        const inputText = profileInput?.value.trim();

        // Construct complete settings object including current profile input
        const settingsToSave = {
            ...settings,
            profile: inputText || settings.profile // Use input if present, else keep existing
        };

        // Update local state
        if (inputText) {
            setProfile(inputText);
        }
        setSettings(settingsToSave);

        try {
            const saved = await saveSettingsAPI(settingsToSave); // Pass explicit settings

            if (saved) {
                modalmanager.showMessage("Settings updated successfully", 'success');

                // If there was pending profile text, update UI to show it
                if (inputText && profileContent) {
                    profileContent.innerText = inputText;
                    profileInputSection?.classList.add('hidden');
                    profileSection?.classList.remove('hidden');
                    if (profileInput) profileInput.value = "";
                }
                StateManager.set('userSettings', settingsToSave)
            }
        } catch (error) {
            modalmanager.showMessage("Failed to save settings", 'error');
        }
    }, [settings, saveSettingsAPI]);

    const handleResetSettings = useCallback(async () => {
        const confirmed = await modalmanager.confirm("This action cannot be undone", "Reset settings?");
        if (!confirmed) return;

        try {
            setProfile('');
            const newSettings = {
                autoscroll: true,
                theme: 'light',
                experimentalFeatures: false,
                profile: '',
                language: 'en',
                modelVerbosity: 'normal'
            };

            setSettings(newSettings);
            await window.desk.api.savePreference(newSettings);
            modalmanager.showMessage('Settings reset to defaults successfully!');
        } catch (error) {
            modalmanager.showMessage('Failed to reset settings', 'error');
        }
    }, []);

    useEffect(() => {
        const openSettings = globalEventBus.on('setting:open', OpenSettings);
        const closeSettings = globalEventBus.on('setting:close', CloseSettings);
        const settingsToggle = globalEventBus.on('setting:toggle', () => {
            settingContainer.current?.classList.contains('hidden') ? OpenSettings() : CloseSettings();
        });
        return () => {
            openSettings.unsubscribe();
            closeSettings.unsubscribe();
            settingsToggle.unsubscribe();
        };
    }, [OpenSettings, CloseSettings]);

    return (
        <div
            ref={settingContainer}
            onClick={shouldClose}
            className="fixed inset-0 z-[51] flex items-center justify-center bg-black/60 backdrop-brightness-50 hidden translate-x-full transition-colors duration-700 ease-in-out"
        >
            <div
                className="relative bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl p-0 w-full mx-4 md:mx-auto max-w-2xl max-h-[98vh] overflow-hidden backdrop-blur-lg"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200/50 dark:border-gray-700/50 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <FiSettings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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

                        <button
                            onClick={CloseSettings}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl group transition-colors"
                        >
                            <FiX className="w-5 h-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto scrollbar-smooth max-h-[calc(90vh-140px)] scrollbar-custom p-6">
                    {/* Quick Settings Grid */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <FiZap className="w-5 h-5 mr-2 text-blue-500" />
                            Quick Settings
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Theme Toggle */}
                            <SettingToggle
                                id="themeSwitch"
                                ref={themeSwitchRef}
                                label="Dark Theme"
                                description="Switch between light and dark mode"
                                icon={<FiMoon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />}
                                checked={settings.theme === 'dark'}
                                onChange={(checked) => handleSettingChange('theme', checked ? 'dark' : 'light')}
                            />

                            {/* Auto Scroll */}
                            <SettingToggle
                                id="autoScroll"
                                ref={autoScrollRef}
                                label="Auto Scroll"
                                description="Automatically scroll to new content"
                                icon={<FiChevronsDown className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
                                checked={settings.autoscroll}
                                onChange={(checked) => handleSettingChange('autoscroll', checked)}
                            />

                            {/* Experimental Features */}
                            <SettingToggle
                                id="experimentalFeatures"
                                ref={experimentalFeaturesRef}
                                label="Experimental Features"
                                description="Enable beta functionality and previews"
                                icon={<FaFlask className="w-5 h-5 text-purple-500 dark:text-purple-400" />}
                                checked={settings.experimentalFeatures}
                                onChange={(checked) => handleSettingChange('experimentalFeatures', checked)}
                            />

                            {/* Model Verbosity */}
                            <div className="relative flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                        <FiBarChart2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Model Verbosity
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            Response detail level
                                        </p>
                                    </div>
                                </div>
                                <select
                                    value={settings.modelVerbosity}
                                    onChange={(e) => handleSettingChange('modelVerbosity', e.target.value)}
                                    className="ml-2 px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* User Preferences Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <FiUser className="w-5 h-5 mr-2 text-emerald-500 dark:text-emerald-400" />
                            Your Profile/Prompt
                        </h3>

                        <div className="space-y-4">
                            {/* Preference Input */}
                            <div
                                ref={profileInputSectionRef}
                                className={`${profile ? 'hidden' : ''} bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50`}
                            >
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Your profile
                                </label>
                                <div className="relative">
                                    <textarea
                                        ref={profileInputRef}
                                        id="pref-input"
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition scrollbar-custom placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                        placeholder="Share your prompt, communication style, or specific needs..."
                                        rows="3"
                                        onChange={(e) => handleSettingChange('profile', e.target.value)}
                                    />
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Any specification, instructions or tweaks that help tailor to your experience
                                        </span>
                                        <button
                                            onClick={(e) => handleProfileSubmit(e.target.value)}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
                                        >
                                            <span>Save</span>
                                            <FiCheck className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Current profile Display */}
                            <ErrorBoundary>
                                <div
                                    ref={profileSectionRef}
                                    id="ProfileSection"
                                    className={`${!profile ? 'hidden' : ''} bg-emerald-50/50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-700/50`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-emerald-900 dark:text-emerald-100">Current Prompt/Profile</h4>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handleEditProfile}
                                                className="p-1.5 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 rounded transition-colors"
                                            >
                                                <FiEdit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={handleDeleteProfile}
                                                className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 hover:bg-red-100 dark:hover:bg-red-800/50 rounded transition-colors"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p ref={profileContentRef} id="pref-content" className="text-emerald-800 dark:text-emerald-200 text-sm">
                                        {profile}
                                    </p>
                                </div>
                            </ErrorBoundary>
                        </div>
                    </div>

                    {/* Additional Settings */}
                    <div className="space-y-6">
                        {/* Language Selection */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                <FiGlobe className="w-5 h-5 mr-2 text-cyan-500 dark:text-cyan-400" />
                                Language & Region
                            </h3>
                            <select
                                ref={languagePrefRef}
                                id="languagePref"
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-colors cursor-pointer"
                                onChange={(e) => handleSettingChange('language', e.target.value)}
                            >
                                <option value="en">🌐 English</option>
                                <option value="fr">🇫🇷 French</option>
                                <option value="es">🇪🇸 Spanish</option>
                                <option value="de">🇩🇪 German</option>
                                <option value="ja">🇯🇵 Japanese</option>
                            </select>
                        </div>

                        {/* API Management */}
                        <section className='block space-y-2 sm:space-y-0 sm:flex justify-between gap-4'>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">API Configuration</h3>
                                <button
                                    onClick={() => globalEventBus.emit('keychain:manager:show')}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-accent-500 to-blue-600 hover:from-blue-600/80 hover:to-blue-400/70 dark:hover:opacity-70 hover:translate-y-[-2px] dark:from-primary-200/80 dark:to-accent-500 text-white rounded-lg font-medium flex items-center justify-center space-x-2 group transition-all duration-500"
                                >
                                    <FiKey className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span>Manage API Key Chain</span>
                                </button>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Tool Configuration</h3>
                                <button
                                    onClick={() => {
                                        CloseSettings();
                                        globalEventBus.emit('agent:editor:open');
                                    }}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-accent-500 hover:from-blue-600/80 hover:to-blue-400/70 dark:hover:opacity-70 hover:translate-y-[-2px] dark:from-primary-200/80 dark:to-accent-500 text-white rounded-lg font-medium flex items-center justify-center space-x-2 group transition-all duration-500"
                                >
                                    <FiTool className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span>Manage Tool Config</span>
                                </button>
                            </div>
                        </section>
                    </div>
                </div >

                {/* Footer */}
                < div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 p-6" >
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                        <button
                            onClick={handleResetSettings}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium flex items-center space-x-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <FiRotateCcw className="w-4 h-4" />
                            <span>Reset to Defaults</span>
                        </button>
                        <div className="flex space-x-3">
                            <button
                                onClick={CloseSettings}
                                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                id="saveSettings"
                                onClick={handleSaveSettings}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-sm hover:shadow-md"
                            >
                                <FiSave className="w-4 h-4" />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </div>
                </div >
            </div >

            {/* Hidden refs for canvas theme icons */}
            < div className="hidden" >
                <div ref={moonIconRef} id="icon-moon" className="hidden" />
                <div ref={sunIconRef} id="icon-sun" className="hidden" />
            </div >
        </div >
    );
};
