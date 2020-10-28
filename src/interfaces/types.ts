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
      [key: string] : T[]
  }
}

export interface ProcessedOpenings {
  processedNeutralWinsConversions: IntermediaryStatsWrapper<ProcessedConversionWrapper>, 
  processedPunishes: IntermediaryStatsWrapper<ProcessedConversionWrapper>, 
  processedNeutralWinsFirstHits: IntermediaryStatsWrapper<MostCommonMove>, 
  processedKillNeutralFirstHits: IntermediaryStatsWrapper<MostCommonMove>,
  processedPunishesFirstHits: IntermediaryStatsWrapper<MostCommonMove>,
  processedKillPunishFirstHits: IntermediaryStatsWrapper<MostCommonMove>,
}

export interface ProcessedConversionWrapper {
  // 'multi-hits' or 'single-hit'
  [key: string] : MoyenneConversion
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