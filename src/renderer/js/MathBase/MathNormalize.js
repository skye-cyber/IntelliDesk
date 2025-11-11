export async function normaliZeMathDisplay(selector, space=true) {
    let items = null
    if (selector) {
        const target = document.querySelector(selector)
        items = target?.querySelectorAll('.katex-display')
    } else {
        items = document.querySelectorAll('.katex-display')
    }
    if (items) {
        items.forEach(item => {
            item.classList.remove('katex-display')
            item.classList.add('p-2', 'space-y-2')
        });
    }
    if (space){
        normalizeMathSpacing();
        //normalizeCodeBlock(selector);
    }
}


export async function normalizeCodeBlock(selector){
    const element = document.querySelector(selector)
    const blocks = element?.querySelectorAll('code')
    blocks.forEach(block =>{
        const childItem = block.querySelectorAll()
        // Replace $...$ with [...]
        //block.textContent = block.textContent.replace(/\$(.*?)\$/g, '[$1]');

        // Replace $$...$$ with [...]
        block.innerText = block.innerText.replace(/\$\$(.*?)\$\$/g, '[$1]');
    })
}
export async function normalizeMathSpacing() {
    const items = document.querySelectorAll('.katex');
    if (items) {
        items.forEach(item => {
            const parItem = item.parentNode.parentNode.parentElement;
            parItem.classList.add('p-4');
        })
    }
}

export function normalizeMathDelimiters(text) {
    // 1) extract all ```…``` blocks and replace with placeholders
    const codeBlocks = [];
    const placeholder = (_match, idx) => `@@CODEBLOCK${idx}@@`;
    text = text?.replace(/```[\s\S]*?```/g, match => {
        const i = codeBlocks.push(match) - 1;
        return `@@CODEBLOCK${i}@@`;
    });

    // 2) do your two math‐delimiter replacements
    text = text
    // […] → $$…$$ when inside looks like math
    .replace(
        /\[([^\[\]]*?(?:\\|[\d\^+\-*/])[^\[\]]*?)\]/g,
             (_, expr) => `$$${expr.trim()}$$`
    )
    // merge stray newlines in $$…$$ blocks that look like math
    .replace(
        /\$\$(?=[\s\S]*?(?:\\|[\d\^+\-*/]))([\s\S]*?)\$\$/g,
             (_, expr) => `$$${expr.replace(/\n/g, ' ').trim()}$$`
    );

    // 3) restore code-blocks back into their placeholders
    text = text.replace(/@@CODEBLOCK(\d+)@@/g, (_, n) => codeBlocks[Number(n)]);

    return text;
}

window.normalizeMathDelimiters = normalizeMathDelimiters
