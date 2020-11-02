const {parentPort, workerData} = require ('worker_threads');
const { default : SlippiGame } = require('@slippi/slippi-js');
const constants = require('./constants');
const node_utils = require('./node_utils');
// const fs = require('fs');

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
  let punishedActionsForPlayer = {};
  let punishedActionsForOpponent = {};
  let lcancelsForPlayer = {};
  let lcancelsForOpponent = {};
  // Getting the data we want
  for (const gameBlob of games) {
      const game = gameBlob.game;
      const stats = game.getStats();
      const metadata = game.getMetadata();
      const frames = game.getFrames();
      // fs.writeFile('frames.json', JSON.stringify(frames, null, 4), err => {
      //   if (err) throw err;
      //   console.log('wrote frames in frames.json');
      // })
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
      const playerPunishedActions = getPunishedActions(frames, playerPort, opponentConversions, playerConversions);
      const opponentPunishedActions = getPunishedActions(frames, opponentPort, playerConversions, opponentConversions);
      const LCancels = getLCancels(frames, playerPort, opponentPort);
      const playerLCancels = LCancels.player;
      const opponentLCancels = LCancels.opponent;

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

      punishedActionsForPlayer[startAt] = {};
      punishedActionsForPlayer[startAt][opponentCharName] = {};
      punishedActionsForPlayer[startAt][opponentCharName][stage] = playerPunishedActions;
      
      punishedActionsForOpponent[startAt] = {};
      punishedActionsForOpponent[startAt][opponentCharName] = {};
      punishedActionsForOpponent[startAt][opponentCharName][stage] = opponentPunishedActions;

      lcancelsForPlayer[startAt] = {};
      lcancelsForPlayer[startAt][opponentCharName] = {};
      lcancelsForPlayer[startAt][opponentCharName][stage] = playerLCancels;

      lcancelsForOpponent[startAt] = {};
      lcancelsForOpponent[startAt][opponentCharName] = {};
      lcancelsForOpponent[startAt][opponentCharName][stage] = opponentLCancels;
    
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
    punishedActionsForPlayer,
    punishedActionsForOpponent,
    lcancelsForPlayer,
    lcancelsForOpponent
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

function getPunishedActions(frames, playerPort, opponentConversions, playerConversions) {
  let punishedAttacks = [];
  let punishedDefensiveOptions = [];
  let punishedMovementOptions = [];
  for (let conversion of opponentConversions) {
    if (conversion.moves?.length > 0) { // Apparently that can happen ?
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
          let isAttackOngoing = true;
          let i = currentFrame - 1;
          let hasFoundCollision = false;
          let whiffShieldPLHit = undefined;
          while (isAttackOngoing && !hasFoundCollision) {
            // To detect a shield hit : we want to find i such that frames[i] has a shieldStun stateId and frames[i-1] doesn't
            // To detect a powershield hit : we want to find i such that frames[i] has a powershield stateId and frames[i-1] doesn't
            // To detect a hit : We look for the startup frame of the attack, and look it up in our conversions somewhere. 
            // Either it was part of a conversion, and it was a hit (unsafe on hit, crouch, etc), or it wasn't and it's a whiff
            // If we don't detect any of the above : it's a whiff
            const currentPlayerPost = frames[i].players.find(player => player.pre.playerIndex === playerPort).post;
            if (node_utils.getAttackAction(currentPlayerPost.actionStateId) === attack) {
              const previousOpponentPost = frames[i-1].players.find(player => player.pre.playerIndex !== playerPort).post;
              const previousOpponentActionStateId = previousOpponentPost.actionStateId;
              const currentOpponentPost = frames[i].players.find(player => player.pre.playerIndex !== playerPort).post;
              const currentOpponentActionStateId = currentOpponentPost.actionStateId;
              // here we will check if we detect a new shieldstun or powershield "event"
              if (node_utils.isNewShield(currentOpponentActionStateId, previousOpponentActionStateId)) {
                whiffShieldPLHit = 'Shield';
                hasFoundCollision = true;
              }
              i --;
            } else {
              isAttackOngoing = false;
              // Here we check if it hit or not
              // The attack wasn't ongoing at frame i, so it started on frame i+1
              // We want to check the player's conversions and see if we can see a move that started at frame i+1. If we do, it's a hit, else it was a whiff
              for (let conv of playerConversions) {
                if (conv.moves.find(move => move.frame === i + 1)) {
                  whiffShieldPLHit = 'Hit';
                  break;
                }
              }
              if (!whiffShieldPLHit) {
                whiffShieldPLHit = 'Whiff'
              }
            }
          }
          //TODO : add the result of whiffShieldPLHit to the return value
          punishedAttacks.push({name: attack, status: whiffShieldPLHit});
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
  }
  return {
    punishedAttacks, punishedDefensiveOptions, punishedMovementOptions
  };
}

function getLCancels(frames, playerPort, opponentPort) {
  let playerLCancels = {successful: 0, failed: 0};
  let playerFailedMoves = [];
  let oppLCancels = {successful: 0, failed: 0};
  let oppFailedMoves = [];
  for (let frameKey of Object.keys(frames)) {
    const playerPostFrameUpdate = frames[frameKey].players.find(player => player.pre.playerIndex === playerPort).post;
    const playerAttack = node_utils.getAttackAction(playerPostFrameUpdate.actionStateId);
    const oppPostFrameUpdate = frames[frameKey].players.find(player => player.pre.playerIndex === opponentPort).post;
    const oppAttack = node_utils.getAttackAction(oppPostFrameUpdate.actionStateId);
    if (playerAttack) {
      if (playerPostFrameUpdate.lCancelStatus === 1) {
        playerLCancels.successful ++;
      } else if (playerPostFrameUpdate.lCancelStatus === 2) {
        playerLCancels.failed ++;
        playerFailedMoves.push(playerAttack);
      }
    }
    if (oppAttack) {
      if (oppPostFrameUpdate.lCancelStatus === 1) {
        oppLCancels.successful ++;
      } else if (oppPostFrameUpdate.lCancelStatus === 2) {
        oppLCancels.failed ++;
        oppFailedMoves.push(oppAttack);
      }
    }
  }
  const returnValue = {
    player: {
      lcancels: playerLCancels,
      failedMoves: playerFailedMoves
    },
    opponent: {
      lcancels: oppLCancels,
      failedMoves: oppFailedMoves
    }
  };
  return returnValue;
}