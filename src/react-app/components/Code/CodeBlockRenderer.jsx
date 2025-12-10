import React from 'react';
import { CodeBlockComponent, SimpleCodeBlockComponent } from './CodeBlockComponent'
import { GenerateId } from '../ConversationRenderer/utils';
import { mathStandardize } from '../../../renderer/js/MathBase/mathRenderer';
export const CodeBlockRenderer = ({ htmlContent }) => {
    const parsedContent = React.useMemo(() => {
        if (!htmlContent) return null;

        const parts = [];
        let lastIndex = 0;

        // Simple and efficient regex - look for start and end markers
        const regex = /<<<CODE_BLOCK\|([\s\S]*?)\|([^>]+)END_BLOCK>>>/g;

        let match;
        while ((match = regex.exec(htmlContent)) !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
                parts.push(
                    <span
                        key={`text-${lastIndex}`}
                        dangerouslySetInnerHTML={{
                            __html: htmlContent.slice(lastIndex, match.index)
                        }}
                    />
                );
            }

            // Extract content - code is in match[1], language in match[2]
            const highlighted = match[1] || '';
            const valid_language = match[2] || 'text';

            /*
             * console.log('Found code block:', {
                language: valid_language,
                codeLength: highlighted.length,
                preview: highlighted.substring(0, 100) + '...'
            });
            */

            if (highlighted.trim()) {
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
            }

            lastIndex = regex.lastIndex;
        }

        // Add remaining text after last match
        if (lastIndex < htmlContent.length) {
            parts.push(
                <span
                    key={`text-${lastIndex}`}
                    dangerouslySetInnerHTML={{
                        __html: htmlContent.slice(lastIndex)
                    }}
                />
            );
        }

        return parts;
    }, [htmlContent]);

    return <>{parsedContent}</>;
};

export const SimpleUserCodeRenderer = ({ htmlContent }) => {
    const parsedContent = React.useMemo(() => {
        if (!htmlContent) return null;

        const parts = [];
        let lastIndex = 0;

        // Simple and efficient regex - look for start and end markers
        const regex = /<<<CODE_BLOCK\|([\s\S]*?)\|([^>]+)END_BLOCK>>>/g;

        let match;
        while ((match = regex.exec(htmlContent)) !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
                parts.push(
                    <span
                        key={`text-${lastIndex}`}
                        dangerouslySetInnerHTML={{
                            __html: htmlContent.slice(lastIndex, match.index)
                        }}
                    />
                );
            }

            // Extract content - code is in match[1], language in match[2]
            const highlighted = match[1] || '';
            const valid_language = match[2] || 'text';

            /*
             * console.log('Found code block:', {
             *              language: valid_language,
             *              codeLength: highlighted.length,
             *              preview: highlighted.substring(0, 100) + '...'
        });
    */

            if (highlighted.trim()) {
                parts.push(
                    <SimpleCodeBlockComponent
                        key={`code-${match.index}`}
                        codeblock_id={GenerateId('code-block')}
                        highlighted={highlighted}
                        valid_language={valid_language}
                    />
                );
            }

            lastIndex = regex.lastIndex;
        }

        // Add remaining text after last match
        if (lastIndex < htmlContent.length) {
            parts.push(
                <span
                    key={`text-${lastIndex}`}
                    dangerouslySetInnerHTML={{
                        __html: htmlContent.slice(lastIndex)
                    }}
                />
            );
        }

        return parts;
    }, [htmlContent]);

    return <>{parsedContent}</>;
};
