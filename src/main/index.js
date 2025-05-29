const { app, BrowserWindow, Tray, Menu, ipcMain, Notification, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const keytar = require('keytar');

let mainWindow;

const isDev = !app.isPackaged;
const iconPath = isDev
    ? path.join(__dirname, '../assets/quickai.png') // for dev
    : path.join(process.resourcesPath, 'assets/quickai.png'); // for prod;

// Fallback to a generic icon or skip setting it
if (!fs.existsSync(iconPath)) {
    console.warn('Icon not found, fallback triggered');
    iconPath = undefined;
}


// Handle notify events
ipcMain.on('Notify', (event, data) => {
    console.log('Received time data from renderer:', data.message);

    const timeTaken = data.message;
    if (mainWindow && !mainWindow.isFocused()) {
        const seconds = Math.floor(timeTaken / 1000) % 60;
        const milliseconds = Math.floor(timeTaken % 1000);

        // Create and send a system notification
        new Notification({
            title: 'QuickAi',
            body: `Request completed in ${seconds} seconds and ${milliseconds} milliseconds`
        }).show();
    }

    // Optionally send a response back
    // event.reply('fromMain', data);
});


// Handle IPC messages from renderer
ipcMain.on('toMain', (event, data) => {
    //console.log('Received data from renderer:', data);
    // Optionally send a response back
    event.reply('fromMain', data);
});

// Handle IPC messages from renderer
ipcMain.on('fromVision-ToMain', (event, data) => {
    //console.log('Received data from VChat:', data);
    // Optionally send a response back
    event.reply('fromMain-ToVision', data);
});

// Handle IPC messages from renderer
ipcMain.on('fromChat-ToMain', (event, data) => {
    //console.log('Received data from Chat:', data);
    // Optionally send a response back
    event.reply('fromMain-ToChat', data);
});

app.disableHardwareAcceleration()


//Handle Documentation shortcut
ipcMain.handle('show-documentation', () => {
    const _docWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    _docWindow.loadFile(path.join(__dirname, '../assets/documentation.html'));
});

const template = [
    {
        label: 'File',
        submenu: [
            { label: 'New', accelerator: 'CmdOrCtrl+N', click: () => console.log('New File') },
            { label: 'Open', accelerator: 'CmdOrCtrl+O', click: () => console.log('Open File') },
            { type: 'separator' },
            { label: 'Exit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
            { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
            { type: 'separator' },
            { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
            { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
            { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
            { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
        ]
    },
    {
        label: 'View',
        submenu: [
            { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: (item, focusedWindow) => focusedWindow.reload() },
            { label: 'Toggle Developer Tools', accelerator: 'F12', click: (item, focusedWindow) => focusedWindow.webContents.toggleDevTools() },
            { type: 'separator' },
            { label: 'Zoom In', accelerator: 'CmdOrCtrl+=', click: (item, focusedWindow) => focusedWindow.webContents.send('zoom-in') },
            { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: (item, focusedWindow) => focusedWindow.webContents.send('zoom-out') }
        ]
    },
    {
        label: 'Window',
        submenu: [
            { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
            { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' },
            {   label: 'Toggle Full Screen',
                role: 'togglefullscreen',       // built-in behavior
                accelerator: 'F11'              // explicit on all platforms
            }
        ]
    },

    {
        label: 'Help',
        submenu: [
            { label: 'Learn More', click: () => require('electron').shell.openExternal('https://electronjs.org') },
            {
                label: 'Documentation',
                click: () => {
                    const docWindow = new BrowserWindow({
                        width: 800,
                        height: 600,
                        webPreferences: {
                            preload: path.join(__dirname, 'preload.js'),
                            nodeIntegration: false,
                            contextIsolation: true
                        }
                    });
                    docWindow.loadFile(path.join(__dirname, '../assets/documentation.html'));
                }
            }
        ]
    }
];

// Function to create the loading and main windows
function createWindow() {
    // Create the loading window
    const loadingWindow = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        alwaysOnTop: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false, // Disable remote module if not needed
        }
    });

    loadingWindow.loadFile(path.join(__dirname, '../assets/loading.html'));
    loadingWindow.show(); // Show the loading window immediately

    // Create the main window
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: iconPath, // Path to your icon file
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Use the preload script
            nodeIntegration: false, // Enable Node.js integration in the renderer process
            contextIsolation: true,
            sandbox: false, // Disable sandboxing
        }
    });

    // Load the main application when it is ready
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html')); // Load your HTML file

    // Show the main window and close the loading window when the main window is ready to show**
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        loadingWindow.close();
    });

    // Return the main window for reference
    return mainWindow;
}

// Set the app user model ID
app.setAppUserModelId('com.quickai.app');

app.on('ready', async () => {
    try {
        await prepDirectories(); // if it's an async function
    } catch (err) {
        console.error('Error creating directories:', err);
    }

    // Create and set the menu
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    // Create the main window
    const mainWindow = createWindow();
    //const storagePath = path.join(app.getPath('home'), '.quickai.store');
    //mainWindow.webContents.send('storagePath', storagePath);

    // Create the tray icon
    const tray = new Tray(path.join(iconPath)); // Path to your tray icon
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                } else {
                    createWindow();
                }
            }
        },
        {
            label: 'Quit',
            click: () => {
                app.quit();
            }
        }
    ]);

    tray.setToolTip('QuickAI');
    tray.setContextMenu(contextMenu);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit(); // Quit when all windows are closed, except on macOS
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow(); // Recreate a window if none are open on macOS
    }
});


const SERVICE_NAME = 'com.quickai.app'

// IPC handler to save keys
ipcMain.handle('save-keys', async (event, keys) => {
    const { mistralKey, huggingfaceKey } = keys;
    if (mistralKey) {
        await keytar.setPassword(SERVICE_NAME, 'mistral', mistralKey);
    }
    if (huggingfaceKey) {
        await keytar.setPassword(SERVICE_NAME, 'huggingface', huggingfaceKey);
    }
    return { success: true };
});

// IPC handler to retrieve keys
ipcMain.handle('get-keys', async (event, keyType) => {
    const mistralKey = await keytar.getPassword(SERVICE_NAME, 'mistral') || null;
    const huggingfaceKey = await keytar.getPassword(SERVICE_NAME, 'huggingface') || null;

    if (keyType) {
        return (keyType === "mistral") ? { mistralKey } : { huggingfaceKey };

    } else {
        //console.log({ mistralKey, huggingfaceKey })
        return { mistralKey, huggingfaceKey };
    }
});

ipcMain.handle('save-dg-As-PNG', async (event, buffer, path) => {
    try {
        //console.log('Saving to:', path);
        const { filePath, canceled } = await dialog.showSaveDialog({
            title: 'Save Diagram as PNG',
            defaultPath: path,
            filters: [{ name: 'PNG Image', extensions: ['png'] }]
        });

        if (canceled || !filePath) {
            return false;
        }

        fs.writeFileSync(filePath, buffer);
        console.log('File saved successfully at', filePath);
        return true;
    } catch (err) {
        console.error('Failed to save file:', err);
        return false;
    }
});

async function prepDirectories() {
    try {
        const baseDir = path.join(app.getPath('home'), '.quickai');

        // Create the base .quickai directory if it doesn't exist
        fs.mkdirSync(baseDir, { recursive: true });
        console.log(`Ensured base directory: ${baseDir}`);

        // Define subdirectories to be created inside .quickai
        const subdirs = ['.quickai.config', '.quickai.store', '.quickai.cache'];

        subdirs.forEach(sub => {
            const fullPath = path.join(baseDir, sub);
            fs.mkdirSync(fullPath, { recursive: true });
            console.log(`Ensured subdirectory: ${fullPath}`);
        });
    } catch (error) {
        console.log(error)
    }
}
