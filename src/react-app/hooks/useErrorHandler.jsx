import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
    const [error, setError] = useState(null);

    const handleError = useCallback((error) => {
        setError(error);
        console.error('Error caught:', error);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return { error, handleError, clearError };
};


export const useErrorModal = () => {
    const [error, setError] = useState(null);

    const showError = useCallback((message, title = "Error", retryAction = null) => {
        setError({ message, title, retryAction });
        console.log(error)
    }, [setError]);

    const hideError = useCallback(() => {
        setError(null);
    }, []);

    return {
        error,
        showError,
        hideError
    };
};
