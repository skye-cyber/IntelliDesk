import { configureStore } from '@reduxjs/toolkit';
import toolPermissionsReducer from './toolPermissionsSlice';
import uiReducer from './uiSlice';
import { useSelector, useDispatch } from 'react-redux';

export const store = configureStore({
  reducer: {
    toolPermissions: toolPermissionsReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false // Allow non-serializable values if needed
    })
});

// Create typed hooks for TypeScript
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Export store types
export const selectToolPermissions = (state) => state.toolPermissions;
export const selectUI = (state) => state.ui;
