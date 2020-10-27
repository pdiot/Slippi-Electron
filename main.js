const { app, BrowserWindow, ipcMain } = require('electron');
const slippiStats = require('./slippi-stats');

function createWindow () { 
    // Create the browser window. 
    const win = new BrowserWindow({ 
        width: 1400, 
        height: 800, 
        webPreferences: { 
            nodeIntegration: true
        } 
    });

    win.maximize();

    // Load the index.html of the app 
    // From the dist folder which is created 
    // After running the build command 
    win.loadFile('dist/ang-electron/index.html') 

    // Open the DevTools. 
    win.webContents.openDevTools()

    ipcMain.on('openFile', (event, path) => {
        const { dialog } = require('electron');
        const fs = require('fs');
        dialog.showOpenDialog(win, {
            title: 'Choisir les replays Slippi à charger',
            filters: [
                {
                    name: 'Fichiers Slippi',
                    extensions: ['slp']
                }
            ],
            properties: [
                'multiSelections'
            ]
        }).then((returnValue => {
            if (!returnValue.canceled) {
                getMetadata(returnValue.filePaths).then(result => {
                    event.sender.send('fileOpenedOK', result);
                })
            }
        })); 
    });
} 

// This method will be called when Electron has finished 
// initialization and is ready to create browser windows. 
// Some APIs can only be used after this event occurs. 
// This method is equivalent to 'app.on('ready', function())' 
app.whenReady().then(createWindow) 

// Quit when all windows are closed. 
app.on('window-all-closed', () => { 
    // On macOS it is common for applications and their 
    // menu bar to stay active until the user quits 
    // explicitly with Cmd + Q 
    if (process.platform !== 'darwin') { 
        app.quit() 
    } 
}) 

app.on('activate', () => { 
    // On macOS it's common to re-create a window in the 
    // app when the dock icon is clicked and there are 
    // no other windows open. 
    if (BrowserWindow.getAllWindows().length === 0) { 
        createWindow() 
    } 
}) 

function makeJSons(filepaths) {
    slippiStats.generateGameStats(filepaths, 'ANDR#571', 1).then(result => {
        console.log('result');
        console.log(result);
    });
}

async function getMetadata(filepaths) {
    return await slippiStats.getMetadata(filepaths);
}

// In this file, you can include the rest of your app's 
// specific main process code. You can also put them in 
// separate files and require them here. 
