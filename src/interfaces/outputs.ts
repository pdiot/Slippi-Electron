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

export interface Openings {
    // key === stage
    [key : string] : {
        // key === character
        [key : string] : {
            multiHits : {
                averageDamage: number,
                averageLength: number,
            },
            singleHits : {
                averageDamage: number,
            }
        }
    }
}

export interface Overalls {
    // key === stage
    [key : string] : {
        // key === character
        [key : string] : {
            conversionCountMoyenne: number,
            totalDamageMoyenne: number,
            killCountMoyenne: number,
            openingsPerKillMoyenne: number,
            damagePerOpeningMoyenne: number,
            killPercentMoyenne: number,
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

