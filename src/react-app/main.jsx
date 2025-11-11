import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import '../renderer/js/polyfills/polyfills';

// Optimized mounting with better error handling and performance
const mountApp = async () => {
    try {
        console.log('🚀 Starting app mounting process...');

        // Wait for DOM to be ready with fallback
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve, { once: true });
            });
        }

        const container = document.getElementById('react-root');
        if (!container) {
            throw new Error('React root element (#react-root) not found in DOM');
        }

        console.log('✅ DOM ready, container found');

        // Render the app
        const root = createRoot(container);
        root.render(React.createElement(App));

        console.log('🎉 React app mounted successfully!');

    } catch (error) {
        console.error('💥 Failed to mount React app:', error);

        // Provide user feedback
        const container = document.getElementById('react-root');
        if (container) {
            container.innerHTML = `
            <div style="padding: 20px; color: #721c24; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">
            <h3>Application Error</h3>
            <p>Failed to load the application. Please refresh the page.</p>
            <details style="margin-top: 10px;">
            <summary>Technical Details</summary>
            <pre style="white-space: pre-wrap; font-size: 12px;">${error.message}</pre>
            </details>
            </div>
            `;
        }
    }
};

// Start the mounting process immediately
mountApp();
