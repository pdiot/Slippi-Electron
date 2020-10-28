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
        var playerCharacterPairs = [
            {
                player: meta.players[0].names.code,
                character: getFullChar(Object.keys(meta.players[0].characters)[0])
            },
            {
                player: meta.players[1].names.code,
                character: getFullChar(Object.keys(meta.players[1].characters)[0])
            }
        ];
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
    return STAGES.find(stage => stage.id === +id).name;
}

function getFullChar(id) {
    return EXTERNALCHARACTERS.find(char => char.id === +id);
}

module.exports = {
    enrichGameFiles: enrichGameFiles
}