const {parentPort, workerData} = require ('worker_threads');
const { default : SlippiGame } = require('@slippi/slippi-js');
const constants = require('./constants');

const EXTERNALCHARACTERS = constants.EXTERNALCHARACTERS;
const EXTERNALMOVES = constants.EXTERNALMOVES;
const STAGES = constants.STAGES;

main();

// Functions

function main() {
  const gameFiles = workerData.gameFiles;
  const slippiId = workerData.slippiId;
  const characterId = workerData.characterId;

  console.log('JE SUIS UN WORKER. ENCORE DU TRAVAIL ?');

  const stats = generateGameStats(gameFiles, slippiId, characterId);

  parentPort.postMessage(stats);
}

function generateGameStats(gameFiles, slippiId, characterId) {
  let games = [];
  for (const gameFile of gameFiles) {
      games.push({game: new SlippiGame(gameFile), gameFile});
  }
  return processGames(games, slippiId, characterId);
}

function processGames(games, slippiId, characterId) {
  let processedGamesNb = 0;
  let conversionsOnOpponent = {};
  let conversionsFromOpponent = {};
  let overallOnOpponent = {};
  let overallFromOpponent = {};
  let playerPort = {};
  // Getting the data we want
  for (const gameBlob of games) {
      const game = gameBlob.game;
      const stats = game.getStats();
      const metadata = game.getMetadata();
      const startAt = metadata.startAt;
      const settings = game.getSettings();
      const stage = getMapName(settings.stageId);
      if (metadata.players[0].names.code === slippiId) {
          playerPort = 0;
      } else {
          playerPort = 1;
      }
      let opponentCharName = getFullChar(Object.keys(metadata.players[Math.abs(1 - playerPort)].characters)[0]).shortName;
      // Overall on opponent
      // if (overallOnOpponent[opponentCharName]) {
      //     if (overallOnOpponent[opponentCharName][stage]){
      //         overallOnOpponent[opponentCharName][stage] = [
      //             ...overallOnOpponent[opponentCharName][stage],
      //             ...stats.overall.filter(overall => overall.playerIndex === playerPort)];
      //     } else {
      //         overallOnOpponent[opponentCharName][stage] = [
      //         ...stats.overall.filter(overall => overall.playerIndex === playerPort)];  
      //     }
      // } else {
      //     overallOnOpponent[opponentCharName]={};
      //     overallOnOpponent[opponentCharName][stage] = [
      //         ...stats.overall.filter(overall => overall.playerIndex === playerPort)];            
      // }

      overallOnOpponent[startAt] = {};
      overallOnOpponent[startAt][opponentCharName] = {};
      overallOnOpponent[startAt][opponentCharName][stage] = {
        ...stats.overall.filter(overall => overall.playerIndex === playerPort)[0]};

      // Conversions on opponent
      // if (conversionsOnOpponent[opponentCharName]) {
      //     if (conversionsOnOpponent[opponentCharName][stage]) {
      //         conversionsOnOpponent[opponentCharName][stage] = [
      //             ...conversionsOnOpponent[opponentCharName][stage],
      //             ...stats.conversions.filter(conversion => conversion.playerIndex === playerPort)
      //         ];                
      //     } else {
      //         conversionsOnOpponent[opponentCharName][stage] = [
      //             ...stats.conversions.filter(conversion => conversion.playerIndex === playerPort)]
      //     }
      // } else {
      //     conversionsOnOpponent[opponentCharName] = {};
      //     conversionsOnOpponent[opponentCharName][stage] = [
      //         ...stats.conversions.filter(conversion => conversion.playerIndex === playerPort)]           
      // }
      
      conversionsOnOpponent[startAt] = {};
      conversionsOnOpponent[startAt][opponentCharName] = {};
      conversionsOnOpponent[startAt][opponentCharName][stage] = [
        ...stats.conversions.filter(conversion => conversion.playerIndex === playerPort)];
      // Overall from opponent on player
      // if (overallFromOpponent[opponentCharName]) {
      //     if (overallFromOpponent[opponentCharName][stage]) {
      //         overallFromOpponent[opponentCharName][stage] = [
      //             ...overallFromOpponent[opponentCharName][stage],
      //             ...stats.overall.filter(overall => overall.playerIndex !== playerPort)
      //         ];
      //     } else {
      //         overallFromOpponent[opponentCharName][stage] = [
      //             ...stats.overall.filter(overall => overall.playerIndex !== playerPort)
      //         ];
      //     }
      // } else {
      //         overallFromOpponent[opponentCharName] = {};
      //         overallFromOpponent[opponentCharName][stage] = [
      //             ...stats.overall.filter(overall => overall.playerIndex !== playerPort)
      //         ]
      // }
      
      
      overallFromOpponent[startAt] = {};
      overallFromOpponent[startAt][opponentCharName] = {};
      overallFromOpponent[startAt][opponentCharName][stage] = {
        ...stats.overall.filter(overall => overall.playerIndex !== playerPort)[0]
      };
      // Conversions from opponent on player
      // if (conversionsFromOpponent[opponentCharName]) {
      //     if (conversionsFromOpponent[opponentCharName][stage]) {
      //         conversionsFromOpponent[opponentCharName][stage] = [
      //             ...conversionsFromOpponent[opponentCharName][stage],
      //             ...stats.conversions.filter(conversion => conversion.playerIndex !== playerPort)
      //         ];
      //     } else {
      //         conversionsFromOpponent[opponentCharName][stage] = [
      //             ...stats.conversions.filter(conversion => conversion.playerIndex !== playerPort)
      //         ];
      //     }
      // } else {
      //     conversionsFromOpponent[opponentCharName] = {};
      //     conversionsFromOpponent[opponentCharName][stage] = [
      //         ...stats.conversions.filter(conversion => conversion.playerIndex !== playerPort)
      //     ];
      // }

      conversionsFromOpponent[startAt] = {};
      conversionsFromOpponent[startAt][opponentCharName] = {};
      conversionsFromOpponent[startAt][opponentCharName][stage] = [
        ...stats.conversions.filter(conversion => conversion.playerIndex !== playerPort)];

      processedGamesNb ++;
      console.log('WORKER sent statProgress', processedGamesNb);
      parentPort.postMessage('statsProgress ' + processedGamesNb);
  }


  /** 
  let conversionsOnOpponent = {};
  let conversionsFromOpponent = {};
  let overallOnOpponent = {};
  let overallFromOpponent = {};
  */

  const returnValue = {
    computedStats: true,
    conversionsOnOpponent,
    conversionsFromOpponent,
    overallOnOpponent,
    overallFromOpponent,
  }
  
  console.log('WORKER end of treatment');
  return returnValue;


  // Got all our data, time to process shit.
  // Processing conversions on opponent
  // let tmp = processConversionsList(conversionsOnOpponent);
  // const processedNeutralWinsConversionsOnOpponent = tmp[0];
  // const processedPunishesOnOpponent = tmp[1];
  // const processedNeutralWinsFirstHitsOnOpponent = tmp[2];
  // const processedKillNeutralFirstHitsOnOpponent = tmp[3];
  // const processedPunishesFirstHitsOnOpponent = tmp[4];
  // const processedKillPunishFirstHitsOnOpponent = tmp[5];

  // // Processing conversions from opponent
  // tmp = processConversionsList(conversionsFromOpponent);
  // const processedNeutralWinsConversionsFromOpponent = tmp[0];
  // const processedPunishesFromOpponent = tmp[1];
  // const processedNeutralWinsFirstHitsFromOpponent = tmp[2];
  // const processedKillNeutralFirstHitsFromOpponent = tmp[3];
  // const processedPunishesFirstHitsFromOpponent = tmp[4];
  // const processedKillPunishFirstHitsFromOpponent = tmp[5];

  // const processedOverallOnOpponent = processOverallList(overallOnOpponent);
  // const processedOverallFromOpponent = processOverallList(overallFromOpponent);

  // const returnValue = {
  //     computedStats: true,
  //     neutralWinConversionsOnOpponent : processedNeutralWinsConversionsOnOpponent,
  //     neutralWinConversionsFromOpponent : processedNeutralWinsConversionsFromOpponent,
  //     punishesOnOpponent : processedPunishesOnOpponent,
  //     punishesFromOpponent : processedPunishesFromOpponent,
  //     neutralWinsFirstHitOnOpponent : processedNeutralWinsFirstHitsOnOpponent,
  //     neutralWinsFirstHitFromOpponent : processedNeutralWinsFirstHitsFromOpponent,
  //     neutralKillsFirstHitOnOpponent : processedKillNeutralFirstHitsOnOpponent,
  //     neutralKillsFirstHitFromOpponent : processedKillNeutralFirstHitsFromOpponent,
  //     punishesFirstHitOnOpponent : processedPunishesFirstHitsOnOpponent,
  //     punishesFirstHitFromOpponent : processedPunishesFirstHitsFromOpponent,
  //     punishKillsFirstHitOnOpponent : processedKillPunishFirstHitsOnOpponent,
  //     punishKillsFirstHitFromOpponent : processedKillPunishFirstHitsFromOpponent,
  //     overallOnOpponent : processedOverallOnOpponent,
  //     overallFromOpponent : processedOverallFromOpponent,
  // };
  // console.log('WORKER fin du traitement');
  // return returnValue;
}

function getMapName(id) {
  return STAGES.find(stage => stage.id === +id).name;
}

function getFullChar(id) {
  return EXTERNALCHARACTERS.find(char => char.id === +id);
}