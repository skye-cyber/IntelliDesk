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
            timestamp: ''
        },
        chats: []
    }
]

async function listFiles() {
    try {
        const files = await fs.readdir(dpath);
        for (const file of files) {
            const filePath = path.join(dpath, file);
            const data = await fs.readFile(filePath, 'utf-8')
            const content = JSON.parse(data)
            const name = file.split('.')[0].slice(2)
            schema[0].chats = content
            schema[0].metadata = {
                model: file.startsWith('C') ? 'chat' : 'multimodal',
                name: name,
                id: name,
                timestamp: name.slice(2).includes('-') ? name : ''
            }
            await fs.writeFile(filePath, JSON.stringify(schema))
        }

        //console.log('Directory contents:', files);
    } catch (err) {
        console.error('Error:', err);
    }
}

listFiles()
