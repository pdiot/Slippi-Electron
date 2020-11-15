const { default : SlippiGame } = require('@slippi/slippi-js');
const constants = require('./constants');

const EXTERNALCHARACTERS = constants.EXTERNALCHARACTERS;
const STAGES = constants.STAGES;

async function enrichGameFiles(gameFiles) {
    let enrichedGameFiles = [];
    /**
     * enrichedGameFiles : [
     *       {
     *          file: string,
     *          playerCharacterPairs: [
     *              {player: string, character: FullChar}
     *          ],
     *          stage: string, 
     *       } 
     * ]
     * 
     */

    for (const gameFile of gameFiles) {
        var game = new SlippiGame(gameFile);
        var meta = game.getMetadata();
        var stage = getMapName(game.getSettings().stageId);
        if (!stage) {
            break;
        }
        let playerCharacterPairs;
        console.log('meta.players : ', meta.players);
        if (meta.players[2] || 
            meta.players[3] || 
            (meta.players[0] && !meta.players[0].names.code) ||
            (meta.players[1] && !meta.players[1].names.code)) {
            console.log('local game : ', gameFile);
            // it's a local game
            let playerA;
            let playerB;
            let characterSlotA;
            let characterSlotB;
            if (meta.players[0]) {
                playerA = 'PORT1';
                characterSlotA = 0;
                if (meta.players[1]) {
                    playerB = 'PORT2';
                    characterSlotB = 1;
                } else if (meta.players[2]) {
                    playerB = 'PORT3';
                    characterSlotB = 2;
                } else if (meta.players[3]) {
                    playerB = 'PORT4';
                    characterSlotB = 3;
                }
            } else if (meta.players[1]) {
                playerA = 'PORT2';
                characterSlotA = 1;
                if (meta.players[2]) {
                    playerB = 'PORT3';
                    characterSlotB = 2;
                } else if (meta.players[3]) {
                    playerB = 'PORT4';
                    characterSlotB = 3;
                }
            } else {
                playerA = 'PORT3';
                characterSlotA = 2;
                playerB = 'PORT4';
                characterSlotB = 3;
            }
            playerCharacterPairs = [
                {
                    player: playerA,
                    character: getFullChar(Object.keys(meta.players[characterSlotA].characters)[0])
                },
                {
                    player: playerB,
                    character: getFullChar(Object.keys(meta.players[characterSlotB].characters)[0])
                }
            ];
        } else {
            console.log('online game : ', gameFile);
            playerCharacterPairs = [
                {
                    player: meta.players[0].names.code,
                    character: getFullChar(Object.keys(meta.players[0].characters)[0])
                },
                {
                    player: meta.players[1].names.code,
                    character: getFullChar(Object.keys(meta.players[1].characters)[0])
                }
            ];
        }        
        enrichedGameFiles.push({
            file : gameFile,
            playerCharacterPairs : playerCharacterPairs,
            stage : stage
        });
    }
    console.log('File enriching done');
    return Promise.resolve(enrichedGameFiles);
}

function getMapName(id) {
    if (STAGES.find(stage => stage.id === +id)) {
        return STAGES.find(stage => stage.id === +id).name;
    }
    return undefined;
}

function getFullChar(id) {
    return EXTERNALCHARACTERS.find(char => char.id === +id);
}

module.exports = {
    enrichGameFiles: enrichGameFiles
}