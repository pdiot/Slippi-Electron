import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Conversion, EnrichedGameFile, LCancels, Ledgedashes, Overall, PunishedActions, StatsWrapper } from 'src/interfaces/outputs';
import { GameFileFilter, StatsCalculationProgress } from 'src/interfaces/types';

export interface Dictionary {
  'enrichedGameFiles': EnrichedGameFile[],
  'selectedGames': EnrichedGameFile[],
  'gameFilter': GameFileFilter,
  'playerConversions': StatsWrapper<Conversion[]>,
  'opponentConversions': StatsWrapper<Conversion[]>,
  'playerOveralls': StatsWrapper<Overall>,
  'opponentOveralls': StatsWrapper<Overall>,
  'punishedActionsForPlayer': StatsWrapper<PunishedActions>,
  'punishedActionsForOpponent': StatsWrapper<PunishedActions>,
  'lcancelsForPlayer': StatsWrapper<LCancels>,
  'lcancelsForOpponent': StatsWrapper<LCancels>,
  'ledgeDashesForPlayer': StatsWrapper<Ledgedashes>,
  'ledgeDashesForOpponent': StatsWrapper<Ledgedashes>,
  'statsCalculationProgress': StatsCalculationProgress,
  'statsCalculationDone': boolean,
  'playerCharName': string,
  'gameResults': StatsWrapper<string>,
  'firstFile': any,
  'secondFile': any,
  'statsFilesForGraphs': any,
  'reset': boolean,
  'visibleMenu': boolean,
}

const DictionaryRecord : Record<keyof Dictionary, boolean> = {
  'enrichedGameFiles': true,
  'selectedGames': true,
  'gameFilter': true,
  'playerConversions': true,
  'opponentConversions': true,
  'playerOveralls': true,
  'opponentOveralls': true,
  'punishedActionsForPlayer': true,
  'punishedActionsForOpponent': true,
  'lcancelsForPlayer': true,
  'lcancelsForOpponent': true,
  'ledgeDashesForPlayer': true,
  'ledgeDashesForOpponent': true,
  'statsCalculationProgress': true,
  'statsCalculationDone': true,
  'playerCharName': true,
  'gameResults': true,
  'firstFile': true,
  'secondFile': true,
  'statsFilesForGraphs': true,
  'reset': true,
  'visibleMenu': true,
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

  public reset(): void {
    this.internalData = {};
    this.internalData['reset'] = true;
    this.internalData['visibleMenu'] = false;
    this.data.next(this.internalData);
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
