import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ElecService } from 'src/app/elec.service';
import { EnrichedGameFile, StatsItem } from 'src/interfaces/outputs';
import { IntermediaryStatsWrapper, ProcessedLCancels, ProcessedLedgedashes, ProcessedOpenings, ProcessedOverallList, ProcessedPunishedOptions } from 'src/interfaces/types';
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

  playerConversions: IntermediaryStatsWrapper<ProcessedOpenings>;
  opponentConversions: IntermediaryStatsWrapper<ProcessedOpenings>;
  playerOverall: IntermediaryStatsWrapper<ProcessedOverallList>;
  opponentOverall: IntermediaryStatsWrapper<ProcessedOverallList>;
  punishedActionsForPlayer: IntermediaryStatsWrapper<ProcessedPunishedOptions>;
  punishedActionsForOpponent: IntermediaryStatsWrapper<ProcessedPunishedOptions>;
  lcancelsForPlayer: IntermediaryStatsWrapper<ProcessedLCancels>;
  lcancelsForOpponent: IntermediaryStatsWrapper<ProcessedLCancels>;
  ledgeDashesForPlayer: IntermediaryStatsWrapper<ProcessedLedgedashes>;
  ledgeDashesForOpponent: IntermediaryStatsWrapper<ProcessedLedgedashes>;
  collapseId = 'collapse';
  writeFeedbackMessage: string;

  statsDates: Date[];

  constructor(private cd: ChangeDetectorRef,
    private statsService: StatsProcessingService,
    private electron: ElecService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.stats?.currentValue) {
      this.stats = changes.stats.currentValue as unknown as StatsItem;
      console.log('Stats Display - got Stats : ', this.stats);
    }
    if (changes?.selectedGames?.currentValue) {
      this.selectedGames = changes.selectedGames.currentValue as unknown as EnrichedGameFile[];
    }
    if (this.selectedGames &&
      this.stats?.ledgeDashesForPlayer &&
      this.stats?.ledgeDashesForOpponent &&
      this.stats?.punishedActionsForPlayer &&
      this.stats?.punishedActionsForOpponent &&
      this.stats?.lcancelsForOpponent &&
      this.stats?.lcancelsForPlayer &&
      this.stats?.opponentConversions &&
      this.stats?.playerConversions &&
      this.stats?.playerOveralls &&
      this.stats?.opponentOveralls) {
      this.writeFeedbackMessage = undefined;
      this.getProcessedStats();
    }
    this.cd.detectChanges();
  }

  private getStatsDates(): Date[] {
    let dates = [];
    for (let gameTag of Object.keys(this.stats.playerOveralls)) {
      const year = +gameTag.substr(0, 4);
      const month = +gameTag.substr(4, 2);
      const day = +gameTag.substr(6, 2);
      const date = new Date(year, month, day);
      if (!dates.find(dateFromArray => date.getTime() === dateFromArray.getTime())) {
        dates.push(date);
      }
    }
    return dates;
  }

  private getProcessedStats(): void {
    // TODO filter this.stats by selectedGames
    const newStats = this.filterStats();
    this.statsDates = this.getStatsDates();
    console.log('Stats Display - getProcessedStats');
    if (newStats.playerConversions) {
      this.statsService.processConversions(newStats.playerConversions).then(result => {
        console.log('Stats Display - got player conversions back', result);
        this.playerConversions = result;
        this.cd.detectChanges();
      });
    }
    if (newStats.opponentConversions) {
      this.statsService.processConversions(newStats.opponentConversions).then(result => {
        console.log('Stats Display - got opponent conversions back', result);
        this.opponentConversions = result;
        this.cd.detectChanges();
      });
    }
    if (newStats.playerOveralls) {
      this.statsService.processOverallList(newStats.playerOveralls).then(result => {
        console.log('Stats Display - got player overall back', result);
        this.playerOverall = result;
        this.cd.detectChanges();
      });
    }
    if (newStats.opponentOveralls) {
      this.statsService.processOverallList(newStats.opponentOveralls).then(result => {
        console.log('Stats Display - got opponent overall back', result);
        this.opponentOverall = result;
        this.cd.detectChanges();
      });
    }
    if (newStats.punishedActionsForPlayer) {
      this.statsService.processPunishedActions(newStats.punishedActionsForPlayer).then(result => {
        console.log('Stats Display - got player punishedActions back', result);
        this.punishedActionsForPlayer = result;
        this.cd.detectChanges();
      });
    }
    if (newStats.punishedActionsForOpponent) {
      this.statsService.processPunishedActions(newStats.punishedActionsForOpponent).then(result => {
        console.log('Stats Display - got opponent punishedActions back', result);
        this.punishedActionsForOpponent = result;
        this.cd.detectChanges();
      });
    }
    if (newStats.lcancelsForPlayer) {
      this.statsService.processLCancels(newStats.lcancelsForPlayer).then(result => {
        console.log('Stats Display - got player lcancels back', result);
        this.lcancelsForPlayer = result;
        this.cd.detectChanges();
      });
    }
    if (newStats.lcancelsForOpponent) {
      this.statsService.processLCancels(newStats.lcancelsForOpponent).then(result => {
        console.log('Stats Display - got opponent lcancels back', result);
        this.lcancelsForOpponent = result;
        this.cd.detectChanges();
      });
    }
    if (newStats.ledgeDashesForPlayer) {
      this.statsService.processLedgeDashes(newStats.ledgeDashesForPlayer).then(result => {
        console.log('Stats Display - got player ledgeDashes back', result);
        this.ledgeDashesForPlayer = result;
        this.cd.detectChanges();
      });
    }
    if (newStats.ledgeDashesForOpponent) {
      this.statsService.processLedgeDashes(newStats.ledgeDashesForOpponent).then(result => {
        console.log('Stats Display - got opponent ledgeDashes back', result);
        this.ledgeDashesForOpponent = result;
        this.cd.detectChanges();
      });
    }
  }

  private filterStats(): StatsItem {
    console.log('Stats Display - Filter Stats');
    const niceNamesToKeep: string[] = [];
    for (let game of this.selectedGames) {
      niceNamesToKeep.push(GameFileUtils.niceName(game.file));
    }
    const newStats: StatsItem = {
      playerConversions: undefined,
      opponentConversions: undefined,
      playerOveralls: undefined,
      opponentOveralls: undefined,
      punishedActionsForOpponent: undefined,
      punishedActionsForPlayer: undefined,
      lcancelsForPlayer: undefined,
      lcancelsForOpponent: undefined,
      ledgeDashesForPlayer: undefined,
      ledgeDashesForOpponent: undefined
    };
    for (let game of Object.keys(this.stats.playerConversions)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.playerConversions) {
          newStats.playerConversions = {};
        }
        newStats.playerConversions[game] = this.stats.playerConversions[game];
      }
    }
    for (let game of Object.keys(this.stats.opponentConversions)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.opponentConversions) {
          newStats.opponentConversions = {};
        }
        newStats.opponentConversions[game] = this.stats.opponentConversions[game];
      }
    }
    for (let game of Object.keys(this.stats.playerOveralls)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.playerOveralls) {
          newStats.playerOveralls = {};
        }
        newStats.playerOveralls[game] = this.stats.playerOveralls[game];
      }
    }
    for (let game of Object.keys(this.stats.opponentOveralls)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.opponentOveralls) {
          newStats.opponentOveralls = {};
        }
        newStats.opponentOveralls[game] = this.stats.opponentOveralls[game];
      }
    }
    for (let game of Object.keys(this.stats.lcancelsForOpponent)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.lcancelsForOpponent) {
          newStats.lcancelsForOpponent = {};
        }
        newStats.lcancelsForOpponent[game] = this.stats.lcancelsForOpponent[game];
      }
    }
    for (let game of Object.keys(this.stats.lcancelsForPlayer)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.lcancelsForPlayer) {
          newStats.lcancelsForPlayer = {};
        }
        newStats.lcancelsForPlayer[game] = this.stats.lcancelsForPlayer[game];
      }
    }
    for (let game of Object.keys(this.stats.punishedActionsForOpponent)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.punishedActionsForOpponent) {
          newStats.punishedActionsForOpponent = {};
        }
        newStats.punishedActionsForOpponent[game] = this.stats.punishedActionsForOpponent[game];
      }
    }
    for (let game of Object.keys(this.stats.punishedActionsForPlayer)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.punishedActionsForPlayer) {
          newStats.punishedActionsForPlayer = {};
        }
        newStats.punishedActionsForPlayer[game] = this.stats.punishedActionsForPlayer[game];
      }
    }
    for (let game of Object.keys(this.stats.ledgeDashesForPlayer)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.ledgeDashesForPlayer) {
          newStats.ledgeDashesForPlayer = {};
        }
        newStats.ledgeDashesForPlayer[game] = this.stats.ledgeDashesForPlayer[game];
      }
    }
    for (let game of Object.keys(this.stats.ledgeDashesForOpponent)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.ledgeDashesForOpponent) {
          newStats.ledgeDashesForOpponent = {};
        }
        newStats.ledgeDashesForOpponent[game] = this.stats.ledgeDashesForOpponent[game];
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
      punishedActionsForPlayer: this.punishedActionsForPlayer,
      punishedActionsForOpponent: this.punishedActionsForOpponent,
      lcancelsForPlayer: this.lcancelsForPlayer,
      lcancelsForOpponent: this.lcancelsForOpponent,
      ledgeDashesForPlayer: this.ledgeDashesForPlayer,
      ledgeDashesForOpponent: this.ledgeDashesForPlayer,
      dates: this.statsDates,
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
