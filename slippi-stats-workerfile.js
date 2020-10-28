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