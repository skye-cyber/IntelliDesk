const fs = require('fs/promises');
const path = require('path');
const os = require('os');

const dpath = path.join(os.homedir(), '.IntelliDesk/.store')

let schema =
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
                if (content.role === 'system') {
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

            schema.chats = content
            schema.metadata = {
                model: file.startsWith('C') ? 'chat' : 'multimodal',
                name: name,
                id: id,
                created_at: (name.length > 2 && datePattern.test(name)) ? name : '',
                highlight: stripHtmlTags(highlight)
            }
            //console.log(schema.chats)
            await fs.writeFile(filePath, JSON.stringify(content))
        }
    } catch (err) {
        console.error('Error:', err);
    }
}


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
        schema.metadata = {
            model: hasFiles(conv.mapping) ? 'multimodal' : 'chat',
            name: '',
            id: conv.id,
            created_at: conv.inserted_at,
            highlight: conv.title,
            update_at: conv.updated_at
        }
        return
    })
}


function getformatDateTime(reverse = false) {
    // Step 1: Create a Date object
    const now = new Date();

    // Step 2: Extract the components
    const year = now.getFullYear().toString().slice(-2); // Get the last two digits of the year
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-based, so add 1
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Step 3: Combine the components
    const formattedDateTime = reverse === true
        ? `${hours}:${minutes} ${day}-${month}-20${year}`
        : `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;

    return formattedDateTime;
}

//transformDS()
//transformFn()

const code = require('../react-app/components/code/autoCodeDetector.js')

async function transformUFn() {
    try {
        const files = await fs.readdir('cache');
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            console.log("Index:", i, 'File:', file)
            const filePath = path.join(__dirname, 'cache', file)

            const data = await fs.readFile(filePath, 'utf-8')
            let content = JSON.parse(data)
            //content.metadata.created_at = getformatDateTime(content.metadata.created_at)
            //content.metadata.updated_at = getformatDateTime(content.metadata.updated_at)

            const chats = content.chats.map(chat => {
                let formattedMessage = chat.content
                if (chat.role === 'user') {
                    formattedMessage = code.AutoCodeDetector.autoFormatCodeBlocks(chat.content)
                        //.replaceAll('&gt;', '>')
                        //.replaceAll('&lt;', '<')
                        //.replaceAll('&amp;', '&')
                        //.replaceAll('&nbsp;', ' ')
                        //.replaceAll('<br>', '\n')

                }
                return {
                    ...chat,
                    content: formattedMessage
                }
            })
            content.chats = chats
            const tdata = JSON.stringify(content, null, 2)
            fs.writeFile(`cache/${file}`, tdata);
        }
    } catch (err) {
        console.log(err)
    }
}
transformUFn()
