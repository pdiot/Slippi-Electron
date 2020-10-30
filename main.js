const { app, BrowserWindow, ipcMain } = require('electron');
const { Worker } = require('worker_threads');
const slippiStats = require('./slippi-stats');
const constants = require('./constants');
const path = require('path');

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
    // win.webContents.openDevTools()

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
                enrichGameFiles(returnValue.filePaths).then(result => {
                    event.sender.send('fileOpenedOK', result);
                })
            }
        })); 
    });

    ipcMain.on('calculateStats', (event, data) => {
        /**
         * data : {
         *      games: EnrichedGameFile[],
         *      slippiId: string
         *      character: string (shortName)
         * }
         */
        
        var characters = constants.EXTERNALCHARACTERS;
        let character = characters.find(ec => ec.shortName === data.character);
        if (character) {
            let games = []
            for (let game of data.games) {
                if (!game.filteredOut) {
                    games.push(game)
                }
            }

            // We need to create a worker so everything doesn't freeze like the huge pile of js that it is
            const worker = new Worker(path.join(__dirname, 'slippi-stats-workerfile.js'), {
                workerData : {
                    gameFiles: games,
                    slippiId: data.slippiId,
                    characterId: character.id,
                }
            });
            worker.on('message', (data) => {
                console.log('message : ', data);
                if (Object.keys(data).includes('computedStats')) {
                    // It's the end of stats processing message
                    event.sender.send('statsDoneTS', data);
                } else {
                    // It's the stats processing advancement message
                    const processedGamesNb = data.split(' ')[1];
                    const totalGamesNb = data.split(' ')[2];
                    event.sender.send('statsProgressTS', {current: processedGamesNb, total: totalGamesNb});
                }
            });
            worker.on('error', (error) => {
                console.log('Error inside stats calculator worker', error);
            });
            worker.on('exit', (code) => {
                if (code !== 0)
                console.log(new Error(`Worker stopped with exit code ${code}`));
            });
        }
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

async function enrichGameFiles(filepaths) {
    return await slippiStats.enrichGameFiles(filepaths);
}

// In this file, you can include the rest of your app's 
// specific main process code. You can also put them in 
// separate files and require them here. 
