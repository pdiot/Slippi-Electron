import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Conversion, EnrichedGameFile, Overall, StatsWrapper } from 'src/interfaces/outputs';
import { GameFileFilter } from 'src/interfaces/types';

export interface Dictionary {
  'enrichedGameFiles': EnrichedGameFile[],
  'gameFilter': GameFileFilter,
  'playerConversions': StatsWrapper<Conversion[]>,
  'opponentConversions': StatsWrapper<Conversion[]>,
  'playerOveralls': StatsWrapper<Overall>,
  'opponentOveralls': StatsWrapper<Overall>,
}

const DictionaryRecord : Record<keyof Dictionary, boolean> = {
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
      console.error(`Wrong store write operation : key `, key);
      console.error(`Wrong store write operation : data `, data);
      return false;
    }
  }

  public async setMultiple(values : {key: keyof(Dictionary), data: any}[]): Promise<boolean> {
    let ok = true;
    for (let value of values) {
      if (DictionaryRecord[value.key]) {
        this.internalData[value.key] = value.data;
      } else {
        console.error(`Wrong store write operation : key `, value.key);
        console.error(`Wrong store write operation : data `, value.data);
        ok = false;
      }
    }
    if (ok) {
      this.data.next(this.internalData);
    }
    return ok;
  }

  public getStore(): Subject<Dictionary> {
    return this.data;
  }
}
