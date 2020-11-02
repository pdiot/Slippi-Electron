export interface ExternalCharacter {
  id: number,
  name: string,
  shortName: string,
  colors: string[],
}

export interface ExternalStage {
  id: number,
  name: string
}

export interface ExternalMoveList {
  [key :number] : {
      id: number,
      name: string,
      shortName: string,
  }
}

export interface GameFileFilter {
  slippiId: string,
  character: string, // shortName
  oppSlippiIds?: WhiteBlackList,
  oppCharacters?: WhiteBlackList, //shortName[]
  stages?: WhiteBlackList // name[]
}

export interface WhiteBlackList {
  whitelisted: string[],
  blacklisted: string[],
}

export interface IntermediaryStatsWrapper<T> {
  // character shortName
  [key: string] : {
      // stage name
      [key: string] : T
  }
}

export interface ProcessedOpenings {
  processedNeutralWinsConversions: ProcessedConversionWrapper, 
  processedPunishes: ProcessedConversionWrapper, 
  processedNeutralWinsFirstHits: MostCommonMove, 
  processedKillNeutralFirstHits: MostCommonMove,
  processedPunishesFirstHits: MostCommonMove,
  processedKillPunishFirstHits: MostCommonMove,
  processedDamageForMostCommonNeutralOpeners: StartersAverageDamage[],
  processedDamageForMostCommonPunishStarts: StartersAverageDamage[],
}

export interface ProcessedConversionWrapper {
  // 'multi-hits' or 'single-hit'
  [key: string] : MoyenneConversion
}

export interface StartersAverageDamage {
  moveId: number, 
  averageDamage: number
}

export interface MoyenneConversion {
  averageDamage: number,
  averageLength: number,
}

export interface MostCommonMove {
  move: string,
  count: number,
}

export interface ProcessedOverallList {
  conversionCountMoyenne: number,
  totalDamageMoyenne: number,
  killCountMoyenne: number,
  openingsPerKillMoyenne: number,
  damagePerOpeningMoyenne: number,
  killPercentMoyenne: number,    
}

export interface StatsCalculationProgress {
  current: number,
  total: number,
}

export interface ProcessedPunishedOptions {
  punishedAttacks : {
    onShield: ProcessedAttack[],
    onPShield: ProcessedAttack[],
    onHit: ProcessedAttack[],
    onWhiff: ProcessedAttack[],
  },
  punishedDefensiveOptions : ProcessedDefensiveOption[],
  punishedMovementOptions : ProcessedMovementOption[],
}

export interface ProcessedAttack {
  attack: string,
  count: number
}
export interface ProcessedDefensiveOption {
  defensiveOption: string,
  count: number
}
export interface ProcessedMovementOption {
  movementOption: string,
  count: number
}

export interface ProcessedLCancels {
  lcancels: {
    sucessful: number,
    failed: number,
  }, 
  failedMoves: {
    move: string,
    count: number
  }[]
}