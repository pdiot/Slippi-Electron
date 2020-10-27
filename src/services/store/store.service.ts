import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { EnrichedGameFile, FirstHits, Metadata, Openings, Overalls } from 'src/interfaces/outputs';
import { GameFileFilter } from 'src/interfaces/types';

export interface Dictionary {
  'neutralWinConversionsOnOpponent' : Openings,
  'neutralWinConversionsFromOpponent' : Openings,
  'punishesOnOpponent' : Openings,
  'punishesFromOpponent' : Openings,
  'neutralWinsFirstHitOnOpponent' : FirstHits,
  'neutralWinsFirstHitFromOpponent' : FirstHits,
  'neutralKillsFirstHitOnOpponent' : FirstHits,
  'neutralKillsFirstHitFromOpponent' : FirstHits,
  'punishesFirstHitOnOpponent' : FirstHits,
  'punishesFirstHitFromOpponent' : FirstHits,
  'punishKillsFirstHitOnOpponent' : FirstHits,
  'punishKillsFirstHitFromOpponent' : FirstHits,
  'overallOnOpponent' : Overalls,
  'overallFromOpponent' : Overalls,
  'metadata': Metadata,
  'enrichedGameFiles': EnrichedGameFile[],
  'gameFilter': GameFileFilter,
}

const DictionaryRecord : Record<keyof Dictionary, boolean> = {
  'neutralWinConversionsOnOpponent' : true,
  'neutralWinConversionsFromOpponent' : true,
  'punishesOnOpponent' : true,
  'punishesFromOpponent' : true,
  'neutralWinsFirstHitOnOpponent' : true,
  'neutralWinsFirstHitFromOpponent' : true,
  'neutralKillsFirstHitOnOpponent' : true,
  'neutralKillsFirstHitFromOpponent' : true,
  'punishesFirstHitOnOpponent' : true,
  'punishesFirstHitFromOpponent' : true,
  'punishKillsFirstHitOnOpponent' : true,
  'punishKillsFirstHitFromOpponent' : true,
  'overallOnOpponent' : true,
  'overallFromOpponent' : true,
  'metadata': true,
  'enrichedGameFiles': true,
  'gameFilter': true,
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private data;
  private internalData;

  constructor() { 
    this.internalData = {};
    this.data = new Subject<Dictionary>();
  }

  public async set(key: keyof(Dictionary), data: any): Promise<boolean> {
    if (DictionaryRecord[key]) {
      this.internalData[key] = data;
      this.data.next(this.internalData);
      return true;
    } else {
      console.error(`Mauvais ajout de données dans le dictionnaire : clé `, key);
      console.error(`Mauvais ajout de données dans le dictionnaire : data `, data);
      return false;
    }
  }

  public getStore(): Subject<Dictionary> {
    return this.data;
  }
}
