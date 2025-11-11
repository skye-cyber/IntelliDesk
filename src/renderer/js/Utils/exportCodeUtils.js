export const exportCodeToFile = (codeblockId) => {
    window.ModalManager.startLoader("Preparing code to file")
    try {
        // Get the code block element
        const codeBlock = document.getElementById(codeblockId);
        if (!codeBlock) {
            console.error('Code block not found:', codeblockId);
            return;
        }

        // Extract the actual code (remove HTML tags if present)
        let codeContent = '';

        // Check if the content is HTML highlighted code or plain text
        if (codeBlock.innerHTML && codeBlock.innerHTML !== codeBlock.textContent) {
            // It's highlighted HTML, get the raw text
            codeContent = codeBlock.textContent || codeBlock.innerText;
        } else {
            // It's plain text
            codeContent = codeBlock.textContent || codeBlock.innerText || '';
        }

        // Clean up the code content (remove extra whitespace)
        codeContent = codeContent.trim();

        if (!codeContent) {
            console.error('No code content found in code block');
            return;
        }

        // Get language from class list or determine from content
        let language = 'txt';
        const classList = codeBlock.className.split(' ');

        // Common language mappings
        const languageExtensions = {
            // Programming languages
            'python': 'py',
            'javascript': 'js',
            'typescript': 'ts',
            'java': 'java',
            'cpp': 'cpp',
            'c++': 'cpp',
            'c': 'c',
            'csharp': 'cs',
            'cs': 'cs',
            'php': 'php',
            'ruby': 'rb',
            'go': 'go',
            'rust': 'rs',
            'swift': 'swift',
            'kotlin': 'kt',
            'scala': 'scala',
            'r': 'r',

            // Web technologies
            'html': 'html',
            'css': 'css',
            'xml': 'xml',
            'json': 'json',
            'yaml': 'yml',
            'markdown': 'md',

            // Shell/Config
            'bash': 'sh',
            'shell': 'sh',
            'powershell': 'ps1',
            'sql': 'sql',
            'dockerfile': 'dockerfile',
            'nginx': 'conf',

            // Data formats
            'dot': 'dot',
            'dot-draw': 'dot',
            'json-draw': 'json',
            'json-chart': 'json'
        };

        // Find language from class names
        for (const className of classList) {
            if (languageExtensions[className]) {
                language = className;
                break;
            }

            // Also check for hljs language classes
            if (className.startsWith('language-')) {
                const lang = className.replace('language-', '');
                if (languageExtensions[lang]) {
                    language = lang;
                    break;
                }
            }
        }

        // Get file extension
        const fileExtension = languageExtensions[language] || 'txt';

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `code-${timestamp}.${fileExtension}`;

        // Create and trigger download
        const blob = new Blob([codeContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        window.ModalManager.showMessage(`Error downloading code: ${err}`, 'error')
        console.log(e)
    }
    finally {
        window.ModalManager.hideLoader()

    }
};

// Alternative function that accepts the code content directly
export const exportCodeContentToFile = (codeContent, language = 'txt') => {
    if (!codeContent || codeContent.trim() === '') {
        console.error('No code content provided');
        return;
    }

    // Language to extension mapping (same as above)
    const languageExtensions = {
        'python': 'py', 'javascript': 'js', 'typescript': 'ts', 'java': 'java',
        'cpp': 'cpp', 'c++': 'cpp', 'c': 'c', 'csharp': 'cs', 'php': 'php',
        'ruby': 'rb', 'go': 'go', 'rust': 'rs', 'swift': 'swift', 'kotlin': 'kt',
        'html': 'html', 'css': 'css', 'json': 'json', 'yaml': 'yml', 'markdown': 'md',
        'bash': 'sh', 'shell': 'sh', 'sql': 'sql', 'dot': 'dot', 'dot-draw': 'dot',
        'json-draw': 'json', 'json-chart': 'json'
    };

    const fileExtension = languageExtensions[language] || 'txt';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `code-${timestamp}.${fileExtension}`;

    const blob = new Blob([codeContent.trim()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
