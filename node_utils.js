const fs = require('fs');

let logString = '';

// Lists of common action states to be used to process whiff / hit / shield punishes
// Source https://docs.google.com/spreadsheets/d/1JX2w-r2fuvWuNgGb6D3Cs4wHQKLFegZe2jhbBuIhCG8/preview#gid=13
const ATTACKACTIONSTATES = {
  44 : { id : 44, name : 'Attack11', niceName: 'Jab 1'},	
	45 : { id : 45, name : 'Attack12', niceName: 'Jab 2'},		
	46 : { id : 46, name : 'Attack13', niceName: 'Jab 3'},	
	47 : { id : 47, name : 'Attack100Start', niceName: 'Rapid jab'},	
	48 : { id : 48, name : 'Attack100Loop', niceName: 'Rapid jab'},		
	49 : { id : 49, name : 'Attack100End', niceName: 'Rapid jab'},
	50 : { id : 50, name : 'AttackDash', niceName: 'Dash attack'},	
	51 : { id : 51, name : 'AttackS3Hi', niceName: 'Forward tilt'},		
	52 : { id : 52, name : 'AttackS3HiS', niceName: 'Forward tilt'},		
  53 : { id : 53, name : 'AttackS3S', niceName: 'Forward tilt'},		
	54 : { id : 54, name : 'AttackS3LwS', niceName: 'Forward tilt'},	
	55 : { id : 55, name : 'AttackS3Lw', niceName: 'Forward tilt'},	
	56 : { id : 56, name : 'AttackHi3', niceName: 'Up tilt'},	
	57 : { id : 57, name : 'AttackLw3', niceName: 'Down tilt'},		
	58 : { id : 58, name : 'AttackS4Hi', niceName: 'Forward smash'},		
	59 : { id : 59, name : 'AttackS4HiS', niceName: 'Forward smash'},		
	60 : { id : 60, name : 'AttackS4S', niceName: 'Forward smash'},	
	61 : { id : 61, name : 'AttackS4LwS', niceName: 'Forward smash'},		
	62 : { id : 62, name : 'AttackS4Lw', niceName: 'Forward smash'},			
	63 : { id : 63, name : 'AttackHi4', niceName: 'Up smash'},	
	64 : { id : 64, name : 'AttackLw4', niceName: 'Down smash'},	
	65 : { id : 65, name : 'AttackAirN', niceName: 'Neutral air'},	
	66 : { id : 66, name : 'AttackAirF', niceName: 'Forward air'},	
	67 : { id : 67, name : 'AttackAirB', niceName: 'Back air'},	
	68 : { id : 68, name : 'AttackAirHi', niceName: 'Up air'},
	69 : { id : 69, name : 'AttackAirLw', niceName: 'Down air'},
	70 : { id : 70, name : 'LandingAirN', niceName: 'Nair landing'},
	71 : { id : 71, name : 'LandingAirF', niceName: 'Fair landing'},
	72 : { id : 72, name : 'LandingAirB', niceName: 'Bair landing'},	
	73 : { id : 73, name : 'LandingAirHi', niceName: 'Uair landing'},	
	74 : { id : 74, name : 'LandingAirLw', niceName: 'Dair landing'},
	212 : { id : 212, name : 'Catch', niceName: 'Grab'},
	214 : { id : 214, name : 'CatchDash', niceName: 'Dash grab'},
};

const MOVEMENTACTIONSTATES = {
  14: {id: 14, name: 'Wait', nameForOpponentAttackStats: 'Wait'},
  15 : {id: 15, name: 'WalkSlow', niceName: 'Walk'},
  16 : {id: 16, name: 'WalkMiddle', niceName: 'Walk'},
  17 : {id: 17, name: 'WalkFast', niceName: 'Walk'},
  18 : {id: 18, name: 'Turn', niceName: 'Turnaround'},
  19 : {id: 19, name: 'TurnRun', niceName: 'Turnaround'},
  20 : {id: 20, name: 'Dash', niceName: 'Dash'},
  21 : {id: 21, name: 'Run', niceName: 'Run'},
  22 : {id: 22, name: 'RunDirect', niceName: 'Run'},
  24 : {id: 24, name: 'KneeBend', niceName: 'Jumpsquat'},
  25 : {id: 25, name: 'JumpF', niceName: 'Jump forward'},
  26 : {id: 26, name: 'JumpB', niceName: 'Jump back'},
  27 : {id: 27, name: 'JumpAerialF', niceName: 'Double jump forward'},
  28 : {id: 28, name: 'JumpAerialB', niceName: 'Double jump back'},
  35 : {id: 35, name: 'FallSpecial', niceName: 'Freefall'},
  36 : {id: 36, name: 'FallSpecialF', niceName: 'Freefall'},
  37 : {id: 37, name: 'FallSpecialB', niceName: 'Freefall'},
  40 : {id: 40, name: 'SquatWait', niceName: 'Crouching'},
  43 : {id: 43, name: 'LandingFallSpecial', niceName: 'Waveland / Wavedash'},
};

const DEFENSIVEACTIONSTATES = {
  179 : {id: 179, name: 'Guard', niceName: 'Hold shield'},
  180 : {id: 180, name: 'GuardOff', niceName: 'Shield release'},
  183 : {id: 183, name: 'DownBoundU', niceName: 'Misstech'},
  191 : {id: 191, name: 'DownBoundD', niceName: 'Misstech'},
  184 : {id: 184, name: 'DownWaitU', niceName: 'Laying on the ground facing up'},
  192 : {id: 192, name: 'DownWaitD', niceName: 'Laying on the ground facing down'},
  186 : {id: 186, name: 'DownStandU', niceName: 'Neutral getup'},
  187 : {id: 187, name: 'DownAttackU', niceName: 'Getup attack facing up '},
  195 : {id: 195, name: 'DownAttackD', niceName: 'Getup attack facing down '},
  188 : {id: 188, name: 'DownFowardU', niceName: 'Misstech roll forward '},
  196 : {id: 196, name: 'DownFowardD', niceName: 'Misstech roll forward '},
  189 : {id: 189, name: 'DownBackU', niceName: 'Misstech roll back '},
  197 : {id: 197, name: 'DownBackD', niceName: 'Misstech roll back '},
  199 : {id: 199, name: 'Passive', niceName: 'Neutral Tech'},
  200 : {id: 200, name: 'PassiveStandF', niceName: 'Tech forward'},
  201 : {id: 201, name: 'PassiveStandB', niceName: 'Tech back'},
  202 : {id: 202, name: 'PassiveWall', niceName: 'Wall tech'},
  203 : {id: 203, name: 'PassiveWallJump', niceName: 'Wall jump'},
  233 : {id: 233, name: 'EscapeF', niceName: 'Roll forward'},
  234 : {id: 234, name: 'EscapeB', niceName: 'Roll back'},
  235 : {id: 235, name: 'Escape', niceName: 'Spotdodge'},
  236 : {id: 236, name: 'EscapeAir', niceName: 'Airdodge '},
  244 : {id: 244, name: 'Pass', niceName: 'Drop through platform '},
  251 : {id: 251, name: 'MissFoot', niceName: 'Shield slide off'},
  252 : {id: 252, name: 'CliffCatch', niceName: 'Grabbing the ledge'},
  253 : {id: 253, name: 'CliffWait', niceName: 'Hanging on the ledge'},
  254 : {id: 254, name: 'CliffClimbSlow', niceName: 'Climbing the ledge (100%+)'},
  255 : {id: 255, name: 'CliffClimbQuick', niceName: 'Climbing the ledge (<100%)'},
  256 : {id: 256, name: 'CliffAttackSlow', niceName: 'Ledge attack (100%+)'},
  257 : {id: 257, name: 'CliffAttackQuick', niceName: 'Ledge attack (<100%) '}, 
  258 : {id: 258, name: 'CliffEscapeSlow', niceName: 'Ledge roll (100%+)'},
  259 : {id: 259, name: 'CliffEscapeQuick', niceName: 'Ledge roll (<100%) '},
  260 : {id: 260, name: 'CliffJumpSlow1', niceName: 'Ledge jump/tournament winner (100%+)'}, 
  261 : {id: 261, name: 'CliffJumpSlow2', niceName: 'Ledge jump/tournament winner (100%+)'},
  262 : {id: 262, name: 'CliffJumpQuick1', niceName: 'Ledge jump/tournament winner (<100%)'},
  263 : {id: 263, name: 'CliffJumpQuick2', niceName: 'Ledge jump/tournament winner (<100%)'},
}

const GENERICSTATES = {
  181: {id: 181, name: 'GuardSetOff', nameForOpponentAttackStats: 'Shield'},
  182: {id: 182, name: 'GardReflect', nameForOpponentAttackStats: 'Powershield'},
  75: {id:75, name: 'DamageHi1', nameForOpponentAttackStats: 'Hit'},		
	76: {id:76, name: 'DamageHi2', nameForOpponentAttackStats: 'Hit'},		
	77: {id:77, name: 'DamageHi3	', nameForOpponentAttackStats: 'Hit'},		
	78: {id:78, name: 'DamageN1', nameForOpponentAttackStats: 'Hit'},		
	79: {id:79, name: 'DamageN2	', nameForOpponentAttackStats: 'Hit'},		
	80: {id:80, name: 'DamageN3', nameForOpponentAttackStats: 'Hit'},		
	81: {id:81, name: 'DamageLw1	', nameForOpponentAttackStats: 'Hit'},
	82: {id:82, name: 'DamageLw2	', nameForOpponentAttackStats: 'Hit'},
	83: {id:83, name: 'DamageLw3', nameForOpponentAttackStats: 'Hit'},
	84: {id:84, name: 'DamageAir1', nameForOpponentAttackStats: 'Hit'},
	85: {id:85, name: 'DamageAir2', nameForOpponentAttackStats: 'Hit'},
	86: {id:86, name: 'DamageAir3', nameForOpponentAttackStats: 'Hit'},
	87: {id:87, name: 'DamageFlyHi', nameForOpponentAttackStats: 'Hit'},
	88: {id:88, name: 'DamageFlyN', nameForOpponentAttackStats: 'Hit'},
	89: {id:89, name: 'DamageFlyLw', nameForOpponentAttackStats: 'Hit'},
	90: {id:90, name: 'DamageFlyTop', nameForOpponentAttackStats: 'Hit'},
	91: {id:91, name: 'DamageFlyRoll', nameForOpponentAttackStats: 'Hit'},
}

function getDefensiveAction(id) {
  if (DEFENSIVEACTIONSTATES[id]) {
    return DEFENSIVEACTIONSTATES[id].niceName;
  } else {
    return undefined;
  }
}
function getMovementAction(id) {
  if (MOVEMENTACTIONSTATES[id]) {
    return MOVEMENTACTIONSTATES[id].niceName;
  } else {
    return undefined;
  }
}
function getAttackAction(id) {
  if (ATTACKACTIONSTATES[id]) {
    return ATTACKACTIONSTATES[id].niceName;
  } else {
    return undefined;
  }
}

function isNewShield(currentStateId, PreviousStateId) {
  if (GENERICSTATES[currentStateId]?.nameForOpponentAttackStats === 'Shield') {
    if (GENERICSTATES[PreviousStateId]?.nameForOpponentAttackStats !== 'Shield') {
      return true;
    } else {
      return false;
    }
  }
  else {
    return false;
  }
}


function isNewPowerShield(currentStateId, PreviousStateId) {
  if (GENERICSTATES[currentStateId]?.nameForOpponentAttackStats === 'Powershield') {
    if (GENERICSTATES[PreviousStateId]?.nameForOpponentAttackStats !== 'Powershield') {
      return true;
    } else {
      return false;
    }
  }
  else {
    return false;
  }
}

function addToLog(stringValue) {
  logString = `${logString}
  ${stringValue}`;
}

function printLog(path) {
  fs.writeFile(path, logString, err => {
    if (err) throw err;
    console.log(`Wrote ${path}`);
  })
}


module.exports = {
  getAttackAction: getAttackAction,
  getMovementAction: getMovementAction,
  getDefensiveAction: getDefensiveAction,
  isNewShield: isNewShield,
  isNewPowerShield: isNewPowerShield,
  addToLog: addToLog,
  printLog: printLog
}