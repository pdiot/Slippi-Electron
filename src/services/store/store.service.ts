import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Conversion, EnrichedGameFile, Metadata, Overall, StatsWrapper } from 'src/interfaces/outputs';
import { GameFileFilter } from 'src/interfaces/types';

export interface Dictionary {
  'metadata': Metadata,
  'enrichedGameFiles': EnrichedGameFile[],
  'gameFilter': GameFileFilter,
  'playerConversions': StatsWrapper<Conversion[]>,
  'opponentConversions': StatsWrapper<Conversion[]>,
  'playerOveralls': StatsWrapper<Overall>,
  'opponentOveralls': StatsWrapper<Overall>,
}

const DictionaryRecord : Record<keyof Dictionary, boolean> = {
  'metadata': true,
  'enrichedGameFiles': true,
  'gameFilter': true,
  'playerConversions': true,
  'opponentConversions': true,
  'playerOveralls': true,
  'opponentOveralls': true,
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
