export class Editor {
    constructor(editorElement, callbacks = []) {
        this.editor = editorElement;
        this.callbacks = callbacks
        this.init();
    }

    init() {
        this.editor.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.editor.addEventListener('input', this.handleInput.bind(this));

        // Set initial structure if empty
        if (this.editor.innerHTML.trim() === '') {
            this.editor.innerHTML = '<div><br></div>';
        }
    }

    handleKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();

            if (event.shiftKey) {
                this.insertLineBreak();
            } else {
                this.insertNewBlock();
            }
        }
        for (let callback of this.callbacks) {
            callback(event)
        }
    }

    insertLineBreak() {
        document.execCommand('insertHTML', false, '<br>');
    }

    insertNewBlock() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const currentBlock = this.getContainingBlock(range.startContainer);

        if (currentBlock) {
            this.splitBlockAtCursor(currentBlock, range);
        } else {
            this.createNewBlockAfterCursor(range);
        }
    }

    splitBlockAtCursor(currentBlock, range) {
        // Get cursor position within the current block
        const cursorPosition = range.startOffset;
        const blockContent = currentBlock.innerHTML;

        // Split content at cursor position
        const contentBeforeCursor = blockContent.substring(0, cursorPosition);
        const contentAfterCursor = blockContent.substring(cursorPosition);

        // Create new block for content after cursor
        const newBlock = document.createElement('div');

        if (contentAfterCursor.trim() === '') {
            newBlock.innerHTML = '<br>';
        } else {
            newBlock.innerHTML = contentAfterCursor;
        }

        // Update current block with content before cursor
        if (contentBeforeCursor.trim() === '') {
            currentBlock.innerHTML = '<br>';
        } else {
            currentBlock.innerHTML = contentBeforeCursor;
        }

        // Insert new block after current block
        currentBlock.parentNode.insertBefore(newBlock, currentBlock.nextSibling);

        // Move cursor to the start of the new block
        this.moveCursorToStart(newBlock);
    }

    createNewBlockAfterCursor(range) {
        // Fallback method using execCommand
        document.execCommand('formatBlock', false, 'div');

        // Ensure the new block is properly formatted
        setTimeout(() => {
            const selection = window.getSelection();
            const currentNode = selection.anchorNode;
            const currentBlock = this.getContainingBlock(currentNode);

            if (currentBlock && currentBlock.innerHTML === '') {
                currentBlock.innerHTML = '<br>';
            }
        }, 0);
    }

    moveCursorToStart(element) {
        const range = document.createRange();
        const selection = window.getSelection();

        range.setStart(element, 0);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);
    }

    getContainingBlock(node) {
        while (node && node !== this.editor) {
            if (node.nodeType === Node.ELEMENT_NODE &&
                (node.tagName === 'DIV' || node.tagName === 'P')) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }

    handleInput(event) {
        // Clean up empty blocks
        const blocks = this.editor.querySelectorAll('div, p');
        blocks.forEach(block => {
            if (block.innerHTML.trim() === '' || block.innerHTML === '<br>') {
                block.innerHTML = '<br>';
            }
        });
        for (let callback of this.callbacks) {
            callback(event)
        }
    }
}
