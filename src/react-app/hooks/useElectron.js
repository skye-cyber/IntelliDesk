import { useState, useEffect, useCallback } from 'react';

// Define the Electron API interface
const electronAPI = window.desk.api2 || {};

export const useElectron = (callbacks = {}) => {
    const [appVersion, setAppVersion] = useState('');
    const [isElectron, setIsElectron] = useState(false);
    const { onChatResponse: chatResponseCallback, onError: errorCallback } = callbacks;

    // Check if we're running in Electron
    useEffect(() => {
        setIsElectron(!!window.desk.api2);
        //console.log('Electron API available:', !!window.desk.api2);
    }, []);

    // Get app version
    useEffect(() => {
        const getVersion = async () => {
            if (electronAPI.getAppVersion) {
                try {
                    const version = await electronAPI.getAppVersion();
                    setAppVersion(version);
                } catch (error) {
                    console.error('Failed to get app version:', error);
                }
            }
        };
        getVersion();
    }, []);

    // Chat functionality
    const sendMessage = useCallback(async (message, model = null, options = {}) => {
        if (!electronAPI.sendChatMessage) {
            console.warn('Electron API not available, using mock response');
            // Fallback for development without Electron
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(`Mock response to: ${message}`);
                }, 1000);
            });
        }

        try {
            const response = await electronAPI.sendChatMessage(message, model, options);
            return response;
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }, []);

    // File operations
    const showSaveDialog = useCallback(async (options = {}) => {
        if (!electronAPI.showSaveDialog) {
            console.warn('Save dialog not available in browser');
            return { canceled: true };
        }

        try {
            return await electronAPI.showSaveDialog(options);
        } catch (error) {
            console.error('Failed to show save dialog:', error);
            throw error;
        }
    }, []);

    const showOpenDialog = useCallback(async (options = {}) => {
        if (!electronAPI.showOpenDialog) {
            console.warn('Open dialog not available in browser');
            return { canceled: true, filePaths: [] };
        }

        try {
            return await electronAPI.showOpenDialog(options);
        } catch (error) {
            console.error('Failed to show open dialog:', error);
            throw error;
        }
    }, []);

    // File attachment
    const attachFiles = useCallback(async () => {
        if (!electronAPI.attachFiles) {
            console.warn('File attachment not available in browser');
            return [];
        }

        try {
            return await electronAPI.attachFiles();
        } catch (error) {
            console.error('Failed to attach files:', error);
            throw error;
        }
    }, []);

    // Model management
    const getAvailableModels = useCallback(async () => {
        if (!electronAPI.getAvailableModels) {
            console.warn('Model API not available, returning default models');
            return [
                { value: 'Qwen/Qwen2.5-72B-Instruct', name: 'Basic mode', description: 'Default conversation model' },
                { value: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Coding mode', description: 'Supports advanced coding tasks' },
            ];
        }

        try {
            return await electronAPI.getAvailableModels();
        } catch (error) {
            console.error('Failed to get available models:', error);
            throw error;
        }
    }, []);

    // Settings
    const getSettings = useCallback(async () => {
        if (!electronAPI.getSettings) {
            return {};
        }

        try {
            return await electronAPI.getSettings();
        } catch (error) {
            console.error('Failed to get settings:', error);
            throw error;
        }
    }, []);

    const saveSettings = useCallback(async (settings) => {
        if (!electronAPI.saveSettings) {
            console.warn('Settings API not available');
            return;
        }

        try {
            await electronAPI.saveSettings(settings);
        } catch (error) {
            console.error('Failed to save settings:', error);
            throw error;
        }
    }, []);

    // Theme management
    const getTheme = useCallback(async () => {
        if (!electronAPI.getTheme) {
            return 'system';
        }

        try {
            return await electronAPI.getTheme();
        } catch (error) {
            console.error('Failed to get theme:', error);
            return 'system';
        }
    }, []);

    const setTheme = useCallback(async (theme) => {
        if (!electronAPI.setTheme) {
            // Fallback: update class on document
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            return;
        }

        try {
            await electronAPI.setTheme(theme);
        } catch (error) {
            console.error('Failed to set theme:', error);
            throw error;
        }
    }, []);

    // Event listeners for real-time updates -- Handle chat responses automatically
    const useChatResponse = useCallback((callback) => {
        if (!electronAPI.onChatResponse) {
            console.warn('electronAPI.onChatResponse not available');
            return () => { }; // Return no-op cleanup
        }

        // Subscribe and return the cleanup function
        return electronAPI.onChatResponse(callback);
    }, []);

    const useError = useCallback((callback) => {
        //useEffect(() => {
        if (!electronAPI.onError) {
            console.warn('electronAPI.onError not available');
            return () => { };
        }

        const unsubscribe = electronAPI.onError(callback);
        return unsubscribe;
        //}, [callback]);
    }, []);

    const useThemeChange = useCallback((callback) => {
        useEffect(() => {
            if (!electronAPI.onThemeChange) {
                return () => { };
            }

            const unsubscribe = electronAPI.onThemeChange(callback);
            return unsubscribe;
        }, [callback]);
    }, []);

    // Voice recording
    const startRecording = useCallback(async () => {
        if (!electronAPI.startRecording) {
            console.warn('Voice recording not available in browser');
            throw new Error('Voice recording not available');
        }

        try {
            return await electronAPI.startRecording();
        } catch (error) {
            console.error('Failed to start recording:', error);
            throw error;
        }
    }, []);

    const stopRecording = useCallback(async () => {
        if (!electronAPI.stopRecording) {
            console.warn('Voice recording not available in browser');
            throw new Error('Voice recording not available');
        }

        try {
            return await electronAPI.stopRecording();
        } catch (error) {
            console.error('Failed to stop recording:', error);
            throw error;
        }
    }, []);

    // Canvas/Code functionality
    const saveCodeToFile = useCallback(async (code, filePath) => {
        if (!electronAPI.saveCodeToFile) {
            console.warn('File save not available in browser');
            return { success: false };
        }

        try {
            return await electronAPI.saveCodeToFile(code, filePath);
        } catch (error) {
            console.error('Failed to save code:', error);
            throw error;
        }
    }, []);

    const loadCodeFromFile = useCallback(async (filePath) => {
        if (!electronAPI.loadCodeFromFile) {
            console.warn('File load not available in browser');
            return '';
        }

        try {
            return await electronAPI.loadCodeFromFile(filePath);
        } catch (error) {
            console.error('Failed to load code:', error);
            throw error;
        }
    }, []);

    // Conversation management
    const getConversations = useCallback(async () => {
        if (!electronAPI.getConversations) {
            return [];
        }

        try {
            return await electronAPI.getConversations();
        } catch (error) {
            console.error('Failed to get conversations:', error);
            throw error;
        }
    }, []);

    const saveConversation = useCallback(async (conversation) => {
        if (!electronAPI.saveConversation) {
            console.warn('Conversation save not available');
            return;
        }

        try {
            await electronAPI.saveConversation(conversation);
        } catch (error) {
            console.error('Failed to save conversation:', error);
            throw error;
        }
    }, []);

    const deleteConversation = useCallback(async (conversationId) => {
        if (!electronAPI.deleteConversation) {
            console.warn('Conversation delete not available');
            return;
        }

        try {
            await electronAPI.deleteConversation(conversationId);
        } catch (error) {
            console.error('Failed to delete conversation:', error);
            throw error;
        }
    }, []);

    return {
        // State
        appVersion,
        isElectron,

        // Chat
        sendMessage,

        // Files
        showSaveDialog,
        showOpenDialog,
        attachFiles,

        // Models
        getAvailableModels,

        // Settings
        getSettings,
        saveSettings,

        // Theme
        getTheme,
        setTheme,

        // Event listeners
        onChatResponse: useChatResponse,
        onError: useError,
        onThemeChange: useThemeChange,

        // Voice
        startRecording,
        stopRecording,

        // Canvas/Code
        saveCodeToFile,
        loadCodeFromFile,

        // Conversations
        getConversations,
        saveConversation,
        deleteConversation,

        // Utility
        hasFeature: (feature) => !!electronAPI[feature]
    };
};
