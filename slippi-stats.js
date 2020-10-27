const { default : SlippiGame } = require('@slippi/slippi-js');
const constants = require('./constants');

const EXTERNALCHARACTERS = constants.EXTERNALCHARACTERS;
const EXTERNALMOVES = constants.EXTERNALMOVES;
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
        console.log('meta players : ', meta.players);
        console.log('meta players[0] : ', meta.players[0]);
        console.log('meta players[1] : ', meta.players[1]);
        console.log('players : ', players);
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
    console.log('Fin du traitement des metadata');
    return Promise.resolve({metadata, enrichedGameFiles});
}

async function generateGameStats(gameFiles, slippiId, characterId) {
    let games = [];
    for (const gameFile of gameFiles) {
        games.push(new SlippiGame(gameFile));
    }
    return await processGames(games, slippiId, characterId);
}

async function processGames(games, slippiId, characterId) {
    let conversionsOnOpponent = {};
    let conversionsFromOpponent = {};
    let overallOnOpponent = {};
    let overallFromOpponent = {};
    let playerPort = {};
    //Récupération des données qui nous intéressent
    for (const game of games) {
        const stats = game.getStats();
        const metadata = game.getMetadata();
        const settings = game.getSettings();
        const stage = getMapName(settings.stageId);
        if (metadata.players[0].name === slippiId) {
            playerPort = 0;
        } else {
            playerPort = 1;
        }
        let opponentCharName = getFullChar(Object.keys(metadata.players[Math.abs(1 - playerPort)].characters)[0]).shortName;
        // Overall on opponent
        if (overallOnOpponent[opponentCharName]) {
            if (overallOnOpponent[opponentCharName][stage]){
                overallOnOpponent[opponentCharName][stage] = [
                    ...overallOnOpponent[opponentCharName][stage],
                    ...stats.overall.filter(overall => overall.playerIndex === playerPort)];
            } else {
                overallOnOpponent[opponentCharName][stage] = [
                ...stats.overall.filter(overall => overall.playerIndex === playerPort)];  
            }
        } else {
            overallOnOpponent[opponentCharName]={};
            overallOnOpponent[opponentCharName][stage] = [
                ...stats.overall.filter(overall => overall.playerIndex === playerPort)];            
        }

        // Conversions on opponent
        if (conversionsOnOpponent[opponentCharName]) {
            if (conversionsOnOpponent[opponentCharName][stage]) {
                conversionsOnOpponent[opponentCharName][stage] = [
                    ...conversionsOnOpponent[opponentCharName][stage],
                    ...stats.conversions.filter(conversion => conversion.playerIndex === playerPort)
                ];                
            } else {
                conversionsOnOpponent[opponentCharName][stage] = [
                    ...stats.conversions.filter(conversion => conversion.playerIndex === playerPort)]
            }
        } else {
            conversionsOnOpponent[opponentCharName] = {};
            conversionsOnOpponent[opponentCharName][stage] = [
                ...stats.conversions.filter(conversion => conversion.playerIndex === playerPort)]           
        }
        // Overall from opponent on player
        if (overallFromOpponent[opponentCharName]) {
            if (overallFromOpponent[opponentCharName][stage]) {
                overallFromOpponent[opponentCharName][stage] = [
                    ...overallFromOpponent[opponentCharName][stage],
                    ...stats.overall.filter(overall => overall.playerIndex !== playerPort)
                ];
            } else {
                overallFromOpponent[opponentCharName][stage] = [
                    ...stats.overall.filter(overall => overall.playerIndex !== playerPort)
                ];
            }
        } else {
                overallFromOpponent[opponentCharName] = {};
                overallFromOpponent[opponentCharName][stage] = [
                    ...stats.overall.filter(overall => overall.playerIndex !== playerPort)
                ]
        }            
        // Conversions from opponent on player
        if (conversionsFromOpponent[opponentCharName]) {
            if (conversionsFromOpponent[opponentCharName][stage]) {
                conversionsFromOpponent[opponentCharName][stage] = [
                    ...conversionsFromOpponent[opponentCharName][stage],
                    ...stats.conversions.filter(conversion => conversion.playerIndex !== playerPort)
                ];
            } else {
                conversionsFromOpponent[opponentCharName][stage] = [
                    ...stats.conversions.filter(conversion => conversion.playerIndex !== playerPort)
                ];
            }
        } else {
            conversionsFromOpponent[opponentCharName] = {};
            conversionsFromOpponent[opponentCharName][stage] = [
                ...stats.conversions.filter(conversion => conversion.playerIndex !== playerPort)
            ];
        } 
    }
    // Got all our data, time to process shit.
    // Processing conversions on opponent
    let tmp = processConversionsList(conversionsOnOpponent);
    const processedNeutralWinsConversionsOnOpponent = tmp[0];
    const processedPunishesOnOpponent = tmp[1];
    const processedNeutralWinsFirstHitsOnOpponent = tmp[2];
    const processedKillNeutralFirstHitsOnOpponent = tmp[3];
    const processedPunishesFirstHitsOnOpponent = tmp[4];
    const processedKillPunishFirstHitsOnOpponent = tmp[5];

    // Processing conversions from opponent
    tmp = processConversionsList(conversionsFromOpponent);
    const processedNeutralWinsConversionsFromOpponent = tmp[0];
    const processedPunishesFromOpponent = tmp[1];
    const processedNeutralWinsFirstHitsFromOpponent = tmp[2];
    const processedKillNeutralFirstHitsFromOpponent = tmp[3];
    const processedPunishesFirstHitsFromOpponent = tmp[4];
    const processedKillPunishFirstHitsFromOpponent = tmp[5];

    const processedOverallOnOpponent = processOverallList(overallOnOpponent);
    const processedOverallFromOpponent = processOverallList(overallFromOpponent);

    const returnValue = {
        neutralWinConversionsOnOpponent : processedNeutralWinsConversionsOnOpponent,
        neutralWinConversionsFromOpponent : processedNeutralWinsConversionsFromOpponent,
        punishesOnOpponent : processedPunishesOnOpponent,
        punishesFromOpponent : processedPunishesFromOpponent,
        neutralWinsFirstHitOnOpponent : processedNeutralWinsFirstHitsOnOpponent,
        neutralWinsFirstHitFromOpponent : processedNeutralWinsFirstHitsFromOpponent,
        neutralKillsFirstHitOnOpponent : processedKillNeutralFirstHitsOnOpponent,
        neutralKillsFirstHitFromOpponent : processedKillNeutralFirstHitsFromOpponent,
        punishesFirstHitOnOpponent : processedPunishesFirstHitsOnOpponent,
        punishesFirstHitFromOpponent : processedPunishesFirstHitsFromOpponent,
        punishKillsFirstHitOnOpponent : processedKillPunishFirstHitsOnOpponent,
        punishKillsFirstHitFromOpponent : processedKillPunishFirstHitsFromOpponent,
        overallOnOpponent : processedOverallOnOpponent,
        overallFromOpponent : processedOverallFromOpponent,
    };

    return returnValue;
}

function processConversionsList(conversionsList) {
    let processedNeutralWinsConversions = {};
    let processedNeutralWinsFirstHits = {};
    let processedKillNeutralFirstHits = {};
    let processedPunishes = {};
    let processedPunishesFirstHits = {};
    let processedKillPunishFirstHits = {};
    for (const opponentChar of Object.keys(conversionsList)) {
        processedNeutralWinsConversions[opponentChar]={};
        processedNeutralWinsFirstHits[opponentChar]={};
        processedKillNeutralFirstHits[opponentChar] = {};
        processedPunishes[opponentChar]={};
        processedPunishesFirstHits[opponentChar]={};
        processedKillPunishFirstHits[opponentChar] = {};
        for (const stage of Object.keys(conversionsList[opponentChar])) {
            processedNeutralWinsConversions[opponentChar][stage]={};
            processedNeutralWinsFirstHits[opponentChar][stage]={};
            processedKillNeutralFirstHits[opponentChar][stage]={};
            processedPunishes[opponentChar][stage]={};
            processedPunishesFirstHits[opponentChar][stage]={};
            processedKillPunishFirstHits[opponentChar][stage]={};
            let neutral = [];
            let punishes = [];
            let oneHitOnlyNeutral = [];
            let oneHitOnlyPunishes = [];
            let neutralFirstHits = [];
            let neutralKillFirstHits = [];
            let punishFirstHits = [];
            let punishKillFirstHits = [];
            for (const conversion of conversionsList[opponentChar][stage]) {
                if (conversion.openingType === 'neutral-win') {
                    // Neutral Win
                    if (conversion.moves.length > 1) {
                        neutral.push({
                            totalDamage: conversion.endPercent - conversion.startPercent,
                            moves: conversion.moves,
                        });
                    } else {
                        oneHitOnlyNeutral.push({
                            totalDamage: conversion.endPercent - conversion.startPercent,
                        })
                    }
                    if (conversion.didKill) {
                        neutralKillFirstHits.push({
                            moveId: conversion.moves[0].moveId
                        });
                    }
                    neutralFirstHits.push({
                        moveId: conversion.moves[0].moveId
                    });
                } else if (conversion.openingType === 'counter-attack') {
                    // Punish
                    if (conversion.moves.length > 1) {
                        punishes.push({
                            totalDamage: conversion.endPercent - conversion.startPercent,
                            moves: conversion.moves,
                        });
                    } else {
                        oneHitOnlyPunishes.push({
                            totalDamage: conversion.endPercent - conversion.startPercent,
                        });
                    }
                    if (conversion.didKill) {
                        punishKillFirstHits.push({
                            moveId: conversion.moves[0].moveId
                        });
                    }
                    punishFirstHits.push({
                        moveId: conversion.moves[0].moveId
                    });
                }
            }
            processedNeutralWinsConversions[opponentChar][stage]['multi-hits'] = calculMoyenneConversion(neutral);
            processedNeutralWinsConversions[opponentChar][stage]['single-hit'] = calculMoyenneConversion(oneHitOnlyNeutral, true);
            processedPunishes[opponentChar][stage]['multi-hits'] = calculMoyenneConversion(punishes);
            processedPunishes[opponentChar][stage]['single-hit'] = calculMoyenneConversion(oneHitOnlyPunishes, true);
            processedNeutralWinsFirstHits[opponentChar][stage] = calculMostCommonMove(neutralFirstHits);
            processedKillNeutralFirstHits[opponentChar][stage] = calculMostCommonMove(neutralKillFirstHits);
            processedPunishesFirstHits[opponentChar][stage] = calculMostCommonMove(punishFirstHits);
            processedKillPunishFirstHits[opponentChar][stage] = calculMostCommonMove(punishKillFirstHits);
        }
    }
    return [processedNeutralWinsConversions, 
        processedPunishes, 
        processedNeutralWinsFirstHits, 
        processedKillNeutralFirstHits,
        processedPunishesFirstHits,
        processedKillPunishFirstHits
    ];
}

function processOverallList(overallList) {
    let processedOverallList = {};
    let overallDatas;
    for (const opponentChar of Object.keys(overallList)) {
        processedOverallList[opponentChar] = {};
        for (const stage of Object.keys(overallList[opponentChar])) {
            overallDatas = {
                conversionCounts: [],
                totalDamages: [],
                killCounts: [],
                openingsPerKills: [],
                damagePerOpenings: [],
            }
            for (const overall of overallList[opponentChar][stage]) {
                overallDatas.conversionCounts.push(overall.conversionCount);
                overallDatas.totalDamages.push(overall.totalDamage);
                overallDatas.killCounts.push(overall.killCount);
                overallDatas.openingsPerKills.push(overall.openingsPerKill.ratio);
                overallDatas.damagePerOpenings.push(overall.damagePerOpening.ratio);
            }
            processedOverallList[opponentChar][stage] = {
                conversionCountMoyenne: calculMoyenneOverall(overallDatas.conversionCounts),
                totalDamageMoyenne: calculMoyenneOverall(overallDatas.totalDamages),
                killCountMoyenne: calculMoyenneOverall(overallDatas.killCounts),
                openingsPerKillMoyenne: calculMoyenneOverall(overallDatas.openingsPerKills),
                damagePerOpeningMoyenne: calculMoyenneOverall(overallDatas.damagePerOpenings),
                killPercentMoyenne: calculMoyenneOverall(overallDatas.totalDamages) / calculMoyenneOverall(overallDatas.killCounts),
            }
        }       
    }
    return processedOverallList;
}

function calculMoyenneOverall(array) {
    let val = 0;
    for (let i = 0; i < array.length; i ++) {
        val += array[i];
    }
    return array.length > 0 ? val / array.length : undefined;
}

function calculMoyenneConversion(conversions, oneHitMode = false) {
    let damage = 0;
    let moves = 0;
    for (let i = 0; i < conversions.length; i++) {
        damage += conversions[i].totalDamage;
        if (!oneHitMode) {
            moves += conversions[i].moves.length;
        }
    }
    return {
        averageDamage: conversions.length !== 0 ? damage/conversions.length : undefined,
        averageLength: oneHitMode ? undefined : conversions.length !== 0 ? moves/conversions.length : undefined
    };
}

function calculMostCommonMove(movesArray) {
    if (movesArray.length > 0) {
        let moves = {};
        for (const move of movesArray) {
            if (moves[move.moveId]) {
                moves[move.moveId] = moves[move.moveId] + 1
            } else {
                moves[move.moveId] = 1;
            }
        }
        let maxMoveId;
        for (const moveId of Object.keys(moves)) {
            if (maxMoveId) {
                if (moves[moveId] > moves[maxMoveId]) {
                    maxMoveId = moveId;
                }
            } else {
                maxMoveId = moveId;
            }
        }
        return {move: EXTERNALMOVES[maxMoveId].name, count: moves[maxMoveId]};
    }
    return undefined;    
}

function getMapName(id) {
    return STAGES.find(stage => stage.id === +id).name;
}

function getFullChar(id) {
    return EXTERNALCHARACTERS.find(char => char.id === +id);
}

module.exports = {
    generateGameStats, 
    processGames,
    getMetadata
}