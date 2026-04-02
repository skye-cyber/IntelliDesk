import { createSlice } from '@reduxjs/toolkit';

const toolPermissionsSlice = createSlice({
    name: 'toolPermissions',
    initialState: {
        pendingRequests: [],
        permissionHistory: [],
        settings: {
            defaultTimeout: 10000, // 10 seconds
            autoApproveTrusted: false
        },
        trustedTools: {} // { 'bash': 'allow_always', 'file_writer': 'allow_session' }
    },
    reducers: {
        addPermissionRequest: (state, action) => {
            const request = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                status: 'pending',
                ...action.payload
            };
            state.pendingRequests.push(request);
        },
        resolvePermissionRequest: (state, action) => {
            const { toolName, decision } = action.payload;
            const request = state.pendingRequests.find(r => r.toolName === toolName);
            if (request) {
                request.status = 'resolved';
                request.decision = decision;
                request.resolvedAt = new Date().toISOString();

                // Move to history
                state.permissionHistory.unshift(request);

                // Remove from pending
                state.pendingRequests = state.pendingRequests.filter(r => r.toolName !== toolName);

                // Update trusted tools if always decision
                if (decision === 'always_allow') {
                    state.trustedTools[request.toolName] = 'always_allow';
                } else if (decision === 'always_deny') {
                    state.trustedTools[request.toolName] = 'always_deny';
                }
            }
        },
        updateSettings: (state, action) => {
            state.settings = { ...state.settings, ...action.payload };
        },
        clearTrustedTool: (state, action) => {
            delete state.trustedTools[action.payload];
        },
        clearHistory: (state) => {
            state.permissionHistory = [];
        }
    }
});

export const {
    addPermissionRequest,
    resolvePermissionRequest,
    updateSettings,
    clearTrustedTool,
    clearHistory
} = toolPermissionsSlice.actions;

export default toolPermissionsSlice.reducer;
