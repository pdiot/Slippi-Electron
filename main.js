const { app, BrowserWindow, ipcMain } = require('electron');
const { Worker } = require('worker_threads');
const slippiStats = require('./slippi-stats');
const constants = require('./constants');
const node_utils = require('./node_utils');
const path = require('path');
const fs = require('fs');

function createWindow () { 
    // Initialize the main-debug writable stream
    node_utils.initLog('main_debug.log');

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
    win.loadFile('dist/ang-electron/index.html');

    // Open the DevTools. 
    // win.webContents.openDevTools()

    ipcMain.on('openFile', (event, path) => {
        const { dialog } = require('electron');
        dialog.showOpenDialog(win, {
            title: 'Choose the slippi replay files to load',
            filters: [
                {
                    name: 'Slippi files',
                    extensions: ['slp']
                }
            ],
            properties: [
                'multiSelections'
            ]
        }).then((returnValue => {
            node_utils.addToLog(`main_debug.log`, `Main.js openFile => received ${JSON.stringify(returnValue, null, 4)}`);
            if (!returnValue.canceled) {
                enrichGameFiles(returnValue.filePaths).then(result => {
                    event.sender.send('fileOpenedOK', result);
                });
            }
        })); 
    });

    ipcMain.on('openStatsFile', (event, data) => {
        const { dialog } = require('electron');
        dialog.showOpenDialog(win, {
            title: `Choose the ${data} stats file to load`,
            filters: [
                {
                    name: 'JSON Files',
                    extensions: ['json']
                }
            ]
        }).then((returnValue => {
            if (!returnValue.canceled) {
                node_utils.addToLog(`main_debug.log`, 'returnValue' + returnValue);
                const value = 
                {
                    path: returnValue.filePaths[0],
                    statsFromJSON : readStatsFile(returnValue.filePaths[0])
                }
                node_utils.addToLog(`main_debug.log`, `sending ${data}StatsFileOpenedOK`);
                event.sender.send(`${data}StatsFileOpenedOK`, value);
            }
        })); 
    })

    ipcMain.on('openStatsFilesForGraphs', (event, data) => {
        const { dialog } = require('electron');
        dialog.showOpenDialog(win, {
            title: `Choose the computed stats files to load`,
            filters: [
                {
                    name: 'JSON files',
                    extensions: ['json']
                }
            ],
            properties: [
                'multiSelections'
            ]
        }).then((returnValue => {
            if (!returnValue.canceled) {
                node_utils.addToLog(`main_debug.log`, 'returnValue', returnValue);
                value = [];
                for (let filePath of returnValue.filePaths) {
                    value.push(readStatsFile(filePath));
                }
                node_utils.addToLog(`main_debug.log`, `sending statsFilesForGraphsOpened`);
                event.sender.send(`statsFilesForGraphsOpened`, value);
            }
        })); 

    })

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
            let lastTime;
            let processTimes = [];
            for (let game of data.games) {
                if (!game.filteredOut) {
                    games.push(game)
                }
            }
            lastTime = Date.now();
            // We need to create a worker so everything doesn't freeze like the huge pile of js that it is
            const worker = new Worker(path.join(__dirname, 'slippi-stats-workerfile.js'), {
                workerData : {
                    gameFiles: games,
                    slippiId: data.slippiId,
                    characterId: character.id,
                }
            });
            worker.on('message', (data) => {
                if (Object.keys(data).includes('computedStats')) {
                    // It's the end of stats processing message
                    node_utils.addToLog(`main_debug.log`, `Average file processing time : ${node_utils.moyenne(processTimes)}ms`);
                    event.sender.send('statsDoneTS', data);
                } else {
                    // It's the stats processing advancement message
                    const processedGamesNb = data.split(' ')[1];
                    const totalGamesNb = data.split(' ')[2];
                    const newTime = Date.now();
                    const processTime = newTime - lastTime;
                    processTimes.push(processTime);
                    node_utils.addToLog(`main_debug.log`, `received progress data for game ${processedGamesNb} out of ${totalGamesNb}`);
                    node_utils.addToLog(`main_debug.log`, `Time for processing game : ${processTime}ms`);
                    lastTime = newTime;
                    event.sender.send('statsProgressTS', {current: processedGamesNb, total: totalGamesNb});
                }
            });
            worker.on('error', (error) => {
                node_utils.addToLog(`main_debug.log`, 'Error inside stats calculator worker' + JSON.stringify(error, null, 4));
            });
            worker.on('exit', (code) => {
                if (code !== 0)
                console.log(new Error(`Worker stopped with exit code ${code}`));
            });
        }
    });

    ipcMain.on('writeStats', (event, data) => {
        writeStatsInJson(data).then((writePath) => {
            event.sender.send('fileWrittenOK', writePath);
        }).catch((err) => {
            event.sender.send('filleWrittenKO', err);
        });
    })
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

function readStatsFile(filePath) {
    const value = JSON.parse(fs.readFileSync(filePath, (err) => {
        if (err) throw err;
    }));
    return value;
}

async function enrichGameFiles(filepaths) {
    return await slippiStats.enrichGameFiles(filepaths);
}

async function writeStatsInJson(data) {
    let parentPath = '';
    for (let i = 0; i < __dirname.split(path.sep).length - 1; i ++) {
        parentPath = parentPath + __dirname.split(path.sep)[i] + path.sep;
    }
    parentPath = parentPath.slice(0, -1);
    let timeStamp = new Date();
    timeStamp = timeStamp.toISOString();
    timeStamp = timeStamp.replace('-', '');
    timeStamp = timeStamp.replace('-', '');
    timeStamp = timeStamp.replace(':', '');
    timeStamp = timeStamp.replace(':', '');
    timeStamp = timeStamp.replace('.', '');
    const fileName = `stats${timeStamp}.json`;
    const writePath = `${parentPath}${path.sep}outputs${path.sep}`;
    await fs.promises.mkdir(writePath, { recursive: true });
    await fs.writeFile(`${writePath}${fileName}`, JSON.stringify(data, null, 4), (err) => {
        if (err) throw err;
    });
    return `${writePath}${fileName}`;
}