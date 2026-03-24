import React from 'react';

class UserFriendlyErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Component Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666'
                }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
                <h3>Oops! Something went wrong</h3>
                <p>This component encountered an error. The issue has been logged.</p>
                <button
                onClick={() => this.setState({ hasError: false })}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
                >
                Reload Component
                </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default UserFriendlyErrorBoundary;
