export class CodeScopeDetector {
  static findCodeSpans(text) {
    const codeSpans = [];
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeBlockStart = -1;
    let currentLanguage = '';

    // First pass: detect code blocks
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect code block start
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockStart = i;
          currentLanguage = line.replace(/```/, '').trim() || 'text';
        } else {
          // Code block end
          codeSpans.push({
            type: 'block',
            start: codeBlockStart,
            end: i,
            language: currentLanguage,
            content: lines.slice(codeBlockStart + 1, i).join('\n')
          });
          inCodeBlock = false;
          codeBlockStart = -1;
          currentLanguage = '';
        }
        continue;
      }
    }

    // Second pass: detect inline code
    const inlineRegex = /`([^`]+)`/g;
    let match;
    while ((match = inlineRegex.exec(text)) !== null) {
      // Check if this inline code is inside a code block
      const position = match.index;
      let insideBlock = false;

      for (const block of codeSpans) {
        const blockStart = text.indexOf('```', block.start);
        const blockEnd = text.indexOf('```', blockStart + 3) + 3;
        if (position > blockStart && position < blockEnd) {
          insideBlock = true;
          break;
        }
      }

      if (!insideBlock) {
        codeSpans.push({
          type: 'inline',
          start: match.index,
          end: match.index + match[0].length,
          content: match[1]
        });
      }
    }

    return codeSpans;
  }

  static isPositionInCode(text, position) {
    const codeSpans = this.findCodeSpans(text);
    return codeSpans.some(span => position >= span.start && position <= span.end);
  }

  static getCodeContext(text, position) {
    const codeSpans = this.findCodeSpans(text);
    const relevantSpan = codeSpans.find(span =>
      position >= span.start && position <= span.end
    );

    return relevantSpan || null;
  }
}
