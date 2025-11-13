import React from 'react';
import { appIsDev } from '../../../renderer/js/managers/ConversationManager/Mistral/shared';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render shows the fallback UI
        return { hasError: true };
    }

    async componentDidCatch(error, errorInfo) {
        // Catch errors in any components below and re-render with error message
        // Check dev mode only when an error occurs
        try {
            const isDev = await appIsDev();
            this.setState({
                error: error,
                errorInfo: errorInfo,
                isDev: isDev,
                showingError: true
            });
        } catch (err) {
            this.setState({
                error: error,
                errorInfo: errorInfo,
                isDev: false,
                showingError: true
            });
        }
        //console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError && this.state.showingError) {
            return !this.state.isDev ? (
                <div style={{
                    padding: '20px',
                    border: '1px solid #ff6b6b',
                    borderRadius: '8px',
                    backgroundColor: '#ffeaea',
                    margin: '10px',
                }} className='fixed z-30 inset-10 max-h-[90vh] overflow-y-auto'>
                    <h2 style={{ color: '#d63031', margin: '0 0 10px 0' }}>Something went wrong.</h2>
                    <details style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state?.errorInfo?.componentStack}
                    </details>
                    <button
                        onClick={() => this.setState({
                            hasError: false,
                            error: null,
                            errorInfo: null,
                            showingError: false
                        })}
                        style={{
                            marginTop: '10px',
                            padding: '8px 16px',
                            backgroundColor: '#d63031',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                window.ModalManager?.showMessage?.("An error occurred", "error") ||
               ""
            );
        }

        // Show nothing while we're checking dev mode after an error
        if (this.state.hasError && !this.state.showingError) {
            return null; // or a loading spinner
        }

        return this.props?.children;
    }
}

export default ErrorBoundary;
