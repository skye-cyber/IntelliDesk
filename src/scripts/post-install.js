const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../../node_modules/underscore/package.json');
console.log(filePath)
try {
    let content = fs.readFileSync(filePath, 'utf8');
    console.log(content)
    // fix: replace dependencies array with an empty object or correct JSON
    content = content.replace(/"dependencies"\s*:\s*\[[\s\S]*?\]/, '"dependencies": {}');

    fs.writeFileSync(filePath, content, 'utf8');

    console.log("content after", fs.readFileSync(filePath, 'utf8'))
    console.log('Fixed malformed package.json in underscore');
} catch (err) {
    console.error('Error fixing package.json:', err);
}
