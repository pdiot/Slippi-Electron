import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { BETTERMOVES } from 'src/interfaces/const';
import { EnrichedGameFile, StatsItem } from 'src/interfaces/outputs';
import { IntermediaryStatsWrapper, ProcessedOpenings, ProcessedOverallList } from 'src/interfaces/types';
import { StatsProcessingService } from 'src/services/stats-processing/stats-processing.service';
import GameFileUtils from '../utils/gameFile.utils';

@Component({
  selector: 'app-stats-display',
  templateUrl: './stats-display.component.html',
  styleUrls: ['./stats-display.component.scss']
})
export class StatsDisplayComponent implements OnInit {

  @Input() stats: StatsItem;
  @Input() selectedGames: EnrichedGameFile[];

  playerConversions : IntermediaryStatsWrapper<ProcessedOpenings>;
  opponentConversions: IntermediaryStatsWrapper<ProcessedOpenings>;
  playerOverall: IntermediaryStatsWrapper<ProcessedOverallList>;
  opponentOverall: IntermediaryStatsWrapper<ProcessedOverallList>;

  constructor(private cd: ChangeDetectorRef,
    private statsService: StatsProcessingService) { }

  ngOnInit(): void {
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.stats?.currentValue) {
      this.stats = changes.stats.currentValue as unknown as StatsItem;
    }
    if (changes?.selectedGames?.currentValue) {
      this.selectedGames = changes.selectedGames.currentValue as unknown as EnrichedGameFile[];
    }
    if (this.selectedGames && this.stats) {
      this.getProcessedStats();
    }
    this.cd.detectChanges();
  }

  private getProcessedStats(): void {
    // TODO filter this.stats by selectedGames
    const newStats = this.filterStats();
    console.log('Stats Display - getProcessedStats');
    this.statsService.processConversions(newStats.playerConversions).then(result => {
      console.log('Stats Display - got player conversions back', result);
      this.playerConversions = result;
      this.cd.detectChanges();
    });
    this.statsService.processConversions(newStats.opponentConversions).then(result => {
      console.log('Stats Display - got opponent conversions back', result);
      this.opponentConversions = result;
      this.cd.detectChanges();
    });
    this.statsService.processOverallList(newStats.playerOveralls).then(result => {
      console.log('Stats Display - got player overall back', result);
      this.playerOverall = result;
      this.cd.detectChanges();
    });
    this.statsService.processOverallList(newStats.opponentOveralls).then(result => {
      console.log('Stats Display - got opponent overall back', result);
      this.opponentOverall = result;
      this.cd.detectChanges();
    });
  }

  private filterStats(): StatsItem {
    console.log('Stats Display - Filter Stats');
    const niceNamesToKeep: string[] = [];
    for (let game of this.selectedGames) {
      niceNamesToKeep.push(GameFileUtils.niceName(game.file));
    }
    const newStats: StatsItem = {
      playerConversions : undefined,
      opponentConversions: undefined,
      playerOveralls: undefined,
      opponentOveralls: undefined,
    };
    for (let game of Object.keys(this.stats.playerConversions)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.playerConversions) {
          newStats.playerConversions={};
        }
        newStats.playerConversions[game] = this.stats.playerConversions[game];
      }
    }
    for (let game of Object.keys(this.stats.opponentConversions)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.opponentConversions) {
          newStats.opponentConversions={};
        }
        newStats.opponentConversions[game] = this.stats.opponentConversions[game];
      }
    }
    for (let game of Object.keys(this.stats.playerOveralls)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.playerOveralls) {
          newStats.playerOveralls={};
        }
        newStats.playerOveralls[game] = this.stats.playerOveralls[game];
      }
    }
    for (let game of Object.keys(this.stats.opponentOveralls)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.opponentOveralls) {
          newStats.opponentOveralls={};
        }
        newStats.opponentOveralls[game] = this.stats.opponentOveralls[game];
      }
    }

    return newStats;
  }

  getKeys(object): string[] {
    return Object.keys(object);
  }

  getMoveName(moveId: number) {
    console.log('getMoveName, moveId: ', moveId);
    console.log('getMoveName, BETTERMOVES: ', BETTERMOVES);
    console.log('getMoveName, find: ', BETTERMOVES.find(bm => bm.id === moveId));
    const move = BETTERMOVES.find(bm => bm.id === moveId);
    console.log('getMoveName, move: ', move);
    return move ? move.name : 'Weird move';
  }

}
