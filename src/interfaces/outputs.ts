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

export interface Metadata {
    //key === slippiId
    [key: string] : {
        characters: string[],
        stages: string[],
        opponentCharacters : string[],
        gameFiles: string[],
    }
}

export interface EnrichedGameFile {
    file: string,
    playerCharacterPairs: {player: string, character: ExternalCharacter}[],
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
