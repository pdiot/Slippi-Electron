const { default : SlippiGame } = require('@slippi/slippi-js');
const constants = require('./constants');

const EXTERNALCHARACTERS = constants.EXTERNALCHARACTERS;
const STAGES = constants.STAGES;

async function getMetadata(gameFiles) {
    let metadata = {}
    let enrichedGameFiles = [];
    /**
     * metadata : {
     *      [key: string === slippiId] : {
     *         characters : FullChar[],
     *         stages : string[],
     *         opponentCharacters : string[],
     *         gameFiles: string[], 
     *       }
     * }
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
        var players = [meta.players[0].names.code, meta.players[1].names.code];
        for (let slippiId of players) {
            var playerPort;
            if (meta.players[0].names.code === slippiId) {
                playerPort = 0;
            } else {
                playerPort = 1;
            }
            var playerCharacter = getFullChar(Object.keys(meta.players[Math.abs(0 - playerPort)].characters)[0]);
            var oppCharacter = getFullChar(Object.keys(meta.players[Math.abs(1 - playerPort)].characters)[0]);
            if (metadata[slippiId]) {
                if (!metadata[slippiId].characters.includes(playerCharacter)) {
                    metadata[slippiId].characters.push(playerCharacter);
                }
                if (!metadata[slippiId].opponentCharacters.includes(oppCharacter)) {
                    metadata[slippiId].opponentCharacters.push(oppCharacter);
                }
                if (!metadata[slippiId].stages.includes(stage)) {
                    metadata[slippiId].stages.push(stage);
                }
                metadata[slippiId].gameFiles.push(gameFile);
            } else {
                metadata[slippiId] = {
                    characters : [playerCharacter],
                    opponentCharacters : [oppCharacter],
                    stages : [stage],
                    gameFiles : [gameFile]
                };
            }
        }
        var playerCharacterPairs = [
            {
                player: meta.players[0].names.code,
                character: getFullChar(Object.keys(meta.players[0].characters)[0])
            },
            {
                player: meta.players[1].names.code,
                character: getFullChar(Object.keys(meta.players[1].characters)[0])
            }
        ]
        enrichedGameFiles.push({
            file : gameFile,
            playerCharacterPairs : playerCharacterPairs,
            stage : stage
        })
    }
    console.log('Metadata parsing done');
    return Promise.resolve({metadata, enrichedGameFiles});
}

function getMapName(id) {
    return STAGES.find(stage => stage.id === +id).name;
}

function getFullChar(id) {
    return EXTERNALCHARACTERS.find(char => char.id === +id);
}

module.exports = {
    getMetadata
}