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
            created_at: '',
            update_at: '',
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
            console.log("Processing:", i, 'Name:', file)
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
                created_at: (name.length > 2 && datePattern.test(name)) ? name : '',
                highlight: stripHtmlTags(highlight)
            }
            //console.log(schema[0].chats)

            await fs.writeFile(filePath, JSON.stringify(schema))
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

//transformFn()
//const fpath = path.join(os.homedir(), '.IntelliDesk/.store')

async function transformST() {
    const data = await fs.readFile('conversations.json', 'utf-8')
    const tdata = JSON.stringify(JSON.parse(data), null, 2)
    fs.writeFile('transformed_conversations.json', tdata);
}

//transformST()


function hasFiles(item) {
    console.log(item.key)
    const res = item?.filter(i => i?.message.files.length > 0)

    console.log(res)
    return res
}

async function transformDS() {
    const raw_data = await fs.readFile('transformed_conversations.json', 'utf-8')
    const data = JSON.parse(raw_data)
    //for (let i = 0; i < files.length; i++)
    data.forEach(conv => {
        schema[0].metadata = {
            model: hasFiles(conv.mapping) ? 'multimodal' : 'chat',
            name: '',
            id: conv.id,
            created_at: conv.inserted_at,
            highlight: conv.title,
            update_at: conv.updated_at
        }
        console.log(schema)
        return
    })
}

transformDS()
