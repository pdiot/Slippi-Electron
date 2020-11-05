import { ExternalCharacter } from './types';

export interface FirstHits {
    // key === stage
    [key : string] : {
        // key === character
        [key : string] : {
            move : string,
            count: number,
        }
    }
}

export interface EnrichedGameFile {
    file: string,
    playerCharacterPairs: {player: string, character: ExternalCharacter, isCurrentPlayer?:boolean, port?:number }[],
    stage: string,
    filteredOut?: boolean,
}

export interface Overall {
    beneficialTradeRatio: RatioBasedValue,
    conversionCount: number,
    counterHitRatio: RatioBasedValue,
    damagePerOpening: RatioBasedValue,
    digitalInputsPerMinute: RatioBasedValue,
    inputCounts: RatioBasedValue,
    inputsPerMinute: RatioBasedValue,
    killCount: number
    neutralWinRatio: RatioBasedValue,
    openingsPerKill: RatioBasedValue,
    opponentIndex: number,
    playerIndex: number,
    successfulConversions: RatioBasedValue,
    totalDamage: number,
    conversionsRatio: number,
}

export interface StatsWrapper<T> {
    // startedAt from game
    [key: string] : {
        // character shortName
        [key: string] : {
            // stage name
            [key: string] : T
        }
    }
}

export interface RatioBasedValue {
    count: number,
    total: number,
    ratio: number
}

export interface Conversion {
    currentPercent: number,
    didKill: boolean,
    endFrame: number,
    endPercent: number,
    moves: Move[],
    openingType: string,
    opponentIndex: number,
    playerIndex: number,
    startFrame: number,
    startPercent: number,
}

export interface Move {
    frame: number,
    moveId: number,
    hitCount: number,
    damage: number
}

export interface PunishedActions {
    punishedAttacks: {name: string, status: string}[],
    punishedDefensiveOptions: string[],
    punishedMovementOptions: string[],
}

export interface LCancels {
    lcancels: {
        successful: number,
        failed: number
    },
    failedMoves: string[],
}

export interface StatsItem {
    playerConversions: StatsWrapper<Conversion[]>,
    opponentConversions: StatsWrapper<Conversion[]>,
    playerOveralls: StatsWrapper<Overall>,
    opponentOveralls: StatsWrapper<Overall>,
    punishedActionsForPlayer: StatsWrapper<PunishedActions>,
    punishedActionsForOpponent: StatsWrapper<PunishedActions>,
    lcancelsForPlayer: StatsWrapper<LCancels>,
    lcancelsForOpponent: StatsWrapper<LCancels>
  }
