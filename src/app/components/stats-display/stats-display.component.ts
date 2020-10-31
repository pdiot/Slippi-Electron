import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ElecService } from 'src/app/elec.service';
import { BETTERMOVES } from 'src/interfaces/const';
import { EnrichedGameFile, StatsItem } from 'src/interfaces/outputs';
import { IntermediaryStatsWrapper, ProcessedOpenings, ProcessedOverallList } from 'src/interfaces/types';
import { StatsProcessingService } from 'src/services/stats-processing/stats-processing.service';
import GameFileUtils from '../utils/gameFile.utils';
import GeneralUtils from '../utils/general.utils';

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

  writeFeedbackMessage: string;

  constructor(private cd: ChangeDetectorRef,
    private statsService: StatsProcessingService,
    private electron: ElecService) { }

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
      this.writeFeedbackMessage = undefined;
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
    return GeneralUtils.getKeys(object);
  }

  getMoveName(moveId: number) {
    return GeneralUtils.getMoveName(moveId);
  }

  getStageName(stage: string) {
    return GeneralUtils.getStageName(stage);
  }

  writeStats() {
    const stats = {
      playerConversions: this.playerConversions,
      opponentConversions: this.opponentConversions,
      playerOverall: this.playerOverall,
      opponentOverall: this.opponentOverall,
    }
    this.electron.ipcRenderer.on('fileWrittenOK', (event, arg) => {
      this.writeFeedbackMessage = `Stats written to ${arg}`
      this.cd.detectChanges();
    });
    this.electron.ipcRenderer.on('fileWrittenKO', (event, arg) => {
      this.writeFeedbackMessage = `Error when trying to write stats to ${arg}`
      this.cd.detectChanges();
    });
    this.electron.ipcRenderer.send('writeStats', stats);
  }

}
