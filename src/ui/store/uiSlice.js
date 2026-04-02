import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        theme: localStorage.getItem('theme') || 'light',
        modalOpen: false,
        notifications: [],
        expandedArgs: {},
        copiedStates: {}
    },
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', state.theme);
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
        },
        openModal: (state, action) => {
            state.modalOpen = true;
            if (action.payload) {
                state.modalData = action.payload;
            }
        },
        closeModal: (state) => {
            state.modalOpen = false;
            state.modalData = null;
        },
        addNotification: (state, action) => {
            state.notifications.push({
                id: Date.now(),
                ...action.payload
            });
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
        },
        toggleExpanded: (state, action) => {
            const { requestId, expanded } = action.payload;
            state.expandedArgs[requestId] = expanded !== undefined ? expanded : !state.expandedArgs[requestId];
        },
        setCopied: (state, action) => {
            const { requestId, copied } = action.payload;
            state.copiedStates[requestId] = copied;
        }
    }
});

export const {
    toggleTheme,
    setTheme,
    openModal,
    closeModal,
    addNotification,
    removeNotification,
    toggleExpanded,
    setCopied
} = uiSlice.actions;

export default uiSlice.reducer;
