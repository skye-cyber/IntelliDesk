import React from 'react';
import { CodeBlockComponent } from './CodeBlockComponent'
import { GenerateId } from './Renderer';

export const CodeBlockRenderer = ({ htmlContent }) => {
    // Parse the HTML and replace tokens with React components
    const parseHtmlWithCodeBlocks = (html) => {
        const parts = [];
        let lastIndex = 0;
        const regex = /<<<CODE_BLOCK\|\|([^|]+)\|\|([^>]+)>>>/g;

        let match;
        while ((match = regex.exec(html)) !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
                parts.push(
                    <span key={`text-${lastIndex}`}
                        dangerouslySetInnerHTML={{ __html: html.slice(lastIndex, match.index) }}
                    />
                );
            }

            // Add the code block component
            const highlighted = match[1];
            const valid_language = match[2];

            parts.push(
                <CodeBlockComponent
                    key={`code-${match.index}`}
                    codeblock_id={GenerateId('code-block')}
                    highlighted={highlighted}
                    valid_language={valid_language}
                    copy_button_id={GenerateId('copy-button')}
                    download_button_id={GenerateId('download')}
                    open_in_canvas_id={GenerateId('open-canvas')}
                    render_button_id={GenerateId('render-button')}
                />
            );

            lastIndex = regex.lastIndex;
        }

        // Add remaining text after last match
        if (lastIndex < html.length) {
            parts.push(
                <span key={`text-${lastIndex}`}
                    dangerouslySetInnerHTML={{ __html: html.slice(lastIndex) }}
                />
            );
        }

        return parts;
    };

    return <>{parseHtmlWithCodeBlocks(htmlContent)}</>;
};
