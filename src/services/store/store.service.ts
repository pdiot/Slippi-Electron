import { Injectable, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { Conversion, EnrichedGameFile, LCancels, Ledgedashes, Overall, PunishedActions, StatsWrapper, Wavedashes } from 'src/interfaces/outputs';
import { TourButton } from 'src/interfaces/tour';
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
  'playerWavedashes': StatsWrapper<Wavedashes>,
  'opponentWavedashes': StatsWrapper<Wavedashes>,
  'statsCalculationProgress': StatsCalculationProgress,
  'statsCalculationDone': boolean,
  'playerCharName': string,
  'gameResults': StatsWrapper<string>,
  'firstFile': any,
  'secondFile': any,
  'statsFilesForGraphs': any,
  'reset': boolean,
  'visibleMenu': boolean,
  'goodToGo': string,
}
export interface TourDictionary {
  'buttons': TourButton[],
  'title': string,
  'text': string,
  'anchor': ViewChild,
  'placement': 'left' | 'right' | 'top' | 'bottom',
  'show': boolean,
  'reset': boolean,
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
  'playerWavedashes': true,
  'opponentWavedashes': true,
  'statsCalculationProgress': true,
  'statsCalculationDone': true,
  'playerCharName': true,
  'gameResults': true,
  'firstFile': true,
  'secondFile': true,
  'statsFilesForGraphs': true,
  'reset': true,
  'visibleMenu': true,
  'goodToGo': true,
}

const TourRecord : Record<keyof TourDictionary, boolean> = {
  'buttons': true,
  'title': true,
  'text': true,
  'anchor': true,
  'placement': true,
  'show': true,
  'reset': true,
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private data;
  private internalData;

  private internalTourData;
  private tourData;

  constructor() { 
    this.internalData = {};
    this.data = new Subject<Dictionary>();
    this.internalTourData = {};
    this.tourData = new Subject<TourDictionary>();
  }

  public getInstantData(key: keyof(Dictionary)) {
    return this.internalData['key'];
  }

  public resetTour(): void {
    this.internalTourData = {};
    this.internalTourData['reset'] = true;
    this.tourData.next(this.internalTourData);
  }

  public reset(): void {
    this.internalData = {};
    this.internalData['reset'] = true;
    this.internalData['visibleMenu'] = false;
    this.data.next(this.internalData);
  }

  public resetButKeepFiles(): void {
    const files = this.internalData['enrichedGameFiles'];
    this.internalData = {};
    this.internalData['enrichedGameFiles'] = files;
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
  

  public async setTour(key: keyof(TourDictionary), data: any): Promise<boolean> {
    if (TourRecord[key]) {
      this.internalTourData[key] = data;
      this.tourData.next(this.internalTourData);
      return true;
    } else {
      console.error(`Wrong tour store write operation : key `, key);
      console.error(`Wrong tour store write operation : data `, data);
      return false;
    }
  }

  public async setMultipleTour(values : {key: keyof(TourDictionary), data: any}[]): Promise<boolean> {
    let ok = true;
    for (let value of values) {
      if (TourRecord[value.key]) {
        this.internalTourData[value.key] = value.data;
      } else {
        console.error(`Wrong tour store write operation : key `, value.key);
        console.error(`Wrong tour store write operation : data `, value.data);
        ok = false;
      }
    }
    if (ok) {
      this.tourData.next(this.internalTourData);
    }
    return ok;
  }

  public getStoreTour(): Subject<TourDictionary> {
    return this.tourData;
  }
}
