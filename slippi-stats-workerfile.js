const {parentPort, workerData} = require ('worker_threads');
const { default : SlippiGame } = require('@slippi/slippi-js');
const constants = require('./constants');
const node_utils = require('./node_utils');
const fs = require('fs');

const EXTERNALCHARACTERS = constants.EXTERNALCHARACTERS;
const STAGES = constants.STAGES;

main();

// Functions

function main() {
  const gameFiles = workerData.gameFiles;
  const slippiId = workerData.slippiId;
  const characterId = workerData.characterId;

  console.log('JE SUIS UN WORKER. ENCORE DU TRAVAIL ?');

  const stats = processGames(gameFiles, slippiId, characterId);

  parentPort.postMessage(stats);
}

function processGames(gamesFromMain, slippiId, characterId) {
  let games = [];
  for (const game of gamesFromMain) {
      games.push({game: new SlippiGame(game.file), gameFile: game.file, gameFromMain: game});
  }
  let processedGamesNb = 0;
  let conversionsOnOpponent = {};
  let conversionsFromOpponent = {};
  let overallOnOpponent = {};
  let overallFromOpponent = {};
  let punishedActionsAndLCancelsForPlayer = {};
  let punishedActionsAndLCancelsForOpponent = {};
  // Getting the data we want
  for (const gameBlob of games) {
      const game = gameBlob.game;
      const stats = game.getStats();
      const metadata = game.getMetadata();
      const frames = game.getFrames();
      const startAt = gameBlob.gameFile.substring(gameBlob.gameFile.length - 19, gameBlob.gameFile.length - 4);
      const settings = game.getSettings();
      const stage = getMapName(settings.stageId);
      let playerPort;
      let opponentPort;
      if (metadata.players[2] || 
        metadata.players[3] || 
        (metadata.players[0] && !metadata.players[0].names.code) ||
        (metadata.players[1] && !metadata.players[1].names.code)) {
        // We're in a local game
        for (let pcp of gameBlob.gameFromMain.playerCharacterPairs) {
          if (pcp.isCurrentPlayer) {
            playerPort = pcp.port;
          } else {
            opponentPort = pcp.port;
          }
        }
      } else {
        if (metadata.players[0].names.code === slippiId) {
            playerPort = 0;
            opponentPort = 1;
        } else {
            playerPort = 1;
            opponentPort = 0;
        }
      }
      let opponentCharName = getFullChar(Object.keys(metadata.players[opponentPort].characters)[0]).shortName;

      const playerConversions = stats.conversions.filter(conversion => conversion.playerIndex === playerPort);
      const opponentConversions = stats.conversions.filter(conversion => conversion.playerIndex === opponentPort);
      const playerPunishedActionsAndLCancels = getPunishedActions(frames, playerPort, opponentConversions);
      const opponentPunishedActionsAndLCancels = getPunishedActions(frames, opponentPort, playerConversions);


      overallOnOpponent[startAt] = {};
      overallOnOpponent[startAt][opponentCharName] = {};
      overallOnOpponent[startAt][opponentCharName][stage] = {
        ...stats.overall.filter(overall => overall.playerIndex === playerPort)[0]};
      
      conversionsOnOpponent[startAt] = {};
      conversionsOnOpponent[startAt][opponentCharName] = {};
      conversionsOnOpponent[startAt][opponentCharName][stage] = [
        ...stats.conversions.filter(conversion => conversion.playerIndex === playerPort)];
      
      
      overallFromOpponent[startAt] = {};
      overallFromOpponent[startAt][opponentCharName] = {};
      overallFromOpponent[startAt][opponentCharName][stage] = {
        ...stats.overall.filter(overall => overall.playerIndex === opponentPort)[0]
      };

      conversionsFromOpponent[startAt] = {};
      conversionsFromOpponent[startAt][opponentCharName] = {};
      conversionsFromOpponent[startAt][opponentCharName][stage] = [
        ...stats.conversions.filter(conversion => conversion.playerIndex === opponentPort)];

      punishedActionsAndLCancelsForPlayer[startAt] = {};
      punishedActionsAndLCancelsForPlayer[startAt][opponentCharName] = {};
      punishedActionsAndLCancelsForPlayer[startAt][opponentCharName][stage] = playerPunishedActionsAndLCancels;
      
      punishedActionsAndLCancelsForOpponent[startAt] = {};
      punishedActionsAndLCancelsForOpponent[startAt][opponentCharName] = {};
      punishedActionsAndLCancelsForOpponent[startAt][opponentCharName][stage] = opponentPunishedActionsAndLCancels;

      processedGamesNb ++;
      console.log('WORKER sent statProgress', processedGamesNb);
      parentPort.postMessage('statsProgress ' + processedGamesNb + ' ' + games.length);
  }

  const returnValue = {
    computedStats: true,
    conversionsOnOpponent,
    conversionsFromOpponent,
    overallOnOpponent,
    overallFromOpponent,
    punishedActionsAndLCancelsForPlayer,
    punishedActionsAndLCancelsForOpponent
  }
  
  console.log('WORKER end of treatment');
  return returnValue;
}

function getMapName(id) {
  return STAGES.find(stage => stage.id === +id).name;
}

function getFullChar(id) {
  return EXTERNALCHARACTERS.find(char => char.id === +id);
}

function getPunishedActions(frames, playerPort, opponentConversions) {
  let punishedAttacks = [];
  let punishedDefensiveOptions = [];
  let punishedMovementOptions = [];
  for (let conversion of opponentConversions) {
    const startFrame = conversion.moves[0].frame;
    let hasFoundMove = false;
    let currentFrame = startFrame - 1;
    while(!hasFoundMove) {
      const players = frames[currentFrame].players;
      const correctPlayerData = players.find(player => player.pre.playerIndex === playerPort);
      const postFrameUpdate = correctPlayerData.post;
      const attack = node_utils.getAttackAction(postFrameUpdate.actionStateId);
      const defensiveOption = node_utils.getDefensiveAction(postFrameUpdate.actionStateId);
      const movementOption = node_utils.getMovementAction(postFrameUpdate.actionStateId);
      if (attack) {
        // TODO : check whether the attack hit, whiffed, or got shielded
        punishedAttacks.push(attack);
        // if (postFrameUpdate.lCancelStatus === 1) {
        //   lCancels.successful ++;
        // } else if (postFrameUpdate.lCancelStatus === 2) {
        //   lCancels.missed ++;
        // } Doesn't seem to work like that
        hasFoundMove = true;
      }
      if (defensiveOption) {
        punishedDefensiveOptions.push(defensiveOption);
        hasFoundMove = true;
      }
      if (movementOption) {
        punishedMovementOptions.push(movementOption);
        hasFoundMove = true;
      }
      currentFrame --;
    }
  }
  return {
    punishedAttacks, punishedDefensiveOptions, punishedMovementOptions
  };
}