const fs = require('fs/promises');
const path = require('path');
const os = require('os');

const dpath = path.join(os.homedir(), '.IntelliDesk/.store')

let schema = [
    {
        metadata: {
            model: 'chat',
            name: '',
            id: '',
            timestamp: '',
            highlight: ''
        },
        chats: []
    }
]

const datePattern = /^\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/;

function stripHtmlTags(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/<[^>]*>?/g, '');
}

async function transformFn() {
    try {
        const files = await fs.readdir(dpath);
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            console.log("Processing:", i,'Name:', file)
            const filePath = path.join(dpath, file);
            const data = await fs.readFile(filePath, 'utf-8')
            let content = JSON.parse(data)
            const name = file.split('.')[0].slice(2)
            const id = file.split('.')[0]
            let highlight = ''

            try {
                if (content[0].role === 'system') {
                    content.shift()
                }
                if (file.startsWith('C')) {
                    highlight = content[0].content
                        ?.replace(/\[\d{1,2}:\d{2} \d{2}-\d{2}-\d{4} UT\s*]?/g, '') //Remove date
                        .slice(0, 30)

                } else {
                    highlight = content[0].content[0].text
                        ?.replace(/\[\d{1,2}:\d{2} \d{2}-\d{2}-\d{4} UT\s*]?/g, '') //Remove date
                        .slice(0, 30)
                }
            } catch (err) {
                highlight = ''
            }
            highlight = (typeof highlight === 'string' && highlight.trim())
                ? highlight.trim()
                    .replace(/(\S)\n(\S)/g, '$1 $2') // Remove line breaks
                    .replace(/[\r\n]+/g, '') //Replace \n between word with space
                : '';

            schema[0].chats = content
            schema[0].metadata = {
                model: file.startsWith('C') ? 'chat' : 'multimodal',
                name: name,
                id: id,
                timestamp: (name.length > 2 && datePattern.test(name)) ? name : '',
                highlight: stripHtmlTags(highlight)
            }
            //console.log(schema[0].chats)

            await fs.writeFile(filePath, JSON.stringify(schema))
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

transformFn()
