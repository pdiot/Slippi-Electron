const { parentPort, workerData } = require('worker_threads');
const { default: SlippiGame } = require('@slippi/slippi-js');
const constants = require('./constants');
const node_utils = require('./node_utils');
const fs = require('fs');

const EXTERNALCHARACTERS = constants.EXTERNALCHARACTERS;
const STAGES = constants.STAGES;

const LEDGEDASHWINDOW = 50;

main();

// Functions

function main() {
  const gameFiles = workerData.gameFiles;
  const slippiId = workerData.slippiId;
  const characterId = workerData.characterId;

  node_utils.initLog('debug_worker.log');

  node_utils.addToLog('debug_worker.log', 'JE SUIS UN WORKER. ENCORE DU TRAVAIL ?');

  let stats;
  try {
    stats = processGames(gameFiles, slippiId, characterId);
    parentPort.postMessage(stats);
  } catch (err) {
    node_utils.addToLog('debug_worker.log', JSON.stringify(err.stack, null, 4));
  }
}

function processGames(gamesFromMain, slippiId, characterId) {
  let games = [];
  for (const game of gamesFromMain) {
    games.push({ game: new SlippiGame(game.file), gameFile: game.file, gameFromMain: game });
  }
  // DEBUG
  let debug;
  // DEBUG
  let processedGamesNb = 0;
  let conversionsOnOpponent = {};
  let conversionsFromOpponent = {};
  let overallOnOpponent = {};
  let overallFromOpponent = {};
  let punishedActionsForPlayer = {};
  let punishedActionsForOpponent = {};
  let lcancelsForPlayer = {};
  let lcancelsForOpponent = {};
  let ledgeDashesForPlayer = {};
  let ledgeDashesForOpponent = {};
  let gameResults = {};
  let wavedashesForPlayer = {};
  let wavedashesForOpponent = {};
  let jcGrabsForPlayer = {};
  let jcGrabsForOpponent = {};
  let playerCharName;

  // Getting the data we want
  for (const gameBlob of games) {
    const game = gameBlob.game;
    const stats = game.getStats();
    const metadata = game.getMetadata();
    const frames = game.getFrames();
    const end = game.getGameEnd();
    // DEBUG
    // framesArray.push(frames);
    // fs.writeFile('frames.json', JSON.stringify(frames, null, 4), err => {
    //   if (err) throw err;
    //   console.log('wrote frames in frames.json');
    // })
    debug = { stats, metadata, end };
    // DEBUG
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
    if (!playerCharName) {
      playerCharName = getFullChar(Object.keys(metadata.players[playerPort].characters)[0]).shortName;
    }
    let opponentCharName = getFullChar(Object.keys(metadata.players[opponentPort].characters)[0]).shortName;

    const playerLedgeDashes = getLedgeDashes(frames, playerPort);
    const opponentLedgeDashes = getLedgeDashes(frames, opponentPort);
    const playerConversions = stats.conversions.filter(conversion => conversion.playerIndex === playerPort);
    const opponentConversions = stats.conversions.filter(conversion => conversion.playerIndex === opponentPort);
    const playerPunishedActions = getPunishedActions(frames, playerPort, opponentConversions, playerConversions);
    const opponentPunishedActions = getPunishedActions(frames, opponentPort, playerConversions, opponentConversions);
    const LCancels = getLCancels(frames, playerPort, opponentPort);
    const playerLCancels = LCancels.player;
    const opponentLCancels = LCancels.opponent;
    const playerOverall = stats.overall.filter(overall => overall.playerIndex === playerPort)[0];
    playerOverall.conversionsRatio = getOpeningRatio(playerConversions, opponentConversions);
    const opponentOverall = stats.overall.filter(overall => overall.playerIndex === opponentPort)[0];
    opponentOverall.conversionsRatio = getOpeningRatio(opponentConversions, playerConversions);
    const gameResult = getResult(playerPort, opponentPort, stats.stocks, end);
    const playerWavedashes = getWavedashes(playerPort, frames);
    const opponentWavedashes = getWavedashes(opponentPort, frames);
    const playerJCGrabs = getJCGrabs(playerPort, frames);
    const opponentJCGrabs = getJCGrabs(opponentPort, frames);


    ledgeDashesForPlayer[startAt] = {};
    ledgeDashesForPlayer[startAt][opponentCharName] = {};
    ledgeDashesForPlayer[startAt][opponentCharName][stage] = playerLedgeDashes;

    ledgeDashesForOpponent[startAt] = {};
    ledgeDashesForOpponent[startAt][opponentCharName] = {};
    ledgeDashesForOpponent[startAt][opponentCharName][stage] = opponentLedgeDashes;

    overallOnOpponent[startAt] = {};
    overallOnOpponent[startAt][opponentCharName] = {};
    overallOnOpponent[startAt][opponentCharName][stage] = {
      ...playerOverall
    };

    conversionsOnOpponent[startAt] = {};
    conversionsOnOpponent[startAt][opponentCharName] = {};
    conversionsOnOpponent[startAt][opponentCharName][stage] = [
      ...playerConversions];


    overallFromOpponent[startAt] = {};
    overallFromOpponent[startAt][opponentCharName] = {};
    overallFromOpponent[startAt][opponentCharName][stage] = {
      ...opponentOverall
    };

    conversionsFromOpponent[startAt] = {};
    conversionsFromOpponent[startAt][opponentCharName] = {};
    conversionsFromOpponent[startAt][opponentCharName][stage] = [
      ...opponentConversions];

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

    gameResults[startAt] = {};
    gameResults[startAt][opponentCharName] = {};
    gameResults[startAt][opponentCharName][stage] = gameResult;

    wavedashesForPlayer[startAt] = {}
    wavedashesForPlayer[startAt][opponentCharName] = {};
    wavedashesForPlayer[startAt][opponentCharName][stage] = playerWavedashes;

    wavedashesForOpponent[startAt] = {}
    wavedashesForOpponent[startAt][opponentCharName] = {};
    wavedashesForOpponent[startAt][opponentCharName][stage] = opponentWavedashes;

    jcGrabsForPlayer[startAt] = {}
    jcGrabsForPlayer[startAt][opponentCharName] = {};
    jcGrabsForPlayer[startAt][opponentCharName][stage] = playerJCGrabs;

    jcGrabsForOpponent[startAt] = {}
    jcGrabsForOpponent[startAt][opponentCharName] = {};
    jcGrabsForOpponent[startAt][opponentCharName][stage] = opponentJCGrabs;

    processedGamesNb++;
    node_utils.addToLog('debug_worker.log', `WORKER sent statProgress n° ${processedGamesNb} for gamefile ${gameBlob.gameFile}`);
    parentPort.postMessage('statsProgress ' + processedGamesNb + ' ' + games.length);
  }

  const returnValue = {
    computedStats: true,
    playerCharName,
    conversionsOnOpponent,
    conversionsFromOpponent,
    overallOnOpponent,
    overallFromOpponent,
    punishedActionsForPlayer,
    punishedActionsForOpponent,
    lcancelsForPlayer,
    lcancelsForOpponent,
    ledgeDashesForPlayer,
    ledgeDashesForOpponent,
    gameResults,
    wavedashesForPlayer,
    wavedashesForOpponent,
    jcGrabsForPlayer,
    jcGrabsForOpponent,
    debug
  }

  node_utils.addToLog('debug_worker.log', 'WORKER end of treatment');
  return returnValue;
}

function getWavedashes(playerPort, frames) {
  let wavedashes = {
    frame1: 0,
    frame2: 0,
    frame3: 0,
    more: 0,
    total: 0,
  };
  // We will store the 8 previous frames of animation because that's how it's done in slippi stats
  let previousPosts = [];
  for (let frameKey of Object.keys(frames)) {
    currentPost = frames[frameKey].players.find(player => player.pre.playerIndex === playerPort).post;

    if (currentPost.actionStateId === 43 && previousPosts[previousPosts.length - 1] !== 43) {
      // We detected a new waveland
      const uniqueAnimations = previousPosts.map(val => val.actionStateId).filter(node_utils.onlyUnique);
      if (uniqueAnimations.includes(24)) { // 24 === Jumpsquat 
        // We had a jump in the previous 8 frames, so it's pretty safe to assume this was a wavedash
        // We will count the number of animations it takes us to find the jumpsquat, beginning at the end of previousPosts
        // Frame perfect WD : the first frame after jumpsquat is 43
        // If it's not a frame perfect wavedash, we can count the number of frames between the end of jumpsquat and the beginning of airdodge
        if (previousPosts[previousPosts.length - 1].actionStateId === 24) {
          // Frame perfect wavedash
          wavedashes.frame1++;
        } else {
          let lateness;
          for (let i = 0; i < previousPosts.length - 1; i++) {
            if (previousPosts[i + 1].actionStateId === 236) { // The next frame is our airdodge
              lateness = previousPosts[i].actionStateCounter + 1; // This contains the number of frames the character spent in it's current actionState before this one
              break;
            }
          }
          if (lateness) {
            if (lateness === 1) {
              wavedashes.frame2++;
            } else if (lateness === 2) {
              wavedashes.frame3++;
            } else {
              wavedashes.more++;
            }
          }
        }
        wavedashes.total++;
        previousPosts = [];
      }
    }

    if (previousPosts.length < 8) {
      previousPosts.push(currentPost);
    } else {
      previousPosts.shift();
      previousPosts.push(currentPost);
    }
  }
  return wavedashes;
}

function getJCGrabs(playerPort, frames) {
  let jcGrabs = {
    successful: {
      frame1: 0,
      frame2: 0,
      frame3orMore: 0
    },
    failed: {
      oneFrameLate: 0,
      twoFramesLate: 0,
      threeFramesLate: 0
    },
    total: 0
  }
  // We will store the 8 previous frames of animation to account for the longer jumpsquats in the game
  let previousPosts = [];
  let isInsideProcessedGrabAnimation = false;
  let processingDashGrab = false;
  let framesSinceDashGrab = 0;
  for (let frameKey of Object.keys(frames)) {
    currentPost = frames[frameKey].players.find(player => player.pre.playerIndex === playerPort).post;
    currentPre = frames[frameKey].players.find(player => player.pre.playerIndex === playerPort).pre;
    if (processingDashGrab === true) {
      framesSinceDashGrab ++;
      if (isButtonPressed('x', currentPre.physicalButtons) || isButtonPressed('y', currentPre.physicalButtons)) {
        // node_utils.addToLog(`WORKER - detected a X or Y press on frame ${framesSinceDashGrab} after dashgrab started`);
        if (framesSinceDashGrab === 1) {
          jcGrabs.failed.twoFramesLate ++;
        } else if (framesSinceDashGrab === 2) {
          jcGrabs.failed.threeFramesLate ++;
        }
        jcGrabs.total++;
        processingDashGrab = false;
        framesSinceDashGrab = 0;
        previousPosts = [];
        isInsideProcessedGrabAnimation = true;
      } else {
        // node_utils.addToLog(`WORKER - didn't detect a X or Y press on frame ${framesSinceDashGrab} after dashgrab started`);
        if (framesSinceDashGrab >= 2) {
          // node_utils.addToLog(`WORKER - didn't detect a X or Y press in the 3 frames after dashgrab started, reset`);
          // It was just a dashgrab, or the jump imput was more than 3 frames late
          processingDashGrab = false;
          framesSinceDashGrab = 0;
          previousPosts = [];
          isInsideProcessedGrabAnimation = true;
        }
      }
    } else if (isInsideProcessedGrabAnimation === false) {
      if (currentPost.actionStateId === 212) {
        // We detected a standing grab, so we want to know whether it was a jc grab or not
        // node_utils.addToLog(`WORKER - found a stand grab, previous posts ${JSON.stringify(previousPosts.map(pp => pp.actionStateId), null, 4)}`);
        const uniqueAnimations = previousPosts.map(val => val.actionStateId).filter(node_utils.onlyUnique);
        if (uniqueAnimations.includes(24)) { // 24 === Jumpsquat 
          let frameCount = 0;
          for (let i = previousPosts.length - 1; i >= 0; i--) {
            if (previousPosts[i].actionStateId === 24) {
              frameCount++;
            } else {
              // We're now before the jumpsquat, we know how many frames we spent in it before our jcgrab
              if (frameCount === 1) {
                jcGrabs.successful.frame1++;
              } else if (frameCount === 2) {
                jcGrabs.successful.frame2++;
              } else if (frameCount >= 3) {
                jcGrabs.successful.frame3orMore++;
              } else {
                // Something went wrong
                // node_utils.addToLog(`WORKER - GetJCGrabs, something went wrong when looking for lateness, frameKey ${frameKey}`);
              }
              // At the end of the treatment of a jc grab we reset stuff
              previousPosts = [];
              jcGrabs.total++;
              // We don't want to treat the same grab multiple times
              isInsideProcessedGrabAnimation = true;
              // node_utils.addToLog(`WORKER - End of JC Grab treatment, jcGrabs ${JSON.stringify(jcGrabs, null, 4)}`);
              i = -1
            }
          }
        } else {
          previousPosts = [];
          // We don't want to treat the same grab multiple times
          isInsideProcessedGrabAnimation = true;
          // node_utils.addToLog(`WORKER - End of non jc grab`);
        }

      } else if (currentPost.actionStateId === 214) {
        // node_utils.addToLog(`WORKER - found a dash grab, frameKey ${frameKey}`);
        // We detect a dash grab, so we want to check if it was an attempted jc grab or not
          // node_utils.addToLog(`WORKER - Testing physicalButtons ${currentPre.physicalButtons}`);
          // node_utils.addToLog(`WORKER - currentPost ${JSON.stringify(currentPre, null, 4)}`);
        if (isButtonPressed('x', currentPre.physicalButtons) || isButtonPressed('y', currentPre.physicalButtons)) {
          // node_utils.addToLog(`WORKER - detected a X or Y press on the same frame as dashgrab started`);
          jcGrabs.failed.oneFrameLate++;
          jcGrabs.total++;
          previousPosts = [];
          isInsideProcessedGrabAnimation = true;
          i = -1;
        } else {
          // node_utils.addToLog(`WORKER - didn't detect a X or Y press on the same frame as dashgrab started`);
          // We will need to keep looking forward for 3 frames to see if we find X or Y inputs during the dashgrab input
          processingDashGrab = true;
        }
      }
      if (previousPosts.length < 8) {
        previousPosts.push(currentPost);
      } else {
        previousPosts.shift();
        previousPosts.push(currentPost);
      }
    } else {
      if (currentPost.actionStateId !== 212 && currentPost.actionStateId !== 214) {
        // We've moved past the duration of the last grab we processed
        isInsideProcessedGrabAnimation = false;
        previousPosts = [];
        // node_utils.addToLog(`WORKER - moved out of last grab, jcGrabs ${JSON.stringify(jcGrabs, null, 4)}`);
        // node_utils.addToLog(`WORKER - moved out of last grab, previousPosts ${JSON.stringify(previousPosts, null, 4)}`);
      }
    }
  }
  // node_utils.addToLog(`WORKER - End of jcgrabs treatment for player ${playerPort}, jcGrabs ${JSON.stringify(jcGrabs, null, 4)}`);
  return jcGrabs;
}

function getResult(playerPort, opponentPort, stocks, end) {
  // If a player ragequits, it's a loss.
  if (end?.lrasInitiatorIndex === playerPort) {
    return 'loss';
  } else if (end?.lrasInitiatorIndex === opponentPort) {
    return 'win';
  }
  // If there was no ragequit, we look for the player who has a stock with no end frame
  // node_utils.addToLog('WORKER GetResults end');
  // node_utils.addToLog(JSON.stringify(end, null, 4));

  // node_utils.addToLog('WORKER GetResults stocks');
  // node_utils.addToLog(JSON.stringify(stocks, null, 4));

  // node_utils.addToLog('WORKER GetResults playerPort');
  // node_utils.addToLog(JSON.stringify(playerPort, null, 4));

  // node_utils.addToLog('WORKER GetResults opponentPort');
  // node_utils.addToLog(JSON.stringify(opponentPort, null, 4));

  let winnerPort;
  for (let stock of stocks) {
    if (stock.deathAnimation === null) {
      // node_utils.addToLog('WORKER GetResults stock without death animation');
      // node_utils.addToLog(JSON.stringify(stock, null, 4));
      if (!winnerPort) {
        winnerPort = stock.playerIndex;
      }
    }
  }
  // node_utils.addToLog('WORKER GetResults winner port');
  // node_utils.addToLog(JSON.stringify(winnerPort, null, 4));
  if (winnerPort !== undefined) {
    if (winnerPort === playerPort) {
      return 'win';
    } else if (winnerPort === opponentPort) {
      return 'loss';
    }
  }
}

function isButtonPressed(button, physicalButtons) {
  // node_utils.addToLog(`WORKER - is Button ${button}, physicalButtons ${physicalButtons}`);
  // node_utils.addToLog(`WORKER - bitValue ${node_utils.PHYSICAL_BUTTONS[button]}`);
  return physicalButtons & node_utils.PHYSICAL_BUTTONS[button];
}

function getOpeningRatio(playerConversions, opponentConversions) {
  if ((playerConversions.length + opponentConversions.length) !== 0) {
    return playerConversions.length / (playerConversions.length + opponentConversions.length) * 100;
  }
  return 0;
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
      while (!hasFoundMove) {
        if (frames[currentFrame]) {
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
              // To detect a hit : We look for the startup frame of the attack, and look it up in our conversions somewhere. 
              // Either it was part of a conversion, and it was a hit (unsafe on hit, crouch, etc), or it wasn't and it's a whiff
              const currentPlayerPost = frames[i].players.find(player => player.pre.playerIndex === playerPort).post;
              if (node_utils.getAttackAction(currentPlayerPost.actionStateId) === attack) {
                const previousOpponentPost = frames[i - 1].players.find(player => player.pre.playerIndex !== playerPort).post;
                const previousOpponentActionStateId = previousOpponentPost.actionStateId;
                const currentOpponentPost = frames[i].players.find(player => player.pre.playerIndex !== playerPort).post;
                const currentOpponentActionStateId = currentOpponentPost.actionStateId;
                // here we will check if we detect a new shieldstun "event"
                if (node_utils.isNewShield(currentOpponentActionStateId, previousOpponentActionStateId)) {
                  // We have detected a shieldstun, now we want to know if it was a regular shield or a powershield
                  // Since non projectile attacks don't trigger a specific powershield actionStateId, we need to parse some frames
                  // We need to parse the previous frame
                  // If previouspost.shieldSize is equal to currentpost.shieldSize, it's a powershield else it's a shield
                  if (currentOpponentPost.shieldSize === previousOpponentPost.shieldSize) {
                    whiffShieldPLHit = 'Powershield';
                  } else {
                    whiffShieldPLHit = 'Shield';
                  }
                  hasFoundCollision = true;
                }
                i--;
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
            punishedAttacks.push({ name: attack, status: whiffShieldPLHit });
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
          currentFrame--;
        } else {
          // The conversion started at the very beginning of the game, without anything being done by the opponent
          // Somehow it has happened I guess
          // We just ignore this conversion
          hasFoundMove = true;
        }
      }
    }
  }
  return {
    punishedAttacks, punishedDefensiveOptions, punishedMovementOptions
  };
}

function getLCancels(frames, playerPort, opponentPort) {
  let playerLCancels = { successful: 0, failed: 0 };
  let playerFailedMoves = [];
  let oppLCancels = { successful: 0, failed: 0 };
  let oppFailedMoves = [];
  for (let frameKey of Object.keys(frames)) {
    const playerPostFrameUpdate = frames[frameKey].players.find(player => player.pre.playerIndex === playerPort).post;
    const playerAttack = node_utils.getAttackAction(playerPostFrameUpdate.actionStateId);
    const oppPostFrameUpdate = frames[frameKey].players.find(player => player.pre.playerIndex === opponentPort).post;
    const oppAttack = node_utils.getAttackAction(oppPostFrameUpdate.actionStateId);
    if (playerAttack) {
      if (playerPostFrameUpdate.lCancelStatus === 1) {
        playerLCancels.successful++;
      } else if (playerPostFrameUpdate.lCancelStatus === 2) {
        playerLCancels.failed++;
        playerFailedMoves.push(playerAttack);
      }
    }
    if (oppAttack) {
      if (oppPostFrameUpdate.lCancelStatus === 1) {
        oppLCancels.successful++;
      } else if (oppPostFrameUpdate.lCancelStatus === 2) {
        oppLCancels.failed++;
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

function getLedgeDashes(frames, playerPort) {
  // node_utils.addToLog(`Starting ledgeDash for playerPort ${playerPort}`);
  let ledgeDashes;
  let foundCliffCatch = false;
  let foundCliffDrop = false;
  let foundAirDodge = false;
  let foundWaveland = false;
  let hasWavelandEnded = false;
  let framesSinceLedgeDrop = 0;
  let extraInvincibilityFrames = 0;
  let reset = function (reason) {
    // node_utils.addToLog(`WORKER LedgeDashes -- Reset for ${reason}`);
    foundCliffCatch = false;
    foundCliffDrop = false;
    foundAirDodge = false;
    foundWaveland = false;
    hasWavelandEnded = false;
    framesSinceLedgeDrop = 0;
    extraInvincibilityFrames = 0;
    previousPosts = [];
  }

  // Will be used to determine the amount of vulnerability frames in non-invincible ledgedashes
  let previousPosts = [];

  for (let frameKey of Object.keys(frames)) {
    const playerPostFrameUpdate = frames[frameKey].players.find(player => player.pre.playerIndex === playerPort).post;
    if (hasWavelandEnded) {
      // Check for the invincibility status
      // Check if we're in our leniency window
      if (framesSinceLedgeDrop <= LEDGEDASHWINDOW) {
        if (playerPostFrameUpdate.hurtboxCollisionState === 0) {
          // Invincibility has ended, we save it
          if (!ledgeDashes) {
            ledgeDashes = {};
          }
          if (!ledgeDashes['invincible']) {
            ledgeDashes['invincible'] = [];
          }
          ledgeDashes['invincible'].push({ framesSinceLedgeDrop, extraInvincibilityFrames });
          reset(`Found an invincible ledgedash, frameKey ${frameKey}`);
        }
      } else {
        // Should never happen. Probably ? I hope.
        reset(`Outside of leniency window, looking for the invincibility frames, frameKey ${frameKey}`);
      }
    } else if (foundWaveland) {
      // Check for the end of waveland
      // Check if we're in our leniency window
      // node_utils.addToLog(`Looking for the end of waveland, frameKey ${frameKey}, framesSinceLedgeDrop ${framesSinceLedgeDrop}, actionStateId ${playerPostFrameUpdate.actionStateId}`);
      if (framesSinceLedgeDrop <= LEDGEDASHWINDOW) {
        if (playerPostFrameUpdate.actionStateId !== 43) {
          // The waveland is over, we check the invincibility status
          if (playerPostFrameUpdate.hurtboxCollisionState === 0) {
            // It's not an invincible ledgedash, we check how many frames ago the character started being vulnerable and save the ledgedash
            let vulnerableFrames = 0;
            for (let i = 0; i <= previousPosts.length - 1; i ++) {
              if (previousPosts[i].hurtboxCollisionState === 0) {
                // node_utils.addToLog(`Found first vulnerable post for ledgeDash, i = ${i}, previousPosts = ${JSON.stringify(previousPosts, null, 4)}`);
                vulnerableFrames = previousPosts.length - i; // If we find vulnerability on i === 3 out of 10, it means the character will have been vulnerable for 7 frames total
                i = 20; // We break the loop
              } 
            }
            if (!ledgeDashes) {
              ledgeDashes = {};
            }
            if (!ledgeDashes['notInvincible']) {
              ledgeDashes['notInvincible'] = [];
            }
            ledgeDashes['notInvincible'].push({ framesSinceLedgeDrop, vulnerableFrames });
            reset(`Found a non invincible ledgedash, frameKey ${frameKey}`);
          } else {
            // It's an invincible ledgedash, we will look forwards in frames until we lose the invulnerability
            hasWavelandEnded = true;
          }
        }
      } else {
        reset(`Outside of leniency window, looking for the end of waveland, frameKey ${frameKey}`);
      }
    } else if (foundAirDodge) {
      // Check for a waveland
      // Check if we're in our leniency window
      if (framesSinceLedgeDrop <= LEDGEDASHWINDOW) {
        if (playerPostFrameUpdate.actionStateId === 43) {
          foundWaveland = true;
        }
      } else {
        reset(`Outside of leniency window, looking for the waveland, frameKey ${frameKey}`);
      }
    } else if (foundCliffDrop) {
      // Check for an airdodge
      // Check if we're in our leniency window
      if (framesSinceLedgeDrop <= LEDGEDASHWINDOW) {
        if (playerPostFrameUpdate.actionStateId === 236) {
          foundAirDodge = true;
        }
      } else {
        reset(`Outside of leniency window, looking for the airdodge, frameKey ${frameKey}`);
      }
    } else if (foundCliffCatch) {
      // Check for a cliff drop
      if ([254, 255, 256, 257, 258, 259, 260, 261, 262, 263].includes(playerPostFrameUpdate.actionStateId)) {
        // Standard ledge option
        reset(`Found standard ledge option, frameKey ${frameKey}`);
      } else {
        foundCliffDrop = true;
      }
    } else {
      // Check for a cliffcatch
      if (playerPostFrameUpdate.actionStateId === 252) {
        foundCliffCatch = true;
      }
    }
    // Counter update after the frame
    if (previousPosts.length >= 20) {
      previousPosts.shift();
      previousPosts.push(playerPostFrameUpdate);
    } else {
      previousPosts.push(playerPostFrameUpdate);
    }
    if (foundCliffDrop) {
      framesSinceLedgeDrop++;
    }
    if (hasWavelandEnded) {
      extraInvincibilityFrames++;
    }
  }
  return ledgeDashes;
}