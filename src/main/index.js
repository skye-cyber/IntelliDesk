"use strict";
/**
 * RStudio Electron Main Process
 *
 * This is the main entry point for the Electron application.
 * It handles:
 * - Application lifecycle
 * - Window management
 * - Inter-process communication (IPC)
 * - Native system integration
 * - Python backend process management
 *
 * @module ElectronMain
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// import isDev from 'electron-is-dev';
const keytar_1 = __importDefault(require("keytar"));
const SERVICE_NAME = 'com.intellidesk.app';
// const isDev = !app.isPackaged;
let isQuiting = false;
// let PythonBackendRunning: Boolean = false
// Global reference to main window (required to prevent garbage collection)
let mainWindow = null;
const isDev = !electron_1.app.isPackaged;
let iconPath;
function setAppIcon() {
    iconPath = isDev
        ? path_1.default.join(__dirname, '../assets/intellidesk.png') // for dev
        : path_1.default.join(process.resourcesPath, './assets/intellidesk.png'); // for prod;
    // Fallback to a generic icon or skip setting it
    if (!fs_1.default.existsSync(iconPath)) {
        console.warn('Icon not found, fallback triggered');
        iconPath = '';
    }
}
setAppIcon();
/**
 * Set up IPC handlers for communication between main and renderer processes
 */
function setupIPC() {
    // Handle notify events
    electron_1.ipcMain.on('Notify', (_, data) => {
        console.log('Received time data from renderer:', data.message);
        const timeTaken = data.message;
        if (mainWindow && !mainWindow.isFocused()) {
            const seconds = Math.floor(timeTaken / 1000) % 60;
            const milliseconds = Math.floor(timeTaken % 1000);
            // Create and send a system notification
            new electron_1.Notification({
                title: 'IntelliDesk',
                body: `Request completed in ${seconds} seconds and ${milliseconds} milliseconds`
            }).show();
        }
        // Optionally send a response back
        // event.reply('reply-from-main-process', data);
    });
    // Handle IPC messages from renderer
    electron_1.ipcMain.on('dispatch-to-main-process', (event, data) => {
        //console.log('Received data from renderer:', data);
        // Optionally send a response back
        event.reply('reply-from-main-process', data);
    });
    // Handle IPC messages from renderer
    electron_1.ipcMain.on('desk.api-update-visionchat', (event, data) => {
        //console.log('Received data from VChat:', data);
        // Optionally send a response back
        event.reply('reply-from-main-process', data);
    });
    // Handle IPC messages from renderer
    electron_1.ipcMain.on('desk.api-update-chat', (event, data) => {
        //console.log('Received data from Chat:', data);
        // Optionally send a response back
        event.reply('reply-from-main-process', data);
    });
    // IPC handler to save keyschains
    electron_1.ipcMain.handle('save-key-chain', async (_, chain) => {
        await keytar_1.default.setPassword(SERVICE_NAME, 'mistral', chain);
        return { success: true };
    });
    // IPC handler to retrieve keyschains
    electron_1.ipcMain.handle('get-key-chain', async (_, service = 'mistral') => {
        const MistralKeyChain = await keytar_1.default.getPassword(SERVICE_NAME, service) || [];
        return MistralKeyChain;
    });
    // IPC handler for keyschains reset
    electron_1.ipcMain.handle('reset-key-chain', async (_, accounts) => {
        accounts.forEach(async (account) => {
            try {
                await keytar_1.default.deletePassword(SERVICE_NAME, account);
            }
            catch (err) {
                //console.log(err)
            }
        });
        return { success: true };
    });
    electron_1.ipcMain.handle('save-dg-As-PNG', async (_, buffer, path) => {
        try {
            //console.log('Saving to:', path);
            const { filePath, canceled } = await electron_1.dialog.showSaveDialog({
                title: 'Save Diagram as PNG',
                defaultPath: path,
                filters: [{ name: 'PNG Image', extensions: ['png'] }]
            });
            if (canceled || !filePath) {
                return false;
            }
            fs_1.default.writeFileSync(filePath, buffer);
            console.log('File saved successfully at', filePath);
            return true;
        }
        catch (err) {
            console.error('Failed to save file:', err);
            return false;
        }
    });
    // IPC handler for keys reset
    electron_1.ipcMain.handle('get-app-version', async () => {
        try {
            return electron_1.app.getVersion();
        }
        catch (err) {
            //console.log(err)
            return '';
        }
    });
    electron_1.ipcMain.handle('get-dev-status', async () => {
        return isDev;
    });
    //Handle Documentation shortcut
    electron_1.ipcMain.handle('show-documentation', () => show_documentation);
}
electron_1.app.disableHardwareAcceleration();
function show_documentation() {
    const _docWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    isDev
        ? _docWindow.loadFile(path_1.default.join(__dirname, '../assets/documentation.html'))
        : _docWindow.loadFile(path_1.default.join(process.resourcesPath, './assets/documentation.html'));
}
/**
 * Set up application menu
 */
function setupMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                { label: 'New', accelerator: 'CmdOrCtrl+N', click: () => console.log('New File') },
                { label: 'Open', accelerator: 'CmdOrCtrl+O', click: () => console.log('Open File') },
                { type: 'separator' },
                { label: 'Exit', accelerator: 'CmdOrCtrl+Q', click: () => electron_1.app.quit() }
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
                { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload', role: "reload", accelerator: 'CmdOrCtrl+R', click: (_, focusedWindow) => {
                        if (focusedWindow && 'reload' in focusedWindow) {
                            const view = focusedWindow.getFocusedWebContentsView?.();
                            view?.webContents?.reload();
                        }
                    }
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'F12',
                    role: 'toggleDevTools',
                    click: (_, focusedWindow) => {
                        // Type guard for BaseWindow multi-view support
                        if (focusedWindow && 'getWebContentsView' in focusedWindow) {
                            const view = focusedWindow.getFocusedWebContentsView?.();
                            view?.webContents?.toggleDevTools();
                        }
                        else if ('webContents' in focusedWindow) {
                            focusedWindow.webContents.toggleDevTools();
                        }
                    },
                },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen', accelerator: 'F11' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
                { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' },
                {
                    label: 'Toggle Full Screen',
                    role: 'togglefullscreen', // built-in behavior
                    accelerator: 'F11' // explicit on all platforms
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
                        const docWindow = new electron_1.BrowserWindow({
                            width: 800,
                            height: 600,
                            webPreferences: {
                                preload: path_1.default.join(__dirname, 'preload.js'),
                                nodeIntegration: false,
                                contextIsolation: true
                            }
                        });
                        docWindow.loadFile(path_1.default.join(__dirname, '../assets/documentation.html'));
                    }
                }
            ]
        }
    ];
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
}
// Function to create the loading and main windows
function createWindow() {
    // Create the loading window
    const loadingWindow = new electron_1.BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        alwaysOnTop: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            // enableRemoteModule: false, // Disable remote module if not needed
        }
    });
    // isDev
    loadingWindow.loadFile(path_1.default.join(__dirname, '../assets/loading.html'));
    //: loadingWindow.loadFile(path.join(process.resourcesPath, './assets/loading.html'));
    loadingWindow.show(); // Show the loading window immediately
    // Create the main window
    mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        icon: iconPath, // Path to your icon file
        show: false,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'), // Use the preload script
            nodeIntegration: false, // Enable Node.js integration in the renderer process
            contextIsolation: true,
            sandbox: false, // Disable sandboxing
        }
    });
    if (isDev) {
        mainWindow.loadURL('http://localhost:40099/');
        // Open DevTools in development
        //mainWindow.webContents.openDevTools()
    }
    else {
        // Load the main application when it is ready
        mainWindow.loadFile(path_1.default.join(process.resourcesPath, './build/index.html'));
    }
    // Show the main window and close the loading window when the main window is ready to show**
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        loadingWindow.close();
    });
    // Intercept the window close event
    mainWindow.on('close', (event) => {
        if (!isQuiting && process.platform !== 'darwin') {
            event.preventDefault(); // prevent window from actually closing
            mainWindow?.hide(); // just hide it to tray
        }
        return false;
    });
    // Return the main window for reference
    return mainWindow;
}
// Set the app user model ID
electron_1.app.setAppUserModelId('com.intellidesk.app');
electron_1.app.on('ready', async () => {
    try {
        await prepDirectories(); // if it's an async function
    }
    catch (err) {
        console.error('Error creating directories:', err);
    }
    setupIPC();
    // Create and set the menu
    setupMenu();
    // Create the main window
    const mainWindow = createWindow();
    // Create the tray icon
    const tray = new electron_1.Tray(iconPath); // Path to your tray icon
    const contextMenu = electron_1.Menu.buildFromTemplate([
        {
            label: 'Show',
            click: () => {
                const windows = electron_1.BrowserWindow.getAllWindows();
                if (windows.length === 0) {
                    createWindow();
                }
                else {
                    windows[0].show();
                }
            }
        },
        {
            label: 'New window',
            click: () => {
                createWindow();
            }
        },
        {
            label: 'Help',
            click: () => {
                show_documentation();
            }
        },
        {
            label: 'Quit',
            click: () => {
                isQuiting = true;
                electron_1.app.quit();
            }
        }
    ]);
    tray.setToolTip('IntelliDesk');
    tray.setContextMenu(contextMenu);
    // Restore window on tray double-click
    tray.on('double-click', () => {
        mainWindow.show();
    });
});
// app.on('window-all-closed', (event) => {
//     event.preventDefault();// ✅ don’t quit app when all windows closed
//     //if (process.platform !== 'darwin') {
//     //  app.quit(); // Quit when all windows are closed, except on macOS
//     //}
// });
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow(); // Recreate a window if none are open on macOS
    }
});
async function prepDirectories() {
    try {
        const baseDir = path_1.default.join(electron_1.app.getPath('home'), '.IntelliDesk');
        // Create the base .IntelliDesk directory if it doesn't exist
        fs_1.default.mkdirSync(baseDir, { recursive: true });
        //console.log(`Ensured base directory: ${baseDir}`);
        // Define subdirectories to be created inside .IntelliDesk
        const subdirs = ['.config', '.store', '.cache'];
        subdirs.forEach(sub => {
            const fullPath = path_1.default.join(baseDir, sub);
            fs_1.default.mkdirSync(fullPath, { recursive: true });
            //console.log(`Ensured subdirectory: ${fullPath}`);
        });
    }
    catch (error) {
        console.log(error);
    }
}
//# sourceMappingURL=index.js.map