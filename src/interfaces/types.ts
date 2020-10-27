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
