function wrapFoldableBlocks() {
    const codeView = document.getElementById("code-view");
    const lines = codeView.textContent.split('\n');
    const newHtml = [];
    let stack = [];
    let insideBlock = false;

    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.endsWith("{") && !insideBlock) {
            newHtml.push(`<div class='code-line'>${line}<span class='fold-toggle'>▼</span></div>`);
            newHtml.push(`<div class='fold-content'>`);
            insideBlock = true;
            stack.push("{");
        } else if (trimmed === "}" && insideBlock && stack.length === 1) {
            newHtml.push(`<div class='code-line'>${line}</div>`);
            newHtml.push(`</div>`);
            insideBlock = false;
            stack.pop();
        } else {
            newHtml.push(`<div class='code-line'>${line}</div>`);
        }
    });

    codeView.innerHTML = newHtml.join("\n");

    // Add togglers
    document.querySelectorAll('.fold-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const foldContent = toggle.parentElement.nextElementSibling;
            foldContent.classList.toggle('folded');
            toggle.classList.toggle('folded');
        });
    });
}
